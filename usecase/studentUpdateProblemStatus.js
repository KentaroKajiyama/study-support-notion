import logger from "../../utils/logger";
import { StudentProblemsNotion } from "../../infrastructure/notion_database/student_only/StudentProblems";
import { StudentProblemsAWS } from "../../infrastructure/aws_database/StudentProblems";
import { Students } from "../../infrastructure/aws_database/Students";
import { TopProblems } from "../../infrastructure/notion_database/student_only/TopProblems";
import { updateTrackerAndTodoRemainingCounter } from "../domain/students/interaction";
import { StudentSubfieldTraces } from "../infrastructure/aws_database/StudentSubfieldTraces";
import NotionAPI from "../infrastructure/notionAPI.js";
import { propertyToNotion } from '../utils/propertyHandler.js'
import { Properties } from "../const/notionTemplate.js";
import { todoRemainingCountersProperties, remainingDayProperties, studentsOverviewsProperties, returnSubfieldDelayKeyName } from "../const/notionDatabaseProperties.js";
import { copyPageCreate } from "../utils/copyPage.js";
import { Trackers } from "../infrastructure/aws_database/Trackers.js";
import { Subfields } from '../infrastructure/aws_database/Subfields.js';

export async function ansStatusChange(studentId, studentProblemPageId, isTodo = false, isWrong = false, isDifficult = false) {
  try {
    // Guarantee that the student problem status is updated
    if (isTodo || isWrong || isDifficult) {
      const topProblem = await TopProblems.getATopPageProblem(studentProblemPageId);
      studentProblemPageId = topProblem.notionPageId;
      const subfieldName = topProblem.subfieldName;
      await StudentProblemsNotion.updateAStudentProblem(studentProblemPageId, subfieldName, {
        ansStatus: topProblem.ansStatus
      });
    }
    const studentInfoAWS = await Students.findByStudentId(studentId);
    const studentProblemNotion = await StudentProblemsNotion.getAStudentProblem(studentProblemPageId);
    const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(studentProblemPageId);
    await StudentProblemsAWS.update(studentProblemAWS.student_problem_id, {
      answer_status: studentProblemNotion.answerStatus,
    });
    // updates Notion UI.
    if (!isTodo){
      const todoProblem = await TopProblems.getTopProblems(studentInfoAWS.todo_db_id).find(todo => todo.notionPageId === studentProblemPageId);
      if (todoProblem) {
        await TopProblems.updateATopProblemAnsStatusById(todoProblem.topProblemPageId, {
          ansStatus: studentProblemNotion.answerStatus
        });
      };
    };
    if (!isWrong){
      const wrongProblem = await TopProblems.getTopProblems(studentInfoAWS.wrong_db_id).find(wrong => wrong.notionPageId === studentProblemPageId);
      if (wrongProblem) {
        await TopProblems.updateATopProblemAnsStatusById(wrongProblem.topProblemPageId, {
          ansStatus: studentProblemNotion.answerStatus
        });
      };
    };
    if (!isDifficult){
      const isDifficultProblem = await TopProblems.getTopProblems(studentInfoAWS.is_difficult_db_id).find(isDifficult => isDifficult.notionPageId === studentProblemPageId);
      if (isDifficultProblem) {
        await TopProblems.updateATopProblemAnsStatusById(isDifficultProblem.topProblemPageId, {
          ansStatus: studentProblemNotion.answerStatus
        });
      };
    }
    if (isTodo) {
      const studentProblem = await StudentProblemsAWS.findWithSubfieldIdByNotionPageId(studentProblemPageId)[0];
      const studentProbAWSId = studentProblem.studentProblemId;
      const currentTracker = await Trackers.findByCompositeKey(studentId, studentProblem.subfieldId);
      
      // Just in case a student updates not latest problem status.
      if (studentProbAWSId !== currentTracker.studentProblemId) return ;

      const studentOverviewPageId = studentInfoAWS.studentOverviewPageId;
      const nextTodoProbPageId = await updateTrackerAndTodoRemainingCounter(studentId, studentProbAWSId);
      const studentSubfieldTrace = await StudentSubfieldTraces.findByCompositeKey(studentId, studentProblem.subfieldId);
      const subfieldName = await Subfields.findBySubfieldId(studentProblem.subfieldId)[0].subfieldName;
      const subfieldDelayKeyName = returnSubfieldDelayKeyName(subfieldName);
      // Notion UI updates
      await Promise.all([
        await NotionAPI.updatePageProperties(studentOverviewPageId, Properties.getJSON([
          propertyToNotion({
            propertyName: studentsOverviewsProperties[subfieldDelayKeyName].name,
            propertyContent: studentSubfieldTrace.delay,
            propertyType: studentsOverviewsProperties[subfieldDelayKeyName].type
          })
        ])),
        await NotionAPI.updatePageProperties(studentSubfieldTrace.todoRemainingCounterNotionPageId, Properties.getJSON([
          propertyToNotion({
            propertyName: todoRemainingCountersProperties.remainingProbNum.name,
            propertyContent: studentSubfieldTrace.todoRemainingCounter,
            propertyType: todoRemainingCountersProperties.remainingProbNum.type
          }),
          propertyToNotion({
            propertyName: todoRemainingCountersProperties.delay.name,
            propertyContent: studentSubfieldTrace.delay,
            propertyType: todoRemainingCountersProperties.delay.type
          })
        ])),
        await NotionAPI.updatePageProperties(studentSubfieldTrace.remainingDayNotionPageId, Properties.getJSON([
          propertyToNotion({
            propertyName: remainingDayProperties.remainingDay.name,
            propertyContent: studentSubfieldTrace.remainingDay,
            propertyType: remainingDayProperties.remainingDay.type
          })
        ]))
      ]);
      // if nextTodoProbPageId is null, then the student might complete all todo tasks!
      if (nextTodoProbPageId) {
        const todoNotionDBId = studentInfoAWS.todoDbId;
        await copyPageCreate(nextTodoProbPageId, todoNotionDBId);
      }
    }
  } catch (error) {
    logger.error("Error updating student problem in AWS:", error.message);
    throw error;
  }
}
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
