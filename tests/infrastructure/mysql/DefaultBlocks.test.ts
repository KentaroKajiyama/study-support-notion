// DefaultBlocks.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { DefaultBlocks, DefaultBlock } from '@infrastructure/mysql/index.js';
import { MySQLUintID, Uint, ActualBlocksProblemLevelEnum, NotionUUID, NotionMentionString, toMySQLUintID, toUint } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Generate a unique block name to help identify our test record.
const uniqueBlockName: string = "旧石器時代";

// Dummy data for our default block record. Adjust subjectId (subfieldId) to a valid test value.
const dummyDefaultBlock: DefaultBlock = {
  subfieldId: toMySQLUintID(6), // Ensure this exists in your test DB.
  notionPageId: "1bcb95a4c619805e8166ef44e7ac3af1" as NotionUUID,
  blockName: "旧石器時代",
  space: toUint(10),
  speed: toUint(5),
  lap: toUint(2) ,
  blockOrder: toUint(1),
  isTail: false,
  blockSize: toUint(10),
  problemLevel: "基礎３", // Adjust if needed per your enum
  averageExpectedTime: toUint(5),
};

describe("DefaultBlocks Repository Integration Tests", () => {
  // We'll use this variable to store the defaultBlockId of the record we create.
  let createdBlockId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: Delete the test record if it still exists.
  //   if (createdBlockId !== null) {
  //     try {
  //       await DefaultBlocks.delete(createdBlockId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it("should create a new default block", async () => {
    const createResult = await DefaultBlocks.create(dummyDefaultBlock);
    expect(createResult).toBe(true);
  });

  it("should find all default blocks and include the created one", async () => {
    const allBlocks = await DefaultBlocks.findAll();
    expect(Array.isArray(allBlocks)).toBe(true);
    const found = allBlocks.find(b => b.blockName === uniqueBlockName);
    expect(found).toBeTruthy();
    if (found) {
      createdBlockId = ensureValue(found.defaultBlockId);
    }
  });

  it("should find the default block by composite key (subfieldId and blockName)", async () => {
    const compositeResults = await DefaultBlocks.findByCompositeKey(dummyDefaultBlock.subfieldId!, uniqueBlockName);
    expect(Array.isArray(compositeResults)).toBe(true);
    expect(compositeResults.length).toBeGreaterThan(0);
    const found = compositeResults.find(b => b.blockName === uniqueBlockName);
    expect(found).toBeTruthy();
    if (found) {
      createdBlockId = ensureValue(found.defaultBlockId);
    }
  });

  it("should find the default block by its defaultBlockId", async () => {
    if (!createdBlockId) throw new Error("No created blockId available");
    const block = await DefaultBlocks.findByDefaultBlockId(createdBlockId);
    expect(block).toBeTruthy();
    if (block) {
      expect(block.blockName).toEqual(uniqueBlockName);
    }
  });

  it("should find default blocks by subfieldId", async () => {
    const blocksBySubfield = await DefaultBlocks.findBySubfieldId(dummyDefaultBlock.subfieldId!);
    expect(Array.isArray(blocksBySubfield)).toBe(true);
    const found = blocksBySubfield.find(b => b.blockName === uniqueBlockName);
    expect(found).toBeTruthy();
  });

  it("should find default blocks by subfieldId under a specific problem level", async () => {
    // Using the same level as our dummy block ("レベル２"), so it should be included.
    const blocksUnderLevel = await DefaultBlocks.findBySubfieldIdUnderSpecificLevel(dummyDefaultBlock.subfieldId!, dummyDefaultBlock.problemLevel!);
    expect(Array.isArray(blocksUnderLevel)).toBe(true);
    const found = blocksUnderLevel.find(b => b.blockName === uniqueBlockName);
    expect(found).toBeTruthy();
  });

  it("should update the default block", async () => {
    if (!createdBlockId) throw new Error("No created blockId available");
    const newBlockName: NotionMentionString = (`Updated ${uniqueBlockName}`) as NotionMentionString;
    const updateResult = await DefaultBlocks.updateByDefaultBlockId(createdBlockId, { blockName: newBlockName });
    expect(updateResult).toBe(true);

    const updatedBlock = await DefaultBlocks.findByDefaultBlockId(createdBlockId);
    expect(updatedBlock).toBeTruthy();
    if (updatedBlock) {
      expect(updatedBlock.blockName).toEqual(newBlockName);
    }
  });

  it("should delete the default block", async () => {
    if (!createdBlockId) throw new Error("No created blockId available");
    const deleteResult = await DefaultBlocks.delete(createdBlockId);
    expect(deleteResult).toBeGreaterThan(0);

    const deletedBlock = await DefaultBlocks.findByDefaultBlockId(createdBlockId);
    expect(deletedBlock).toBeNull();
    createdBlockId = null;
  });
});
