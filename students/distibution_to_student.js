import logger from '../infrastructure/logger';
import { StudentsSubfields } from '../infrastructure/aws_database/StudentsSubfields';
import { StudentSubfieldTraces } from '../infrastructure/aws_database/StudentSubfieldTraces';
import { Subfields } from '../infrastructure/aws_database/Subfields';
import { Students } from '../infrastructure/aws_database/Students';
import { TopProblems } from '../infrastructure/notion_database/student_only/TopProblems';
import { Trackers } from '../infrastructure/aws_database/Trackers';
import { ActualBlocks } from '../infrastructure/aws_database/ActualBlocks';
import { StudentProblemsAWS } from '../infrastructure/aws_database/StudentProblems';
import { Wrongs } from '../infrastructure/notion_database/student_only/Wrongs';
import { Difficults } from '../infrastructure/aws_database/Difficults';
import convertToSnakeCase from '../utils/lodash';
import { head } from 'lodash';
import { Remaining } from '../infrastructure/notion_database/student_only/Remaining';
import { addDays } from 'date-fns';
import { Problems } from '../infrastructure/aws_database/Problems';
import { TodoCounters } from '../infrastructure/notion_database/student_only/TodoCounters';
import { StudentProblemsNotion } from '../infrastructure/notion_database/student_only/StudentProblems';
import NotionAPI from '../infrastructure/notionAPI';
import { copyPageCreate } from '../utils/copyPage';
/**
 * Checks remaining distribution items for a student. This function handles the case where the system updates dbs in midnight.
 * @param {string} studentId The student identifier.
 */
export async function distRemainingPerStudent(studentId) {
  try {
    // 1. pick up the subfieldIDs from db
    const rows = await StudentsSubfields.findByStudentID(studentId);
    const subfieldIds = rows.map(row => row.subfield_id);
    const promises = subfieldIds.map(async subfieldId => {
      try {
        const subfieldData = await Subfields.findBySubfieldId(subfieldId)[0];
        if (!subfieldData) {
          logger.error(`No subfield data found for subfield ${subfieldId}`);
          return null;
        }
        // 2. pick up the student remaining data from Remaining Database
        const remainingData = await StudentSubfieldTraces.findByCompositeKey(studentId, subfieldId)[0];
        if (!remainingData) {
          logger.error(`No remaining data found for student ${studentId} and subfield ${subfieldId}`);
          return null;
        }
        // 3. convert the remaining data into a appropriate data structure for distribution
        const formattedData = {
          name: remainingData.title,
          subfield: subfieldData.subject,
          remaining: remainingData.remaining
        }
        return formattedData;
      } catch (error) {
        logger.error(`Error in fetching data for student ${studentId} and subfield ${subfieldId}:`, error.message);
        return null;
      }
    })
    const formattedDataList = (await await Promise.all(promises)).filter(data => data !== null);
    // 4. distribute the remaining data
    await Remaining.updateRemainingsAll(formattedDataList)
    // TODO: Record logs for missing data
  } catch (error) {
    logger.error('Error in dist_remaining', error.message);
  };
}

export async function distRemainingToAllStudents(){
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => student.Student_ID);
    await Promise.all(studentIds.map(async (studentId) => await distRemainingPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in dist_remaining_to_all', error.message);
  };
}

/**
 * Sends textbook to students who have 'to-do' status.
 * I don't care about the corner case where a block size is so small that students can have the same problem in one distribution. 
 * I assume that you need at least two times distribution to have the same problem.
 * TODO: To keep the consistency of the status, we should record the data only every midnight. 
 * However, we change the status of understanding level and others whenever students change it.
 * TODO: When deleting todo items, we should change the status of understanding level from '正解' to '未回答'
 * TODO: When deleting todo items, we should check if the same item is manupulated multiple times at once.
 * @param {string} studentId
 * @param {string} databaseId
 */
