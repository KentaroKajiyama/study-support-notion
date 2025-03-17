import { calculateNextTrackerAndTodoCounter } from '../caluculation/scheduleForStudents.js';
import { adjustSchedule } from '../caluculation/scheduleForStudents.js';
import { 
  logger,
  copyPageCreate,
  ensureValue
} from '@utils/index.js';
import {
  StudentSubfieldTraces,
  Subfields,
  Students,
  StudentProblems,
  Trackers,
} from '@infrastructure/mysql/index.js'
import { 
  MySQLUintID,
  Uint,
  NotionUUID, 
  SubfieldsSubfieldNameEnum, 
  SubjectsSubjectNameEnum,
  toUint,
  isWrongAnswerStatus,
  isCorrectAnswerStatus,
} from '@domain/types/index.js';
import {
  NotionStudentRemainings,
  NotionTopProblems,
  NotionStudentProblems
} from '@infrastructure/notion/index.js';
import { DomainStudentProblem } from '@domain/student/StudentProblem.js';
import { NotionStudentOverviews } from '@infrastructure/notion/StudentOverview.js';

export async function distRemainingPerStudent(
  studentId: MySQLUintID,
  remainingDatabaseId: NotionUUID,
): Promise<void> {
  try {
    // 1. pick up the subfieldIDs from db
    const rows = await StudentSubfieldTraces.findOnlySubfieldInfoByStudentId(studentId);
    const promises = rows.map(async subfieldInfo => {
      try {
        const subfieldData = ensureValue(
          await Subfields.findWithSubjectNameBySubfieldId(subfieldInfo.subfieldId), 
          `No subfield data found for subfield ${subfieldInfo.subfieldId}`
        );
        // 2. pick up the student remaining data from Remaining Database
        const trace = ensureValue(
          await StudentSubfieldTraces.findWithSubfieldNameByCompositeKey(studentId, subfieldInfo.subfieldId),
          `No remaining data found for student ${studentId} and subfield ${subfieldInfo.subfieldId}`
        );
        // 3. convert the remaining data into a appropriate data structure for distribution
        const formattedData: {
          pageId: NotionUUID | null,
          subjectName: SubjectsSubjectNameEnum,
          subfieldName: SubfieldsSubfieldNameEnum,
          remainingDay: Uint
        } = {
          pageId: trace.todoCounterNotionPageId ?? null,
          subjectName: ensureValue(subfieldData.subjectName),
          subfieldName: ensureValue(subfieldData.subfieldName),
          remainingDay: ensureValue(trace.remainingDay)
        } 
        return formattedData;
      } catch (error) {
        logger.error(`Error in fetching data for student ${studentId} and subfield ${subfieldInfo.subfieldId}:`, error);
        return null;
      }
    })
    const formattedDataList = (await Promise.all(promises)).filter(data => data !== null);
    // 4. distribute the remaining data
    const notionStudentRemainings = new NotionStudentRemainings();
    await Promise.all(formattedDataList.map(async data => {
      if (data.pageId) {
        return await notionStudentRemainings.updatePageProperties(data.pageId, {
          subjectName: data.subjectName,
          subfieldName: data.subfieldName,
          remainingDay: data.remainingDay
        })
      } else {
        return await notionStudentRemainings.createAPageOnlyWithProperties(
          remainingDatabaseId,
          'database_id',
          {
            subjectName: data.subjectName,
            subfieldName: data.subfieldName,
            remainingDay: data.remainingDay
          }
        );
      }
    }))
    // TODO: Record logs for missing data
  } catch (error) {
    logger.error('Error in dist_remaining', error);
  };
}

export async function distRemainingToAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIdAndRemainingDbIds = studentData.map(student => ({studentId: student.studentId, remainingDbId: student.remainingDbId}));
    await Promise.all(studentIdAndRemainingDbIds
      .map(
        async (studentIdAndRemainingDbId) => 
          await distRemainingPerStudent(
            studentIdAndRemainingDbId.studentId, 
            ensureValue(studentIdAndRemainingDbId.remainingDbId, `There is no remaining db ID for student ${studentIdAndRemainingDbId.studentId}\n`)
          )
        )
      );
  } catch (error) {
    logger.error('Error in dist_remaining_to_all', error);
  };
}

