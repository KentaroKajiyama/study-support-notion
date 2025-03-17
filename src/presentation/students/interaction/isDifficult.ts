import { NotionUUID, PeoplePropertyResponse } from "@domain/types/myNotionType.js";
import { 
  answerStatusChange, 
  isDifficultChange 
} from "@usecase/index.js";
import { 
  logger,
  extractStudentUserIdFromPeople,
  ensureValue
} from '@utils/index.js';
import { Request, Response } from "express";
import {
  Students
} from '@infrastructure/mysql/Students.js';

export const isDifficultHandler = async (req: Request, res: Response) => {
  try {
    const peopleArray = req.body.people;
    // TODO: Confirm this after contracting the charged plan.
    const studentUserId = extractStudentUserIdFromPeople(peopleArray as PeoplePropertyResponse);
    const studentId = ensureValue(
      ensureValue(await Students.findByNotionUserId(studentUserId)).studentId
    )
    const studentProblemPageId = req.body.studentProblemPageId as NotionUUID;
    await Promise.all([
      await answerStatusChange(studentId, studentProblemPageId, false, false, true),
      await isDifficultChange(studentId, studentProblemPageId, true),
    ])
    res.status(200).json({ message: "is difficult problem handler succeeded in updating problem status" });
  } catch (error) {
    logger.error(`Error in isDifficultHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}