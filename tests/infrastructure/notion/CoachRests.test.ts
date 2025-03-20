// NotionCoachRests.test.ts
import { describe, it, expect } from 'vitest';
import { NotionCoachRests } from '@infrastructure/notion/index.js';
import type { DomainCoachRest } from '@domain/coach/index.js';
import { NotionUUID } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '19eb95a4c61980f081dfeea8da6fa412';

// Create an instance of the NotionCoachRests repository.
const repository = new NotionCoachRests();

// Define dummy data that complies with DomainCoachRest.
// Adjust the values as necessary to match your actual Notion schema.
const dummyData: DomainCoachRest = {
  restName: "Test Rest Name",
  subfieldNames: ["日本史"],
  startDate: "2023-03-20",
  endDate: "2023-03-27",
};

describe('NotionCoachRests Repository Integration Tests', () => {
  // This will hold the created page id for subsequent tests.
  let createdPageId: NotionUUID | null = null;

  it('should create a page with only properties', async () => {
    const result = await repository.createAPageOnlyWithProperties(
      TEST_NOTION_DATABASE_ID as NotionUUID,
      'database_id',
      dummyData
    );
    expect(result).toBeTruthy();
    createdPageId = result;
  });

  it('should retrieve the created page', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage("createdPageId" as NotionUUID);
    expect(data).toBeTruthy();
    // Verify that the restName property matches the dummy data.
    expect(data?.restName).toEqual(dummyData.restName);
  });

  it.only('should update the page properties', async () => {
    // if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainCoachRest = {
      startDate: "2025-03-20",
      endDate: "2025-03-28",
    };
    const data = await repository.updatePageProperties("1bcb95a4c61981d08a21d4154e1027eb" as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.startDate).toEqual(updatedData.startDate);
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