export async function sendTodoCountersPerStudent(
  studentId: MySQLUintID, 
  databaseId: NotionUUID
): Promise<void> {
  try {
    // 0. instantiation.
    const notionTopProblems = new NotionTopProblems();
    // 1. fetch all the subfield ids of the student
    const traces = await StudentSubfieldTraces.findByStudentId(studentId);
    // 2. fetch the content of the current todo db
    const currentTodos = await notionTopProblems.queryADatabase(databaseId)
    // 3. fetch the tracking data of the student for each subfield
    const trackingData = await Trackers.findAll();
    const promises = traces.map(async (trace) => {
      // 3. filter items which the student marked as wrong or difficult.
      // TODO: Add transaction logics in case something is wrong.
      const subfieldId = ensureValue(trace.subfieldId);
      const subfieldName = ensureValue(ensureValue(await Subfields.findBySubfieldId(subfieldId)).subfieldName);
      const wrongCurrentTodo = currentTodos.filter(todo => todo.subfieldName === subfieldName && todo.answerStatus === '不正解');
      const difficultCurrentTodo = currentTodos.filter(todo => todo.subfieldName === subfieldName && todo.isDifficult === true);
      // await Wrongs.createWrong(wrongCurrentTodo);
      // await Difficults.createDifficult(difficultCurrentTodo);
      // 4. delete done items 
      // const doneCurrentTodo = currentTodos.filter(todo => todo.subfieldId === subfieldId && todo.understandingLevel !== '未回答');
      // await Promise.all(doneCurrentTodo.map(async (todo) => await TopProblems.deleteATopProblemById(todo.todoId)));
      // 5. check if the student already has a todo item (Don't check this because the item is already distributed when the student finished the former problem)
      const studentTrace = ensureValue(await StudentSubfieldTraces.findWithSubfieldNameByCompositeKey(studentId, subfieldId));
      const currentTracker = ensureValue(trackingData.find(tracker => tracker.subfieldId === subfieldId));
      const actualBlockId = ensureValue(currentTracker.actualBlockId)
      if (ensureValue(studentTrace.todoCounter) > 0) {
        await adjustSchedule(studentId, actualBlockId, subfieldId, "delay", false);
      } else {
        // 6. fetch the id and number of the subfield item for todo
        const trackerId = ensureValue(currentTracker.trackerId);
        const remainingSpace = ensureValue(currentTracker.remainingSpace);
        const isRest = ensureValue(currentTracker.isRest);
        if (isRest) {
          await Trackers.update(trackerId, { isRest: false });
        } else if (remainingSpace > 0) {
          await Trackers.update(trackerId, { remainingSpace: toUint(remainingSpace-1) });
        } else {
          const result = await calculateNextTrackerAndTodoCounter(studentId, subfieldId, actualBlockId, currentTracker);
          await Promise.all([
            await Trackers.update(trackerId, result.tracker),
            await StudentSubfieldTraces.updateByCompositeKey(studentId, subfieldId, {
              todoCounter: result.todoCounter
            })
          ]);
        }
      }
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in sendTodoPerStudent', error);
  };
}
// TODO: Add logic for except irregular students who don't have database yet.
export async function sendTodoCountersForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findAll();
    const studentIds = studentData.map(student => {
      return {
        studentId: ensureValue(student.studentId),
        databaseId: ensureValue(student.todoDbId)
      }
    });
    await Promise.all(studentIds.map(async ({studentId, databaseId}) => await sendTodoCountersPerStudent(studentId, databaseId)));
  } catch (error) {
    logger.error('Error in sendTodoForAllStudents', error);
  };
}

