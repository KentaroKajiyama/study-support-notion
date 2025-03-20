// NotionStudentTodoCounters.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentTodoCounters } from '@infrastructure/notion/index.js';
import type { DomainStudentTodoCounter } from '@domain/student/index.js';
import { NotionUUID, toInt, toUint } from '@domain/types/index.js';
import { logger } from '@utils/index.js'

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '1aab95a4c61980f798dbf9b4dae2f432';

// Create an instance of the repository.
const repository = new NotionStudentTodoCounters();

// Define dummy data that complies with DomainStudentTodoCounter.
// Adjust the values so they match your Notion schema and type definitions.
const dummyData: DomainStudentTodoCounter = {
  subfieldName: "数学",            // This maps to the '科目' title property.
  remainingProblemNumber: toUint(10),       // Example remaining problem count.
  delay: toInt(-2),                      // Example delay value (could be negative if target date is past).
};

describe("NotionStudentTodoCounters Repository Integration Tests", () => {
  // Store the created page ID for subsequent tests.
  let createdPageId: string | null = null;

  it("should create a page with only properties", async () => {
    const result = await repository.createAPageOnlyWithProperties(
      TEST_NOTION_DATABASE_ID as NotionUUID,
      'database_id',
      dummyData
    );
    expect(result).toBeTruthy();
    createdPageId = result;
    logger.info("result:"+result);
  });

  it("should retrieve the created page", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
    // Verify that key properties match the dummy data.
    expect(data?.subfieldName).toEqual(dummyData.subfieldName);
    expect(data?.remainingProblemNumber).toEqual(dummyData.remainingProblemNumber);
    expect(data?.delay).toEqual(dummyData.delay);
  });

  it("should update the page properties", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentTodoCounter = {
      remainingProblemNumber: toUint(5),  // Update the remaining problem count.
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.remainingProblemNumber).toEqual(updatedData.remainingProblemNumber);
  });

  it("should archive (delete) the page", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.deleteAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
  });

  it("should restore the page", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.restoreAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
  });
});
