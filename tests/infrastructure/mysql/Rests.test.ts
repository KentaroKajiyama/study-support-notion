// Rests.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { Rests, Rest } from '@infrastructure/mysql/index.js';
import { MySQLUintID, NotionUUID, toMySQLUintID } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Dummy test data for a Rest record.
// In the create() method, only studentId, subfieldId, startDate, and endDate are inserted.
// Adjust these values to valid ones in your test DB.
const dummyRest: Rest = {
  studentId: toMySQLUintID(8),      // Replace with a valid test student ID
  subfieldId: toMySQLUintID(6),        // Replace with a valid test subfield ID
  // Provide valid ISO date strings (or the format your converters expect)
  restName: '夏休み',
  startDate: "2025-08-01", 
  endDate: "2025-08-10",
  // Optionally, you can include restName, notionPageId, etc. for update tests.
};

describe("Rests Repository Integration Tests", () => {
  let createdRestId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: If the test record still exists, delete it.
  //   if (createdRestId !== null) {
  //     try {
  //       await Rests.delete(createdRestId);
  //     } catch (error) {
  //       console.error("Cleanup error:", error);
  //     }
  //   }
  // });

  it.only("should create a new Rest record", async () => {
    const insertId = await Rests.create(dummyRest);
    expect(typeof insertId).toBe("number");
    expect(insertId).toBeGreaterThan(0);
    createdRestId = ensureValue(insertId);
  });

  it("should retrieve all Rest records and include the created one", async () => {
    const allRests = await Rests.findAll();
    expect(Array.isArray(allRests)).toBe(true);
    const found = allRests.find(rest => 
      rest.studentId === dummyRest.studentId && 
      rest.subfieldId === dummyRest.subfieldId &&
      rest.startDate === dummyRest.startDate &&
      rest.endDate === dummyRest.endDate
    );
    expect(found).toBeTruthy();
  });

  it("should retrieve Rest records by studentId", async () => {
    const restsByStudent = await Rests.findByStudentId(dummyRest.studentId!);
    expect(Array.isArray(restsByStudent)).toBe(true);
    const found = restsByStudent.find(rest => rest.subfieldId === dummyRest.subfieldId);
    expect(found).toBeTruthy();
  });

  it("should retrieve Rest records by composite key (studentId and subfieldId)", async () => {
    const restsByComposite = await Rests.findByCompositeKey(dummyRest.studentId!, dummyRest.subfieldId!);
    expect(Array.isArray(restsByComposite)).toBe(true);
    const found = restsByComposite.find(rest =>
      rest.studentId === dummyRest.studentId && rest.subfieldId === dummyRest.subfieldId
    );
    expect(found).toBeTruthy();
  });

  it("should update the Rest record", async () => {
    if (!createdRestId) throw new Error("No created Rest ID available");
    // For update, we provide new startDate and endDate.
    // Ensure the new dates form a valid range: startDate is before endDate.
    const updatedRest: Rest = {
      // Add a restName for demonstration (even if not inserted during creation)
      restName: "Updated Test Rest",
      startDate: "2024-01-02", // New start date
      endDate: "2024-01-12",   // New end date
    };

    // The update method expects an array of Rest objects.
    const updateResult = await Rests.update(createdRestId, updatedRest);
    expect(updateResult).toBe(true);

    // Retrieve and verify the update.
    const updatedRecords = await Rests.findByStudentId(dummyRest.studentId!);
    const updatedRecord = updatedRecords.find(r => r.restId === createdRestId);
    expect(updatedRecord).toBeTruthy();
    if (updatedRecord) {
      expect(updatedRecord.restName).toEqual("Updated Test Rest");
      expect(updatedRecord.startDate).toEqual(updatedRest.startDate);
      expect(updatedRecord.endDate).toEqual(updatedRest.endDate);
    }
  });

  it("should delete the Rest record", async () => {
    if (!createdRestId) throw new Error("No created Rest ID available");
    const deleteResult = await Rests.delete(createdRestId);
    expect(deleteResult).toBe(true);

    // Verify deletion by attempting to retrieve by composite key.
    const recordsAfterDelete = await Rests.findByCompositeKey(dummyRest.studentId!, dummyRest.subfieldId!);
    // Our record should no longer appear.
    const found = recordsAfterDelete.find(r => r.restId === createdRestId);
    expect(found).toBeUndefined();
    createdRestId = null;
  });
});
