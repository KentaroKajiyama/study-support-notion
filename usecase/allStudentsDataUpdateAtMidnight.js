import logger from "../utils/logger";
import * as distToStudent from '../domain/students/distibutionToStudent.js';

export async function allStudentsDataUpdateAtMidnight() {
  try {
    await distToStudent.dealWithTodosForAllStudents();
    await distToStudent.dealWithWrongsForAllStudents();
    await distToStudent.dealWithIsDifficultsForAllStudents();
    await distToStudent.dealWithStudentProblemsForAllStudents();
    await distToStudent.sendTodoCountersForAllStudents();
    await distToStudent.sendReviewsForAllStudents();
  } catch (error) {
    logger.error("Error in allStudentsDataUpdateAtMidnight", error.message);
    throw error;
  }
}