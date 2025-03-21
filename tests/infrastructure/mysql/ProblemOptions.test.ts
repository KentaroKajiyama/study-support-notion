// ProblemOptions.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { ProblemOptions, ProblemOption } from '@infrastructure/mysql/index.js';
import { MySQLUintID, toMySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

const dummyProblemOption: ProblemOption = {
  problemId: toMySQLUintID(3),             // Replace with a valid test problem ID
  notionDbPropertyId: toMySQLUintID(10),      // Replace with a valid test notionDbPropertyId
  optionValue: `旧石器時代`,
};

describe("ProblemOptions Repository Integration Tests", () => {
  let createdOptionId: MySQLUintID | null = null;

  afterAll(async () => {
    // Cleanup: Delete the test record if it still exists.
    if (createdOptionId !== null) {
      try {
        await ProblemOptions.delete(createdOptionId);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
  });

  it.only("should create a new problem option", async () => {
    const createResult = await ProblemOptions.create(dummyProblemOption);
    expect(createResult).toBe(true);

    // Retrieve the record using composite key to capture its ID.
    const found = await ProblemOptions.findByCompositeKey(
      dummyProblemOption.problemId!,
      dummyProblemOption.notionDbPropertyId!
    );
    expect(found).toBeTruthy();
    if (found) {
      createdOptionId = ensureValue(found.problemOptionId);
    }
  });

  it("should retrieve all problem options", async () => {
    const options = await ProblemOptions.findAll();
    expect(Array.isArray(options)).toBe(true);
    const found = options.find(
      o => o.optionValue === dummyProblemOption.optionValue
    );
    expect(found).toBeTruthy();
  });

  it("should retrieve a problem option by its ID", async () => {
    if (!createdOptionId) throw new Error("No created option ID available");
    const option = await ProblemOptions.findByProblemOptionId(createdOptionId);
    expect(option).toBeTruthy();
    if (option) {
      expect(option.problemOptionId).toEqual(createdOptionId);
    }
  });

  it("should retrieve problem options by problemId", async () => {
    const options = await ProblemOptions.findByProblemId(dummyProblemOption.problemId!);
    expect(Array.isArray(options)).toBe(true);
    const found = options.find(
      o => o.optionValue === dummyProblemOption.optionValue
    );
    expect(found).toBeTruthy();
  });

  it("should retrieve problem options by notionDbPropertyId", async () => {
    const options = await ProblemOptions.findByNotionDbPropertyId(dummyProblemOption.notionDbPropertyId!);
    expect(Array.isArray(options)).toBe(true);
    const found = options.find(
      o => o.optionValue === dummyProblemOption.optionValue
    );
    expect(found).toBeTruthy();
  });

  it("should retrieve a problem option by composite key", async () => {
    const option = await ProblemOptions.findByCompositeKey(
      dummyProblemOption.problemId!,
      dummyProblemOption.notionDbPropertyId!
    );
    expect(option).toBeTruthy();
    if (option) {
      expect(option.optionValue).toEqual(dummyProblemOption.optionValue);
    }
  });

  it("should update a problem option using the generic update method", async () => {
    if (!createdOptionId) throw new Error("No created option ID available");
    const newOptionValue = dummyProblemOption.optionValue + "_updated";
    const updateResult = await ProblemOptions.update(createdOptionId, {
      ...dummyProblemOption,
      optionValue: newOptionValue,
    });
    expect(updateResult).toBe(true);
    const updatedOption = await ProblemOptions.findByProblemOptionId(createdOptionId);
    expect(updatedOption).toBeTruthy();
    if (updatedOption) {
      expect(updatedOption.optionValue).toEqual(newOptionValue);
    }
  });

  it("should update a problem option using updateByCompositeKey", async () => {
    if (!dummyProblemOption.problemId || !dummyProblemOption.notionDbPropertyId) {
      throw new Error("Missing keys for composite update");
    }
    const newOptionValue = dummyProblemOption.optionValue + "_composite";
    const compositeUpdateResult = await ProblemOptions.updateByCompositeKey(
      dummyProblemOption.problemId,
      dummyProblemOption.notionDbPropertyId,
      newOptionValue
    );
    expect(compositeUpdateResult).toBe(true);
    const updatedOption = await ProblemOptions.findByCompositeKey(
      dummyProblemOption.problemId,
      dummyProblemOption.notionDbPropertyId
    );
    expect(updatedOption).toBeTruthy();
    if (updatedOption) {
      expect(updatedOption.optionValue).toEqual(newOptionValue);
    }
  });

  it("should delete the problem option", async () => {
    if (!createdOptionId) throw new Error("No created option ID available");
    const deleteResult = await ProblemOptions.delete(createdOptionId);
    expect(deleteResult).toBe(true);
    const optionAfterDelete = await ProblemOptions.findByProblemOptionId(createdOptionId);
    expect(optionAfterDelete).toBeNull();
    createdOptionId = null;
  });
});
