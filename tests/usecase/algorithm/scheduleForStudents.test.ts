// // File: tests/usecase/scheduling.test.ts
// import { describe, it, expect, vi } from "vitest";

// // --- Mock external dependencies ---

// vi.mock("@infrastructure/mysql/index.js", () => ({
//   ActualBlocks: {
//     findByStudentActualBlockDbNotionPageId: vi.fn().mockResolvedValue({
//       actualBlockId: 1,
//       studentScheduleNotionPageId: "nsid1",
//       speed: 5,
//       space: 3,
//       lap: 2,
//     }),
//     updateForDelayOrExpidite: vi.fn().mockResolvedValue(undefined),
//     findByStudentIdAndSubfieldId: vi.fn().mockResolvedValue([
//       {
//         actualBlockId: 1,
//         blockOrder: 1,
//         studentScheduleNotionPageId: "nsid1",
//         coachPlanNotionPageId: "ncid1",
//         startDate: "2025-01-01" as any,
//         endDate: "2025-01-10" as any,
//         speed: 5,
//         space: 3,
//         lap: 2,
//         isTail: false,
//         actualBlockSize: 10,
//       },
//     ]),
//     findByActualBlockId: vi.fn().mockResolvedValue({
//       actualBlockId: 1,
//       speed: 5,
//       space: 3,
//       lap: 2,
//       actualBlockSize: 10,
//       blockOrder: 1,
//       isTail: false,
//       startDate: "2025-01-01" as any,
//       endDate: "2025-01-10" as any,
//       studentScheduleNotionPageId: "nsid1",
//       coachPlanNotionPageId: "ncid1",
//     }),
//     findByStudentSubfieldIdAndBlockOrder: vi.fn().mockResolvedValue({
//       actualBlockId: 2,
//       blockOrder: 2,
//       studentScheduleNotionPageId: "nsid2",
//       coachPlanNotionPageId: "ncid2",
//       startDate: "2025-01-11" as any,
//       endDate: "2025-01-20" as any,
//       speed: 5,
//       space: 3,
//       lap: 2,
//       isTail: false,
//       actualBlockSize: 10,
//     }),
//   },
//   StudentProblems: {
//     findWithSubfieldIdByStudentId: vi.fn().mockResolvedValue([
//       {
//         studentProblemId: 100,
//         notionPageId: "npid100",
//         problemInBlockOrder: 1,
//         subfieldId: 1,
//         actualBlockId: 1,
//       },
//     ]),
//     findByBlockInfoAndStudentInfo: vi.fn().mockResolvedValue({ studentProblemId: 101 }),
//     findByNotionPageId: vi.fn().mockResolvedValue({
//       studentProblemId: 102,
//       problemInBlockOrder: 1,
//     }),
//     findByStudentProblemId: vi.fn().mockResolvedValue({
//       studentProblemId: 100,
//       problemInBlockOrder: 1,
//     }),
//   },
//   Students: {
//     findByStudentId: vi.fn().mockResolvedValue({ examDate: "2025-01-21" as any }),
//   },
//   StudentSubfieldTraces: {
//     findWithSubfieldNameByCompositeKey: vi.fn().mockResolvedValue({ delay: 0 }),
//     updateByCompositeKey: vi.fn().mockResolvedValue(undefined),
//   },
// }));

// vi.mock("@infrastructure/notion/index.js", () => ({
//   NotionCoachIrregulars: vi.fn().mockImplementation(() => ({
//     updatePageProperties: vi.fn().mockResolvedValue(undefined),
//   })),
//   NotionCoachPlans: vi.fn().mockImplementation(() => ({
//     updatePageProperties: vi.fn().mockResolvedValue(undefined),
//   })),
//   NotionStudentSchedules: vi.fn().mockImplementation(() => ({
//     updatePageProperties: vi.fn().mockResolvedValue(undefined),
//   })),
// }));

// // Optionally, if your domain/coach types are used in a non-function way, you can leave them as-is.
// // (We assume they’re just types here.)

// // --- Import the functions under test ---
// import {
//   applyIrregularChanges,
//   scheduleProblems,
//   adjustSchedule,
//   calculateNextTrackerAndTodoCounter,
// } from "@usecase/index.js"; // Adjust this path as needed
// import { SubfieldsSubfieldNameEnum, toMySQLUintID, toNotionUUID, toUint } from "@domain/types/index.js";
// import { DomainCoachPlan } from "@domain/coach/CoachPlan.js";
// import { DomainCoachIrregular } from "@domain/coach/CoachIrregular.js";

// // --- Prepare dummy input data ---

