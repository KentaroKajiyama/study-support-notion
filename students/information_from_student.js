import logger from "../utils/logger";
import { StudentProblemsNotion } from "../infrastructure/notion_database/student_only/StudentProblems";
import { StudentProblemsAWS } from "../infrastructure/aws_database/StudentProblems";
import { Students } from "../infrastructure/aws_database/Students";
import { TopProblems } from "../infrastructure/notion_database/student_only/TopProblems";

export async function ansStatusChange(studentId, studentProblemPageId, isTopProblem = false) {
  try {
    if (isTopProblem) {
      const topProblem = await TopProblems.getATopPageProblem(studentProblemPageId);
      studentProblemPageId = topProblem.notionPageId;
      const subfieldName = topProblem.subfieldName;
      await StudentProblemsNotion.updateAStudentProblem(studentProblemPageId, subfieldName, {
        ansStatus: topProblem.ansStatus
      })
    }
    const studentInfoAWS = await Students.findByStudentId(studentId);
    const studentProblemNotion = await StudentProblemsNotion.getAStudentProblem(studentProblemPageId);
    const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(studentProblemPageId);
    await StudentProblemsAWS.update(studentProblemAWS.student_problem_id, {
      answer_status: studentProblemNotion.answerStatus,
    });
    const todoProblem = await TopProblems.getTopProblems(studentInfoAWS.todo_db_id).filter(todo => todo.notionPageId === studentProblemPageId);
    if (todoProblem.length > 0) {
      await TopProblems.updateATopProblemAnsStatusById(todoProblem[0].topProblemPageId, {
        ansStatus: studentProblemNotion.answerStatus
      });
    };
    const wrongProblem = await TopProblems.getTopProblems(studentInfoAWS.wrong_db_id).filter(todo => todo.notionPageId === studentProblemPageId);
    if (wrongProblem.length > 0) {
      await TopProblems.updateATopProblemAnsStatusById(wrongProblem[0].topProblemPageId, {
        ansStatus: studentProblemNotion.answerStatus
      });
    };
    const isDifficultProblem = await TopProblems.getTopProblems(studentInfoAWS.is_difficult_db_id).filter(todo => todo.notionPageId === studentProblemPageId);
    if (isDifficultProblem.length > 0) {
      await TopProblems.updateATopProblemAnsStatusById(isDifficultProblem[0].topProblemPageId, {
        ansStatus: studentProblemNotion.answerStatus
      });
    };
  } catch (error) {
    logger.error("Error updating student problem in AWS:", error.message);
    throw error;
  }
}
/**
 * Handles "difficult" feedback from a student.
 * @param {string} studentId The student identifier
 * @param {string} problemId The problem identifier
 */
export async function isDifficultChange(studentId, studentProblemPageId, isTopProblem = false) {
  try {
    if (isTopProblem) {
      const topProblem = await TopProblems.getATopPageProblem(studentProblemPageId);
      studentProblemPageId = topProblem.notionPageId;
      const subfieldName = topProblem.subfieldName;
      await StudentProblemsNotion.updateAStudentProblem(studentProblemPageId, subfieldName, {
        isDifficult:topProblem.isDifficult
      })
    }
    const studentInfoAWS = await Students.findByStudentId(studentId);
    const studentProblemNotion = await StudentProblemsNotion.getAStudentProblem(studentProblemPageId);
    const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(studentProblemPageId);
    await StudentProblemsAWS.update(studentProblemAWS.student_problem_id, {
      is_difficult: studentProblemNotion.isDifficult,
    });
    const todoProblem = await TopProblems.getTopProblems(studentInfoAWS.todo_db_id).filter(todo => todo.notionPageId === studentProblemPageId);
    if (todoProblem.length > 0) {
      await TopProblems.updateATopProblemIsDifficultById(todoProblem[0].topProblemPageId, {
        is_difficult: studentProblemNotion.isDifficult,
      });
    };
    const wrongProblem = await TopProblems.getTopProblems(studentInfoAWS.wrong_db_id).filter(todo => todo.notionPageId === studentProblemPageId);
    if (wrongProblem.length > 0) {
      await TopProblems.updateATopProblemIsDifficultById(wrongProblem[0].topProblemPageId, {
        is_difficult: studentProblemNotion.isDifficult,
      });
    };
    const isDifficultProblem = await TopProblems.getTopProblems(studentInfoAWS.is_difficult_db_id).filter(todo => todo.notionPageId === studentProblemPageId);
    if (isDifficultProblem.length > 0) {
      await TopProblems.updateATopProblemIsDifficultById(isDifficultProblem[0].topProblemPageId, {
        is_difficult: studentProblemNotion.isDifficult,
      });
    };
  } catch (error) {
    logger.error("Error updating student problem in AWS:", error.message);
    throw error;
  }
}
