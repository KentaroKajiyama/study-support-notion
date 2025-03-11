import logger from "../../../utils/logger";
import { extractStudentInfoFromPeople } from "../../../utils/extractId";
import { schedulePlan } from "../../../usecase/arrangeBlocks";

export const confirmationHandler = async function (req, res) {
  try {
    const peopleArray = req.body.people;
    const studentInfo = extractStudentInfoFromPeople(peopleArray)[0];
    await schedulePlan(studentInfo.studentId, studentInfo.coachPlanDbId, studentInfo.coachIrregularDbId, true);
    res.status(200).json({ message: "Confirmation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in confirmationHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
