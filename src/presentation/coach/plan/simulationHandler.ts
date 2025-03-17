import {
  logger,
  extractStudentUserIdFromPeople,
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

export const simulationHandler = async function (req: Request, res: Response) {
  try {
    const peopleArray = req.body.people;
    const studentUserId = extractStudentUserIdFromPeople(peopleArray);
    const studentInfo = ensureValue(await Students.findByNotionUserId(studentUserId));
    await schedulePlan(
      ensureValue(studentInfo.studentId), 
      ensureValue(studentInfo.coachPlanDbId), 
      ensureValue(studentInfo.coachIrregularDbId),
      ensureValue(studentInfo.coachRestDbId),
      false
    );
    res.status(200).json({ message: "Simulation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in simulationHandler: ${error}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