export async function sendReviewsPerStudent(
  studentId: MySQLUintID, 
  todoDatabaseId: NotionUUID
) {
  try {
    const reviewInfo = await StudentSubfieldTraces.findByStudentId(studentId);
    const promises = reviewInfo.map(async row => {
      const traceId = ensureValue(row.traceId);
      const subfieldId = ensureValue(row.subfieldId);
      const reviewSpeed = ensureValue(row.reviewSpeed);
      const reviewSpace = ensureValue(row.reviewSpace);
      const reviewRemainingSpace = ensureValue(row.reviewRemainingSpace);
      if (reviewRemainingSpace === 0){
        const reviewProblems = await StudentProblems.findAllProblemsForReview(subfieldId, reviewSpeed);
        await Promise.all(reviewProblems.map(async reviewProblem => {
          try {
            await copyPageCreate(ensureValue(reviewProblem.notionPageId), todoDatabaseId);
          } catch (error) {
            logger.error('Error in copyPageCreate', error);
            throw error;
          }
        }));
        await StudentSubfieldTraces.update(traceId, { reviewRemainingSpace: reviewSpace });
      } else {
        await StudentSubfieldTraces.update(traceId,{ reviewRemainingSpace: toUint(reviewRemainingSpace-1) });
      }
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in sendReviewsPersStudent', error);
  }
}

export async function sendReviewsForAllStudents() {
  try {
    const studentInfo = await Students.findOnlyTopProblemDBIds();
    await Promise.all(studentInfo.map(async row => await sendReviewsPerStudent(row.studentId, ensureValue(row.todoDbId))));
  } catch (error) {
    logger.error('Error in sendReviewsForAllStudents', error);
    throw error;
  }
}
export async function dealWithTodosPerStudent(
  studentId: MySQLUintID
) {
  try {
    // 0. instantiation.
    const notionTopProblems = new NotionTopProblems();
    // 1. fetch all the items from the todos database
    const studentInfoAWS = ensureValue(await Students.findByStudentId(studentId));
    const todoData = await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.todoDbId));
    // 3. delete the done items
    await Promise.all(todoData.map(async (data) => {
      const studentProblem = ensureValue(await StudentProblems.findByNotionPageId(ensureValue(data.studentProblemPageId)))
      if (data.isDifficult) {
        await updateStudentProblemProperties(
          ensureValue(studentProblem.studentProblemId),
          ensureValue(data.studentProblemPageId),
          {
            difficultCount: toUint(ensureValue(studentProblem.difficultCount)+1),
          }
        );
        await copyPageCreate(ensureValue(data.studentProblemPageId), ensureValue(studentInfoAWS.isDifficultDbId));
      };
      if (isWrongAnswerStatus(ensureValue(data.answerStatus))) {
        await Promise.all([
          await updateStudentProblemProperties(
            ensureValue(studentProblem.studentProblemId),
            ensureValue(data.studentProblemPageId),
            {
              answerStatus: '未回答',
              tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
              wrongCount: toUint(ensureValue(studentProblem.wrongCount)+1),
            }
          ),
          await updateReviewLevel(
            ensureValue(studentProblem.studentProblemId), 
            ensureValue(data.studentProblemPageId),
            false,
            true
          ),
          await notionTopProblems.deleteAPage(ensureValue(data.topProblemPageId))
        ]);
        await copyPageCreate(ensureValue(data.studentProblemPageId), ensureValue(studentInfoAWS.wrongDbId));
      } else if (isCorrectAnswerStatus(ensureValue(data.answerStatus))) {
        await Promise.all([
          await updateStudentProblemProperties(
            ensureValue(studentProblem.studentProblemId),
            ensureValue(data.studentProblemPageId),
            {
              answerStatus: '未回答',
              tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
            }
          ),
          await updateReviewLevel(
            ensureValue(studentProblem.studentProblemId), 
            ensureValue(data.studentProblemPageId),
            true,
            true
          ),
          await notionTopProblems.deleteAPage(ensureValue(data.topProblemPageId))
        ])
      };
    }));
  } catch(error) {
    logger.error('Error in deleteWithTodosPerStudent', error);
  }
}

export async function dealWithTodosForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.studentId);
    await Promise.all(studentIds.map(async (studentId) => await dealWithTodosPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithTodosForAllStudents', error);
  }
}

export async function dealWithWrongsPerStudent(studentId: MySQLUintID) {
  try {
    const notionTopProblems = new NotionTopProblems();
    // 1. fetch all the items from the wrongs database
    const studentInfoAWS = ensureValue(await Students.findByStudentId(studentId));
    const wrongData = await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.wrongDbId));
    // 3. delete the done items
    await Promise.all(wrongData.map(async (data) => {
      const studentProblem = ensureValue(await StudentProblems.findByNotionPageId(ensureValue(data.studentProblemPageId)));
      if (isWrongAnswerStatus(ensureValue(data.answerStatus))) {
        await updateStudentProblemProperties(
          ensureValue(studentProblem.studentProblemId),
          ensureValue(data.studentProblemPageId),
          {
            answerStatus: '未回答',
            tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
            wrongCount: toUint(ensureValue(studentProblem.wrongCount)+1),
          }
        );
      } else if (isCorrectAnswerStatus(ensureValue(data.answerStatus))) {
        await Promise.all([
          await updateStudentProblemProperties(
            ensureValue(studentProblem.studentProblemId),
            ensureValue(data.studentProblemPageId),
            {
              answerStatus: '未回答',
              tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
            }
          ),
          await notionTopProblems.deleteAPage(ensureValue(data.topProblemPageId))
        ])
      } 
      if (data.isDifficult) {
        await updateStudentProblemProperties(
          ensureValue(studentProblem.studentProblemId),
          ensureValue(data.studentProblemPageId),
          {
            difficultCount: toUint(ensureValue(studentProblem.difficultCount)+1),
          }
        );
        await copyPageCreate(ensureValue(data.studentProblemPageId), ensureValue(studentInfoAWS.isDifficultDbId));
      }
    }));
  } catch(error) {
    logger.error('Error in deleteWithWrongsPerStudent', error);
  }
}

