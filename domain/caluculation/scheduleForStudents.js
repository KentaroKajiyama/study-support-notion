import { isWithinInterval } from "date-fns";
import { coachPlanProperties, coachIrregularProperties } from "../const/notionDatabaseProperties";
import { propertyFromNotion, propertyToNotion } from '../utils/propertyHandler';
import { extractIdFromMention } from "../utils/extractId";
import { ActualBlocks } from "../infrastructure/aws_database/ActualBlocks";
import NotionAPI from "../infrastructure/notionAPI";
import { Properties } from "../const/notionTemplate";
import { StudentProblemsAWS } from '../infrastructure/aws_database/StudentProblems';
import logger from "../utils/logger";
import { myAddDays, mySubDays, isDate1EarlierThanOrSameWithDate2, isDateBetween, date2MinusDate1 } from '../utils/dateHandler.js';
import { convertToSnakeCase } from '../utils/lodash.js';
import { CoachPlan } from "../infrastructure/notion_database/coach/CoachPlan.js";
import { StudentOnlyPlan } from "../infrastructure/notion_database/student_only/StudentOnlyPlan.js";
import { StudentSubfieldTraces } from "../../infrastructure/aws_database/StudentSubfieldTraces.js";

export function isHoliday(checkedDateObj, holidayArray, subfield) {
  const subfieldHolidays = holidayArray.filter((hol) => hol.subfield === subfield);
  for (const row of subfieldHolidays) {
    const startDateObj = row.startDate
    const endDateObj = row.endDate
    if (startDateObj && endDateObj && isWithinInterval(checkedDateObj, { start: startDateObj, end: endDateObj })) {
      return true;
    }
  }
  return false;
};
// TODO: Parallelize this
// TODO: Preprocess for irregular blocks
export async function applyIrregularChanges(studentId, subfieldInfoList, planBlockArray, irregularArray) {
  try {
    const plannedBlocks = planBlockArray.map(async blockProperties => {
      // TODO: This is vulnerable...
      const actualBlockPageId = extractIdFromMention(propertyFromNotion(blockProperties, coachPlanProperties.blockName.name, coachPlanProperties.blockName.type));
      const actualBlockAWSId = await ActualBlocks.findByNotionPageId(blockProperties.actualBlockPageId)[0].actual_block_id;
      const blockOrder = propertyFromNotion(blockProperties, coachPlanProperties.blockOrder.name, coachPlanProperties.blockOrder.type);
      if (!blockOrder){
        throw new Error(`Block ${propertyFromNotion(blockProperties, coachPlanProperties.blockName.name, coachPlanProperties.blockName.type)}'s order must not be empty`);
      }
      return {
        actualBlockPageId: actualBlockPageId,
        actualBlockAWSId: actualBlockAWSId,
        inputStartDate: propertyFromNotion(blockProperties, coachPlanProperties.startDate.name, coachPlanProperties.startDate.type).start,
        inputEndDate: propertyFromNotion(blockProperties, coachPlanProperties.endDate.name, coachPlanProperties.endDate.type).start,
        isIrregular: propertyFromNotion(blockProperties, coachPlanProperties.isIrregular.name, coachPlanProperties.isIrregular.type),
        speed: propertyFromNotion(blockProperties, coachPlanProperties.speed.name, coachPlanProperties.speed.type) || 4,
        space: propertyFromNotion(blockProperties, coachPlanProperties.space.name, coachPlanProperties.space.type) || 0,
        lap: propertyFromNotion(blockProperties, coachPlanProperties.lap.name, coachPlanProperties.lap.type) || 0,
        subfieldName: propertyFromNotion(blockProperties, coachPlanProperties.subfield.name, coachPlanProperties.subfield.type),
        blockOrder: blockOrder,
        planDBPageId: propertyFromNotion(blockProperties, coachPlanProperties.planDBPageId.name, coachPlanProperties.planDBPageId.type),
        outputPeriod: propertyFromNotion(blockProperties, coachPlanProperties.outputPeriod.name, coachPlanProperties.outputPeriod.type),
      }
    });
    const irregularProblems = irregularArray.map(blockProperties => {
      const insertOrder = propertyFromNotion(blockProperties, coachIrregularProperties.insertNumber.name, coachIrregularProperties.insertNumber.type);
      const irregularProbOrder = propertyFromNotion(blockProperties, coachIrregularProperties.irregularProbOrder.name, coachIrregularProperties.irregularProbOrder.type);
      if (!insertOrder) {
        throw new Error(`Irregular problem ${propertyFromNotion(blockProperties, coachIrregularProperties.problemName.name, coachIrregularProperties.problemName.type)}'s insert order must not be empty`);
      };
      if (!irregularProbOrder) {
        throw new Error(`Irregular problem ${propertyFromNotion(blockProperties, coachIrregularProperties.problemName.name, coachIrregularProperties.problemName.type)}'s irregular problem order must not be empty`);
      };
      return {
        studentProblemPageId: extractIdFromMention(propertyFromNotion(blockProperties, coachIrregularProperties.problemName.name, coachIrregularProperties.problemName.type)),
        isModified: propertyFromNotion(blockProperties, coachIrregularProperties.isModified.name, coachIrregularProperties.type),
        insertOrder: insertOrder,
        subfieldName: propertyFromNotion(blockProperties, coachIrregularProperties.subfield.name, coachIrregularProperties.subfield.type),
        irregularProbOrder: insertOrder,
        formerBlockName: propertyFromNotion(blockProperties, coachIrregularProperties.formerBlock.name, coachIrregularProperties.formerBlock.type),
        formerBlockPageId: extractIdFromMention(propertyFromNotion(blockProperties, coachIrregularProperties.formerBlock.name, coachIrregularProperties.formerBlock.type)),
        insertBlockName: propertyFromNotion(blockProperties, coachIrregularProperties.insertBlock.name, coachIrregularProperties.insertBlock.type),
        insertBlockPageId: extractIdFromMention(propertyFromNotion(blockProperties, coachIrregularProperties.insertBlock.name, coachIrregularProperties.insertBlock.type)),
        irregularPageId: propertyFromNotion(blockProperties, coachIrregularProperties.irregularPageId.name, coachIrregularProperties.irregularPageId.type)
      }
    });
    const studentProblems = await StudentProblemsAWS.findByStudentId(studentId);
    const result = {
      assignedBlocks: [],
      assignedProblems: [],
    }
    const promises = subfieldInfoList.map(async subfieldInfo => {
      const specificStudentProblems = studentProblems.filter(problem => problem.subfield_id === subfieldInfo.subfieldId);
      const specificPlannedBlocks = plannedBlocks(blockInfo => blockInfo.subfieldName === subfieldInfo.subfieldName);
      const specificIrregularBlocks = (async (irregularProblems) => {
        const result = [];
        let originalIrregularProblems = irregularProblems
                                                  .filter(irregularInfo => irregularInfo.subfieldName === subfieldInfo.subfieldName)
                                                  .sort((a,b) => {
                                                    if(a.formerBlockPageId > b.formerBlockPageId) return 1;
                                                    else if (a.formerBlockPageId < b.formerBlockPageId) return -1;
                                                    return a.irregularProbOrder - b.irregularProbOrder;
                                                  });
        let isModifiedFlag = false; let laterFlagChange = false;
        let insertOrder;
        let insertBlockName; let insertBlockAWSId; let formerBlockAWSId; let formerBlockPageId;
        originalIrregularProblems = originalIrregularProblems.map(async (irregularInfo) => {
          // Check if the problem is in modification range.
          if(irregularInfo.isModified && !isModifiedFlag) {
            isModifiedFlag = true;
          } else if (irregularInfo.isModified) {
            laterFlagChange = true;
          };
          // Initialize formerBlockPageId
          if(!formerBlockPageId) { 
            formerBlockPageId = irregularInfo.formerBlockPageId
            formerBlockAWSId = await ActualBlocks.findActualBlockIdByNotionPageId(irregularInfo.formerBlockPageId)[0];
          };
          if(isModifiedFlag){
            delete irregularInfo.isModified;
            // fill empty insert orders
            // fill empty insert block relations and aws ids
            if (irregularInfo.insertOrder && irregularInfo.insertBlockPageId) {
              insertOrder = irregularInfo.insertOrder;
              insertBlockAWSId = await ActualBlocks.findActualBlockIdByNotionPageId(irregularInfo.insertBlockPageId)[0];
              irregularInfo.insertBlockAWSId = insertBlockAWSId;
              insertBlockName = irregularInfo.insertBlockName;
            } else if (!irregularInfo.insertOrder && irregularInfo.insertBlockPageId) {
              if (!insertOrder) throw new Error("Insert order is undefined");
              irregularInfo.insertOrder = insertOrder;
            } else if (!irregularInfo.insertOrder && !irregularInfo.insertBlockPageId) {
              if (!insertOrder) throw new Error("Insert order is undefined");
              irregularInfo.insertOrder = insertOrder;
              if (!insertBlockAWSId) throw new Error("Insert Block AWS Id is undefined");
              irregularInfo.insertBlockAWSId = insertBlockAWSId;
              if (!insertBlockName) throw new Error("Insert Block Name is undefined");
              await NotionAPI.updatePageProperties(irregularInfo.irregularPageId, Properties.getJSON([
                propertyToNotion(
                  {
                    propertyName: coachIrregularProperties.insertBlock.name,
                    propertyContent: insertBlockName,
                    propertyType: coachIrregularProperties.insertBlock.type
                  }
                )
              ]));
            } else {
              throw new Error("You must specify an Insert BLock if you specify an Insert Order");
            };
            // Add former block AWS ID
            if (irregularInfo.formerBlockPageId !== formerBlockPageId) {
              formerBlockPageId = irregularInfo.formerBlockPageId
              formerBlockAWSId = await ActualBlocks.findActualBlockIdByNotionPageId(irregularInfo.formerBlockPageId)[0];
              irregularInfo.formerBlockAWSId = formerBlockAWSId;
            } else {
              irregularInfo.formerBlockAWSId = formerBlockAWSId;
            };
            if (laterFlagChange) {
              isModifiedFlag = false;
              laterFlagChange = false;
            };
            return irregularInfo;
          } else {
            return null;
          } 
        }).filter(e => e !== null);
        while (originalIrregularProblems.length > 0) {
          // TODO: Clarify the difference between order in total and one in a specific block
          const specificIrregularInsertBlockAWSId = originalIrregularProblems[0].insertBlockAWSId;
          const specificIrregularBlockInsertOrder = originalIrregularProblems[0].insertOrder;
          const specificIrregularFormerBLockAWSId = originalIrregularProblems[0].formerBlockAWSId;
          const specificIrregularBlock = originalIrregularProblems
                                                  .filter(irregularInfo => 
                                                    irregularInfo.insertBlockAWSId === specificIrregularInsertBlockAWSId 
                                                    && irregularInfo.insertOrder === specificIrregularBlockInsertOrder
                                                    && irregularInfo.formerBlockAWSId === specificIrregularFormerBLockAWSId
                                                  );
          const insertedProbAWSId = StudentProblemsAWS.findByCompositeKeyInBlockOrder(studentId, subfieldInfo.subfieldId, specificIrregularBlockInsertOrder)
          result.push({
            idOrderArray: 
              specificIrregularBlock.map(async irregularInfo => {
              const idAWS = await StudentProblemsAWS.findByNotionPageId(irregularInfo.studentProblemPageId)[0].student_problem_id;
              return {
                idAWS: idAWS,
                irregularProbOrder: irregularInfo.irregularProbOrder
              }
              }).sort((a,b) => a.irregularProbOrder - b.irregularProbOrder),
            insertedProbAWSId: 
              insertedProbAWSId,
            newBlockAWSId: 
              specificIrregularInsertBlockAWSId,
            formerBlockAWSId:
              specificIrregularFormerBLockAWSId
          });
          originalIrregularProblems = originalIrregularProblems
                                                .filter(irregularInfo => 
                                                  irregularInfo.insertBlockAWSId !== specificIrregularInsertBlockAWSId
                                                  | irregularInfo.insertOrder !== specificIrregularBlockInsertOrder
                                                  | irregularInfo.formerBlockAWSId !== specificIrregularFormerBLockAWSId
                                                );
        };
        return result;
      })(irregularProblems);
      const formerProblems = specificPlannedBlocks.map(async blockInfo => {
        const specificBlockProblems = specificStudentProblems.filter(problem => problem.actual_block_id);
        const idOrderArray = specificBlockProblems.map(problem => {
          return {
            idAWS: problem.student_problem_id,
            inBlockOrder: problem.problem_in_block_order
          }
        });
        return {
          idOrderArray: idOrderArray.sort((a,b) => a.inBlockOrder - b.inBlockOrder),
          blockAWSId: blockInfo.actualBlockAWSId
        }
      });
      const addNewProblems = formerProblems.map(blockInfo => {
        const specificBlock = blockInfo.idOrderArray;
        const insertIrregularBlocks = specificIrregularBlocks.filter(block => block.newBlockAWSId === blockInfo.blockAWSId);
        const newBlock = (() => {
          for (const irregularBlock of insertIrregularBlocks) {
            const irregularBlockLength = irregularBlock.idOrderArray.length;
            const insertOrder = blockInfo.idOrderArray.filter(problem.idAWS === irregularBlock.insertedProbAWSId)[0].inBlockOrder;
            specificBlock.idOrderArray.forEach(idOrder => {
              if (idOrder.inBlockOrder > insertOrder) {
                idOrder.inBlockOrder += irregularBlockLength+1; 
              };
            });
            for (let i=1; i <= irregularBlockLength; i++) {
              specificBlock.push({
                idAWS: irregularBlock.idOrderArray[i-1],
                inBlockOrder: insertOrder + i
              })
            };
          };
          return specificBlock;
        })();
        return {
          idOrderArray: newBlock.sort((a,b) => a.inBlockOrder - b.inBlockOrder),
          blockAWSId: blockInfo.blockAWSId
        }
      });
      const removedOldProblems = addNewProblems.map(blockInfo => {
        const specificBlock = blockInfo.idOrderArray;
        const removeIrregularBlocks = specificIrregularBlocks.filter(block => block.formerBlockAWSId === blockInfo.blockAWSId);
        const idsToRemove = removeIrregularBlocks.map(removeBlockInfo => removeBlockInfo.idOrderArray.map(idOrder => idOrder.idAWS)).flat();
        const removedIdOrderArray = specificBlock.idOrderArray.filter(idOrder => !idsToRemove.includes(idOrder.idAWS));
        return {
          idOrderArray: removedIdOrderArray.sort((a,b) => a.inBlockOrder - b.inBlockOrder),
          blockAWSId: blockInfo.blockAWSId,
          blockOrder: plannedBlockIdAndOrderDict[blockInfo.blockAWSId]
        }
      });
      const { assignedProblems, assignedBlocks } = (() => {
        removedOldProblems.sort((a,b) => a.blockOrder - b.blockOrder);
        const numOfBlocks = removedOldProblems.length;
        const assignedProblems = [];
        const assignedBlocks = [];
        let index = 1;
        for (let k = 0; k < numOfBlocks; k++) {
          const block = removedOldProblems[k];
          const plannedBlockInfo = specificPlannedBlocks.filter(blockInfo => blockInfo.actualBlockAWSId === block.blockAWSId);
          for (let i = 1; i <= block.idOrderArray.length; i++) {
            block.idOrderArray[i-1].inBlockOrder = i;
            assignedProblems.push({
              idAWS: block.idOrderArray[i-1].idAWS,
              inBlockOrder: i,
              problemOverallOrder: index,
              blockAWSId: block.blockAWSId,
              blockOrder: plannedBlockInfo.blockOrder
            });
            index++;
          };
          assignedBlocks.push({
            idOrderArray: block.idOrderArray.sort((a,b) => a.inBlockOrder - b.inBlockOrder),
            actualBlockPageId: block.actualBlockPageId,
            actualBlockAWSId: block.blockAWSId,
            inputStartDate: plannedBlockInfo.inputStartDate,
            inputEndDate: plannedBlockInfo.inputEndDate,
            isIrregular: plannedBlockInfo.isIrregular,
            speed: plannedBlockInfo.speed,
            space: plannedBlockInfo.space,
            lap: plannedBlockInfo.lap,
            subfieldName: plannedBlockInfo.subfieldName,
            blockOrder: plannedBlockInfo.blockOrder,
            planDBPageId: plannedBlockInfo.planDBPageId,
            outputPeriod: plannedBlockInfo.outputPeriod,
            isTail: k === numOfBlocks ? 1 : 0,
          });
        }
        return { 
          assignedProblems: assignedProblems, 
          assignedBlocks: assignedBlocks,
        };
      });
      result.assignedBlocks.push({
        blocks: assignedBlocks,
        subfieldId: subfieldInfo.subfieldId,
        subfieldName: subfieldInfo.subfieldName,
      });
      result.assignedProblems.push({
        problems: assignedProblems,
        subfieldId: subfieldInfo.subfieldId,
        subfieldName: subfieldInfo.subfieldName,
      })
    });
    await Promise.all(promises);
    return result;
  } catch (error) {
    logger.error("Something went wrong during processing of the problem order", error);
    throw error;
  }
};
// TODO: If we had bad rest array???
// restArray {startDate, endDate, subfieldName}
export async function scheduleProblems(assignedBlocks, restArray) {
  const result = [];
  // TODO: Parallelize this.
  for (const specificAssignedBlocksData of assignedBlocks) {
    const specificAssignedBlocks = specificAssignedBlocksData.blocks;
    let specificRestArray = restArray
                              .filter(row => row.subfieldName === specificAssignedBlocks.subfieldName || row.subfieldName === 'ALL')
                              .sort((a,b) => isDate1EarlierThanOrSameWithDate2(a.startDate, b.startDate));
    specificAssignedBlocks.sort((a,b) => a.blockOrder - b.blockOrder);
    // Note that this 'orderCursor' variable is zero indexed!
    let orderCursor = 0;
    // These are all zero indexed.
    let startOrder; let endOrder; let remainder = 0; let startDate; let endDate; 
    let restList = []; let restLength = 0; let remainderRecorder;
    while (orderCursor < assignedBlocks.length) {
      while (!startOrder) {
        startOrder = orderCursor ? specificAssignedBlocks[orderCursor].inputStartDate : null;
        if (startOrder) {
          while (!endOrder) {
            if (specificAssignedBlocks[orderCursor].inputEndDate) {
              endOrder = orderCursor;
              startOrder = orderCursor+1; // Add process of exception for orderCursor + 1 == assignedBlock.length?
            } else if (specificAssignedBlocks[orderCursor+1].inputStartDate) {
              endOrder = orderCursor;
              specificAssignedBlocks[orderCursor].endDate = mySubDays(specificAssignedBlocks[orderCursor+1].inputStartDate, 1);
            }
          }
        };
        orderCursor++;
        if (orderCursor > assignedBlocks.length) {
          throw new Error('Must input at least one start date.')
        }
      };
      startDate = specificAssignedBlocks[startOrder].inputStartDate;
      endDate = specificAssignedBlocks[endOrder].inputEndDate;
      if (!isDate1EarlierThanOrSameWithDate2(startDate, endDate)) throw new Error('startDate must be earlier than or same with endDate');
      // Create size ascending speed list
      const speedManagementList = Array.from(specificAssignedBlocks.slice(startOrder, endOrder+1)).sort((a,b) => a.idOrderArray.length < b.idOrderArray.length);
      // Create rest List
      for (let i = 0; i < specificRestArray.length; i++) {
        if (isDate1EarlierThanOrSameWithDate2(myAddDays(endDateCandidate,1), specificRestArray[i].startDate)) {
          specificRestArray.filter(restElement => isDate1EarlierThanOrSameWithDate2(endDateCandidate, restElement.startDate));
          specificRestArray.sort((a,b) => isDate1EarlierThanOrSameWithDate2(a.startDate, b.endDate));
          break;
        }
        if (isDateBetween(endDateCandidate, specificRestArray[i].startDate, specificRestArray[i].endDate) 
          && isDate1EarlierThanOrSameWithDate2(myAddDays(endDateCandidate,1), specificRestArray[i].endDate)){
          restList.push({
            startDate: specificRestArray[i].startDate,
            endDate: endDateCandidate
          });
          restLength += date2MinusDate1(specificRestArray[i].startDate, endDateCandidate)+1;
          specificRestArray[i].startDate = myAddDays(endDateCandidate, 1);
          specificRestArray.filter(restElement => isDate1EarlierThanOrSameWithDate2(endDateCandidate, restElement.startDate));
          specificRestArray.sort((a,b) => isDate1EarlierThanOrSameWithDate2(a.startDate, b.endDate));
          break;
        } else {
          restList.push({
            startDate: specificRestArray[i].startDate,
            endDate: specificRestArray[i].endDate
          })
          restLength += date2MinusDate1(specificRestArray[i].startDate, specificRestArray[i].endDate)+1;
        }
      }
      // Adjust speed
      const actualDayCapacity = date2MinusDate1(startDate, endDate) + 1 - restLength;
      let actualDayLength; let speedManagementCursor = 0;
      let result = actualDayLengthCalculator(specificAssignedBlocks, startOrder, endOrder, remainder);
      actualDayLength = result.actualDayLength; remainderRecorder = result.remainderRecorder; 
      remainder = remainderRecorder[endOrder];
      while (actualDayLength > actualDayCapacity) {
        const speedUpBlockAWSId = speedManagementList[speedManagementCursor].idAWS;
        const speedUpBlockIndex = specificAssignedBlocks.findIndex(block => block.idAWS === speedUpBlockAWSId);
        specificAssignedBlocks[speedUpBlockIndex].speed++;
        speedManagementCursor = speedManagementCursor + 1 ? speedManagementCursor + 1 < speedManagementList.length : 0;
        result = actualDayLengthCalculator(specificAssignedBlocks, startOrder, endOrder, remainder);
        actualDayLength = result.actualDayLength; remainderRecorder = result.remainderRecorder; remainder = remainderRecorder[endOrder];
      };
      // Assign Output Date
      assignOutputDaysToBlocks(specificAssignedBlocks, startOrder, endOrder, remainderRecorder, restList);
      // Initialize global variables.
      startOrder = null; endOrder = null; restList = []; restLength = 0;
    }
    result.push({
      subfieldName: specificAssignedBlocks[0].subfieldName,
      blocks: specificAssignedBlocks
    });
  }
  return result;
}

