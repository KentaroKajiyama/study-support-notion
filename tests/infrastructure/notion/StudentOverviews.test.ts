// NotionStudentOverviews.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentOverviews } from '@infrastructure/notion/index.js';
import type { DomainStudentOverview } from '@domain/coach/index.js';
import { NotionUUID, Int, SubfieldsSubfieldNameEnum, toURLString, toUint, toInt } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '1a9b95a4c61980499924c3cb0a10e5ba';

// Create an instance of the repository.
const repository = new NotionStudentOverviews();

// Define dummy data that complies with DomainStudentOverview.
// Adjust the values and enum strings as necessary for your environment.
const dummyData: DomainStudentOverview = {
  studentName: "Test Student",
  lineName: "Test LINE Name",
  alertSubfieldNames: ["数学"], // Example: using "数学" as a subfield
  chatStatus: "Chat",         // Replace with a valid StudentsOverviewsChatStatusEnum value if needed
  distStatus: "エラー発生",         // Replace with a valid StudentsOverviewsDistributionStatusEnum value if needed
  studentPage: "@[更新世（氷河時代）ではどんな動物を狩猟していた？ (page:1a9b95a4c61981649fffc91c0ac349ff)]",
  planStatus: "シミュレーション中",
  modifiedPlanSubfieldNames: ["数学"],
  modernJapaneseDelay: toInt(0),
  ancientJapaneseDelay: toInt(0),
  ancientChineseDelay: toInt(0),
  mathDelay: toInt(0),
  readingDelay: toInt(0),
  listeningAndSpeakingDelay: toInt(-4),
  writingDelay: toInt(5),
  physicsDelay: toInt(0),
  chemistryDelay: toInt(6),
  biologyDelay: toInt(-7),
  japaneseHistoryDelay: toInt(0),
  worldHistoryDelay: toInt(0),
  geographyDelay: toInt(0),
};

describe('NotionStudentOverviews Repository Integration Tests', () => {
  // Store the created page ID to be used across tests.
  let createdPageId: string | null = null;

  it('should create a page with only properties', async () => {
    const result = await repository.createAPageOnlyWithProperties(
      TEST_NOTION_DATABASE_ID as NotionUUID,
      "database_id",
      dummyData
    );
    expect(result).toBeTruthy();
    createdPageId = result;
  });

  it('should retrieve the created page', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(data).toBeTruthy();
    // Verify that at least the studentName property matches.
    expect(data?.studentName).toEqual(dummyData.studentName);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentOverview = {
      ...dummyData,
      studentName: "Updated Test Student"
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.studentName).toEqual(updatedData.studentName);
  });

  it('should update delay for a subfield using updatePagePropertiesWithDelay', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const delay: Int = toInt(10); // Example delay value
    // Update the delay for the "数学" subfield.
    await repository.updatePagePropertiesWithDelay(
      createdPageId as NotionUUID,
      "数学" as SubfieldsSubfieldNameEnum,
      delay,
      dummyData
    );
    const updatedPage = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(updatedPage).toBeTruthy();
    // Verify that mathDelay was updated.
    expect(updatedPage?.mathDelay).toEqual(delay);
  });

  it('should update plan status using updatePlanStatus', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    // Update the plan status to confirmed.
    await repository.updatePlanStatus(createdPageId as NotionUUID, true);
    const updatedPage = await repository.retrieveAPage(createdPageId as NotionUUID);
    expect(updatedPage).toBeTruthy();
    // According to the repository logic, a confirmed plan status is set to '確定'.
    expect(updatedPage?.planStatus).toEqual('確定');
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
