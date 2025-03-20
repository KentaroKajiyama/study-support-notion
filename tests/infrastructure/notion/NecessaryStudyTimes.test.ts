// NotionNecessaryStudyTimes.test.ts
import { describe, it, expect } from 'vitest';
import { NotionNecessaryStudyTimes } from '@infrastructure/notion/index.js';
import type { DomainNecessaryStudyTime } from '@domain/coach/index.js';
import { NotionUUID, toUint } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '19eb95a4c61980f19fd5daa96d8b10a6';

// Create an instance of the repository.
const repository = new NotionNecessaryStudyTimes();

// Define dummy data that complies with DomainNecessaryStudyTime.
// Adjust the numeric values as needed to match the expectations of your schema.
const dummyData: DomainNecessaryStudyTime = {
  pattern: "Test Pattern",
  modernJapanese: toUint(30),
  ancientJapanese: toUint(20),
  ancientChinese: toUint(10),
  math: toUint(40),
  reading: toUint(15),
  listeningAndSpeaking: toUint(10),
  writing: toUint(12),
  physics: toUint(18),
  chemistry: toUint(14),
  biology: toUint(16),
  japaneseHistory: toUint(22),
  worldHistory: toUint(19),
  geography: toUint(17),
  howManyTimes: toUint(3),
  totalOpportunity: toUint(60),
  order: toUint(1),
};

describe('NotionNecessaryStudyTimes Repository Integration Tests', () => {
  // This will hold the created page id to use across tests.
  let createdPageId: string | null = null;

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
    const data = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
    // Verify that the 'pattern' property matches the dummy data.
    expect(data?.pattern).toEqual(dummyData.pattern);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainNecessaryStudyTime = {
      ...dummyData,
      pattern: "Updated Test Pattern",
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.pattern).toEqual(updatedData.pattern);
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