export async function dealWithWrongsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.studentId);
    await Promise.all(studentIds.map(async (studentId) => await dealWithWrongsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithWrongsForAllStudents', error);
  }
}

export async function dealWithIsDifficultsPerStudent(studentId: MySQLUintID) {
  try {
    const notionTopProblems = new NotionTopProblems();
    // 1. fetch all the items from the isDifficults database
    const studentInfoAWS = ensureValue(await Students.findByStudentId(studentId));
    const isDifficultData = await notionTopProblems.queryADatabase(ensureValue(studentInfoAWS.isDifficultDbId));
    // 3. delete the done items
    await Promise.all(isDifficultData.map(async (data) => {
      const studentProblem = ensureValue(await StudentProblems.findByNotionPageId(ensureValue(data.studentProblemPageId)))
      if (isWrongAnswerStatus(ensureValue(data.answerStatus))) {
        await updateStudentProblemProperties(
          ensureValue(studentProblem.studentProblemId),
          ensureValue(data.studentProblemPageId),
          {
            answerStatus: '未回答',
            tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
            wrongCount: toUint(ensureValue(studentProblem.wrongCount)+1),
          }
        );
        await copyPageCreate(ensureValue(data.studentProblemPageId), ensureValue(studentInfoAWS.wrongDbId));
      } else if (isCorrectAnswerStatus(ensureValue(data.answerStatus))) {
        await updateStudentProblemProperties(
          ensureValue(studentProblem.studentProblemId),
          ensureValue(data.studentProblemPageId),
          {
            answerStatus: '未回答',
            tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
          }
        );
      } 
      if (!data.isDifficult) {
        Promise.all([
          await updateStudentProblemProperties(
            ensureValue(studentProblem.studentProblemId),
            ensureValue(data.studentProblemPageId),
            {
              isDifficult: false
            }
          ),
          await notionTopProblems.deleteAPage(ensureValue(data.topProblemPageId))
        ])
      }
    }));
  } catch(error) {
    logger.error('Error in deleteWithIsDifficultsPerStudent', error);
  }
}

export async function dealWithIsDifficultsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.studentId);
    await Promise.all(studentIds.map(async (studentId) => await dealWithIsDifficultsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in deleteWithIsDifficultsForAllStudents', error);
  }
}

export async function dealWithStudentProblemsPerStudent(studentId: MySQLUintID) {
  try {
    const notionStudentProblems = new NotionStudentProblems();
    // 1. fetch all the items from the isDifficults database
    const studentInfoAWS = ensureValue(await Students.findByStudentId(studentId));
    const studentSubfieldInfo = await StudentSubfieldTraces.findByStudentId(studentId);
    const promises = studentSubfieldInfo.map(async (tmp) => {
      const databaseId = ensureValue(tmp.notionProblemsDbId);
      const studentProblems = await notionStudentProblems.queryADatabase(databaseId);
      await Promise.all(studentProblems.map(async (problem) => {
        const studentProblem = ensureValue(await StudentProblems.findByNotionPageId(ensureValue(problem.studentProblemPageId)))
        if (isWrongAnswerStatus(ensureValue(problem.answerStatus))) {
          await Promise.all([
            await updateStudentProblemProperties(
              ensureValue(studentProblem.studentProblemId),
              ensureValue(problem.studentProblemPageId),
              {
                answerStatus: '未回答',
                tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
                wrongCount: toUint(ensureValue(studentProblem.wrongCount)+1),
              }
            ),
            await updateReviewLevel(
              ensureValue(studentProblem.studentProblemId),
              ensureValue(problem.studentProblemPageId),
              false,
              false
            )
          ]);
          await copyPageCreate(ensureValue(problem.studentProblemPageId), ensureValue(studentInfoAWS.wrongDbId));
        } else if (isCorrectAnswerStatus(ensureValue(problem.answerStatus))) {
          await Promise.all([
            await updateStudentProblemProperties(
              ensureValue(studentProblem.studentProblemId),
              ensureValue(problem.studentProblemPageId),
              {
                answerStatus: '未回答',
                tryCount: toUint(ensureValue(studentProblem.tryCount)+1),
              }
            ), 
            await updateReviewLevel(
              ensureValue(studentProblem.studentProblemId),
              ensureValue(problem.studentProblemPageId),
              true,
              false
            )
          ]);
        };
        if (problem.isDifficult) {
          await updateStudentProblemProperties(
            ensureValue(studentProblem.studentProblemId),
            ensureValue(problem.studentProblemPageId),
            {
              isDifficult: true,
            }
          );
          await copyPageCreate(ensureValue(problem.studentProblemPageId), ensureValue(studentInfoAWS.isDifficultDbId));
        }
      }));
    });
    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in dealWithStudentProblemsPerStudent', error);
    throw error;
  }
};