function actualDayLengthCalculator(actualBlocks, startOrder, endOrder, remainder) {
  try { 
    let actualDayLength = 0; let remainderRecorder = []
    for (let i = startOrder; i <= endOrder; i++) {
      const blockLength = actualBlocks[i].idOrderArray.length;
      const speed = actualBlocks[i].speed;
      const space = actualBlocks[i].space;
      const lap = actualBlocks[i].lap;
      if (remainder === 0) {
        actualDayLength += Math.floor(((blockLength + (blockLength - 1) * space) * lap) / speed);
        remainder = ((blockLength + (blockLength - 1) * space) * lap) % speed;
        push.remainderRecorder(remainder);
      } else {
        const residual = Math.min(speed, actualBlocks[i-1].speed - remainder);
        actualDayLength += Math.floor(((blockLength + (blockLength - 1) * space) * lap - residual) / speed) + 1;
        remainder = ((blockLength + (blockLength - 1) * space) * lap - residual) % speed;
        push.remainderRecorder(remainder);
      }
    }
    return {
      actualDayLength: actualDayLength,
      remainderRecorder: remainderRecorder,
    }
  } catch(error) {
    logger.error("Something went wrong during actual day length calculation", error);
    throw error;
  }
}

function assignOutputDaysToBlocks(actualBlocks, startOrder, endOrder, remainderRecorder, restList) {
  try {
    let restCursor = 0;
    for (let i = startOrder; i <= endOrder; i++) {
      const blockLength = actualBlocks[i].idOrderArray.length;
      const speed = actualBlocks[i].speed;
      const space = actualBlocks[i].space;
      const lap = actualBlocks[i].lap;
      let periodLength = 0; let endDateCandidate;
      if (i===0 || remainderRecorder[i-1] === 0) {
        periodLength = Math.floor(((blockLength + (blockLength - 1) * space) * lap) / speed);
      } else {
        const residual = Math.min(speed, actualBlocks[i-1].speed - remainderRecorder[i-1]);
        periodLength = Math.floor(((blockLength + (blockLength - 1) * space) * lap - residual) / speed) + 1;
      };
      endDateCandidate = myAddDays(actualBlocks[i].inputStartDate, periodLength-1);
      while (restList[restCursor].startDate <= endDateCandidate && restCursor < restList.length) {
        const restLength = date2MinusDate1(restList[restCursor].startDate, restList[restCursor].endDate) - 1;
        endDateCandidate = myAddDays(endDateCandidate, restLength);
        restCursor++;
      };
      actualBlocks[i].outputDate = {
        start: actualBlocks[i].inputStartDate,
        end: endDateCandidate,
      };
      // Set next block's input start date.
      if (i < actualBlocks.length - 1 && remainderRecorder[i] > 0 && actualBlocks[i+1].inputStartDate) {
        actualBlocks[i+1].inputStartDate = endDateCandidate;
      } else if (i < actualBlocks.length - 1 && remainderRecorder[i] === 0 && actualBlocks[i+1].inputStartDate) {
        actualBlocks[i+1].inputStartDate = myAddDays(endDateCandidate, 1);
      };
    }
  } catch (error) {
    logger.error("Something went wrong during output date assignment", error);
    throw error;
  }
}

