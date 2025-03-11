import logger from "../../../utils/logger";
import { extractStudentInfoFromPeople } from "../../../utils/extractId";
import { irregularChange } from "../../../usecase/irregularCheckbox";

export const irregularCheckHandler = async function (req, res) {
  try {
    const peopleArray = req.body.people;
    const studentInfo = extractStudentInfoFromPeople(peopleArray)[0];
    // TODO: Modify this correctly after you determine the form of requesting.
    const irregularPageId = req.body.pageId
    const isChecked = req.body.isChecked;
    await irregularChange(studentInfo.studentId, irregularPageId, isChecked);
    res.status(200).json({ message: "Simulation has been scheduled successfully." });
  } catch (error) {
    logger.error(`Error in simulationHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
