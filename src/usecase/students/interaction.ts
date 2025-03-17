import { 
  calculateNextTrackerAndTodoRemainingCounter 
} from "@usecase/caluculation/scheduleForStudents.js";
import {
  ensureValue,
  logger,
} from '@utils/index.js'
import { 
  MySQLUintID, 
  toUint
} from '@domain/types/index.js';
import {
  StudentProblems,
  Trackers,
  Tracker,
  ActualBlocks,
  StudentSubfieldTraces
} from '@infrastructure/aws_tables/index.js'

export async function updateTrackerAndTodoRemainingCounter(
  studentId: MySQLUintID,
  studentProblemId: MySQLUintID
) : Promise<MySQLUintID | null>{
  try {
    const studentProblem = ensureValue(await StudentProblems.findWithSubfieldIdByStudentProblemId(studentProblemId));
    const currentTracker = ensureValue(await Trackers.findByStudentProblemId(studentProblemId));
    const subfieldId = ensureValue(studentProblem.subfieldId);
    const currentTrackerId = ensureValue(currentTracker.trackerId);
    let trackerUpdates : Tracker = {};
    if (currentTracker.isEnabled) {
      const currentProbInBlockOrder = ensureValue(studentProblem.problemInBlockOrder);
      const currentLap = ensureValue(currentTracker.currentLap);
      const currentActualBlock = ensureValue(await ActualBlocks.findByActualBlockId(ensureValue(studentProblem.actualBlockId)));
      const currentActualBlockId = ensureValue(currentActualBlock.actualBlockId);
      const currentActualBlockSize = ensureValue(currentActualBlock.actualBlockSize);
      const currentActualBlockMaxLap = ensureValue(currentActualBlock.lap);
      const todoRemainingCounter = ensureValue(
                                    ensureValue(
                                      await StudentSubfieldTraces.findByCompositeKey(
                                        studentId, ensureValue(studentProblem.subfieldId)
                                      )
                                    ).todoRemainingCounter
                                  );
      if (todoRemainingCounter > 0) {
        const nextTodoRemainingCounter = toUint(todoRemainingCounter - 1);
        if (currentProbInBlockOrder < currentActualBlockSize) {
          const nextProbInBlockOrder = toUint(currentProbInBlockOrder + 1);
          const nextTodoProblem = ensureValue(
            await StudentProblems.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextProbInBlockOrder)
          );
          const nextStudentProbId = ensureValue(nextTodoProblem.studentProblemId);
          trackerUpdates = {
            studentProblemId: nextStudentProbId,
          };
          await Promise.all([
            await Trackers.update(currentTrackerId, trackerUpdates),
            await StudentSubfieldTraces.updateByCompositeKey(studentId, subfieldId, {
              todoRemainingCounter: nextTodoRemainingCounter,
            })
          ]);
        } else if (currentProbInBlockOrder === currentActualBlockSize) {
          const nextProbInBlockOrder = toUint(1);
          if (currentLap < currentActualBlockMaxLap) {
            const nextTodoProblem = ensureValue(
              await StudentProblems.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextProbInBlockOrder)
            );
            const nextStudentProbId = ensureValue(nextTodoProblem.studentProblemId);
            trackerUpdates = {
              studentProblemId: nextStudentProbId,
              currentLap: toUint(currentLap + 1),
            };
            await Promise.all([
              await Trackers.update(currentTrackerId, trackerUpdates),
              await StudentSubfieldTraces.updateByCompositeKey(studentId, subfieldId, {
                todoRemainingCounter: nextTodoRemainingCounter,
              })
            ]);
          } else if (currentLap === currentActualBlockMaxLap) {
            const nextActualBlock = ensureValue(
              await ActualBlocks.findByStudentSubfieldIdAndBlockOrder(studentId, ensureValue(currentActualBlock.subfieldId), ensureValue(currentActualBlock.blockOrder))
            );
            const nextActualBlockId = ensureValue(nextActualBlock.actualBlockId);
            const nextStudentProblem = ensureValue(
              await StudentProblems.findByBlockInfoAndStudentInfo(studentId, nextActualBlockId, toUint(1))
            );
            const nextStudentProbId = nextStudentProblem.studentProblemId;
            trackerUpdates = {
              actualBlockId: nextActualBlockId,
              studentProblemId: nextStudentProbId,
              currentLap: toUint(0),
            };
            await Promise.all([
              await Trackers.update(currentTrackerId, trackerUpdates),
              await StudentSubfieldTraces.updateByCompositeKey(studentId, subfieldId, {
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
        const result = await calculateNextTrackerAndTodoRemainingCounter(studentId, subfieldId, currentActualBlockId, currentTracker);
        trackerUpdates = result.tracker;
        const nextTodoRemainingCounter = result.todoRemainingCounter;
        await Promise.all([
          await Trackers.update(currentTrackerId, trackerUpdates),
          await StudentSubfieldTraces.updateByCompositeKey(studentId, subfieldId, {
            todoRemainingCounter: nextTodoRemainingCounter,
          })
        ]);
      }
      const nextTodoProblemId = ensureValue(trackerUpdates.studentProblemId)
      return nextTodoProblemId;
    } else {
      logger.warn(`Current Tracker is disabled for ${studentId}.`);
      return null;
    }
  } catch (error) {
    logger.error('Error in updateTrackerAndTodoRemainingCounter', error);
    throw error;
  }
}