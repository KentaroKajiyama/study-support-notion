// NotionCoachPlans.test.ts
import { describe, it, expect } from 'vitest';
import { NotionCoachPlans } from '@infrastructure/notion/index.js';
import type { DomainCoachPlan } from '@domain/coach/index.js';
import { NotionUUID, toUint } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '19bb95a4c61980dab22be7333b95e841';

// Create an instance of the repository.
const repository = new NotionCoachPlans();

// A dummy domain object to use for creation and update.
// Adjust these values so they match what your Notion database schema accepts.
const dummyData: DomainCoachPlan = {
  blockName: "@[旧石器時代 (page:1bbb95a4c61980528a4fd74dab6d8b67)]",
  inputStartDate: "2023-03-20",
  inputEndDate: "2023-03-27",
  speed: toUint(1),
  space: toUint(2),
  lap: toUint(3),
  blockOrder: toUint(1),
  problemLevel: "基礎２",
  isIrregular: false,
  outputStartDate: "2023-03-20",
  outputEndDate: "2023-03-27",
  subfieldName: "日本史",
};

describe('NotionCoachPlans Repository Integration Tests', () => {
  // We'll store the created page ID to use across tests.
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
    // Check that at least one property (blockName) matches
    expect(data?.blockName).toEqual(dummyData.blockName);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainCoachPlan = {
      blockName: "@[縄文時代 (page:1bbb95a4c61980b999cfe7bac574200c)]"
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

  it('should query the database with subfield name filter', async () => {
    if (!TEST_NOTION_DATABASE_ID) throw new Error("No test database id provided");
    // Query the database using the subfield name (e.g., "数学")
    const results = await repository.queryADatabaseWithSubfieldNameFilter(
      TEST_NOTION_DATABASE_ID as NotionUUID,
      "日本史"
    );
    expect(Array.isArray(results)).toBe(true);
  });
});
