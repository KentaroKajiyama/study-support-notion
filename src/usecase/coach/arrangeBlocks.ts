import {
  ensureValue,
  logger
} from '@utils/index.js';
import { 
  MySQLUintID, 
  NotionUUID,
  toInt,
  toUint
} from "@domain/types/index.js";
import {
  StudentSubfieldTraces,
  StudentProblems,
  Students,
  ActualBlocks,
  Trackers,
  Subfields,
} from '@infrastructure/mysql/index.js';
import {
  NotionCoachPlans,
  NotionCoachIrregulars,
  NotionStudentProblems,
  NotionStudentSchedules
} from '@infrastructure/notion/index.js';
import {
  applyIrregularChanges,
  scheduleProblems
} from '@usecase/index.js'
import { NotionCoachRests } from '@infrastructure/notion/CoachRests.js';
import { NotionStudentActualBlocks } from '@infrastructure/notion/StudentActualBlocks.js';
import { NotionStudentOverviews } from '@infrastructure/notion/StudentOverview.js';

export async function schedulePlan(
  studentId: MySQLUintID, 
  planDBId: NotionUUID, 
  irregularDBId: NotionUUID, 
  restDBId: NotionUUID, 
  isConfirmed: boolean,
): Promise<void> {
  try {
    // 0. fetch necessary data from Notion & AWS.
    const subfieldInfoList = ensureValue(await StudentSubfieldTraces.findOnlySubfieldInfoByStudentId(studentId))
                              .map(row => {
                                return {
                                  subfieldId: ensureValue(row.subfieldId),
                                  subfieldName: ensureValue(row.subfieldName)
                                }
                              });
    const notionCoachPlans = new NotionCoachPlans();
    const notionCoachIrregulars = new NotionCoachIrregulars();
    const notionCoachRests = new NotionCoachRests();
    const notionStudentProblems = new NotionStudentProblems();
    const domainCoachPlanArray = ensureValue(await notionCoachPlans.queryADatabase(planDBId));
    const irregularProbArray = ensureValue(await notionCoachIrregulars.queryADatabase(irregularDBId));
    const restArray = ensureValue(await notionCoachRests.queryADatabase(restDBId));
    // 1. arrange irregular blocks
    const { assignedBlocksArray, assignedProblemsArray } = await applyIrregularChanges(studentId, subfieldInfoList, domainCoachPlanArray, irregularProbArray);
    // 2. schedule blocks
    const scheduledBlocks = await scheduleProblems(studentId, assignedBlocksArray, restArray);
    // 3. distribute simulated blocks to coach plan database and problem database
    const promises = [];
    promises.push(scheduledBlocks.map(async (blocksInfo) => {
      await Promise.all(blocksInfo.blocks.map(async (block) => {
        await notionCoachPlans.updatePageProperties(
          block.planPageId, 
          {
            speed: block.speed,
            outputStartDate: block.outputStartDate,
            outputEndDate: block.outputEndDate,
          }
        )
      }))
    }));
    promises.push(assignedProblemsArray.map(async (problemsInfo) => {
      await Promise.all(problemsInfo.problems.map(async (problem) => {
        const studentProblemPageId = ensureValue(await StudentProblems.findNotionPageIdByStudentProblemId(problem.studentProblemId));
        await notionStudentProblems.updatePageProperties(
          studentProblemPageId, 
          {
            problemInBlockOrder: problem.problemInBlockOrder,
            problemOverallOrder: problem.problemOverallOrder,
          }
        );
      }));
    }));
    // Update only the actual blocks database
    promises.push(scheduledBlocks.map(async blocksInfo => await ActualBlocks.updateForCoachPlan(blocksInfo.blocks)));

    // 3.5 if you confirm the plan, then update the database and student page.
    if (isConfirmed) {
      // AWS: trace, actual block, student problem, and tracker
      promises.push(scheduledBlocks.map(async (blocksInfo) => {
        const endBlockIndex = blocksInfo.blocks.findIndex(block => block.isTail === true);
        const actualEndDate = ensureValue(blocksInfo.blocks[endBlockIndex].outputEndDate);
        const subfieldName = blocksInfo.blocks[0].subfieldName;
        const subfieldId = ensureValue(
          ensureValue(await Subfields.findBySubfieldName(subfieldName)).subfieldId
        )
        await StudentSubfieldTraces.updateByCompositeKey(
          studentId, 
          subfieldId, 
          {
            delay: toInt(0),
            actualEndDate: actualEndDate,
          }
        );
      }));
      promises.push(await Trackers.updateAllTrackersStatusByStudentId(studentId, true));
      promises.push(assignedProblemsArray.map(async (problemsInfo) => {
        await StudentProblems.updateForCoachPlan(problemsInfo.problems);
      }))
      // Notion: student schedule, student block, student problem, and remainings.
      promises.push(scheduledBlocks.map(async (blocksInfo) => {
        const notionStudentSchedules = new NotionStudentSchedules();
        const notionStudentActualBlocks = new NotionStudentActualBlocks();
        await Promise.all(blocksInfo.blocks.map(async (block) => {
          const specificProblems = ensureValue(assignedProblemsArray.find(problemsInfo => problemsInfo.subfieldName === block.subfieldName));
          const relatedProblemsPageIdArray = specificProblems
                                              .problems
                                              .filter(problem => problem.actualBlockId === block.actualBlockId)
                                              .map(problem => problem.studentProblemPageId);
          await Promise.all([
            await notionStudentSchedules.updatePageProperties(
              block.studentScheduleNotionPageId, 
              {
                blockName: block.blockName,
                startDate: ensureValue(block.outputStartDate),
                endDate: ensureValue(block.outputEndDate),
              }
            ),
            await notionStudentActualBlocks.updatePageProperties(
              block.studentActualBlockDbNotionPageId, 
              {
                blockName: block.blockName,
                startDate: ensureValue(block.outputStartDate),
                endDate: ensureValue(block.outputEndDate),
                studentProblemRelations: relatedProblemsPageIdArray,
                speed: block.speed,
                space: block.space,
                lap: block.lap,
                blockOrder: block.blockOrder,
                problemLevel: block.problemLevel,
              }
            )
          ])
        }))
      }));
      promises.push(assignedProblemsArray.map(async problemsInfo => {
        await Promise.all(problemsInfo.problems.map(async problem => {
          await notionStudentProblems.updatePageProperties(
            problem.studentProblemPageId, 
            {
              problemInBlockOrder: problem.problemInBlockOrder,
              problemOverallOrder: problem.problemOverallOrder,
            }
          )
        }))
      }));
    }
    await Promise.all(promises);
    // 4. change status of student overview page
    const notionStudentOverviews = new NotionStudentOverviews();
    const studentDetailInfo = ensureValue(await Students.findForDetailRegistrationByStudentId(studentId));
    const studentOverviewPageId = ensureValue(studentDetailInfo.studentOverviewPageId);
    // const studentOverview = ensureValue(await notionStudentOverviews.retrieveAPage(studentOverviewPageId));
    // const existingModifiedSubfieldNames = ensureValue(studentOverview.modifiedPlanSubfieldNames);
    // const updatedModifiedSubfieldNames = [...new Set([...existingModifiedSubfieldNames,...changedSubjects])];
    await notionStudentOverviews.updatePlanStatus(studentOverviewPageId, isConfirmed);
  } catch (error) {
    logger.error(`Error simulating plan: ${error}`);
    throw error;
  }
}
