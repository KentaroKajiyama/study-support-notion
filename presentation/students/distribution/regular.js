import logger from "../../../utils/logger";
import * as dist from "../../../students/distibution_to_student";

export const regularHandler = async (req, res) => {
  try {
    await Promise.all([
      await dist.dealWithTodosForAllStudents(),
      await dist.dealWithWrongsForAllStudents(),
      await dist.dealWithIsDifficultsForAllStudents()
    ]);
    await dist.dealWithStudentProblemsForAllStudents();
    Promise.all([
      await dist.sendTodoCountersForAllStudents(),
      await dist.sendReviewsForAllStudents()
    ]);
    await dist.sendReviewAlertForAllStudents();
    return res.status(200).json({ message: 'Succeeded in handling all students distributions!'});
  } catch (error) {
    logger.error(`Error in regularHandler: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}