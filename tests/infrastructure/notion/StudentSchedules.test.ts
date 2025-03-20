// NotionStudentSchedules.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentSchedules } from '@infrastructure/notion/index.js';
import type { DomainStudentSchedule } from '@domain/student/index.js';
import { NotionUUID } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '19bb95a4c61980fda4dce4c94dfd9b42';

// Create an instance of the repository.
const repository = new NotionStudentSchedules();

// Define dummy data that complies with DomainStudentSchedule.
// Ensure the values match your Notion schema and type definitions.
const dummyData: DomainStudentSchedule = {
  blockName: "@[旧石器時代 (page:1bbb95a4c61980528a4fd74dab6d8b67)]",
  subfieldName: "日本史",         // This maps to the '科目' select property.
  startDate: "2025-03-20",      // ISO string for the start date.
  endDate: "2025-03-27",        // ISO string for the end date.
};

describe("NotionStudentSchedules Repository Integration Tests", () => {
  // Will store the created page ID for subsequent tests.
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
    // Verify that the key properties match the dummy data.
    expect(data?.blockName).toEqual(dummyData.blockName);
    expect(data?.subfieldName).toEqual(dummyData.subfieldName);
    expect(data?.startDate).toEqual(dummyData.startDate);
    expect(data?.endDate).toEqual(dummyData.endDate);
  });

  it("should update the page properties", async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentSchedule = {
      blockName: "@[縄文時代 (page:1bbb95a4c61980b999cfe7bac574200c)]",
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.blockName).toEqual(updatedData.blockName);
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
