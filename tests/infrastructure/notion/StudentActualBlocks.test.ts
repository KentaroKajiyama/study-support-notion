// NotionStudentActualBlocks.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentActualBlocks } from '@infrastructure/notion/NotionStudentActualBlocks';
import type { DomainStudentActualBlock } from '@domain/student/index.js';
import { NotionUUID } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_PARENT_ID = process.env.TEST_NOTION_PARENT_ID || 'dummy_parent_id';
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || 'dummy_database_id';

// Create an instance of the repository.
const repository = new NotionStudentActualBlocks();

// Define dummy data that complies with DomainStudentActualBlock.
// Adjust values as needed for your Notion database schema.
const dummyData: DomainStudentActualBlock = {
  blockName: "Test Block Name",
  problemLevel: "easy", // Ensure this value is valid for ActualBlocksProblemLevelEnum.
  speed: 1,
  space: 2,
  lap: 3,
  blockOrder: 1,
  startDate: "2023-03-20",
  endDate: "2023-03-27",
  // Note: blockPageId is generally populated by Notion as a formula property and is not sent in requests.
  studentProblemRelations: ["dummy_relation_id"],
};

describe('NotionStudentActualBlocks Repository Integration Tests', () => {
  // Store the created page ID to be used in subsequent tests.
  let createdPageId: string | null = null;

  it('should create a page with only properties', async () => {
    const result = await repository.createAPageOnlyWithProperties(
      TEST_NOTION_PARENT_ID as NotionUUID,
      TEST_NOTION_DATABASE_ID as NotionUUID,
      dummyData
    );
    expect(result).toBeTruthy();
    createdPageId = result;
  });

  it('should retrieve the created page', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
    // Verify that the blockName property matches the dummy data.
    expect(data?.blockName).toEqual(dummyData.blockName);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentActualBlock = {
      ...dummyData,
      blockName: "Updated Block Name",
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.blockName).toEqual(updatedData.blockName);
  });

  it('should archive (delete) the page', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.deleteAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
  });

  it('should restore the page', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.restoreAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
  });
});
