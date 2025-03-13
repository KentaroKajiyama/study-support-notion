import logger from "../../../utils/logger";
import { ansStatusChange, isDifficultChange } from "../../../usecase/studentUpdateProblemStatus";
import { extractStudentInfoFromPeople } from "../../../utils/extractId";

export const todoHandler = async (req, res) => {
  try {
    const peopleArray = req.body.people;
    const studentInfo = extractStudentInfoFromPeople(peopleArray)[0];
    const studentProblemPageId = req.body.studentProblemPageId;
    await Promise.all([
      await ansStatusChange(studentInfo.studentId, studentProblemPageId, isTodo = true),
      await isDifficultChange(studentInfo.studentId, studentProblemPageId, isTopProblem = true),
    ])
    res.status(200).json({ message: "todo problem handler succeeded in updating problem status" });
  } catch (error) {
    logger.error(`Error in todoHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}