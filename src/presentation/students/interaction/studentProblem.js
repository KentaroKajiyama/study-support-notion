import logger from "../../../utils/logger";
import { ansStatusChange, isDifficultChange } from "../../../usecase/studentUpdateProblemStatus";
import { extractStudentInfoFromPeople } from "../../../utils/extractId";

export const studentProblemHandler = async (req, res) => {
  try {
    const peopleArray = req.body.people;
    const studentInfo = extractStudentInfoFromPeople(peopleArray)[0];
    const studentProblemPageId = req.body.studentProblemPageId;
    await Promise.all([
      await ansStatusChange(studentInfo.studentId, studentProblemPageId),
      await isDifficultChange(studentInfo.studentId, studentProblemPageId),
    ])
    res.status(200).json({ message: "student problem handler succeeded in updating problem status" });
  } catch (error) {
    logger.error(`Error in topHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}