export async function dealWithStudentProblemsForAllStudents() {
  try {
    // 1. fetch all the student IDs from database.
    const studentData = await Students.findOnlyTopProblemDBIds();
    const studentIds = studentData.map(student => student.studentId);
    await Promise.all(studentIds.map(async (studentId) => await dealWithStudentProblemsPerStudent(studentId)));
  } catch (error) {
    logger.error('Error in dealWithStudentProblemsForAllStudents', error);
    throw error;
  }
};

export async function sendReviewAlertPerStudent(studentId: MySQLUintID, todoDatabaseId: NotionUUID) {
  try {
    const notionTopProblems = new NotionTopProblems();
    const studentOverviewPageId = ensureValue(await Students.findOnlyOverviewPageIdByStudentId(studentId));
    const studentSubfieldInfo = await StudentSubfieldTraces.findOnlyReviewAlertByStudentId(studentId);
    const reviewProblemsInTodo = await notionTopProblems.queryADatabaseWithOnlyReviews(todoDatabaseId);
    const subfieldList = reviewProblemsInTodo
      .map( reviewProblemInTodo => reviewProblemInTodo.subfieldName);
    const alertSubfieldList: SubfieldsSubfieldNameEnum[] = [];
    await Promise.all(studentSubfieldInfo.map(async infoRow => {
      const subfieldName = ensureValue(infoRow.subfieldName);
      const reviewAlert = ensureValue(infoRow.reviewAlert);
      if (subfieldList.filter(element => element === subfieldName).length >= reviewAlert) {
        alertSubfieldList.push(subfieldName);
      }
    }));
    if (alertSubfieldList.length > 0) {
      const notionStudentOverviews = new NotionStudentOverviews();
      await notionStudentOverviews.updatePageProperties(
        studentOverviewPageId, 
        {
          alertSubfieldNames: alertSubfieldList,
        }
      );
    }
  } catch (error) {
    logger.error('Error in sendReviewAlertPerStudent', error);
    throw error;
  }
}
export async function sendReviewAlertForAllStudents() {
  try {
    const studentInfo = await Students.findOnlyTopProblemDBIds();
    await Promise.all(studentInfo.map(async infoRow => await sendReviewAlertPerStudent(infoRow.studentId, ensureValue(infoRow.todoDbId))));
  } catch (error) {
    logger.error('Error in sendReviewAlertForAllStudents', error);
    throw error;
  }
}

// TODO: guarantee consistency
export async function updateStudentProblemProperties(
  studentProblemId: MySQLUintID, 
  studentProblemPageId: NotionUUID,
  updates: StudentProblems & DomainStudentProblem) {
  try {    
    const notionStudentProblems = new NotionStudentProblems()
    // AWS
    const updateAWS = async () => await StudentProblems.update(studentProblemId, updates);
    // Notion
    const updateNotion = async () => await notionStudentProblems.updatePageProperties(studentProblemPageId, updates);
    await Promise.all([updateAWS(), updateNotion()]);
  } catch (error) {
    logger.error('Error in updateStudentProblemProperties', error);
  }
}

