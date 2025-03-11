import { coachPlanColumns, coachRestColumns, studentsOverviewsColumns, studentOnlyScheduleColumns, studentActualBlocksColumns } from "../const/notionDatabaseColumns.js";
import NotionAPI from "../infrastructure/notionAPI.js";
import { Properties } from "../const/notionTemplate.js";
import { propertyFromNotion, propertyToNotion } from "../utils/propertyHandler.js";
import { logger } from "../utils/logger.js";
import { StudentSubfieldTraces } from "../infrastructure/aws_database/StudentSubfieldTraces.js";
import { Rests } from "../infrastructure/aws_database/Rests.js";
import { applyIrregularChanges } from "../domain/caluculation/scheduleForStudents.js";
import { StudentProblemsAWS } from '../infrastructure/aws_database/StudentProblems.js';
import { convertToSnakeCase } from '../utils/lodash.js';
import { probAnalysis } from "../const/problemAnalysis.js";
import { Students } from "../../infrastructure/aws_database/Students.js";
import { ActualBlocks } from "../infrastructure/aws_database/ActualBlocks.js";
import { Trackers } from "../infrastructure/aws_database/Trackers.js";
import { isDate1EarlierThanOrSameWithDate2 } from "../utils/dateHandler.js";
import { StudentSubfieldTraces } from "../infrastructure/aws_database/StudentSubfieldTraces.js";
import { scheduleProblems } from "../domain/caluculation/scheduleForStudents.js";

