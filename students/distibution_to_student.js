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
import { StudentProblemsNotion } from '../infrastructure/notion_database/student_only/StudentProblems';
import NotionAPI from '../infrastructure/notionAPI';
import { copyPageCreate } from '../utils/copyPage';
import { probAnalysis } from '../const/problemAnalysis';
import { Properties } from '../const/notionTemplate';
import { propertyFromNotion, propertyToNotion } from '../utils/propertyHandler';
import { studentsOverviewsColumns } from '../const/notionDatabaseColumns';
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

export async function distRemainingToAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.student_id);
    await Promise.all(studentIds.map(async (studentId) => await distRemainingPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in dist_remaining_to_all', error.message);
  };
}

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

export async function sendReviewsPerStudent(studentId, todoDatabaseId) {
  try {
    const reviewInfo = await StudentSubfieldTraces.findByStudentId(studentId);
    const promises = reviewInfo.map(async row => {
      const traceId = row.trace_id;
      const subfieldId = row.subfield_id;
      const reviewSpeed = row.review_speed;
      const reviewSpace = row.review_space;
      const reviewRemainingSpace = row.review_remaining_space;
      if (reviewRemainingSpace === 0){
        const reviewProblems = await StudentProblemsAWS.findAllProblemsForReview(subfieldId, reviewSpeed);
        await Promise.all(reviewProblems.map(async reviewProblem => {
          try {
            await copyPageCreate(reviewProblem.notion_page_id, todoDatabaseId);
          } catch (error) {
            logger.error('Error in copyPageCreate', error.message);
            throw error;
          }
        }));
        await StudentSubfieldTraces.update(traceId, 
          convertToSnakeCase(
            { reviewRemainingSpace: reviewSpace }
          )
        );
      } else {
        await StudentSubfieldTraces.update(traceId, 
          convertToSnakeCase(
            { reviewRemainingSpace: reviewRemainingSpace-1 }
          )
        );
      }
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in sendReviewsPersStudent', error.message);
  }
}

export async function sendReviewsForAllStudents() {
  try {
    const studentInfo = await Students.findOnlyTopProblemDBIds();
    await Promise.all(studentInfo.map(async row => await sendReviewsPerStudent(row.student_id, row.todo_db_id)));
  } catch (error) {
    logger.error('Error in sendReviewsForAllStudents', error.message);
    throw error;
  }
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
        await Promise.all([
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            data.notionPageId,
            data.subfieldName,
            {
              answerStatus: '未回答',
              tryCount: studentProblemAWS.try_count+1,
              wrongCount: studentProblemAWS.wrong_count+1,
            }
          ),
          await updateReviewLevel(
            studentProblemAWS.student_problem_id, 
            data.notionPageId,
            false,
            true
          ),
          await NotionAPI.deleteAPage(data.topProblemPageId)
        ]);
        await copyPageCreate(data.notionPageId, studentProblemAWS.wrong_db_id);
      } else if (data.ansStatus === '正解') {
        await Promise.all([
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            data.notionPageId,
            data.subfieldName,
            {
              answerStatus: '未回答',
              tryCount: studentProblemAWS.try_count+1,
            }
          ),
          await updateReviewLevel(
            studentProblemAWS.student_problem_id, 
            data.notionPageId,
            true,
            true
          ),
          await NotionAPI.deleteAPage(data.topProblemPageId)
        ])
      };
    }));
  } catch(error) {
    logger.error('Error in deleteWithTodosPerStudent', error.message);
  }
}

export async function dealWithTodosForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.student_id);
    await Promise.all(studentIds.map(async (studentId) => await dealWithTodosPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithTodosForAllStudents', error.message);
  }
}

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
        await Promise.all([
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            data.notionPageId,
            data.subfieldName,
            {
              answerStatus: '未回答',
              tryCount: studentProblemAWS.try_count+1,
            }
          ),
          await NotionAPI.deleteAPage(data.topProblemPageId)
        ])
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
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.student_id);
    await Promise.all(studentIds.map(async (studentId) => await dealWithWrongsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithWrongsForAllStudents', error.message);
  }
}

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
        Promise.all([
          await updateStudentProblemProperties(
            studentProblemAWS.student_problem_id,
            data.notionPageId,
            data.subfieldName,
            {
              isDifficult: false
            }
          ),
          await NotionAPI.deleteAPage(data.topProblemPageId)
        ])
      }
    }));
  } catch(error) {
    logger.error('Error in deleteWithIsDifficultsPerStudent', error.message);
  }
}

