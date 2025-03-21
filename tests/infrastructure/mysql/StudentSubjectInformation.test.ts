// StudentSubjectInformation.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { StudentSubjectInformationData, StudentSubjectInformation } from '@infrastructure/mysql/index.js';
import { MySQLUintID, toMySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Dummy test data – ensure these IDs and enum values are valid in your test DB.
const dummyStudentSubjectInfo: StudentSubjectInformation = {
  studentId: toMySQLUintID(8), // Replace with a valid test student ID
  subjectId: toMySQLUintID(3), // Replace with a valid test subject ID
  subjectLevel: "基礎３", // Example value; adjust per your enum definitions
  goalDescription: "旧帝大レベル",
  subjectGoalLevel: 60, // Example value; adjust per your enum definitions
};

describe("StudentSubjectInformationData Repository Integration Tests", () => {
  let createdRecordId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: Delete the created record if it exists.
  //   if (createdRecordId !== null) {
  //     try {
  //       await StudentSubjectInformationData.delete(createdRecordId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create a new StudentSubjectInformation record", async () => {
    const createResult = await StudentSubjectInformationData.create(dummyStudentSubjectInfo);
    expect(createResult).toBeTruthy();
    // Use findByCompositeKey to locate the created record.
    const foundRecord = await StudentSubjectInformationData.findByCompositeKey(
      dummyStudentSubjectInfo.studentId!,
      dummyStudentSubjectInfo.subjectId!
    );
    expect(foundRecord).toBeTruthy();
    if (foundRecord) {
      createdRecordId = ensureValue(foundRecord.studentSubjectInformationId);
    }
  });

  it("should retrieve all StudentSubjectInformation records", async () => {
    const allRecords = await StudentSubjectInformationData.findAll();
    expect(Array.isArray(allRecords)).toBe(true);
    const found = allRecords.find(r => 
      r.studentId === dummyStudentSubjectInfo.studentId &&
      r.subjectId === dummyStudentSubjectInfo.subjectId
    );
    expect(found).toBeTruthy();
  });

  it("should retrieve StudentSubjectInformation by studentId", async () => {
    const recordsByStudent = await StudentSubjectInformationData.findByStudentId(dummyStudentSubjectInfo.studentId!);
    expect(Array.isArray(recordsByStudent)).toBe(true);
    const found = recordsByStudent.find(r => r.subjectId === dummyStudentSubjectInfo.subjectId);
    expect(found).toBeTruthy();
  });

  it("should retrieve ID and subject name by studentId", async () => {
    const idAndNames = await StudentSubjectInformationData.findIdAndSubjectNameByStudentId(dummyStudentSubjectInfo.studentId!);
    expect(Array.isArray(idAndNames)).toBe(true);
    expect(idAndNames).toBeTruthy();
  });

  it("should retrieve a record by composite key (studentId and subjectId)", async () => {
    const record = await StudentSubjectInformationData.findByCompositeKey(
      dummyStudentSubjectInfo.studentId!,
      dummyStudentSubjectInfo.subjectId!
    );
    expect(record).toBeTruthy();
    if (record) {
      expect(record.studentId).toEqual(dummyStudentSubjectInfo.studentId);
      expect(record.subjectId).toEqual(dummyStudentSubjectInfo.subjectId);
    }
  });

  it("should update the StudentSubjectInformation record", async () => {
    if (!createdRecordId) throw new Error("No created record ID available");
    const newGoalDescription = dummyStudentSubjectInfo.goalDescription + " - updated";
    const updateResult = await StudentSubjectInformationData.update(createdRecordId, { goalDescription: newGoalDescription });
    expect(updateResult).toBe(true);
    const updatedRecord = await StudentSubjectInformationData.findByCompositeKey(
      dummyStudentSubjectInfo.studentId!,
      dummyStudentSubjectInfo.subjectId!
    );
    expect(updatedRecord).toBeTruthy();
    if (updatedRecord) {
      expect(updatedRecord.goalDescription).toEqual(newGoalDescription);
    }
  });

  it("should delete the StudentSubjectInformation record", async () => {
    if (!createdRecordId) throw new Error("No created record ID available");
    const deleteResult = await StudentSubjectInformationData.delete(createdRecordId);
    expect(deleteResult).toBe(true);
    const recordAfterDelete = await StudentSubjectInformationData.findByCompositeKey(
      dummyStudentSubjectInfo.studentId!,
      dummyStudentSubjectInfo.subjectId!
    );
    expect(recordAfterDelete).toBeNull();
    createdRecordId = null;
  });
});