// // Minimal dummy DomainCoachPlan object
// const fakeDomainCoachPlan: DomainCoachPlan = {
//   blockName: "@[BlockName (page:bcfc9ed5-733d-47b8-afa7-6d889f49373c)]",
//   inputStartDate: "2025-01-01",
//   inputEndDate: "2025-01-10",
//   isIrregular: false,
//   speed: toUint(5),
//   space: toUint(3),
//   lap: toUint(2),
//   subfieldName: "日本史", // Assume "数学" is a valid SubfieldsSubfieldNameEnum
//   problemLevel: "基礎１", // Assume valid ActualBlocksProblemLevelEnum
//   blockOrder: toUint(1),
//   planPageId: toNotionUUID("19eb95a4c61980ff9aacf59770489d82"),
//   outputStartDate: null,
//   outputEndDate: null,
// };

// // Minimal dummy DomainCoachIrregular object
// const fakeDomainCoachIrregular: DomainCoachIrregular = {
//   problemName: "@[Irregular Problem (page:1a9b95a4c619815996d9ed8c5dfcf8c5)]",
//   isModified: false,
//   insertOrder: toUint(1),
//   subfieldName: "日本史",
//   irregularProblemOrder: toUint(1),
//   insertBlock: "@[InsertBlock (page:1bbb95a4c61980b999cfe7bac574200c)]",
//   formerBlock: "@[FormerBlock (page:1bbb95a4c61980528a4fd74dab6d8b67)]",
//   irregularPageId: toNotionUUID("19eb95a4c61980ff9aacf59770489d82"),
// };

// // Dummy subfield info list
// const subfieldInfoList = [{ subfieldId: toMySQLUintID(1), subfieldName: "日本史" as SubfieldsSubfieldNameEnum }];

// // Dummy AssignedBlocksInfo for scheduleProblems
// const fakeAssignedBlocksArray = [
//   {
//     blocks: [
//       {
//         idOrderArray: [
//           {
//             studentProblemId: toMySQLUintID(1),
//             studentProblemPageId: "npid100",
//             problemInBlockOrder: toUint(1),
//           },
//         ],
//         studentActualBlockDbNotionPageId: "fake-page-id",
//         studentScheduleNotionPageId: "nsid1",
//         coachPlanNotionPageId: "ncid1",
//         actualBlockId: toMySQLUintID(1),
//         isTail: false,
//         speed: toUint(5),
//         space: toUint(3),
//         lap: toUint(2),
//         subfieldName: "日本史",
//         blockOrder: toUint(1),
//       },
//     ],
//     subfieldId: 1,
//     subfieldName: "数学",
//   },
// ];

// // Dummy DomainCoachRest for scheduleProblems
// const fakeDomainCoachRest = [
//   {
//     subfieldNames: ["数学"],
//     startDate: "2025-01-15",
//     endDate: "2025-01-16",
//   },
// ];

// describe("applyIrregularChanges", () => {
//   it("should process irregular changes and return assigned blocks and problems", async () => {
//     const result = await applyIrregularChanges(
//       toMySQLUintID(1),
//       subfieldInfoList,
//       [fakeDomainCoachPlan],
//       [fakeDomainCoachIrregular]
//     );
//     expect(result).toHaveProperty("assignedBlocksArray");
//     expect(result).toHaveProperty("assignedProblemsArray");
//     expect(result.assignedBlocksArray.length).toBeGreaterThan(0);
//     expect(result.assignedProblemsArray.length).toBeGreaterThan(0);
//   });
// });

// describe("scheduleProblems", () => {
//   it("should schedule problems and return an array with scheduled blocks", async () => {
//     const result = await scheduleProblems(1, fakeAssignedBlocksArray, fakeDomainCoachRest);
//     expect(Array.isArray(result)).toBe(true);
//     expect(result[0]).toHaveProperty("subfieldName", "数学");
//     expect(result[0]).toHaveProperty("blocks");
//     expect(Array.isArray(result[0].blocks)).toBe(true);
//   });
// });

// describe("adjustSchedule", () => {
//   it("should update schedule for delay mode", async () => {
//     // Call adjustSchedule and then check that the ActualBlocks.updateForDelayOrExpidite function was called.
//     await adjustSchedule(1, 1, 1, "delay");
//     const { ActualBlocks } = await import("@infrastructure/mysql/index.js");
//     expect(ActualBlocks.updateForDelayOrExpidite).toHaveBeenCalled();
//   });
// });

// describe("calculateNextTrackerAndTodoCounter", () => {
//   it("should calculate the next tracker and todo counter", async () => {
//     // Provide a fake current tracker with minimal properties.
//     const fakeTracker = {
//       currentLap: toUint(1),
//       studentProblemId: 100,
//     };
//     const result = await calculateNextTrackerAndTodoCounter(1, 1, 1, fakeTracker);
//     expect(result).toHaveProperty("tracker");
//     expect(result).toHaveProperty("todoCounter");
//   });
// });
