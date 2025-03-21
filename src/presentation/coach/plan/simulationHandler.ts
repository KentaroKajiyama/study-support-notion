import {
  logger,
  extractStudentUserIdFromPeople,
  ensureValue
} from "@utils/index.js";
import { schedulePlan, sendNecessaryStudyTimes } from "@usecase/index.js";
import {
  Students
} from '@infrastructure/mysql/Students.js';
import {
  Request,
  Response
} from 'express'
import {
  NotionWebhookCoachPlanSchedule,
  parseCoachPlanScheduleWebhook
} from '@presentation/notionWebhook.js'

export const simulationHandler = async function (req: Request, res: Response) {
  try {
    const webhookBody = req.body as NotionWebhookCoachPlanSchedule
    const { studentUserId } = parseCoachPlanScheduleWebhook(webhookBody);
    const studentInfo = ensureValue(await Students.findByNotionUserId(studentUserId));
    await schedulePlan(
      ensureValue(studentInfo.studentId), 
      ensureValue(studentInfo.coachPlanDbId), 
      ensureValue(studentInfo.coachIrregularDbId),
      ensureValue(studentInfo.coachRestDbId),
      false
    );
    await sendNecessaryStudyTimes(
      ensureValue(studentInfo.studentId),
      ensureValue(studentInfo.necessaryStudyTimeDbId)
    )
    res.status(200).json({ message: "Simulation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in simulationHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