// TODO: #2 Updating delay
export async function delaySchedule(studentId, actualBlockId, subfieldId) {
  try {
    const actualBlocks = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    actualBlocks.sort((a,b) => a.block_order - b.block_order);
    const currentBlockIndex = actualBlocks.findIndex(block => block.actual_block_id === actualBlockId);
    const affectedBlocks = actualBlocks.slice(currentBlockIndex);
    let updatedEndIndex = 0;
    for (let i = 0; i < affectedBlocks.length; i++) {
      if (i === affectedBlocks.length - 1) {
        affectedBlocks[i].end_date = myAddDays(affectedBlocks[i].end_date, 1);
        updatedEndIndex = i;
        break;
      }
      const endDate = affectedBlocks[i].end_date;
      const nextStartDate = affectedBlocks[i+1].start_date;
      const diff = date2MinusDate1(endDate, nextStartDate);
      if (diff <= 1) {
        affectedBlocks[i].end_date = myAddDays(endDate, 1);
        affectedBlocks[i+1].start_date = myAddDays(nextStartDate, 1);
      } else {
        affectedBlocks[i].end_date = myAddDays(endDate, 1);
        updatedEndIndex = i;
        break;
      }
    };
    const updatedBlocksForAWS = affectedBlocks
                            .slice(0, updatedEndIndex+1)
                            .map(e => {
                                        return convertToSnakeCase({
                                          actualBlockId: e.actual_block_id,
                                          startDate: e.start_date,
                                          endDate: e.end_date
                                        })
                                      });
    // update AWS
    await ActualBlocks.update(updatedBlocksForAWS);
    const currentDelay = await StudentSubfieldTraces.findByCompositeKey(studentId, subfieldId)[0].delay;
    await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
      delay: currentDelay + 1
    })
    // update notion ui (coach plan, student only plan, (block database for student, this may be not necessary) )
    const updatedBlocksForNotion = affectedBlocks
                                    .slice(0, updatedEndIndex+1)
                                    .map(e => {
                                                return {
                                                  notionStudentPlanPageId: e.notion_page_id_for_student_plan,
                                                  notionCoachPlanPageId: e.notion_page_id_for_coach_plan,
                                                  startDate: e.start_date,
                                                  endDate: e.end_date
                                                }
                                              });
    await Promise.all(updatedBlocksForNotion.map(async (blockInfo) => {
      await Promise.all([
        await CoachPlan.updateAnOutputDate(blockInfo.notionCoachPlanPageId, blockInfo.startDate, blockInfo.endDate0),
        await StudentOnlyPlan.updateAPeriod(blockInfo.notionStudentPlanPageId, blockInfo.startDate, blockInfo.endDate)
      ]);
    }));
  } catch (error) {
    logger.error("Something went wrong during delay schedule", error);
    throw error;
  }
}

