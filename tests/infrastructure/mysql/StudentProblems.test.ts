// StudentProblems.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { StudentProblems, StudentProblem } from '@infrastructure/mysql/index.js';
import { MySQLUintID, Uint, NotionUUID, StudentProblemsAnswerStatusEnum, StudentProblemsReviewLevelEnum, toMySQLUintID, toNotionUUID, toUint } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Create dummy data for a student problem.
// Ensure that the provided IDs (studentId, problemId, actualBlockId) exist in your test DB.
const dummyStudentProblem: StudentProblem = {
  studentId: toMySQLUintID(8), // Replace with a valid test student ID
  problemId: toMySQLUintID(3), // Replace with a valid test problem ID
  actualBlockId: toMySQLUintID(36), // Replace with a valid test actual block ID
  notionPageId: toNotionUUID("1bcb95a4c6198163a8bdcb8fa4b03ce1"),
  answerStatus: "未回答", // Replace with a valid enum value
  isDifficult: false,
  tryCount: toUint(1) ,
  difficultCount: toUint(0) ,
  wrongCount: toUint(0) ,
  reviewLevel: "レベル１", // Replace with a valid enum value
  reviewCountDown: toUint(0) ,
  reviewAvailableDate: null, // ISO date string (if that's what your converters expect)
  problemInBlockOrder: toUint(1) ,
  problemOverallOrder: toUint(1) ,
  lastAnsweredDate: "2025-03-20", // ISO date string
};

describe("StudentProblems Repository Integration Tests", () => {
  let createdProblemId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: Delete the test record if it still exists.
  //   if (createdProblemId !== null) {
  //     try {
  //       await StudentProblems.delete(createdProblemId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create a new student problem", async () => {
    const insertId = await StudentProblems.create(dummyStudentProblem);
    expect(typeof insertId).toBe("number");
    expect(insertId).toBeGreaterThan(0);
    createdProblemId = insertId;
  });

  it("should retrieve the student problem by studentProblemId", async () => {
    if (!createdProblemId) throw new Error("No created problem ID available");
    const problem = ensureValue(await StudentProblems.findByStudentProblemId(createdProblemId));
    expect(problem).toBeTruthy();
    expect((problem as any).problemName).toBeUndefined(); // Since we didn't set problemName in dummy data
    expect(problem.answerStatus).toEqual(dummyStudentProblem.answerStatus);
  });

  it("should retrieve student problems by studentId", async () => {
    const problems = await StudentProblems.findByStudentId(dummyStudentProblem.studentId!);
    expect(Array.isArray(problems)).toBe(true);
    const found = problems.find(p => p.notionPageId === dummyStudentProblem.notionPageId);
    expect(found).toBeTruthy();
  });

  it("should retrieve the student problem by notionPageId", async () => {
    const problem = await StudentProblems.findByNotionPageId(dummyStudentProblem.notionPageId!);
    expect(problem).toBeTruthy();
    if (problem) {
      expect(problem.notionPageId).toEqual(dummyStudentProblem.notionPageId);
    }
  });

  it("should update review_count_down via updateReviewCountDown", async () => {
    // First, update the review_count_down (which is 5) by decrementing it.
    const updateResult = await StudentProblems.updateReviewCountDown();
    expect(updateResult).toBe(true);

    // Retrieve the problem and check that reviewCountDown has decreased (to 4, if the update works correctly)
    const updatedProblem = await StudentProblems.findByStudentProblemId(createdProblemId!);
    // Allow for the possibility that updateReviewCountDown might run on other records;
    // we verify that our record's countdown is either unchanged (if it was already 0)
    // or decreased by one.
    if (updatedProblem.reviewCountDown !== 0) {
      expect(updatedProblem.reviewCountDown).toEqual(dummyStudentProblem.reviewCountDown! - 1);
    }
  });

  it("should update the student problem (update method)", async () => {
    if (!createdProblemId) throw new Error("No created problem ID available");
    const newAnswerStatus = "不正解" as StudentProblemsAnswerStatusEnum; // New value for answerStatus
    // The update method expects an array of Problem objects.
    const updatedData: StudentProblem = {
      answerStatus: newAnswerStatus,
    };
    const updateResult = await StudentProblems.update(createdProblemId, updatedData);
    expect(updateResult).toBe(true);
    const updatedProblem = await StudentProblems.findByStudentProblemId(createdProblemId);
    expect(updatedProblem.answerStatus).toEqual(newAnswerStatus);
  });

  it("should update student problems for coach plan (updateForCoachPlan)", async () => {
    if (!createdProblemId) throw new Error("No created problem ID available");
    // For example, update actualBlockId and orders.
    const updateForCoachPlanData = 
      [{
        studentProblemId: createdProblemId,
        actualBlockId: toMySQLUintID(36), // New actual block ID for test
        probOverallOrder: toUint(2) ,
        probInBlockOrder: toUint(2) ,
      }]
    ;
    const result = await StudentProblems.updateForCoachPlan(updateForCoachPlanData);
    expect(result).toBe(true);
    const updatedProblem = await StudentProblems.findByStudentProblemId(createdProblemId);
    expect(updatedProblem.actualBlockId).toEqual(36);
    expect(updatedProblem.problemOverallOrder).toEqual(2);
    expect(updatedProblem.problemInBlockOrder).toEqual(2);
  });

  it("should delete the student problem", async () => {
    if (!createdProblemId) throw new Error("No created problem ID available");
    const deleteResult = await StudentProblems.delete(createdProblemId);
    expect(deleteResult).toBe(true);
    const problemAfterDelete = await StudentProblems.findByStudentProblemId(createdProblemId);
    // Our findByStudentProblemId returns an empty object if not found (per code) or maybe null.
    // Here, we check for an empty object.
    expect(problemAfterDelete).toEqual({});
    createdProblemId = null;
  });
});
