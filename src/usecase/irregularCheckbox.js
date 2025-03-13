import logger from "../utils/logger.js";
import { ActualBlocks } from "../../infrastructure/aws_database/ActualBlocks.js";
import { StudentProblemsAWS } from "../../infrastructure/aws_database/StudentProblems.js";
import { copyPageCreate } from "../utils/copyPage.js";
import { Students } from '../../infrastructure/aws_database/Students.js';
import NotionAPI from "../../infrastructure/notionAPI";
import { coachIrregularProperties } from "../../const/notionDatabaseProperties";

export async function irregularChange(studentAWSId, irregularPageId, isChecked) {
  try {
    const irregularDatabaseId = await Students.findByStudentId(studentAWSId)[0].coach_irregular_db_id;
    const actualBlockInfo = await ActualBlocks.findActualBlockIdAndSubfieldIdByCoachPlanPageId(irregularPageId);
    if (isChecked) {
      const problemPageIds = await StudentProblemsAWS.findNotionPageIdsByCompositekey(studentAWSId, actualBlockInfo.subfieldId, actualBlockInfo.actual_block_id);
      await Promise.all(problemPageIds.map(async problemPageId => await copyPageCreate(problemPageId, irregularDatabaseId)))
    } else {
      const deleteProblemPageIds = await NotionAPI.queryADatabase(irregularDatabaseId, filter = {
        filter: {
          property: coachIrregularProperties.formerBlock.name,
          [coachIrregularProperties.formerBlock.type]: {
            equals: actualBlockInfo.actual_block_id,
          }
        }
      });
      await Promise.all(deleteProblemPageIds.map(async deleteProblemPageId => await NotionAPI.deleteABlock(deleteProblemPageId.id)));
    }
  } catch (error) {
    logger.error(`Error in irregularChange:`, error.message);
    throw error;
  }
}