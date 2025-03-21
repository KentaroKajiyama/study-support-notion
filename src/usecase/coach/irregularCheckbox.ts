import {
  logger,
  copyPageCreate,
  ensureValue
} from "@utils/index.js";
import {
  ActualBlocks,
  StudentProblems,
  Students
} from "@infrastructure/mysql/index.js";
import { MySQLUintID } from "@domain/types/mysqlTypes.js";
import { extractMentionDetails, MentionDetailId, NotionMentionString, NotionUUID, RichTextPropertyResponse } from "@domain/types/myNotionTypes.js";
import { propertyResponseToDomain } from "@infrastructure/notionProperty.js";
import { NotionCoachIrregulars } from "@infrastructure/notion/index.js";

export async function irregularChange(
  studentId: MySQLUintID, 
  actualBLockName: NotionMentionString,
  isChecked: boolean,
  coachPlanNotionPageId?: NotionUUID,
) {
  try {
    const studentInfo = ensureValue(await Students.findByStudentId(studentId));
    const irregularDatabaseId = ensureValue(studentInfo.coachIrregularDbId);
    // TODO: Just in case the coach rewrite block name manually, we should implement redundant fetch logic.
    //       Fetch block info by block name as well.
    const studentActualBlockDbNotionPageId = ensureValue(extractMentionDetails(actualBLockName) as MentionDetailId).id;
    const actualBlockInfo = ensureValue(await ActualBlocks.findByStudentActualBlockDbNotionPageId(studentActualBlockDbNotionPageId));
    // const actualBlockInfo = (await ActualBlocks.findByCoachPlanNotionPageId(ensureValue(coachPlanNotionPageId)));
    if (isChecked) {
      const problemPageIds = await StudentProblems.findNotionPageIdsByCompositeKey(
        studentId, ensureValue(actualBlockInfo.subfieldId), ensureValue(actualBlockInfo.actualBlockId)
      );
      await Promise.all(problemPageIds.map(async problemPageId => await copyPageCreate(problemPageId, irregularDatabaseId)))
    } else {
      const notionCoachIrregulars = new NotionCoachIrregulars();
      const deleteProblemPageIds = ensureValue(
        await notionCoachIrregulars.queryADatabaseWithFormerBlockId(irregularDatabaseId, ensureValue(actualBlockInfo.studentActualBlockDbNotionPageId))
      ).map(domainCoachIrregular => domainCoachIrregular.irregularPageId).filter(e => e != null);
      await Promise.all(deleteProblemPageIds.map(async deleteProblemPageId => await notionCoachIrregulars.deleteAPage(deleteProblemPageId)));
    }
  } catch (error) {
    logger.error(`Error in irregularChange:`, error);
    throw error;
  }
}