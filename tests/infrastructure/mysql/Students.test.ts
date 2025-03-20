// Students.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { Students } from '@infrastructure/mysql/index.js'; // Adjust path as needed
import { MySQLUintID, NotionUUID, toEmail, toNotionUUID, toPhoneNumber } from '@domain/types/index.js';
import { Student } from '@domain/student/index.js';

// Define dummy student data for testing
const dummyStudent: Student = {
  studentName: "Test Student " + Date.now(),
  parentName: "Test Parent",
  parentPhoneNumber: toPhoneNumber("123-456-7890"),
  parentEmail: toEmail("parent@test.com"),
  examDate: "2026-02-25", // ISO date string
  studentPageId: toNotionUUID("19bb95a4c6198035b422ce14a172927f"),
  todoDbId: toNotionUUID("1bcb95a4c61980b091c0e0cd61e8f78d"),
  remainingDbId: toNotionUUID("19bb95a4c619804cbc04e488f42db7b5"),
  wrongDbId: toNotionUUID("1bcb95a4c61980e591efe1dd2a00848f"),
  isDifficultDbId: toNotionUUID("1bcb95a4c61980fe9097e42fc8dea23a"),
  todoCounterDbId: toNotionUUID("1aab95a4c61980f798dbf9b4dae2f432"),
  studentScheduleDbId: toNotionUUID("19bb95a4c61980fda4dce4c94dfd9b42"),
  studentOverviewPageId: toNotionUUID("1a9b95a4c61980499924c3cb0a10e5ba"),
  coachRestDbId: toNotionUUID("19eb95a4c61980f081dfeea8da6fa412"),
  coachPlanDbId: toNotionUUID("19bb95a4c61980dab22be7333b95e841"),
  necessaryStudyTimeDbId: toNotionUUID("19eb95a4c61980f19fd5daa96d8b10a6"),
  goalDescription: "東大合格",
};

describe("Students Repository Integration Tests", () => {
  let createdStudentId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: If a test record still exists, delete it.
  //   if (createdStudentId !== null) {
  //     try {
  //       await Students.delete(createdStudentId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create a new student", async () => {
    const createResult = await Students.create(dummyStudent);
    expect(createResult).toBe(true);

    // Use findAll to locate the new student record by name.
    const students = await Students.findAll();
    const found = students.find(s => s.studentName === dummyStudent.studentName);
    expect(found).toBeTruthy();
    if (found && found.studentId) {
      createdStudentId = found.studentId;
    }
  });

  it("should retrieve the student by studentId", async () => {
    if (!createdStudentId) throw new Error("No created studentId available");
    const student = await Students.findByStudentId(createdStudentId);
    expect(student).toBeTruthy();
    if (student) {
      expect(student.studentName).toEqual(dummyStudent.studentName);
      expect(student.parentEmail).toEqual(dummyStudent.parentEmail);
    }
  });

  it("should update the student's name and goal description", async () => {
    if (!createdStudentId) throw new Error("No created studentId available");
    const updatedName = dummyStudent.studentName + " Updated";
    const updatedGoal = "Updated goal description";
    const updatedData: Partial<Student> = {
      studentName: updatedName,
      goalDescription: updatedGoal,
    };
    const updateResult = await Students.update(createdStudentId, updatedData);
    expect(updateResult).toBe(true);

    const updatedStudent = await Students.findByStudentId(createdStudentId);
    expect(updatedStudent).toBeTruthy();
    if (updatedStudent) {
      expect(updatedStudent.studentName).toEqual(updatedName);
      expect(updatedStudent.goalDescription).toEqual(updatedGoal);
    }
  });

  it("should delete the student", async () => {
    if (!createdStudentId) throw new Error("No created studentId available");
    const deleteResult = await Students.delete(createdStudentId);
    expect(deleteResult).toBe(true);

    const deletedStudent = await Students.findByStudentId(createdStudentId);
    expect(deletedStudent).toBeNull();
    // Mark as deleted so afterAll doesn't attempt cleanup again.
    createdStudentId = null;
  });
});
