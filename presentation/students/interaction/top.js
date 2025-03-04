import logger from "../../../utils/logger";
import { ansStatusChange, isDifficultChange } from "../../../students/information_from_student";

export const topHandler = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const studentProblemPageId = req.body.studentProblemPageId;
    await Promise.all([
      await ansStatusChange(studentId, studentProblemPageId, true),
      await isDifficultChange(studentId, studentProblemPageId, true),
    ])
    res.status(200).json({ message: "Top problem handler succeeded in updating problem status" });
  } catch (error) {
    logger.error(`Error in topHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}