import { ensureValue, logger } from "@utils/index.js";
import { registerStudentDetailInfo } from "@usecase/index.js";
import { Request, Response } from "express";
import { parseStudentDetailInformationWebhook,  } from "@presentation/notionWebhook.js";
import { Students } from "@infrastructure/mysql/index.js";

export const detailHandler = async (req: Request, res: Response) => {
  try {
    const webhookBody = req.body;
    const { studentUserId } = parseStudentDetailInformationWebhook(webhookBody);
    const studentId = ensureValue(await Students.findByNotionUserId(studentUserId)).studentId; 
    await registerStudentDetailInfo(ensureValue(studentId));
    res.status(200).json({ message: "Detail information has been registered successfully." });
  } catch (error) {
    logger.error(`Error in detailHandler:`, error);
    res.status(500).json({ message: "An error occurred while registering detail information." });
  }
}