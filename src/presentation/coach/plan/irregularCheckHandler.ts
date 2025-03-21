import { 
  logger,
  ensureValue
} from "@utils/index.js";
import {
  Students
} from '@infrastructure/mysql/index.js';
import { irregularChange } from "@usecase/index.js";
import { Request, Response } from "express";
import { parseCoachPlanIrregularCheckWebhook } from "@presentation/notionWebhook.js";

export const irregularCheckHandler = async function (req: Request, res: Response) {
  try {
    const webhookBody = req.body;
    const { blockName, isChecked, studentUserId } = parseCoachPlanIrregularCheckWebhook(webhookBody);
    // TODO: Modify this correctly after you determine the form of requesting.
    const studentId = ensureValue(
      ensureValue(await Students.findByNotionUserId(studentUserId)).studentId
    )
    await irregularChange(studentId, blockName, isChecked);
    res.status(200).json({ message: "Simulation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in simulationHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