export async function sendTodoCountersPerStudent(studentId, databaseId) {
  try {
    // 1. fetch all the subfield ids of the student
    const subfieldIds = await StudentsSubfields.findByStudentID(studentId);
    // 2. fetch the content of the current todo db
    const currentToDos = await TopProblems.getTopProblems(databaseId);
    // 3. fetch the tracking data of the student for each subfield
    const trackingData = await Trackers.findAll();
    const promises = subfieldIds.map(async (subfieldId) => {
      // 3. filter items which the student marked as wrong or difficult.
      // TODO: Add transaction logics in case something is wrong.
      const wrongCurrentToDo = currentToDos.filter(toDo => toDo.subfieldId === subfieldId && toDo.understandingLevel === '不正解');
      const difficultCurrentToDo = currentToDos.filter(toDo => toDo.subfieldId === subfieldId && toDo.isDifficult === true);
      await Wrongs.createWrong(wrongCurrentToDo);
      await Difficults.createDifficult(difficultCurrentToDo);
      // 4. delete done items 
      const doneCurrentToDo = currentToDos.filter(toDo => toDo.subfieldId === subfieldId && toDo.understandingLevel !== '未回答');
      await Promise.all(doneCurrentToDo.map(async (toDo) => await TopProblems.deleteATopProblemById(toDo.toDoId)));
      // 5. check if the student already has a todo item (Don't check this because the item is already distributed when the student finished the former problem)
      const studentTrace = StudentSubfieldTraces.findByCompositeKey(studentId, subfieldId)[0];
      const specificTrackingData = trackingData.filter(tracker => tracker.subfield_id === subfieldId);
      const actualBlockId = specificTrackingData.actual_block_id;
      if (studentTrace.todo_counter > 0) {
        await StudentSubfieldTraces.update(studentTrace.tracker_id, {
          remaining_day: studentTrace.remaining_day-1,
          actual_end_date: addDays(new Date(studentTrace.actual_end_date), 1)
        })
        // TODO: change appropriately syncrhonized with calculation program.
        await delayPlan(actualBlockId);
        return null;
      }
      // 6. fetch the id and number of the subfield item for todo
      const trackerId = specificTrackingData.tracker_id;
      const remainingSpace = specificTrackingData.remaining_space;
      const isRest = specificTrackingData.is_rest;
      if (isRest) {
        await Trackers.update(trackerId, {is_rest: 0});
        return null;
      } else if (remainingSpace > 0) {
        await Trackers.update(trackerId, {remaining_space: remainingSpace-1});
        return null;
      } else {
        const problemOrder = specificTrackingData.present_order;
        const actualBlock = ActualBlocks.findByCompositeKey(studentId, subfieldId, actualBlockId)[0];
        const speed = actualBlock.speed;
        const lap = specificTrackingData.lap;
        const space = actualBlock.space;
        const numberOfLaps = actualBlock.number_of_laps;
        const headOrder = actualBlock.head_order;
        const tailOrder = actualBlock.tail_order;
        if (problemOrder+speed-1 < tailOrder) {
          // TODO: I have to convert the problem list into todo list format.
          const nextTimeProblem = await StudentProblemsAWS.findByCompositeKey(studentId, subfieldId, problemOrder+speed)[0];
          const nextTracker = {
            problemId: nextTimeProblem.student_problem_id,
            presentOrder: nextTimeProblem.problem_order,
            remainingSpace: space,
          }
          const data = convertToSnakeCase(nextTracker);
          await Trackers.update(trackerId, data);
        } else if (problemOrder+speed-1 === tailOrder && lap < numberOfLaps) {
          const nextTimeProblem = await StudentProblemsAWS.findByCompositeKey(studentId, subfieldId, headOrder)[0];
          if(!nextTimeProblem){ throw new Error(`Could not find next block in student record ${studentId}`); };
          const nextTracker = {
            problemId: nextTimeProblem.student_problem_id,
            presentOrder: headOrder,
            remainingSpace: space,
            lap: lap+1,
          }
          const data = convertToSnakeCase(nextTracker);
          await Trackers.update(trackerId, data);
        } else if (problemOrder+speed-1 === tailOrder) {
          const nextTimeProblem = await StudentProblemsAWS.findByCompositeKey(studentId, subfieldId, tailOrder+1)[0];
          if(!nextTimeProblem){ throw new Error(`Could not find next problem in student record ${studentId}`); };
          const nextActualBlock = await ActualBlocks.findByActualBlockId(nextTimeProblem.actual_block_id)[0];
          if(!nextActualBlock){ throw new Error(`Could not find next actual block in student record ${studentId}`); };
          const nextTracker = {
            blockId: nextTimeProblem.actual_block_id,
            problemId: nextTimeProblem.student_problem_id,
            presentOrder: nextTimeProblem.problem_order,
            remainingSpace: nextActualBlock.space,
            lap: 1,
          }
          const data = convertToSnakeCase(nextTracker);
          await Trackers.update(trackerId, data);
        } else if (problemOrder+speed-1 > tailOrder && lap < numberOfLaps){
          const secondEndOrder = speed - (tailOrder-problemOrder+1) + head-1
          const nextTimeProblem = await StudentProblemsAWS.findByCompositeKey(studentId, subfieldId, secondEndOrder+1)[0];
          if(!nextTimeProblem){ throw new Error(`Could not find next block in student record ${studentId}`); };
          const nextTracker = {
            problemId: nextTimeProblem.problem_id,
            presentOrder: nextTimeProblem.problem_order,
            remainingSpace: space,
            lap: lap+1,
          }
          const data = convertToSnakeCase(nextTracker);
          await Trackers.update(trackerId, data);
        } else {
          const secondGroupHeadProblem = await StudentProblemsAWSProblems.findByCompositeKey(studentId, subfieldId, tailOrder+1)[0];
          const secondGroupActualBlock = await ActualBlocks.findByCompositeKey(studentId, subfieldId, secondGroupHeadProblem.block_id)[0];
          const nextSpeed = secondGroupActualBlock.speed;
          const nextHead = secondGroupActualBlock.head;
          const secondEndOrder = Math.min(speed - (tailOrder-problemOrder+1) + nextHead-1, nextSpeed - (tailOrder-problemOrder+1) + nextHead-1);
          const nextTimeProblem = await Problems.findByCompositeKey(studentId, subfieldId, secondEndOrder+1)[0];
          if(!nextTimeProblem){ throw new Error(`Could not find next block in student record ${studentId}`); };
          const nextTracker = {
            blockId: nextTimeProblem.actual_block_id,
            problemId: nextTimeProblem.problem_id,
            presentOrder: nextTimeProblem.problem_order,
            remainingSpace: secondGroupActualBlock.space,
            lap: 0,
          }
          const data = convertToSnakeCase(nextTracker);
          await Trackers.update(trackerId, data);
        }
      }
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in sendTodoPerStudent', error.message);
  };
}

export async function sendTodoCountersForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => {
      return {
        studentId: student.student_id,
        databaseId: student.todo_db_id
      }
    });
    await Promise.all(studentIds.map(async ({studentId, databaseId}) => await sendTodoCountersPerStudent(studentId, databaseId)));
  } catch (error) {
    logger.error('Error in sendTodoForAllStudents', error.message);
  };
}

