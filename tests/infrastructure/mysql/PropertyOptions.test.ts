// PropertyOptions.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { PropertyOptions } from '@infrastructure/mysql/index.js'; // Adjust import path if needed
import { MySQLUintID, toMySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Define dummy data for testing. Ensure that notionDbPropertyId exists in your test DB.
const testPropertyOptionData = {
  notionDbPropertyId: toMySQLUintID(8), // Use a valid test notionDbPropertyId
  optionKey: "modernJapanese",
  optionValue: "現代文",
};

describe("PropertyOptions Integration Tests", () => {
  // This will store the ID of the created record for subsequent tests and cleanup.
  let createdPropertyOptionId: MySQLUintID | null = null;

  // Cleanup: after tests, delete the test record if it still exists.
  afterAll(async () => {
    if (createdPropertyOptionId !== null) {
      try {
        await PropertyOptions.delete(createdPropertyOptionId);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
  });

  it("should create a new property option", async () => {
    const created = await PropertyOptions.create(testPropertyOptionData);
    expect(created).toBe(true);

    // Retrieve the created record using findByNotionDbPropertyIdAndOptionValue
    const found = await PropertyOptions.findByNotionDbPropertyIdAndOptionValue(
      testPropertyOptionData.notionDbPropertyId,
      testPropertyOptionData.optionValue
    );
    expect(found).toBeTruthy();
    if (found) {
      createdPropertyOptionId = ensureValue(found.propertyOptionId);
    }
  });

  it("should find property options by notionDbPropertyId", async () => {
    const options = await PropertyOptions.findByNotionDbPropertyId(testPropertyOptionData.notionDbPropertyId);
    expect(Array.isArray(options)).toBe(true);
    const found = options.find(option => option.optionKey === testPropertyOptionData.optionKey);
    expect(found).toBeTruthy();
  });

  it("should find a property option by propertyOptionId", async () => {
    if (!createdPropertyOptionId) throw new Error("No created property option ID available");
    const option = await PropertyOptions.findByPropertyOptionId(createdPropertyOptionId);
    expect(option).toBeTruthy();
    if (option) {
      expect(option.propertyOptionId).toEqual(createdPropertyOptionId);
    }
  });

  it("should update a property option", async () => {
    if (!createdPropertyOptionId) throw new Error("No created property option ID available");
    const newOptionValue = testPropertyOptionData.optionValue + "_updated";
    const updateData = {
      ...testPropertyOptionData,
      optionValue: newOptionValue,
    };
    const updateResult = await PropertyOptions.update(createdPropertyOptionId, updateData);
    expect(updateResult).toBe(true);

    const updatedOption = await PropertyOptions.findByPropertyOptionId(createdPropertyOptionId);
    expect(updatedOption).toBeTruthy();
    if (updatedOption) {
      expect(updatedOption.optionValue).toEqual(newOptionValue);
    }
  });

  it("should delete the property option", async () => {
    if (!createdPropertyOptionId) throw new Error("No created property option ID available");
    const deleteResult = await PropertyOptions.delete(createdPropertyOptionId);
    expect(deleteResult).toBe(true);

    const optionAfterDelete = await PropertyOptions.findByPropertyOptionId(createdPropertyOptionId);
    expect(optionAfterDelete).toBeNull();
    createdPropertyOptionId = null;
  });
});
