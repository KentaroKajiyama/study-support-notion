import {
  updateTrackerAndTodoCounter
} from '@usecase/index.js'
import {
  Trackers,
  Students,
  StudentProblems,
  StudentSubfieldTraces,
} from '@infrastructure/mysql/index.js'
import {
  logger,
  ensureValue,
  copyPageCreate
} from "@utils/index.js";
import { 
  NotionUUID,
  MySQLUintID,
} from "@domain/types/index.js";
import {
  NotionStudentProblems,
  NotionStudentRemainings,
  NotionTopProblems
} from '@infrastructure/notion/index.js';
import { NotionStudentOverviews } from "@infrastructure/notion/StudentOverview.js";
import { NotionStudentTodoCounters } from "@infrastructure/notion/StudentTodoCounters.js";


export async function answerStatusChange(
  studentId: MySQLUintID,
  studentProblemPageId: NotionUUID, 
  isTodo = false, 
  isWrong = false, 
  isDifficult = false
): Promise<void> {
  try {
    const notionTopProblems = new NotionTopProblems();
    const notionStudentProblems = new NotionStudentProblems();
    const notionStudentOverviews = new NotionStudentOverviews();
    // Guarantee that the student problem status is updated
    if (isTodo || isWrong || isDifficult) {
      const topProblem = ensureValue(await notionTopProblems.retrieveAPage(studentProblemPageId));
      studentProblemPageId = ensureValue(topProblem.studentProblemPageId);
      await notionStudentProblems.updatePageProperties(
        studentProblemPageId, 
        {
          answerStatus: topProblem.answerStatus
        }
      );
    }
    const studentInfoAWS = ensureValue(await Students.findByStudentId(studentId));
    const studentProblemNotion = ensureValue(await notionStudentProblems.retrieveAPage(studentProblemPageId));
    const studentProblemAWS = ensureValue(await StudentProblems.findByNotionPageId(studentProblemPageId));
    await StudentProblems.update(
      ensureValue(studentProblemAWS.studentProblemId), 
      {
        answerStatus: studentProblemNotion.answerStatus,
      }
    );
    // updates Notion UI.
    
    const todoProblem = ensureValue(
      await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.todoDbId))
    ).find(todo => todo.studentProblemPageId === studentProblemPageId);
    if (todoProblem) {
      await notionTopProblems.updatePageProperties(
        ensureValue(todoProblem.topProblemPageId), 
        {
          answerStatus: studentProblemNotion.answerStatus
        }
      );
    };
  
    
    const wrongProblem = ensureValue(
      await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.wrongDbId))
    ).find(wrong => wrong.studentProblemPageId === studentProblemPageId);
    if (wrongProblem) {
      await notionTopProblems.updatePageProperties(
        ensureValue(wrongProblem.topProblemPageId), 
        {
          answerStatus: studentProblemNotion.answerStatus
        }
      );
    };
  
    
    const isDifficultProblem = ensureValue(
      await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.isDifficultDbId))
    ).find(isDifficult => isDifficult.studentProblemPageId === studentProblemPageId);
    if (isDifficultProblem) {
      await  notionTopProblems.updatePageProperties(
        ensureValue(isDifficultProblem.topProblemPageId), 
        {
          answerStatus: studentProblemNotion.answerStatus
        }
      );
    };
    
    if (isTodo) {
      const notionStudentTodoCounters = new NotionStudentTodoCounters();
      const notionStudentRemainings = new NotionStudentRemainings();
      const studentProblem = ensureValue(await StudentProblems.findWithSubfieldIdByNotionPageId(studentProblemPageId));
      const studentProbAWSId = ensureValue(studentProblem.studentProblemId);
      const subfieldId = ensureValue(studentProblem.subfieldId);
      const currentTracker = ensureValue(await Trackers.findByCompositeKey(studentId, subfieldId));
      
      // Just in case a student updates not latest problem status.
      if (studentProbAWSId !== currentTracker.studentProblemId) return;

      const studentOverviewPageId = ensureValue(studentInfoAWS.studentOverviewPageId);
      const nextTodoProblemId = await updateTrackerAndTodoCounter(studentId, studentProbAWSId);
      const studentSubfieldTrace = ensureValue(await StudentSubfieldTraces.findWithSubfieldNameByCompositeKey(studentId, subfieldId));
      const subfieldName = ensureValue(studentSubfieldTrace.subfieldName)
      const delay = ensureValue(studentSubfieldTrace.delay);
      const todoCounter = ensureValue(studentSubfieldTrace.todoCounter);
      const remainingDay = ensureValue(studentSubfieldTrace.remainingDay);
      // Notion UI updates
      await Promise.all([
        await notionStudentOverviews.updatePagePropertiesWithDelay(
          studentOverviewPageId, 
          subfieldName,
          delay,
          {}
        ),
        await notionStudentTodoCounters.updatePageProperties(
          ensureValue(studentSubfieldTrace.todoCounterNotionPageId),
          {
            remainingProblemNumber: todoCounter,
            delay: delay,
          }
        ),
        await notionStudentRemainings.updatePageProperties(
          ensureValue(studentSubfieldTrace.remainingDayNotionPageId), 
          {
            remainingDay: remainingDay
          }
        )
      ]);
      // if nextTodoProblemId is null, then the student might complete all todo tasks!
      if (nextTodoProblemId) {
        const todoNotionDBId = ensureValue(studentInfoAWS.todoDbId);
        const nextTodoProblemPageId = ensureValue(await StudentProblems.findNotionPageIdByStudentProblemId(nextTodoProblemId));
        await copyPageCreate(nextTodoProblemPageId, todoNotionDBId);
      } else if (nextTodoProblemId === null) {
        logger.warn(`StudentId: ${studentId} has completed all tasks!`);
      }
    }
  } catch (error) {
    logger.error("Error updating student problem in AWS:", error);
    throw error;
  }
}
export async function isDifficultChange(
  studentId: MySQLUintID, 
  studentProblemPageId: NotionUUID, 
  isTopProblem = false
) {
  try {
    const notionStudentProblems = new NotionStudentProblems();
    const notionTopProblems = new NotionTopProblems();
    if (isTopProblem) {
      const topProblem = ensureValue(await notionTopProblems.retrieveAPage(studentProblemPageId));
      studentProblemPageId = ensureValue(topProblem.studentProblemPageId);
      await notionStudentProblems.updatePageProperties(
        studentProblemPageId, 
        {
          isDifficult: topProblem.isDifficult
        }
      );
    }
    const studentInfoAWS = ensureValue(await Students.findByStudentId(studentId));
    const studentProblemNotion = ensureValue(await notionStudentProblems.retrieveAPage(studentProblemPageId));
    const studentProblemAWS = ensureValue(await StudentProblems.findByNotionPageId(studentProblemPageId));
    await StudentProblems.update(
      ensureValue(studentProblemAWS.studentProblemId), 
      {
        isDifficult: studentProblemNotion.isDifficult,
      }
    );
    // updates Notion UI.
    
    const todoProblem = ensureValue(
      await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.todoDbId))
    ).find(todo => todo.studentProblemPageId === studentProblemPageId);
    if (todoProblem) {
      await notionTopProblems.updatePageProperties(
        ensureValue(todoProblem.topProblemPageId), 
        {
          isDifficult: studentProblemNotion.isDifficult
        }
      );
    };
    
    const wrongProblem = ensureValue(
      await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.wrongDbId))
    ).find(wrong => wrong.studentProblemPageId === studentProblemPageId);
    if (wrongProblem) {
      await notionTopProblems.updatePageProperties(
        ensureValue(wrongProblem.topProblemPageId), 
        {
          isDifficult: studentProblemNotion.isDifficult
        }
      );
    };
    
    const isDifficultProblem = ensureValue(
      await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.isDifficultDbId))
    ).find(isDifficult => isDifficult.studentProblemPageId === studentProblemPageId);
    if (isDifficultProblem) {
      await  notionTopProblems.updatePageProperties(
        ensureValue(isDifficultProblem.topProblemPageId), 
        {
          isDifficult: studentProblemNotion.isDifficult
        }
      );
    };
  } catch (error) {
    logger.error("Error updating student problem in AWS:", error);
    throw error;
  }
}
