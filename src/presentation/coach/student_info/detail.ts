import { logger } from "@utils/index.js";
import { registerStudentDetailInfo } from "@usecase/index.js";
import { Request, Response } from "express";
import { MySQLUintID } from "@domain/types/index.js";

export const detailHandler = async (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId as MySQLUintID;
    await registerStudentDetailInfo(studentId);
    res.status(200).json({ message: "Detail information has been registered successfully." });
  } catch (error) {
    logger.error(`Error in detailHandler:`, error);
    res.status(500).json({ message: "An error occurred while registering detail information." });
  }
}