export async function schedulePlan(studentId, planDBId, irregularDBId, isConfirmed) {
  try {
    // 0. fetch necessary data from Notion & AWS.
    const subfieldInfoList = (await StudentSubfieldTraces.findOnlySubfieldInfoByStudentId(studentId))
                                .map(row => {
                                  return {
                                    subfieldId: row.subfield_id,
                                    subfieldName: row.subfield_name
                                  }
                                });
    const planBlockArray = (await NotionAPI.queryADatabase(planDBId).results).map(result => result.properties);
    const irregularProbArray = (await NotionAPI.queryADatabase(irregularDBId).results).map(result => result.properties);
    const restArrayNotion = (await NotionAPI.queryADatabase(irregularDBId).results).map(result => result.properties);
    const restArrayPreprocessed = restArrayNotion.map(async properties => {
      return {
        startDate: propertyFromNotion({
          propertiesArray: properties,
          propertyName: coachRestColumns.period.name,
          propertyType: coachRestColumns.period.type
        }).start,
        endDate: propertyFromNotion({
          propertiesArray: properties,
          propertyName: coachRestColumns.period.name,
          propertyType: coachRestColumns.period.type
        }).end,
        subfieldName: propertyFromNotion({
          propertiesArray: properties,
          propertyName: coachRestColumns.subfieldName.name,
          propertyType: coachRestColumns.subfieldName.type
        })
      }
    });
    // 1. arrange irregular blocks
    const { assignedBlocks, assignedProblems } = applyIrregularChanges(studentId, subfieldInfoList, planBlockArray, irregularProbArray);
    // 2. schedule blocks
    const scheduledBlocks = scheduleProblems(assignedBlocks, restArrayPreprocessed);
    // 3. distribute simulated blocks to coach plan database and problem database
    const promises = [];
    promises.push(scheduledBlocks.map(async (blocksInfo) => {
      await Promise.all(blocksInfo.blocks.map(async (block) => {
        await NotionAPI.updatePageProperties(block.planDBPageId, Properties([
          propertyToNotion({
            propertyName: coachPlanColumns.speed.name,
            propertyContent: block.speed,
            propertyType: coachPlanColumns.speed.type
          }),
          propertyToNotion({
            propertyName: coachPlanColumns.outputPeriod.name,
            propertyContent: { start: block.startDate, end: block.endDate },
            propertyType: coachPlanColumns.outputPeriod.type
          })
        ]))
      }))
    }));
    promises.push(assignedProblems.map(async (problemsInfo) => {
      await Promise.all(problemsInfo.problems.map(async (problem) => {
        problem = convertToSnakeCase(problem);
        const studentProblemPageId = await StudentProblemsAWS.findNotionPageIdByStudentProblemId(problem.student_problem_id);
        await NotionAPI.updatePageProperties(studentProblemPageId, Properties([
          propertyToNotion({
            propertyName: probAnalysis.probOverallOrder.name,
            propertyContent: problem.problem_overall_order,
            propertyType: probAnalysis.probOverallOrder.type
          }),
          propertyToNotion({
            propertyName: probAnalysis.probInBlockOrder.name,
            propertyContent: problem.problem_in_block_order,
            propertyType: probAnalysis.probInBlockOrder.type
          })
        ]));
      }));
    }))
    // 3.5 if you confirm the plan, then update the database and student page.
    if (isConfirmed) {
      // AWS: trace, actual block, student problem, and tracker
      promises.push(scheduledBlocks.map(async (blocksInfo) => {
        await ActualBlocks.updateForCoachPlan(blocksInfo.blocks);
        const endBlockIndex = blocksInfo.blocks.findIndex(block => block.isTail === true);
        const actualEndDate = blocksInfo.blocks[endBlockIndex];
        await StudentSubfieldTraces.update(studentId, blocksInfo.subfieldId, {
          delay: 0,
          actualEndDate: actualEndDate,
        });
      }));
      promises.push(await Trackers.updateAllTrackersStatusByStudentId(studentId, true));
      promises.push(assignedProblems.map(async (problemsInfo) => {
        await StudentProblemsAWS.updateForCoachPlan(problemsInfo.problems);
      }))
      // Notion: student schedule, student block, student problem, and remainings.
      promises.push(scheduledBlocks.map(async (blocksInfo) => {
        await Promise.all(blocksInfo.blocks.map(async (block) => {
          const specificProblems = assignedProblems.find(problemsInfo => problemsInfo.subfieldId === block.subfieldId);
          const relatedProblemsPageIdArray = specificProblems.problems.filter(problem => problem.actualBlockId === block.actualBlockId)
                                                                      .map(problem => problem.notionPageId);
          await Promise.all([
            await NotionAPI.updatePageProperties(block.notionPageIdForStudentSchedule, Properties([
              propertyToNotion({
                propertyName: studentOnlyScheduleColumns.title.name,
                propertyContent: block.blockName,
                propertyType: studentOnlyScheduleColumns.title.type
              }),
              propertyToNotion({
                propertyName: studentOnlyScheduleColumns.period,
                propertyContent: { start: block.startDate, end: block.endDate },
                propertyType: studentOnlyScheduleColumns.period.type
              })
            ])),
            await NotionAPI.updatePageProperties(block.notionPageIdForStudentActualBlocks, Properties([
              propertyToNotion({
                propertyName: studentActualBlocksColumns.blockName.name,
                propertyContent: block.blockName,
                propertyType: studentActualBlocksColumns.blockName.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksColumns.speed.name,
                propertyContent: block.speed,
                propertyType: studentActualBlocksColumns.speed.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksColumns.outputPeriod.name,
                propertyContent: { start: block.startDate, end: block.endDate },
                propertyType: studentActualBlocksColumns.outputPeriod.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksColumns.problemRelations.name,
                propertyContent: relatedProblemsPageIdArray,
                propertyType: studentActualBlocksColumns.problemRelations.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksColumns.space.name,
                propertyContent: block.space,
                propertyType: studentActualBlocksColumns.space.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksColumns.lap.name,
                propertyContent: block.lap,
                propertyType: studentActualBlocksColumns.lap.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksColumns.blockOrder.name,
                propertyContent: block.blockOrder,
                propertyType: studentActualBlocksColumns.blockOrder.type
              })
            ]))
          ])
        }))
      }));
      promises.push(assignedProblems.map(async problemsInfo => {
        await Promise.all(problemsInfo.problems.map(async problem => {
          await NotionAPI.updatePageProperties(problem.notionPageId, Properties([
            propertyToNotion({
              propertyName: probAnalysis.probOverallOrder.name,
              propertyContent: problem.probOverallOrder,
              propertyType: probAnalysis.probOverallOrder.type
            }),
            propertyToNotion({
              propertyName: probAnalysis.probInBlockOrder.name,
              propertyContent: problem.probInBlockOrder,
              propertyType: probAnalysis.probInBlockOrder.type
            })
          ]))
        }))
      }));
    }
    await Promise.all(promises);
    // 4. change status of student overview page
    const studentDetailInfo = await Students.findForDetailRegistrationByStudentId(studentAWSId)[0];
    const studentOverviewPageId = studentDetailInfo.student_overview_page_id;
    const response = await NotionAPI.retrieveAPage(studentOverviewPageId);
    const existingModifiedSubfieldNames = propertyFromNotion({
      propertiesArray: response.properties,
      propertyName: studentsOverviewsColumns.planModifiedSubfieldNames.name,
      propertyType: studentsOverviewsColumns.planModifiedSubfieldNames.type
    });
    const updatedModifiedSubfieldNames = [...new Set([...existingModifiedSubfieldNames,...changedSubjects])];
    await NotionAPI.updatePageProperties(studentOverviewPageId, Properties([
      propertyToNotion({
        propertyName: studentsOverviewsColumns.planModifiedSubfieldNames.name,
        propertyContent: isConfirmed ? updatedModifiedSubfieldNames : [],
        propertyType: studentsOverviewsColumns.planModifiedSubfieldNames.type
      }),
      propertyToNotion({
        propertyName: studentsOverviewsColumns.planStatus.name,
        propertyContent: isConfirmed ? studentsOverviewsColumns.planStatus.completed : studentsOverviewsColumns.planStatus.uncompleted,
        propertyType: studentsOverviewsColumns.planStatus.type
      })
    ]))
  } catch (error) {
    logger.error(`Error simulating plan: ${error.message}`);
    throw error;
  }
}
