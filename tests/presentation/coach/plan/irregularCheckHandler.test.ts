import { 
  logger,
  extractStudentUserIdFromPeople, 
  ensureValue
} from "@utils/index.js";
import {
  Students
} from '@infrastructure/mysql/index.js';
import { irregularChange } from "@usecase/index.js";
import { Request, Response } from "express";

export const irregularCheckHandler = async function (req: Request, res: Response) {
  try {
    const peopleArray = req.body.people;
    const studentUserId = extractStudentUserIdFromPeople(peopleArray);
    // TODO: Modify this correctly after you determine the form of requesting.
    const irregularPageId = req.body.pageId
    const isChecked = req.body.isChecked;
    const studentId = ensureValue(
      ensureValue(await Students.findByNotionUserId(studentUserId)).studentId
    )
    await irregularChange(studentId, irregularPageId, isChecked);
    res.status(200).json({ message: "Simulation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in simulationHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
