// NotionStudentDetailInformation.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentDetailInformation } from '@infrastructure/notion/index.js';
import type { DomainStudentDetailInformation } from '@domain/coach/index.js';
import { NotionUUID } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_PARENT_ID = process.env.TEST_NOTION_PARENT_ID || 'dummy_parent_id';
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || 'dummy_database_id';

// Create an instance of the repository.
const repository = new NotionStudentDetailInformation();

// Define dummy data that complies with DomainStudentDetailInformation.
// Adjust the values so they match your actual Notion schema and enum definitions.
const dummyData: DomainStudentDetailInformation = {
  studentName: "John Doe",
  parentName: "Jane Doe",
  parentEmail: "parent@example.com",
  parentPhoneNumber: "123-456-7890",
  examDate: "2023-06-01",
  goal: "Achieve academic excellence",
  registeredSubjectNames: ["国語", "数学", "英語"],
  levelModifiedSubjectNames: ["物理", "化学"],
  japaneseLevel: "中級",
  japaneseGoalDescription: "Improve reading comprehension",
  japaneseGoalLevel: "上級",
  mathLevel: "初級",
  mathGoalDescription: "Learn calculus basics",
  mathGoalLevel: "中級",
  englishLevel: "中級",
  englishGoalDescription: "Enhance speaking skills",
  englishGoalLevel: "上級",
  physicsLevel: "初級",
  physicsGoalDescription: "Understand fundamental concepts",
  physicsGoalLevel: "中級",
  chemistryLevel: "初級",
  chemistryGoalDescription: "Study organic chemistry",
  chemistryGoalLevel: "中級",
  biologyLevel: "初級",
  biologyGoalDescription: "Learn cell biology",
  biologyGoalLevel: "中級",
  japaneseHistoryLevel: "中級",
  japaneseHistoryGoalDescription: "Improve essay writing",
  japaneseHistoryGoalLevel: "上級",
  worldHistoryLevel: "初級",
  worldHistoryGoalDescription: "Learn major world events",
  worldHistoryGoalLevel: "中級",
  geographyLevel: "初級",
  geographyGoalDescription: "Understand maps and regions",
  geographyGoalLevel: "中級",
  japaneseChange: "なし",
  mathChange: "変更あり",
  englishChange: "なし",
  physicsChange: "なし",
  chemistryChange: "なし",
  biologyChange: "なし",
  japaneseHistoryChange: "変更あり",
  worldHistoryChange: "なし",
  geographyChange: "なし",
};

describe('NotionStudentDetailInformation Repository Integration Tests', () => {
  // This will hold the created page ID to use across tests.
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
    // Check that at least one property (studentName) matches the dummy data.
    expect(data?.studentName).toEqual(dummyData.studentName);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentDetailInformation = {
      ...dummyData,
      studentName: "John Doe Updated",
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.studentName).toEqual(updatedData.studentName);
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
