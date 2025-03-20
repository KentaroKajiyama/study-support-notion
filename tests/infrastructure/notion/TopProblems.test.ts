// NotionTopProblems.test.ts
import { describe, it, expect } from 'vitest';
import { NotionTopProblems } from '@infrastructure/notion/index.js';
import type { DomainTopProblem } from '@domain/student/index.js';
import { NotionUUID, SubfieldsSubfieldNameEnum, toNotionUUID, toUint } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '1bcb95a4c61980b091c0e0cd61e8f78d';

// Create an instance of the repository.
const repository = new NotionTopProblems();

// Define dummy data for a DomainTopProblem.
// Adjust enum values as necessary. Here, for the review level we use "レベル２"
// so that our query (which filters out "初学" and "レベル１") will include this record.
const dummyData: DomainTopProblem = {
  answerStatus: "正解", // Example answer status (replace with a valid StudentProblemsAnswerStatusEnum value)
  isDifficult: false,
  tryCount: toUint(1),
  difficultCount: toUint(0),
  wrongCount: toUint(0),
  reviewLevel: "レベル２", // Record not filtered out by the query (must not be "初学" or "レベル１")
  problemOverallOrder: toUint(1),
  problemInBlockOrder: toUint(1),
  studentProblemPageId: toNotionUUID("1a9b95a4c61981019a9eebf265d63098"),
  blockPageId: toNotionUUID("1bbb95a4c61980528a4fd74dab6d8b67"),
  subfieldName: "日本史" as SubfieldsSubfieldNameEnum,
};

describe('NotionTopProblems Repository Integration Tests', () => {
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
    // if (!createdPageId) throw new Error("No created page id available");
    const data = await repository.retrieveAPage(toNotionUUID("1bcb95a4c619813a9642ed8670a7fe6b") as NotionUUID);
    expect(data).toBeTruthy();
    expect(data?.answerStatus).toEqual('不正解');
    expect(data?.reviewLevel).toEqual(dummyData.reviewLevel);
    expect(data?.subfieldName).toEqual(dummyData.subfieldName);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainTopProblem = {
      ...dummyData,
      answerStatus: "不正解", // Change answer status for update
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.answerStatus).toEqual(updatedData.answerStatus);
  });

  it('should query the database with only reviews', async () => {
    // The custom query should return records that do not have reviewLevel "初学" or "レベル１".
    const results = await repository.queryADatabaseWithOnlyReviews(TEST_NOTION_DATABASE_ID as NotionUUID);
    expect(Array.isArray(results)).toBe(true);
    // Optionally, ensure every record in the result meets the review level condition.
    results.forEach(item => {
      expect(item.reviewLevel).not.toEqual('初学');
      expect(item.reviewLevel).not.toEqual('レベル１');
    });
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
