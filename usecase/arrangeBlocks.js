import { coachPlanProperties, coachRestProperties, studentsOverviewsProperties, studentOnlyScheduleProperties, studentActualBlocksProperties } from "../const/notionDatabaseProperties.js";
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
          propertyName: coachRestProperties.period.name,
          propertyType: coachRestProperties.period.type
        }).start,
        endDate: propertyFromNotion({
          propertiesArray: properties,
          propertyName: coachRestProperties.period.name,
          propertyType: coachRestProperties.period.type
        }).end,
        subfieldName: propertyFromNotion({
          propertiesArray: properties,
          propertyName: coachRestProperties.subfieldName.name,
          propertyType: coachRestProperties.subfieldName.type
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
            propertyName: coachPlanProperties.speed.name,
            propertyContent: block.speed,
            propertyType: coachPlanProperties.speed.type
          }),
          propertyToNotion({
            propertyName: coachPlanProperties.outputPeriod.name,
            propertyContent: { start: block.startDate, end: block.endDate },
            propertyType: coachPlanProperties.outputPeriod.type
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
                propertyName: studentOnlyScheduleProperties.title.name,
                propertyContent: block.blockName,
                propertyType: studentOnlyScheduleProperties.title.type
              }),
              propertyToNotion({
                propertyName: studentOnlyScheduleProperties.period,
                propertyContent: { start: block.startDate, end: block.endDate },
                propertyType: studentOnlyScheduleProperties.period.type
              })
            ])),
            await NotionAPI.updatePageProperties(block.notionPageIdForStudentActualBlocks, Properties([
              propertyToNotion({
                propertyName: studentActualBlocksProperties.blockName.name,
                propertyContent: block.blockName,
                propertyType: studentActualBlocksProperties.blockName.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksProperties.speed.name,
                propertyContent: block.speed,
                propertyType: studentActualBlocksProperties.speed.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksProperties.outputPeriod.name,
                propertyContent: { start: block.startDate, end: block.endDate },
                propertyType: studentActualBlocksProperties.outputPeriod.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksProperties.problemRelations.name,
                propertyContent: relatedProblemsPageIdArray,
                propertyType: studentActualBlocksProperties.problemRelations.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksProperties.space.name,
                propertyContent: block.space,
                propertyType: studentActualBlocksProperties.space.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksProperties.lap.name,
                propertyContent: block.lap,
                propertyType: studentActualBlocksProperties.lap.type
              }),
              propertyToNotion({
                propertyName: studentActualBlocksProperties.blockOrder.name,
                propertyContent: block.blockOrder,
                propertyType: studentActualBlocksProperties.blockOrder.type
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
      propertyName: studentsOverviewsProperties.planModifiedSubfieldNames.name,
      propertyType: studentsOverviewsProperties.planModifiedSubfieldNames.type
    });
    const updatedModifiedSubfieldNames = [...new Set([...existingModifiedSubfieldNames,...changedSubjects])];
    await NotionAPI.updatePageProperties(studentOverviewPageId, Properties([
      propertyToNotion({
        propertyName: studentsOverviewsProperties.planModifiedSubfieldNames.name,
        propertyContent: isConfirmed ? updatedModifiedSubfieldNames : [],
        propertyType: studentsOverviewsProperties.planModifiedSubfieldNames.type
      }),
      propertyToNotion({
        propertyName: studentsOverviewsProperties.planStatus.name,
        propertyContent: isConfirmed ? studentsOverviewsProperties.planStatus.completed : studentsOverviewsProperties.planStatus.uncompleted,
        propertyType: studentsOverviewsProperties.planStatus.type
      })
    ]))
  } catch (error) {
    logger.error(`Error simulating plan: ${error.message}`);
    throw error;
  }
}
