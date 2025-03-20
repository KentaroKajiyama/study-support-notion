// Problems.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { Problems, Problem } from '@infrastructure/mysql/index.js';
import { MySQLUintID, Uint, ProblemsProblemLevelEnum, NotionUUID, toUint, toMySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

const dummyProblem: Problem = {
  subfieldId: toMySQLUintID(6), // Adjust to a valid test subfield ID
  defaultBlockId: toMySQLUintID(45), // Adjust to a valid test default block ID
  notionPageId: ("1bcb95a4c6198163a8bdcb8fa4b03ce1") as NotionUUID,
  problemName: "旧石器時代と新石器時代の違いが説明できる？",
  answer: "旧石器時代は打製石器を用い、新石器時代は磨製石器を使用した。",
  problemLevel: "基礎３", 
};

describe('Problems Repository Integration Tests', () => {
  let createdProblemId: MySQLUintID | null = null;

  it('should create a new problem', async () => {
    const createResult = await Problems.create(dummyProblem);
    expect(createResult).toBe(true);
    // Since create() returns a boolean, we retrieve the created record using findBySubfieldId.
    const problems = await Problems.findBySubfieldId(dummyProblem.subfieldId!);
    const created = problems.find(p => p.problemName === dummyProblem.problemName);
    expect(created).toBeTruthy();
    if (created) {
      createdProblemId = ensureValue(created.problemId);
    }
  });

  it('should retrieve the problem by id', async () => {
    if (!createdProblemId) throw new Error("No created problem id available");
    const problems = await Problems.findById(createdProblemId);
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBeGreaterThan(0);
    const retrieved = problems[0];
    expect(retrieved.problemName).toEqual(dummyProblem.problemName);
  });

  it('should retrieve problems by subfield id', async () => {
    const problems = await Problems.findBySubfieldId(dummyProblem.subfieldId!);
    expect(Array.isArray(problems)).toBe(true);
    const found = problems.find(p => p.problemName === dummyProblem.problemName);
    expect(found).toBeTruthy();
  });

  it('should update the problem', async () => {
    if (!createdProblemId) throw new Error("No created problem id available");
    const updatedProblemName = dummyProblem.problemName + " Updated";
    // The update method expects an array of Problem objects.
    const updateData: Problem = {
      ...dummyProblem,
      problemName: updatedProblemName,
    };
    const updateResult = await Problems.update(createdProblemId, [updateData]);
    expect(updateResult).toBe(true);
    const problems = await Problems.findById(createdProblemId);
    expect(problems.length).toBeGreaterThan(0);
    const updatedProblem = problems[0];
    expect(updatedProblem.problemName).toEqual(updatedProblemName);
  });

  it('should delete the problem', async () => {
    if (!createdProblemId) throw new Error("No created problem id available");
    const deleteResult = await Problems.delete(createdProblemId);
    expect(deleteResult).toBe(true);
    const problemsAfterDelete = await Problems.findById(createdProblemId);
    expect(problemsAfterDelete.length).toEqual(0);
    createdProblemId = null;
  });
});
