import {
  logger,
  ensureValue
} from "@utils/index.js";
import { schedulePlan } from "@usecase/index.js";
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
} from "@presentation/notionWebhook.js";

export const confirmationHandler = async function (req: Request, res: Response) {
  try {
    const webhookBody = req.body as NotionWebhookCoachPlanSchedule
    const { studentUserId } = parseCoachPlanScheduleWebhook(webhookBody);
    const studentInfo = ensureValue(await Students.findByNotionUserId(studentUserId));
    await schedulePlan(
      ensureValue(studentInfo.studentId), 
      ensureValue(studentInfo.coachPlanDbId), 
      ensureValue(studentInfo.coachIrregularDbId),
      ensureValue(studentInfo.coachRestDbId),
      true
    );
    res.status(200).json({ message: "confirmation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in confirmationHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