export async function dealWithTodosPerStudent(studentId) {
  try {
    // 1. fetch all the items from the todos database
    const studentInfoAWS = await Students.findByStudentId(studentId)[0];
    const todoData = await TopProblems.getTopProblems(studentInfoAWS.todo_db_id);
    // 3. delete the done items
    await Promise.all(todoData.map(async (data) => {
      const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(data.notionPageId)[0]
      if (data.isDifficult) {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            difficultCount: studentProblemAWS.difficult_count+1,
          }
        );
        await copyPageCreate(data.notionPageId, studentInfoAWS.is_difficult_db_id);
      };
      if (data.ansStatus === '不正解') {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            answerStatus: '未回答',
            tryCount: studentProblemAWS.try_count+1,
            wrongCount: studentProblemAWS.wrong_count+1,
          }
        );
        await NotionAPI.deleteAPage(data.topProblemPageId);
        await copyPageCreate(data.notionPageId, studentProblemAWS.wrong_db_id);
      } else if (data.ansStatus === '正解') {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            answerStatus: '未回答',
            tryCount: studentProblemAWS.try_count+1,
          }
        );
        await NotionAPI.deleteAPage(data.topProblemPageId);
      };
    }));
  } catch(error) {
    logger.error('Error in deleteWithTodosPerStudent', error.message);
  }
}

export async function dealWithTodosForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => student.Student_ID);
    await Promise.all(studentIds.map(async (studentId) => await dealWithTodosPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithTodosForAllStudents', error.message);
  }
}
/**
 * Sends textbook to students who answered questions incorrectly.
 * @param 
 */
export async function dealWithWrongsPerStudent(studentId) {
  try {
    // 1. fetch all the items from the wrongs database
    const studentInfoAWS = await Students.findByStudentId(studentId)[0];
    const wrongData = await TopProblems.getTopProblems(studentInfoAWS.wrong_db_id);
    // 3. delete the done items
    await Promise.all(wrongData.map(async (data) => {
      const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(data.notionPageId)[0]
      if (data.ansStatus === '不正解') {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            answerStatus: '未回答',
            tryCount: studentProblemAWS.try_count+1,
            wrongCount: studentProblemAWS.wrong_count+1,
          }
        );
      } else if (data.ansStatus === '正解') {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            answerStatus: '未回答',
            tryCount: studentProblemAWS.try_count+1,
          }
        );
        await NotionAPI.deleteAPage(data.topProblemPageId);
      } 
      if (data.isDifficult) {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            difficultCount: studentProblemAWS.difficult_count+1,
          }
        );
        await copyPageCreate(data.notionPageId, studentInfoAWS.is_difficult_db_id);
      }
    }));
  } catch(error) {
    logger.error('Error in deleteWithWrongsPerStudent', error.message);
  }
}

