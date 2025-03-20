// Subfields.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { Subfields, Subfield } from '@infrastructure/mysql/index.js'; 
import { MySQLUintID, SubfieldsSubfieldNameEnum, toMySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Define dummy subfield data for testing.
// Ensure that the provided subjectId exists in your test database.
// Here, we assume that "日本史" and "英語" are valid SubfieldsSubfieldNameEnum values.
const dummySubfield: Subfield = {
  subjectId: toMySQLUintID(3), // Use a valid test subject ID from your database
  subfieldName: "日本史" as SubfieldsSubfieldNameEnum,
};

describe("Subfields Repository Integration Tests", () => {
  let createdSubfieldId: MySQLUintID | null = null;

  // Cleanup: Remove the test record if it still exists.
  // afterAll(async () => {
  //   if (createdSubfieldId !== null) {
  //     try {
  //       await Subfields.delete(createdSubfieldId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create a new subfield", async () => {
    const createResult = await Subfields.create(dummySubfield);
    expect(createResult).toBe(true);

    // Retrieve subfields for the given subjectId and find the one we just created.
    const subfields = await Subfields.findBySubjectId(dummySubfield.subjectId!);
    expect(Array.isArray(subfields)).toBe(true);
    const created = subfields.find(s => s.subfieldName === dummySubfield.subfieldName);
    expect(created).toBeTruthy();
    if (created) {
      createdSubfieldId = ensureValue(created.subfieldId);
    }
  });

  it("should retrieve the subfield by subfieldId", async () => {
    if (!createdSubfieldId) throw new Error("No created subfieldId available");
    const subfield = await Subfields.findBySubfieldId(createdSubfieldId);
    expect(subfield).toBeTruthy();
    if (subfield) {
      expect(subfield.subfieldName).toEqual(dummySubfield.subfieldName);
    }
  });

  it("should retrieve the subfield by subfieldName", async () => {
    const found = await Subfields.findBySubfieldName(dummySubfield.subfieldName as SubfieldsSubfieldNameEnum);
    expect(found).toBeTruthy();
    if (found) {
      expect(found.subfieldName).toEqual(dummySubfield.subfieldName);
    }
  });

  it("should retrieve subfields by subjectId", async () => {
    const subfields = await Subfields.findBySubjectId(dummySubfield.subjectId!);
    expect(Array.isArray(subfields)).toBe(true);
    const found = subfields.find(s => s.subfieldName === dummySubfield.subfieldName);
    expect(found).toBeTruthy();
  });

  it("should retrieve subfield with subject name by subfieldId", async () => {
    if (!createdSubfieldId) throw new Error("No created subfieldId available");
    const subfieldWithSubjectName = await Subfields.findWithSubjectNameBySubfieldId(createdSubfieldId);
    expect(subfieldWithSubjectName).toBeTruthy();
    if (subfieldWithSubjectName) {
      expect(subfieldWithSubjectName.subfieldName).toEqual(dummySubfield.subfieldName);
      // Check that a subjectName is present (the join returns a subject name)
      expect(subfieldWithSubjectName.subjectName).toBeDefined();
    }
  });

  it("should update the subfield", async () => {
    if (!createdSubfieldId) throw new Error("No created subfieldId available");
    // Update the subfield name to a new valid value.
    const updatedName = "Listening&Speaking" as SubfieldsSubfieldNameEnum; // Ensure "英語" is valid per your enum.
    const updateResult = await Subfields.update(createdSubfieldId, { subfieldName: updatedName });
    expect(updateResult).toBe(true);

    const updatedSubfield = await Subfields.findBySubfieldId(createdSubfieldId);
    expect(updatedSubfield).toBeTruthy();
    if (updatedSubfield) {
      expect(updatedSubfield.subfieldName).toEqual(updatedName);
    }
  });

  it("should delete the subfield", async () => {
    if (!createdSubfieldId) throw new Error("No created subfieldId available");
    const deleteResult = await Subfields.delete(createdSubfieldId);
    expect(deleteResult).toBe(true);

    const deletedSubfield = await Subfields.findBySubfieldId(createdSubfieldId);
    expect(deletedSubfield).toBeNull();
    createdSubfieldId = null;
  });
});