export async function expediteSchedule(studentId, actualBlockId, subfieldId, isTail) {
  try {
    const actualBlocks = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    actualBlocks.sort((a,b) => a.blockOrder - b.blockOrder);
    const currentBlockIndex = actualBlocks.findIndex(block => block.actualBlockId === actualBlockId);
    const affectedBlocks = actualBlocks.slice(currentBlockIndex);
    let updatedEndIndex = 0;
    const updateDiffDate = isTail ? date2MinusDate1(affectedBlocks[0].endDate, affectedBlocks[1].startDate) : 1;
    for (let i = 0; i < affectedBlocks.length; i++) {
      if (updateDiffDate === 0) {
        updatedEndIndex = i;
        break;
      }
      if (i === affectedBlocks.length - 1) {
        affectedBlocks[i].endDate = mySubDays(affectedBlocks[i].endDate, updateDiffDate);
        await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
          actualEndDate: affectedBlocks[i].endDate
        })
        updatedEndIndex = i;
        break;
      }
      const endDate = affectedBlocks[i].endDate;
      const nextStartDate = affectedBlocks[i+1].startDate;
      const diff = date2MinusDate1(endDate, nextStartDate);
      if (diff <= 1) {
        affectedBlocks[i].end_date = mySubDays(endDate, updateDiffDate);
        affectedBlocks[i+1].start_date = mySubDays(nextStartDate, updateDiffDate);
      } else {
        affectedBlocks[i].end_date = mySubDays(endDate, updateDiffDate);
        updatedEndIndex = i;
        break;
      }
    };
    // TODO: #1 We should separate the following updates logic from this code.
    const updatedBlocksForAWS = affectedBlocks
                                .slice(0, updatedEndIndex+1)
                                .map(e => {
                                      return convertToSnakeCase({
                                        actualBlockId: e.actualBlockId,
                                        startDate: e.startDate,
                                        endDate: e.endDate
                                      })
                                    });
    // update AWS
    await ActualBlocks.update(updatedBlocksForAWS);
    await ActualBlocks.update(updatedBlocksForAWS);
    const currentDelay = await StudentSubfieldTraces.findByCompositeKey(studentId, subfieldId)[0].delay;
    await StudentSubfieldTraces.updateByCompositekey(studentId, subfieldId, {
      delay: currentDelay - updateDiffDate
    });
    // update notion ui (coach plan, student only plan, (block database for student, this may be not necessary) )
    const updatedBlocksForNotion = affectedBlocks
                                    .slice(0, updatedEndIndex+1)
                                    .map(e => {
                                          return {
                                            notionStudentPlanPageId: e.notionPageIdForStudentPlan,
                                            notionCoachPlanPageId: e.notionPageIdForCoachPlan,
                                            startDate: e.startDate,
                                            endDate: e.endDate
                                          }
                                        });
    await Promise.all(updatedBlocksForNotion.map(async (blockInfo) => {
      await Promise.all([
        await CoachPlan.updateAnOutputDate(blockInfo.notionCoachPlanPageId, blockInfo.startDate, blockInfo.endDate0),
        await StudentOnlyPlan.updateAPeriod(blockInfo.notionStudentPlanPageId, blockInfo.startDate, blockInfo.endDate)
      ]);
    }));
  } catch (error) {
    logger.error("Something went wrong during expedite schedule", error);
    throw error;
  }
}

