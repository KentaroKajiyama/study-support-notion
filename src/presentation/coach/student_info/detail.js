import logger from "../../../utils/logger";
import { registerStudentDetailInfo } from "../../../coach/informationFromCoach";

export const detailHandler = async (req, res) => {
  try {
    const studentId = req.studentId;
    await registerStudentDetailInfo(studentId);
    res.status(200).json({ message: "Detail information has been registered successfully." });
  } catch (error) {
    logger.error(`Error in detailHandler:`, error.message);
    res.status(500).json({ message: "An error occurred while registering detail information." });
  }
}