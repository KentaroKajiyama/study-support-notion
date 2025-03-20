// ActualBlocks.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ActualBlocks, ActualBlock } from '@infrastructure/mysql/index.js'; 
import { MySQLUintID, toMySQLUintID } from '@domain/types/mysqlTypes.js';
import { toUint } from '@domain/types/myTypes.js';
import { toNotionUUID } from '@domain/types/myNotionTypes.js';

// Dummy data for testing. Adjust these values as needed.
const dummyBlock: ActualBlock = {
  studentId: toMySQLUintID(8),                    // Use a test student ID
  subfieldId: toMySQLUintID(6),
  defaultBlockId: toMySQLUintID(45),
  actualBlockName: "旧石器時代 actual",
  space: toUint(10),
  speed: toUint(5),
  lap: toUint(2),
  startDate: "2025-03-30",             // ISO string format (if that's what your conversion expects)
  endDate: "2023-04-05",
  blockOrder: toUint(1),
  isTail: false,
  actualBlockSize: toUint(10),
  problemLevel: "基礎３",               
  studentActualBlockDbNotionPageId: toNotionUUID("1bbb95a4c61980528a4fd74dab6d8b67"),
  studentScheduleNotionPageId: null,
  coachPlanNotionPageId: null,
};

describe("ActualBlocks Integration Tests", () => {
  let createdId: MySQLUintID;

  // Clean up: after tests, attempt to remove any leftover test records.
  // afterAll(async () => {
  //   if (createdId) {
  //     try {
  //       await ActualBlocks.delete(createdId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create an actual block", async () => {
    createdId = await ActualBlocks.create(dummyBlock);
    expect(createdId).toBeGreaterThan(0);
  });

  it("should retrieve the created block by its ID", async () => {
    const block = await ActualBlocks.findByActualBlockId(toMySQLUintID(21));
    expect(block).toBeTruthy();
    if (block) {
      expect(block.actualBlockName).toEqual(dummyBlock.actualBlockName);
      expect(block.studentId).toEqual(dummyBlock.studentId);
    }
  });

  it("should update the block's name using updateByActualBlockId", async () => {
    const problemLevel = "基礎３";
    const updateResult = await ActualBlocks.updateByActualBlockId(toMySQLUintID(21), {problemLevel: problemLevel});
    expect(updateResult).toBe(true);

    const block = await ActualBlocks.findByActualBlockId(toMySQLUintID(21));
    expect(block).toBeTruthy();
    if (block) {
      expect(block.problemLevel).toEqual(problemLevel);
    }
  });

  it("should find blocks by student ID", async () => {
    const blocks = await ActualBlocks.findByStudentId(dummyBlock.studentId!);
    expect(Array.isArray(blocks)).toBe(true);
    const found = blocks.find(b => b.actualBlockId === createdId);
    expect(found).toBeTruthy();
  });

  it("should delete the block", async () => {
    const affectedRows = await ActualBlocks.delete(createdId);
    expect(affectedRows).toBeGreaterThan(0);

    const blockAfterDelete = await ActualBlocks.findByActualBlockId(createdId);
    expect(blockAfterDelete).toBeNull();
  });
});
