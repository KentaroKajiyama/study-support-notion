// StudentSubfieldTraces.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { StudentSubfieldTraces, StudentSubfieldTrace } from '@infrastructure/mysql/index.js';
import { MySQLUintID, Uint, SubfieldsSubfieldNameEnum, toMySQLUintID, toInt, Int, toURLString, toUint } from '@domain/types/index.js';

// Dummy test data – adjust these IDs to valid values in your test database.
const testStudentId: MySQLUintID = toMySQLUintID(8); // Replace with a valid test student ID
const testSubfieldId: MySQLUintID = toMySQLUintID(6);  // Replace with a valid test subfield ID

// We'll use these variables to store the created trace's identifier (if available) or identify our record later.
let createdTrace: StudentSubfieldTrace | null = null;

describe("StudentSubfieldTraces Repository Integration Tests", () => {
  // Create a new trace record using only the required fields.
  it.only("should create a new StudentSubfieldTrace", async () => {
    const createResult = await StudentSubfieldTraces.create({
      studentId: testStudentId,
      subfieldId: testSubfieldId,
    });
    expect(createResult).toBeTruthy;

    // After creation, try to retrieve records for our student.
    const traces = await StudentSubfieldTraces.findByStudentId(testStudentId);
    expect(Array.isArray(traces)).toBe(true);
    // Assume that our test database is isolated so that the record with our test studentId and test subfieldId is ours.
    createdTrace = traces.find(trace => trace.subfieldId === testSubfieldId) || null;
    expect(createdTrace).toBeTruthy();
  });

  it("should retrieve all StudentSubfieldTraces", async () => {
    const allTraces = await StudentSubfieldTraces.findAll();
    expect(Array.isArray(allTraces)).toBe(true);
    // Our created trace should appear in the full list.
    const found = allTraces.find(trace => trace.studentId === testStudentId && trace.subfieldId === testSubfieldId);
    expect(found).toBeTruthy();
  });

  it("should retrieve StudentSubfieldTraces by studentId", async () => {
    const traces = await StudentSubfieldTraces.findByStudentId(testStudentId);
    expect(Array.isArray(traces)).toBe(true);
    const found = traces.find(trace => trace.subfieldId === testSubfieldId);
    expect(found).toBeTruthy();
  });

  it("should retrieve only subfield info by studentId", async () => {
    const info = await StudentSubfieldTraces.findOnlySubfieldInfoByStudentId(testStudentId);
    expect(Array.isArray(info)).toBe(true);
    const found = info.find(item => item.subfieldId === testSubfieldId);
    expect(found).toBeTruthy();
    // Check that a subfieldName is provided (if the join returned one)
    if (found) {
      expect(typeof found.subfieldName).toBe("string");
    }
  });

  it("should retrieve review alert info by studentId", async () => {
    const reviewAlerts = await StudentSubfieldTraces.findOnlyReviewAlertByStudentId(testStudentId);
    expect(Array.isArray(reviewAlerts)).toBe(true);
    // Even if reviewAlert is null, the returned structure should include the studentId and subfieldId.
    const found = reviewAlerts.find(item => item.subfieldId === testSubfieldId);
    expect(found).toBeTruthy();
  });

  it("should retrieve trace with subfield name by composite key", async () => {
    // This method uses a join to get subfieldName.
    // Note: The query in your code joins on a questionable column (subfields.subfield_name); ensure your test DB setup matches.
    const traceWithName = await StudentSubfieldTraces.findWithSubfieldNameByCompositeKey(testStudentId, testSubfieldId);
    expect(traceWithName).toBeTruthy();
    if (traceWithName) {
      expect(traceWithName.subfieldId).toEqual(testSubfieldId);
      // Check that subfieldName is returned.
      expect(typeof traceWithName.subfieldName).toBe("string");
    }
  });

  it("should retrieve todoCounter by composite key", async () => {
    const todoCounter = await StudentSubfieldTraces.findOnlyTodoCounterByCompositeKey(testStudentId, testSubfieldId);
    // Depending on your DB defaults, this may be null or a number.
    // For testing, we accept either null or a non-negative number.
    if (todoCounter !== null) {
      expect(typeof todoCounter).toBe("number");
      expect(todoCounter).toBeGreaterThanOrEqual(0);
    }
  });

  it("should update a StudentSubfieldTrace by traceId", async () => {
    if (!createdTrace || !createdTrace.traceId) throw new Error("No created trace available");
    const newDelay: Int = toInt(5); // Example new delay value.
    const updateResult = await StudentSubfieldTraces.update(createdTrace.traceId, { delay: newDelay });
    expect(updateResult).toBe(true);
    // Retrieve the updated record.
    const traces = await StudentSubfieldTraces.findByStudentId(testStudentId);
    const updated = traces.find(trace => trace.traceId === createdTrace?.traceId);
    expect(updated).toBeTruthy();
    if (updated) {
      expect(updated.delay).toEqual(newDelay);
    }
  });

  it("should update a StudentSubfieldTrace by composite key", async () => {
    // For example, update todoCounter via composite key.
    const newTodoCounter: Uint = toUint(10);
    const updateResult = await StudentSubfieldTraces.updateByCompositeKey(testStudentId, testSubfieldId, { todoCounter: newTodoCounter });
    expect(updateResult).toBe(true);
    // Retrieve and check update.
    const traces = await StudentSubfieldTraces.findByStudentId(testStudentId);
    const updated = traces.find(trace => trace.subfieldId === testSubfieldId);
    expect(updated).toBeTruthy();
    if (updated) {
      expect(updated.todoCounter).toEqual(newTodoCounter);
    }
  });

  it("should delete a StudentSubfieldTrace by composite key", async () => {
    // Delete our test record using composite key.
    const deleteResult = await StudentSubfieldTraces.delete(testStudentId, testSubfieldId);
    expect(deleteResult).toBe(true);
    // Verify deletion.
    const tracesAfterDelete = await StudentSubfieldTraces.findByStudentId(testStudentId);
    const stillExists = tracesAfterDelete.some(trace => trace.subfieldId === testSubfieldId);
    expect(stillExists).toBe(false);
  });
});