export async function dealWithIsDifficultsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.student_id);
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
          await Promise.all([
            await updateStudentProblemProperties(
              studentProblemAWS.student_problem_id,
              problem.notionPageId,
              problem.subfieldName,
              {
                answerStatus: '未回答',
                tryCount: studentProblemAWS.try_count+1,
                wrongCount: studentProblemAWS.wrong_count+1,
              }
            ),
            await updateReviewLevel(
              studentProblemAWS.student_problem_id,
              problem.notionPageId,
              false,
              false
            )
          ]);
          await copyPageCreate(problem.notionPageId, studentInfoAWS.wrong_db_id);
        } else if (problem.ansStatus === '正解') {
          await Promise.all([
            await updateStudentProblemProperties(
              studentProblemAWS.student_problem_id,
              problem.notionPageId,
              problem.subfieldName,
              {
                answerStatus: '未回答',
                tryCount: studentProblemAWS.try_count+1,
              }
            ), 
            await updateReviewLevel(
              studentProblemAWS.student_problem_id,
              problem.notionPageId,
              true,
              false
            )
          ]);
        };
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
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.student_id);
    await Promise.all(studentIds.map(async (studentId) => await dealWithStudentProblemsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in dealWithStudentProblemsForAllStudents', error.message);
    throw error;
  }
};

export async function delayPlan(actualBlockId) {
  // TODO: Implement this 
};

export async function sendReviewAlertPerStudent(studentId, todoDatabaseId) {
  try {
    const studentOverviewPageId = await Students.findOnlyOverviewPageIdByStudentId(studentId);
    const studentSubfieldInfo = await StudentSubfieldTraces.findOnlyReviewAlertByStudentId(studentId);
    const todoDatabaseInfo = await NotionAPI.queryADatabase(todoDatabaseId, filter={
      and: [
        { property: probAnalysis.reviewLevel.name, [probAnalysis.reviewLevel.type]: { 'does_not_equal': probAnalysis.reviewLevel.level0 }},
        { property: probAnalysis.reviewLevel.name, [probAnalysis.reviewLevel.type]: { 'does_not_equal': probAnalysis.reviewLevel.level1 }},
      ]
    });
    const subfieldList = todoDatabaseInfo.results.map(result => propertyFromNotion(result.properties, '科目', 'select'));
    const alertSubfieldList = [];
    await Promise.all(studentSubfieldInfo.map(async infoRow => {
      const subfieldName = infoRow.subfield_name;
      const reviewAlert = infoRow.review_alert;
      if (subfieldList.filter(element => element === subfieldName).length >= reviewAlert) {
        alertSubfieldList.push(subfieldName);
      }
    }));
    if (alertSubfieldList.length > 0) {
      const response = await NotionAPI.updatePageProperties(studentOverviewPageId, Properties.getJSON(
        [
          propertyToNotion({
            propertyName: studentsOverviewsColumns.alertSubfields.name,
            propertyContent: alertSubfieldList,
            propertyType: studentsOverviewsColumns.alertSubfields.type
          })
        ]
      ));
      if (response.status !== 200) {
        throw new Error('Failed to update alert subfields in Notion for student', { studentId, alertSubfieldList });
      }
    }
  } catch (error) {
    logger.error('Error in sendReviewAlertPerStudent', error.message);
    throw error;
  }
}
export async function sendReviewAlertForAllStudents() {
  try {
    const studentInfo = await Students.findOnlyTopProblemDBIds();
    await Promise.all(studentInfo.map(async infoRow => await sendReviewAlertPerStudent(infoRow.student_id, infoRow.todo_db_id)));
  } catch (error) {
    logger.error('Error in sendReviewAlertForAllStudents', error.message);
    throw error;
  }
}

// TODO: guarantee consistency
export async function updateStudentProblemProperties(studentProblemAWSId, studentProblemIdNotion, subfieldName,  updates) {
  try {    
    // AWS
    const updateAWS = async () => await StudentProblemsAWS.update(studentProblemAWSId, convertToSnakeCase(updates));
    // Notion
    const updateNotion = async () => await StudentProblemsNotion.update(studentProblemIdNotion, subfieldName, updates);
    await Promise.all([updateAWS(), updateNotion()]);
  } catch (error) {
    logger.error('Error in updateStudentProblemProperties', error.message);
  }
}

