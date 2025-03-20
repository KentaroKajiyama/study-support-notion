// NotionStudentProblems.test.ts
import { describe, it, expect } from 'vitest';
import { NotionStudentProblems } from '@infrastructure/notion/index.js';
import type { DomainStudentProblem } from '@domain/student/index.js';
import { NotionUUID, Int, SubfieldsSubfieldNameEnum, toUint, toNotionUUID } from '@domain/types/index.js';

// Set these environment variables or replace with valid test IDs.
const TEST_NOTION_DATABASE_ID = process.env.TEST_NOTION_DATABASE_ID || '1a9b95a4c61980ef81f2f152d5e366b5';

// Create an instance of the repository.
const repository = new NotionStudentProblems();

// Define dummy data that complies with DomainStudentProblem.
// Adjust values (especially enum values) as needed for your environment.
const dummyData: DomainStudentProblem = {
  answerStatus: "正解",                   // Example answer status (replace with a valid StudentProblemsAnswerStatusEnum value)
  isDifficult: false,                     // Whether the problem is marked as difficult
  tryCount: toUint(1),                            // Number of attempts
  difficultCount: toUint(0),                      // Count of attempts where the problem was too difficult
  wrongCount: toUint(0),                          // Count of wrong attempts
  reviewLevel: "初学",                      // Review level (replace with a valid StudentProblemsReviewLevelEnum value)
  problemOverallOrder: toUint(1),
  problemInBlockOrder: toUint(1),
  blockPageId: toNotionUUID("1bbb95a4c61980b999cfe7bac574200c"),
  subfieldName: "日本史"                    // Example subfield (replace with a valid SubfieldsSubfieldNameEnum value)
};

describe('NotionStudentProblems Repository Integration Tests', () => {
  // Store the created page ID for subsequent tests.
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
    // Verify that at least the answerStatus property matches the dummy data.
    expect(data?.answerStatus).toEqual(dummyData.answerStatus);
  });

  it('should update the page properties', async () => {
    if (!createdPageId) throw new Error("No created page id available");
    const updatedData: DomainStudentProblem = {
      ...dummyData,
      answerStatus: "不正解" // Update answer status for testing purposes
    };
    const data = await repository.updatePageProperties(createdPageId as NotionUUID, updatedData);
    expect(data).toBeTruthy();
    expect(data?.answerStatus).toEqual(updatedData.answerStatus);
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