export async function dealWithWrongsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => student.Student_ID);
    await Promise.all(studentIds.map(async (studentId) => await dealWithWrongsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithWrongsForAllStudents', error.message);
  }
}

/**
 * Sends textbook to students who find certain content difficult.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} notionClient - Instance of the Notion client (optional)
 */
export async function dealWithIsDifficultsPerStudent(studentId) {
  try {
    // 1. fetch all the items from the isDifficults database
    const studentInfoAWS = await Students.findByStudentId(studentId)[0];
    const isDifficultData = await TopProblems.getTopProblems(studentInfoAWS.is_difficult_db_id);
    // 3. delete the done items
    await Promise.all(isDifficultData.map(async (data) => {
      const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(data.notionPageId)[0]
      if (data.ansStatus === '不正解') {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            answerStatus: '未回答',
            tryCount: studentProblemAWS.try_count+1,
            wrongCount: studentProblemAWS.wrong_count+1,
          }
        );
        await copyPageCreate(data.notionPageId, studentInfoAWS.wrong_db_id);
      } else if (data.ansStatus === '正解') {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            answerStatus: '未回答',
            tryCount: studentProblemAWS.try_count+1,
          }
        );
      } 
      if (!data.isDifficult) {
        await updateStudentProblemProperties(
          studentProblemAWS.student_problem_id,
          data.notionPageId,
          data.subfieldName,
          {
            isDifficult: false
          }
        );
        await NotionAPI.deleteAPage(data.topProblemPageId);
      }
    }));
  } catch(error) {
    logger.error('Error in deleteWithIsDifficultsPerStudent', error.message);
  }
}

export async function dealWithIsDifficultsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => student.Student_ID);
    await Promise.all(studentIds.map(async (studentId) => await dealWithIsDifficultsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithIsDifficultsForAllStudents', error.message);
  }
}

export async function dealWithStudentProblemsPerStudent(studentId) {
  try {
    // 1. fetch all the items from the isDifficults database
    const studentInfoAWS = await Students.findByStudentId(studentId)[0];
    const studentSubfieldInfo = await StudentSubfieldTraces.findByStudentId(studentId);
    const promises = studentSubfieldInfo.map(async (tmp) => {
      const subfieldId = tmp.subfield_id;
      const databaseId = tmp.database_id;
      const subfieldName = await Subfields.findBySubfieldId(subfieldId)[0].subfield_name;
      const studentProblems = await StudentsProblemsNotion.getStudentsProblems(databaseId, subfieldName);
      await Promise.all(studentProblems.map(async (problem) => {
        const studentProblemAWS = await StudentProblemsAWS.findByNotionPageId(problem.notionPageId)[0]
        if (data.ansStatus === '不正解') {
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            problem.notionPageId,
            problem.subfieldName,
            {
              answerStatus: '未回答',
              tryCount: studentProblemAWS.try_count+1,
              wrongCount: studentProblemAWS.wrong_count+1,
            }
          );
          await copyPageCreate(problem.notionPageId, studentInfoAWS.wrong_db_id);
        } else if (problem.ansStatus === '正解') {
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            problem.notionPageId,
            problem.subfieldName,
            {
              answerStatus: '未回答',
              tryCount: studentProblemAWS.try_count+1,
            }
          );
        } 
        if (problem.isDifficult) {
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            problem.notionPageId,
            problem.subfieldName,
            {
              isDifficult: true,
            }
          );
          await copyPageCreate(problem.notionPageId, studentInfoAWS.is_difficult_db_id);
        }
      }));
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in dealWithStudentProblemsPerStudent', error.message);
    throw error;
  }
};

export async function dealWithStudentProblemsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => student.Student_ID);
    await Promise.all(studentIds.map(async (studentId) => await dealWithStudentProblemsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in dealWithStudentProblemsForAllStudents', error.message);
    throw error;
  }
};

export async function delayPlan(actualBlockId){
  // TODO: Implement this 
};

// TODO: guarantee consistency
export async function updateStudentProblemProperties(studentProblemIdAWS, studentProblemIdNotion, subfieldName,  updates){
  try {    
    // AWS
    await StudentProblemsAWS.update(studentProblemIdAWS, convertToSnakeCase(updates));
    // Notion
    await StudentProblemsNotion.update(studentProblemIdNotion, subfieldName, updates);
  } catch (error) {
    logger.error('Error in updateStudentProblemProperties', error.message);
  }
}