// TODO: change the review frequency based on subfield?
export async function updateReviewLevel(studentProblemAWSId, studentProblemPageId, isCorrect, isTodo) {
  try {
    const studentProblem = await NotionAPI.retrieveAPage(studentProblemPageId);
    if (isCorrect) {
      switch (studentProblem[probAnalysis.reviewLevel.name]) {
        case probAnalysis.reviewLevel.level0:
          if (isTodo){
            await Promise.all([
              await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
                propertyToNotion({
                  propertyName: probAnalysis.reviewLevel.name,
                  propertyContent: probAnalysis.reviewLevel.level1,
                  propertyType: probAnalysis.reviewLevel.type
                })
              ])),
              await StudentProblemsAWS.update(studentProblemAWSId, 
                convertToSnakeCase({
                  reviewLevel: probAnalysis.reviewLevel.level1
                })
              )
            ])
            ;
          };
          break;
        case probAnalysis.reviewLevel.level1:
          if (isTodo) {
            await Promise.all([
              await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
                propertyToNotion({
                  propertyName: probAnalysis.reviewLevel.name,
                  propertyContent: probAnalysis.reviewLevel.level2,
                  propertyType: probAnalysis.reviewLevel.type
                })
              ])),
              await StudentProblemsAWS.update(studentProblemAWSId,
                convertToSnakeCase({
                  reviewLevel: probAnalysis.reviewLevel.level2,
                  reviewCount: probAnalysis.reviewCount.level2
                })
              )
            ])
          };
          break;
        case probAnalysis.reviewLevel.level2:
          await Promise.all([
            await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
              propertyToNotion({
                propertyName: probAnalysis.reviewLevel.name,
                propertyContent: probAnalysis.reviewLevel.level3,
                propertyType: probAnalysis.reviewLevel.type
              })
            ])),
            await StudentProblemsAWS.update(studentProblemAWSId,
              convertToSnakeCase(
                {
                  reviewLevel: probAnalysis.reviewLevel.level3,
                  reviewCount: probAnalysis.reviewCount.level3
                }
              )
            )
          ])
          break;
        case probAnalysis.reviewLevel.level3:
          await Promise.all([
            await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
              propertyToNotion({
                propertyName: probAnalysis.reviewLevel.name,
                propertyContent: probAnalysis.reviewLevel.level4,
                propertyType: probAnalysis.reviewLevel.type
              })
            ])),
            await StudentProblemsAWS.update(studentProblemAWSId,
              convertToSnakeCase(
                {
                  reviewLevel: probAnalysis.reviewLevel.level4,
                  reviewCount: probAnalysis.reviewCount.level4
                }
              )
            )
          ])
          break;
        case probAnalysis.reviewLevel.level4:
          await Promise.all([
            await StudentProblemsAWS.update(studentProblemAWSId,
              convertToSnakeCase(
                {
                  reviewCount: probAnalysis.reviewCount.level4
                }
              )
            )
          ])
          break;
        default:
          throw new Error('Invalid review level. Review level should be one of'+ Object.values(probAnalysis.reviewLevel).join(', '));
      }
    } else {
      switch (studentProblem[probAnalysis.reviewLevel.name]) {
        case probAnalysis.reviewLevel.level0:
          if (isTodo) {
            await Promise.all([
              await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
                propertyToNotion({
                  propertyName: probAnalysis.reviewLevel.name,
                  propertyContent: probAnalysis.reviewLevel.level1,
                  propertyType: probAnalysis.reviewLevel.type
                })
              ])),
              await StudentProblemsAWS.update(studentProblemAWSId,
                convertToSnakeCase(
                  {
                    reviewLevel: probAnalysis.reviewLevel.level1
                  }
                )
              )
            ])
          }
          break;
        case probAnalysis.reviewLevel.level1:
          if (isTodo) {
            await Promise.all([
              await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
                propertyToNotion({
                  propertyName: probAnalysis.reviewLevel.name,
                  propertyContent: probAnalysis.reviewLevel.level2,
                  propertyType: probAnalysis.reviewLevel.type
                })
              ])),
              await StudentProblemsAWS.update(studentProblemAWSId,
                convertToSnakeCase(
                  {
                    reviewLevel: probAnalysis.reviewLevel.level2
                  }
                )
              )
            ])
          };
          break;
        case probAnalysis.reviewLevel.level2:
          await Promise.all([
            await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
              propertyToNotion({
                propertyName: probAnalysis.reviewLevel.name,
                propertyContent: probAnalysis.reviewLevel.level2,
                propertyType: probAnalysis.reviewLevel.type
              })
            ])),
            await StudentProblemsAWS.update(studentProblemAWSId,
              convertToSnakeCase(
                {
                  reviewLevel: probAnalysis.reviewLevel.level2
                }
              )
            )
          ])
          break;
        case probAnalysis.reviewLevel.level3:
          await Promise.all([
            await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
              propertyToNotion({
                propertyName: probAnalysis.reviewLevel.name,
                propertyContent: probAnalysis.reviewLevel.level3,
                propertyType: probAnalysis.reviewLevel.type
              }),
            ])),
            await StudentProblemsAWS.update(studentProblemAWSId,
              convertToSnakeCase(
                {
                  reviewLevel: probAnalysis.reviewLevel.level3,
                  reviewCount: probAnalysis.reviewCount.level3
                }
              )
            )
          ])
          break;
        case probAnalysis.reviewLevel.level4:
          await Promise.all([
            await NotionAPI.updatePageProperties(studentProblemPageId, Properties.getJSON([
              propertyToNotion({
                propertyName: probAnalysis.reviewLevel.name,
                propertyContent: probAnalysis.reviewLevel.level3,
                propertyType: probAnalysis.reviewLevel.type
              }),
            ])),
            await StudentProblemsAWS.update(studentProblemAWSId,
              convertToSnakeCase(
                {
                  reviewLevel: probAnalysis.reviewLevel.level3,
                  reviewCount: probAnalysis.reviewCount.level3
                }
              )
            )
          ])
          break;
        default:
          throw new Error('Invalid review level. Review level should be one of'+ Object.values(probAnalysis.reviewLevel).join(', '));
      };
    }
  } catch (error) {
    logger.error('Error in updateReviewLevel', error.message);
    throw error;
  }
}