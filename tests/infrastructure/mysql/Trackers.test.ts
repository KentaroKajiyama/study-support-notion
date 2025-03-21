// Trackers.integration.test.ts
import { describe, it, expect, afterAll } from 'vitest';
import { Trackers, Tracker } from '@infrastructure/mysql/index.js';
import { MySQLUintID, toMySQLUintID, toUint, Uint } from '@domain/types/index.js';
import { ensureValue } from '@utils/ensureValue.js';

// Dummy data for creating a tracker record. Make sure these IDs are valid in your test DB.
const dummyTracker: Tracker = {
  studentId: toMySQLUintID(8),         // Replace with a valid test student ID
  subfieldId: toMySQLUintID(6),          // Replace with a valid test subfield ID
  actualBlockId: toMySQLUintID(36),       // Replace with a valid test actual block ID
  studentProblemId: toMySQLUintID(8),    // Replace with a valid test student problem ID
  remainingSpace: toUint(50),
  isRest: false,
  currentLap:toUint(1),
  isEnabled: true,
};

describe("Trackers Repository Integration Tests", () => {
  let createdTrackerId: MySQLUintID | null = null;

  // afterAll(async () => {
  //   // Cleanup: delete the tracker record if it still exists.
  //   if (createdTrackerId !== null) {
  //     try {
  //       await Trackers.delete(createdTrackerId);
  //     } catch (err) {
  //       console.error("Cleanup error:", err);
  //     }
  //   }
  // });

  it.only("should create a new tracker", async () => {
    const result = await Trackers.create(dummyTracker);
    expect(result).toBeTruthy();

    // Retrieve created tracker by studentId (or composite key) to capture its ID.
    const trackers = await Trackers.findByStudentId(dummyTracker.studentId!);
    const created = trackers.find(
      t =>
        t.studentId === dummyTracker.studentId &&
        t.subfieldId === dummyTracker.subfieldId &&
        t.remainingSpace === dummyTracker.remainingSpace
    );
    expect(created).toBeTruthy();
    if (created) {
      createdTrackerId = ensureValue(created.trackerId);
    }
  });

  it("should retrieve the tracker by its ID", async () => {
    if (!createdTrackerId) throw new Error("No tracker ID available");
    const tracker = await Trackers.findById(createdTrackerId);
    expect(tracker).toBeTruthy();
    if (tracker) {
      expect(tracker.remainingSpace).toEqual(dummyTracker.remainingSpace);
      expect(tracker.isEnabled).toEqual(dummyTracker.isEnabled);
    }
  });

  it("should retrieve trackers by studentId", async () => {
    const trackers = await Trackers.findByStudentId(dummyTracker.studentId!);
    expect(Array.isArray(trackers)).toBe(true);
    const found = trackers.find(t => t.trackerId === createdTrackerId);
    expect(found).toBeTruthy();
  });

  it("should retrieve tracker by composite key (studentId, subfieldId)", async () => {
    const tracker = await Trackers.findByCompositeKey(dummyTracker.studentId!, dummyTracker.subfieldId!);
    expect(tracker).toBeTruthy();
    if (tracker) {
      expect(tracker.studentId).toEqual(dummyTracker.studentId);
      expect(tracker.subfieldId).toEqual(dummyTracker.subfieldId);
    }
  });

  it("should update remainingSpace via updateRemainingSpace", async () => {
    if (!createdTrackerId) throw new Error("No tracker ID available");
    const newRemainingSpace = toUint(40);
    const updateResult = await Trackers.updateRemainingSpace(createdTrackerId, newRemainingSpace);
    expect(updateResult).toBe(true);
    const tracker = await Trackers.findById(createdTrackerId);
    expect(tracker?.remainingSpace).toEqual(newRemainingSpace);
  });

  it("should update currentLap via updateLap", async () => {
    if (!createdTrackerId) throw new Error("No tracker ID available");
    const newLap =toUint( 2);
    const updateResult = await Trackers.updateLap(createdTrackerId, newLap);
    expect(updateResult).toBe(true);
    const tracker = await Trackers.findById(createdTrackerId);
    expect(tracker?.currentLap).toEqual(newLap);
  });

  it("should update isRest via updateIsRest", async () => {
    if (!createdTrackerId) throw new Error("No tracker ID available");
    const updateResult = await Trackers.updateIsRest(createdTrackerId, true);
    expect(updateResult).toBe(true);
    const tracker = await Trackers.findById(createdTrackerId);
    expect(tracker?.isRest).toEqual(true);
  });

  it("should update all trackers' isEnabled status by studentId", async () => {
    // Update all trackers for the student to disabled (false)
    const updateResult = await Trackers.updateAllTrackersStatusByStudentId(dummyTracker.studentId!, false);
    expect(updateResult).toBe(true);
    const trackers = await Trackers.findByStudentId(dummyTracker.studentId!);
    trackers.forEach(tracker => {
      expect(tracker.isEnabled).toEqual(false);
    });
    // Restore enabled status for subsequent tests.
    await Trackers.updateAllTrackersStatusByStudentId(dummyTracker.studentId!, true);
  });

  it("should update tracker using generic update", async () => {
    if (!createdTrackerId) throw new Error("No tracker ID available");
    const newRemainingSpace = toUint(30);
    const updateResult = await Trackers.update(createdTrackerId, { remainingSpace: newRemainingSpace });
    expect(updateResult).toBe(true);
    const tracker = await Trackers.findById(createdTrackerId);
    expect(tracker?.remainingSpace).toEqual(newRemainingSpace);
  });

  it("should delete the tracker", async () => {
    if (!createdTrackerId) throw new Error("No tracker ID available");
    const deleteResult = await Trackers.delete(createdTrackerId);
    expect(deleteResult).toBe(true);
    const trackerAfterDelete = await Trackers.findById(createdTrackerId);
    expect(trackerAfterDelete).toBeNull();
    createdTrackerId = null;
  });
});
