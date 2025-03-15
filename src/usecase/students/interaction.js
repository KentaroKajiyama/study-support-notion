import { StudentProblemsAWS } from '../../infrastructure/aws_database/StudentProblems.js'
import logger from "../../utils/logger.js";
import { Trackers } from '../../infrastructure/aws_database/Trackers.js';
import { ActualBlocks } from '../../infrastructure/aws_database/ActualBlocks.js';
import { StudentSubfieldTraces } from '../../infrastructure/aws_database/StudentSubfieldTraces.js';
import { calculateNextTrackerAndTodoRemainingCounter } from "../../domain/caluculation/scheduleForStudents.js";

export async function updateTrackerAndTodoRemainingCounter(studentId, studentProblemAWSId) {
  try {
    const studentProblem = await StudentProblemsAWS.findWithSubfieldIdByStudentProblemId(studentProblemAWSId);
    const currentTracker = await Trackers.findByStudentProblemId(studentProblemAWSId);
    if (currentTracker.isEnabled) {
      const currentProbInBlockOrder = studentProblem.problemInBlockOrder;
      const currentLap = currentTracker.currentLap;
      const currentActualBlock = await ActualBlocks.findByActualBlockId(studentProblem.actualBlockId);
      const currentActualBlockSize = currentActualBlock.actualBlockSize;
      const currentActualBlockMaxLap = currentActualBlock.lap;
      const todoRemainingCounter = await StudentSubfieldTraces.findOnlyTodoRemainingCounterByCompositeKey(studentId, studentProblem.subfieldId)[0].todoRemainingCounter;
      if (todoRemainingCounter > 0) {
        const nextTodoRemainingCounter = todoRemainingCounter - 1;
        if (currentProbInBlockOrder < currentActualBlockSize) {
          const nextProbInBlockOrder = currentProbInBlockOrder + 1;
          const nextTodoProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, currentActualBlock.actualBlockId, nextProbInBlockOrder);
          const nextStudentProbAWSId = nextTodoProblem.studentProblemId;
          const trackerUpdates = {
            studentProblemId: nextStudentProbAWSId,
          };
          await Promise.all([
            await Trackers.update(currentTracker.trackerId, trackerUpdates),
            await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
              todoRemainingCounter: nextTodoRemainingCounter,
            })
          ]);
        } else if (currentProbInBlockOrder === currentActualBlockSize) {
          const nextProbInBlockOrder = 1;
          if (currentLap < currentActualBlockMaxLap) {
            const nextTodoProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, currentActualBlock.actualBlockId, nextProbInBlockOrder);
            const nextStudentProbAWSId = nextTodoProblem.studentProblemId;
            const trackerUpdates = {
              studentProblemId: nextStudentProbAWSId,
              currentLap: currentLap + 1,
            };
            await Promise.all([
              await Trackers.update(currentTracker.trackerId, trackerUpdates),
              await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
                todoRemainingCounter: nextTodoRemainingCounter,
              })
            ]);
          } else if (currentLap === currentActualBlockMaxLap) {
            const nextActualBlock = await ActualBlocks.findByBlockOrderAndStudentInfo(studentId, currentActualBlock.subfieldId, currentActualBlock.blockOrder);
            const nextActualBlockId = nextActualBlock.actualBlockId;
            const nextStudentProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, nextActualBlockId, 1);
            const nextStudentProbAWSId = nextStudentProblem.studentProblemId;
            const trackerUpdates = {
              actualBlockId: nextActualBlockId,
              studentProblemId: nextStudentProbAWSId,
              currentLap: 0,
            };
            await Promise.all([
              await Trackers.update(currentTracker.trackerId, trackerUpdates),
              await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
                todoRemainingCounter: nextTodoRemainingCounter,
              })
            ]);
          } else {
            throw new Error('Current Lap is too Big! currentLap must be <= currentActualBlockMaxLap in distNextTodo function.');
          }
        } else {
          throw new Error('Current ProbInBlockOrder is too Big! currentProbInBlockOrder must be <= currentActualBlockSize in distNextTodo function.');
        }
      } else if (todoRemainingCounter === 0) {
        const result = await calculateNextTrackerAndTodoRemainingCounter(studentId, studentProblem.subfieldId, currentActualBlock.actualBlockId, currentTracker);
        const trackerUpdates = result.tracker;
        const nextTodoRemainingCounter = result.todoRemainingCounter;
        await Promise.all([
          await Trackers.update(currentTracker.trackerId, trackerUpdates),
          await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
            todoRemainingCounter: nextTodoRemainingCounter,
          })
        ]);
      }
      const nextTodoProblemId = trackerUpdates.studentProblemId ? trackerUpdates.studentProblemId : null;
      return nextTodoProblemId;
    } 
  } catch (error) {
    logger.error('Error in distNextTodo', error.message);
    throw error;
  }
}