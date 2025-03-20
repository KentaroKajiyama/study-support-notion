// NotionDbProperties.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NotionDbProperties } from '@infrastructure/mysql/index.js'; // Adjust the import path as needed
// You may import types if they are exported. Otherwise, we declare the test data inline.
import { MySQLUintID, NotionDbPropertiesPropertyTypeEnum } from '@domain/types/index.js';
import { ensureValue } from '@utils/index.js';

interface TestNotionDbProperty {
  dbName: string;
  programName: string;
  propertyName: string;
  propertyType: NotionDbPropertiesPropertyTypeEnum;
}

// Use a unique propertyName for testing so you can reliably find it later.
const testProperty: TestNotionDbProperty = {
  dbName: "todo_db",
  programName: "subfieldName",
  propertyName: "科目",
  propertyType: "select",
};

describe("NotionDbProperties Integration Tests", () => {
  // This will hold the ID of the created record.
  let createdRecordId: MySQLUintID | null = null;

  // Cleanup: After all tests, try to delete the test record if it still exists.
  afterAll(async () => {
    if (createdRecordId !== null) {
      try {
        await NotionDbProperties.delete(createdRecordId);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }
  });

  it.only("should create a new notion db property", async () => {
    const created = await NotionDbProperties.create(testProperty);
    expect(created).toBe(true);
  });

  it("should find the created property by dbName and propertyName", async () => {
    const found = await NotionDbProperties.findByDbNameAndPropertyName(
      testProperty.dbName,
      testProperty.propertyName
    );
    expect(found).toBeTruthy();
    if (found) {
      // Store the id for later tests.
      createdRecordId = ensureValue(found.notionDbPropertyId);
      expect(found.dbName).toEqual(testProperty.dbName);
      expect(found.propertyName).toEqual(testProperty.propertyName);
    }
  });

  it("should find the property by its notionDbPropertyId", async () => {
    if (!createdRecordId) throw new Error("No created record ID available");
    const foundById = await NotionDbProperties.findByNotionDbPropertyId(createdRecordId);
    expect(foundById).toBeTruthy();
    if (foundById) {
      expect(foundById.notionDbPropertyId).toEqual(createdRecordId);
    }
  });

  it("should update the notion db property", async () => {
    if (!createdRecordId) throw new Error("No created record ID available");
    // Prepare updated data; for example, change propertyName.
    const updatedPropertyName = testProperty.propertyName + "_updated";
    const updateData: TestNotionDbProperty = {
      ...testProperty,
      propertyName: updatedPropertyName,
    };
    const updateResult = await NotionDbProperties.update(createdRecordId, updateData);
    expect(updateResult).toBe(true);

    // Verify update via findByDbNameAndPropertyName.
    const foundAfterUpdate = await NotionDbProperties.findByDbNameAndPropertyName(
      testProperty.dbName,
      updatedPropertyName
    );
    expect(foundAfterUpdate).toBeTruthy();
    if (foundAfterUpdate) {
      expect(foundAfterUpdate.propertyName).toEqual(updatedPropertyName);
    }
  });

  it("should delete the notion db property", async () => {
    if (!createdRecordId) throw new Error("No created record ID available");
    const deleteResult = await NotionDbProperties.delete(createdRecordId);
    expect(deleteResult).toBe(true);

    const foundAfterDelete = await NotionDbProperties.findByNotionDbPropertyId(createdRecordId);
    expect(foundAfterDelete).toBeNull();
    // Mark the record id as null so cleanup doesn't try to delete it again.
    createdRecordId = null;
  });
});
