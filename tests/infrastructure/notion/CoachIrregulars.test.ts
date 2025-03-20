// NotionCoachIrregulars.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { NotionCoachIrregulars } from '@infrastructure/notion/index.js';
import type { DomainCoachIrregular } from '@domain/coach/index.js';
import { NotionUUID, toUint } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs
const TEST_NOTION_PARENT_ID = process.env.TEST_NOTION_PARENT_ID || '19bb95a4c61980978b53e913977b3246';
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '19bb95a4c61980978b53e913977b3246';

// Create an instance of your repository
const repository = new NotionCoachIrregulars();

// A dummy domain object to use for creation and update.
// Make sure these values are acceptable for your actual schema.
const dummyData: DomainCoachIrregular = {
  problemName: "@[旧石器時代と新石器時代の違いが説明できる？ (page:1a9b95a4c619814b96b6f95df6cf2f65)]",
  isModified: false,
  insertOrder: toUint(1),
  subfieldName: "日本史",
  irregularProblemOrder: toUint(1),
  insertBlock: "@[旧石器時代 (page:1bbb95a4c61980528a4fd74dab6d8b67)]",
  formerBlock: "@[縄文時代 (page:1bbb95a4c61980b999cfe7bac574200c)]",
};

describe('NotionCoachIrregulars Repository Integration Tests', () => {
  // We’ll store the created page id to use across tests.
  let createdPageId: string | null = null;

  it('should create a page with only properties', async () => {
    const result = await repository.createAPageOnlyWithProperties(TEST_NOTION_PARENT_ID as NotionUUID, 'database_id', dummyData);
    expect(result).toBeTruthy();
    createdPageId = result;
  });

  it('should retrieve the created page', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
    // Ensure at least one property matches
    expect(data?.problemName).toEqual(dummyData.problemName);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainCoachIrregular = { 
      ...dummyData, 
      problemName: "@[縄文時代の人々はどんな家に住んでいた？ (page:1a9b95a4c6198147b168d6b3e47a419d)]" 
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.problemName).toEqual(`@[縄文時代の人々はどんな家に住んでいた？ (page: 1a9b95a4-c619-8147-b168-d6b3e47a419d)]`
    );
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

  it('should query the database with subfield filter', async () => {
    if (!TEST_NOTION_DATABASE_ID) throw new Error("No test database id provided");
    // The subfield filter value should match the expected type in your Notion database.
    const results = await repository.queryADatabaseWithSubfieldFilter(TEST_NOTION_DATABASE_ID as NotionUUID, "日本史");
    expect(Array.isArray(results)).toBe(true);
  });

  it('should query the database with former block id filter', async () => {
    if (!TEST_NOTION_DATABASE_ID) throw new Error("No test database id provided");
    // Using a dummy former block id (e.g., 123). Adjust this value if needed.
    const results = await repository.queryADatabaseWithFormerBlockId(TEST_NOTION_DATABASE_ID as NotionUUID, "1bbb95a4c61980528a4fd74dab6d8b67" as NotionUUID);
    expect(Array.isArray(results)).toBe(true);
  });
});
