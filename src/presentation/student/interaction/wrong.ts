import { 
  answerStatusChange, 
  isDifficultChange 
} from "@usecase/index.js";
import { 
  logger,
  ensureValue
} from '@utils/index.js';
import { Request, Response } from "express";
import {
  Students
} from '@infrastructure/mysql/Students.js';
import {
  parseProblemStatusWebhook
} from '@presentation/notionWebhook.js';

export const wrongHandler = async (req: Request, res: Response) => {
  try {
    const webhookBody = req.body;
    const { studentUserId, studentProblemPageId } = parseProblemStatusWebhook(webhookBody);
    const studentId = ensureValue(
      ensureValue(await Students.findByNotionUserId(studentUserId)).studentId
    )
    await Promise.all([
      await answerStatusChange(studentId, studentProblemPageId, false, false, true),
      await isDifficultChange(studentId, studentProblemPageId, true),
    ])
    res.status(200).json({ message: "wrong problem handler succeeded in updating problem status" });
  } catch (error) {
    logger.error(`Error in wrongHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}