// TODO: change the review frequency based on subfield?
export async function updateReviewLevel(
  studentProblemId: MySQLUintID, 
  studentProblemPageId: NotionUUID, 
  isCorrect: boolean, 
  isTodo: boolean
): Promise<void> {
  try {
    const notionStudentProblems = new NotionStudentProblems();
    const studentProblem = await notionStudentProblems.retrieveAPage(studentProblemPageId);
    const level0 = '初学'; const level1 = 'レベル１'; const level2 = 'レベル２'; const level3 = 'レベル３'; const level4 = 'レベル４';
    const reviewCountLevel2 = toUint(30); const reviewCountLevel3 = toUint(60); const reviewCountLevel4 = toUint(120);
    if (isCorrect) {
      switch (studentProblem?.reviewLevel) {
        case level0:
          if (isTodo){
            await Promise.all([
              await notionStudentProblems.updatePageProperties(
                studentProblemPageId, 
                {
                  reviewLevel: level1,
                }
              ),
              await StudentProblems.update(
                studentProblemId, 
                {
                  reviewLevel: level1
                }
              )
            ])
            ;
          };
          break;
        case level1:
          if (isTodo) {
            await Promise.all([
              await notionStudentProblems.updatePageProperties(
                studentProblemPageId, 
                {
                  reviewLevel: level2,
                }
              ),
              await StudentProblems.update(
                studentProblemId,
                {
                  reviewLevel: level2,
                  reviewCountDown: reviewCountLevel2
                }
              )
            ])
          };
          break;
        case level2:
          await Promise.all([
            await notionStudentProblems.updatePageProperties(
              studentProblemPageId, 
              {
                reviewLevel: level3,
              }
            ),
            await StudentProblems.update(
              studentProblemId,
              {
                reviewLevel: level3,
                reviewCountDown: reviewCountLevel3
              }
            )
          ])
          break;
        case level3:
          await Promise.all([
            await notionStudentProblems.updatePageProperties(
              studentProblemPageId, 
              {
                reviewLevel: level4,
              }
            ),
            await StudentProblems.update(
              studentProblemId,
              {
                reviewLevel: level4,
                reviewCountDown: reviewCountLevel4
              }
            )
          ])
          break;
        case level4:
          await Promise.all([
            await StudentProblems.update(
              studentProblemId,
              {
                reviewCountDown: reviewCountLevel4
              }
            )
          ])
          break;
        default:
          throw new Error('Invalid review level. Review level should be one of'+ [level0, level1, level2, level3, level4].join(', '));
      }
    } else {
      switch (studentProblem?.reviewLevel) {
        case level0:
          if (isTodo) {
            await Promise.all([
              await notionStudentProblems.updatePageProperties(
                studentProblemPageId, 
                {
                  reviewLevel: level1,
                }
              ),
              await StudentProblems.update(studentProblemId,
                {
                  reviewLevel: level1,
                }
              )
            ])
          }
          break;
        case level1:
          if (isTodo) {
            await Promise.all([
              await notionStudentProblems.updatePageProperties(
                studentProblemPageId, 
                {
                  reviewLevel: level2,
                }
              ),
              await StudentProblems.update(studentProblemId,
                {
                  reviewLevel: level2,
                  reviewCountDown: reviewCountLevel2
                }
              )
            ])
          };
          break;
        case level2:
          await Promise.all([
            await notionStudentProblems.updatePageProperties(
              studentProblemPageId, 
              {
                reviewLevel: level2,
              }
            ),
            await StudentProblems.update(studentProblemId,
              {
                reviewLevel: level2,
                reviewCountDown: reviewCountLevel2
              }
            )
          ])
          break;
        case level3:
          await Promise.all([
            await notionStudentProblems.updatePageProperties(
              studentProblemPageId, 
              {
                reviewLevel: level3,
              }
            ),
            await StudentProblems.update(
              studentProblemId,
              {
                reviewLevel: level3,
                reviewCountDown: reviewCountLevel3
              }
            )
          ])
          break;
        case level4:
          await Promise.all([
            await notionStudentProblems.updatePageProperties(
              studentProblemPageId, 
              {
                reviewLevel: level3,
              }
            ),
            await StudentProblems.update(
              studentProblemId,
              {
                reviewLevel: level3,
                reviewCountDown: reviewCountLevel3
              }
            )
          ])
          break;
        default:
          throw new Error('Invalid review level. Review level should be one of'+[level0, level1, level2, level3, level4].join(', '));
      };
    }
  } catch (error) {
    logger.error('Error in updateReviewLevel', error);
    throw error;
  }
}