export async function calculateNextTrackerAndTodoRemainingCounter(studentId, subfieldId, currentActualBlockId, currentTracker) {
  try {
    // Current Block Information
    const currentActualBlock = ActualBlocks.findByCompositeKey(studentId, subfieldId, currentActualBlockId)[0];
    const currentSpeed = currentActualBlock.speed;
    const currentSpace = currentActualBlock.space;
    const maxLap = currentActualBlock.lap;
    const currentBlockSize = currentActualBlock.blockSize
    const currentBlockOrder = currentActualBlock.blockOrder
    // Current Tracker Information
    const currentLap = currentTracker.currentLap;
    const currentProbAWSId = currentTracker.currentProbAWSId;
    const currentInBlockOrder = await StudentProblemsAWS.findByStudentProblemId(currentProbAWSId)[0].problemInBlockOrder;
    const nextInBlockOrder = (currentInBlockOrder < currentBlockSize) ? currentInBlockOrder+1 : 1;
    if (currentInBlockOrder+currentSpeed > currentBlockSize && currentLap === maxLap) {
      if (currentActualBlock.isTail && nextInBlockOrder === 1) {
        const nextTracker = {
          isEnabled: 0
        }
        const todoRemainingCounter = 0;
        return {
          tracker: nextTracker,
          todoRemainingCounter: todoRemainingCounter
        }
      } else if (currentActualBlock.isTail) {
        const nextStudentProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextInBlockOrder)[0];
        const nextTracker = {
          studentProblemId: nextStudentProblem.studentProblemId,
          remainingSpace: currentSpace,
        }
        const todoRemainingCounter = currentBlockSize - currentInBlockOrder;
        await expediteSchedule(studentId, currentActualBlockId, subfieldId, false);
        return {
          tracker: nextTracker,
          todoRemainingCounter: todoRemainingCounter
        }
      } else {
        const nextBlock = await ActualBlocks.findByBlockOrderAndStudentInfo(studentId, subfieldId, currentBlockOrder+1)[0];
        if (nextInBlockOrder === 1) {
          const nextStudentProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, nextBlock.actualBlockId, nextInBlockOrder)[0];
          const nextTracker = {
            actualBlockId: nextBlock.actualBlockId,
            studentProblemId: nextStudentProblem.studentProblemId,
            remainingSpace: nextBlock.blockOrder,
            currentLap: 1
          }
          const todoRemainingCounter = nextBlock.speed;
          await expediteSchedule(studentId, currentActualBlockId, subfieldId, true);
          return {
            tracker: nextTracker,
            todoRemainingCounter: todoRemainingCounter
          }
        } else {
          const nextStudentProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextInBlockOrder)[0];
          const nextTracker = {
            studentProblemId: nextStudentProblem.studentProblemId,
            remainingSpace: nextBlock.blockOrder,
          }
          const todoRemainingCounter = Math.min(currentSpace- (currentBlockSize - currentInBlockOrder), nextBlock.space) + (currentBlockSize - currentInBlockOrder);
          await expediteSchedule(studentId, currentActualBlockId, subfieldId, false);
          return {
            tracker: nextTracker,
            todoRemainingCounter: todoRemainingCounter
          }
        }
      }
    } else if (currentInBlockOrder+currentSpeed > currentBlockSize && nextInBlockOrder === 1) {
      const nextStudentProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextInBlockOrder)[0];
      const nextTracker = {
        studentProblemId: nextStudentProblem.studentProblemId,
        remainingSpace: currentSpace,
        currentLap: currentLap + 1
      };
      const todoRemainingCounter = currentSpeed;
      await expediteSchedule(studentId, currentActualBlockId, subfieldId, true);
      return {
        tracker: nextTracker,
        todoRemainingCounter: todoRemainingCounter
      }
    } else {
      const nextStudentProblem = await StudentProblemsAWS.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextInBlockOrder)[0];
      const nextTracker = {
        studentProblemId: nextStudentProblem.studentProblemId,
        remainingSpace: currentSpace,
      };
      const todoRemainingCounter = currentSpeed;
      await expediteSchedule(studentId, currentActualBlockId, subfieldId, false);
      return {
        tracker: nextTracker,
        todoRemainingCounter: todoRemainingCounter
      }
    }
  } catch (error) {
    logger.error("Something went wrong during calculate next tracker and todo remaining counter", error);
    throw error;
  }
}