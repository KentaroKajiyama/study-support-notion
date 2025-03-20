// NotionStudentRemainings.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentRemainings } from '@infrastructure/notion/index.js';
import type { DomainStudentRemaining } from '@domain/student/index.js';
import { NotionUUID, toUint } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '19bb95a4c619804cbc04e488f42db7b5';

// Create an instance of the repository.
const repository = new NotionStudentRemainings();

// Define dummy data that complies with DomainStudentRemaining.
// Adjust values so they match your Notion schema and type definitions.
const dummyData: DomainStudentRemaining = {
  subfieldName: "Listening&Speaking",   // This maps to the '科目' title property.
  subjectName: "英語",         // This maps to the '教科' select property.
  remainingDay: toUint(30),            // Number of days remaining until the exam.
  targetDate: "2025-12-31",    // Example target date (ISO string).
};

describe("NotionStudentRemainings Repository Integration Tests", () => {
  // Will store the created page ID to use in subsequent tests.
  let createdPageId: string | null = null;

  it("should create a page with only properties", async () => {
    const result = await repository.createAPageOnlyWithProperties(
      TEST_NOTION_DATABASE_ID as NotionUUID,
      'database_id',
      dummyData
    );
    expect(result).toBeTruthy();
    createdPageId = result;
  });

  it("should retrieve the created page", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
    // Check that the 'subfieldName' and 'subjectName' properties match the dummy data.
    expect(data?.subfieldName).toEqual(dummyData.subfieldName);
    expect(data?.subjectName).toEqual(dummyData.subjectName);
  });

  it("should update the page properties", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentRemaining = {
      ...dummyData,
      remainingDay: toUint(25), // Updated remaining day value.
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.remainingDay).toEqual(updatedData.remainingDay);
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
