// Subjects.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { Subjects, Subject } from '@infrastructure/mysql/index.js'; 
import { MySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Create a unique subject name using the current timestamp.
const uniqueSubjectName = "日本史";

const dummySubject: Subject = {
  subjectName: uniqueSubjectName,
};

describe("Subjects Repository Integration Tests", () => {
  let createdSubjectId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: Delete the subject if it still exists.
  //   if (createdSubjectId !== null) {
  //     try {
  //       await Subjects.delete(createdSubjectId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create a new subject", async () => {
    const createResult = await Subjects.create(dummySubject);
    expect(createResult).toBe(true);
    // Retrieve the created subject by name to get its ID.
    const subjectsFound = await Subjects.findBySubjectName(uniqueSubjectName);
    expect(Array.isArray(subjectsFound)).toBe(true);
    const created = subjectsFound.find(s => s.subjectName === uniqueSubjectName);
    expect(created).toBeTruthy();
    if (created) {
      createdSubjectId = ensureValue(created.subjectId);
    }
  });

  it("should retrieve the subject by subjectId", async () => {
    if (!createdSubjectId) throw new Error("No created subject ID available");
    const subject = await Subjects.findBySubjectId(createdSubjectId);
    expect(subject).toBeTruthy();
    if (subject) {
      expect(subject.subjectName).toEqual(uniqueSubjectName);
    }
  });

  it("should retrieve all subject names", async () => {
    const subjectNames = await Subjects.findAllSubjectNames();
    expect(Array.isArray(subjectNames)).toBe(true);
    // The created subject name should be among them.
    expect(subjectNames).toContain(uniqueSubjectName);
  });

  it("should update the subject", async () => {
    if (!createdSubjectId) throw new Error("No created subject ID available");
    const updatedName = "世界史";
    const updateResult = await Subjects.update(createdSubjectId, { subjectName: updatedName });
    expect(updateResult).toBe(true);
    const updatedSubject = await Subjects.findBySubjectId(createdSubjectId);
    expect(updatedSubject).toBeTruthy();
    if (updatedSubject) {
      expect(updatedSubject.subjectName).toEqual(updatedName);
    }
  });

  it("should delete the subject", async () => {
    if (!createdSubjectId) throw new Error("No created subject ID available");
    const deleteResult = await Subjects.delete(createdSubjectId);
    expect(deleteResult).toBe(true);
    const deletedSubject = await Subjects.findBySubjectId(createdSubjectId);
    expect(deletedSubject).toBeNull();
    // Mark as deleted so cleanup doesn't run again.
    createdSubjectId = null;
  });
});
