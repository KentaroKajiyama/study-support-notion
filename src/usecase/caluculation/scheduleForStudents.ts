import { 
  logger,
  myAddDays, 
  mySubDays, 
  isDate1EarlierThanOrSameWithDate2, 
  isDateBetween, 
  date2MinusDate1,
  ensureValue
} from "@utils/index.js";
import {
  ActualBlocks, 
  StudentProblems,
  Students,
  StudentSubfieldTraces,
  Tracker
} from '@infrastructure/aws_tables/index.js';
import {
  NotionCoachIrregulars,
  NotionCoachPlans,
  NotionStudentSchedules,

} from '@infrastructure/notion/index.js'
import { 
  SubfieldsSubfieldNameEnum, 
  MySQLUintID, 
  NotionDate,
  getMentionDetailsArrayFromInlineText,
  isNotionMentionString,
  MentionDetailId,
  Uint,
  NotionUUID,
  NotionMentionString,
  toNotionMentionString,
  toUint,
  toInt,
  ActualBlocksProblemLevelEnum
} from "@domain/types/index.js";
import { 
  DomainCoachRest, 
  DomainCoachPlan, 
  DomainCoachIrregular 
} from '@domain/coach/index.js';


export function isHoliday(
  checkedDate: NotionDate, 
  holidayArray: DomainCoachRest[], 
  subfieldName: SubfieldsSubfieldNameEnum
): boolean{
  const subfieldHolidays = holidayArray.filter((hol) => hol.subfieldList.includes(subfieldName));
  for (const row of subfieldHolidays) {
    if (row.startDate && row.endDate && isDateBetween(checkedDate, row.startDate, row.endDate)) {
      return true;
    }
  }
  return false;
};
// TODO: Parallelize this
// TODO: Preprocess for irregular blocks

interface SpecificAssignedProblem {
  studentProblemId: MySQLUintID;
  problemInBlockOrder: Uint;
  problemOverallOrder: Uint;
  actualBlockId: MySQLUintID;
}

interface AssignedProblemsInfo {
  problems: SpecificAssignedProblem[];
  subfieldId: MySQLUintID;
  subfieldName: SubfieldsSubfieldNameEnum;
}

interface BlockIdOrder {
  studentProblemId: MySQLUintID;
  problemInBlockOrder: Uint;
};

interface SpecificAssignedBlock extends Required<Omit<DomainCoachPlan, 'blockName' | 'outputStartDate' | 'outputEndDate'>>, Pick<DomainCoachPlan, 'outputStartDate'|'outputEndDate'> {
  idOrderArray: BlockIdOrder[];
  actualBlockPageId: NotionUUID;
  actualBlockId: MySQLUintID;
  isTail: boolean;
}

interface AssignedBlocksInfo {
  blocks: SpecificAssignedBlock[];
  subfieldId: MySQLUintID;
  subfieldName: SubfieldsSubfieldNameEnum;
}

type PlannedBlock = {
  actualBlockPageId: NotionUUID,
  actualBlockId: MySQLUintID,
  inputStartDate: NotionDate,
  inputEndDate: NotionDate,
  isIrregular: boolean,
  speed: Uint,
  space: Uint,
  lap: Uint,
  subfieldName: SubfieldsSubfieldNameEnum,
  subfieldLevel: ActualBlocksProblemLevelEnum,
  blockOrder: Uint,
  planPageId: NotionUUID,
  outputStartDate: NotionDate | null,
  outputEndDate: NotionDate | null,
};

type IrregularBlock = {
  studentProblemPageId: NotionUUID;
  isModified: boolean;
  insertOrder: Uint;
  subfieldName: SubfieldsSubfieldNameEnum;
  irregularProblemOrder: Uint;
  insertBlockName: string;
  insertBlockPageId: NotionUUID;
  insertBlockId?: MySQLUintID;
  formerBlockName: string;
  formerBlockPageId: NotionUUID;
  formerBlockId?: MySQLUintID;
  irregularPageId: NotionUUID;
}

export async function applyIrregularChanges(
  studentId: MySQLUintID, 
  subfieldInfoList: {subfieldId: MySQLUintID, subfieldName: SubfieldsSubfieldNameEnum }[], 
  domainCoachPlanArray: DomainCoachPlan[], 
  domainCoachIrregularArray: DomainCoachIrregular[], 
): Promise<{ assignedBlocksArray: Array<AssignedBlocksInfo>, assignedProblemsArray: Array<AssignedProblemsInfo>}> {
  try {
    const plannedBlocks: PlannedBlock[] = await Promise.all(domainCoachPlanArray.map(async domainCoachPlan => {
      if (!isNotionMentionString(domainCoachPlan.blockName as string)) throw new Error(`${domainCoachPlan.blockName} is not mention string`);
      const actualBlockPageId = (getMentionDetailsArrayFromInlineText(domainCoachPlan.blockName as string)[0] as MentionDetailId).id;
      // TODO: More strict type checking for ActualBlocks
      const actualBlockData = await ActualBlocks.findByStudentActualBlockDbNotionPageId(actualBlockPageId);
      if (actualBlockData === null) throw new Error(`${domainCoachPlan.blockName}'s page id is not found in mysql`);
      const actualBlockId = actualBlockData.actualBlockId as MySQLUintID;
      if (!domainCoachPlan.blockOrder){
        throw new Error(`Block ${domainCoachPlan.blockName} 's order must not be empty`);
      }
      return {
        actualBlockPageId: actualBlockPageId,
        actualBlockId: actualBlockId,
        inputStartDate: domainCoachPlan.inputStartDate as NotionDate,
        inputEndDate: domainCoachPlan.inputEndDate as NotionDate,
        isIrregular: domainCoachPlan.isIrregular as boolean,
        speed: domainCoachPlan.speed !== null ? domainCoachPlan.speed as Uint : actualBlockData.speed as Uint,
        space: domainCoachPlan.space !== null ? domainCoachPlan.space as Uint: actualBlockData.space as Uint,
        lap: domainCoachPlan.lap !== null ? domainCoachPlan.lap as Uint: actualBlockData.lap as Uint,
        subfieldName: domainCoachPlan.subfieldName as SubfieldsSubfieldNameEnum,
        subfieldLevel: domainCoachPlan.subfieldLevel as ActualBlocksProblemLevelEnum,
        blockOrder: domainCoachPlan.blockOrder as Uint,
        planPageId: domainCoachPlan.planPageId as NotionUUID,
        outputStartDate: domainCoachPlan.outputStartDate as NotionDate | null,
        outputEndDate: domainCoachPlan.outputEndDate as NotionDate | null,
      }
    }));
    const irregularProblems: IrregularBlock[] = domainCoachIrregularArray.map(domainCoachIrregular => {
      if (!domainCoachIrregular.insertOrder) {
        throw new Error(`Irregular problem ${domainCoachIrregular.problemName}'s insert order must not be empty`);
      };
      if (!domainCoachIrregular.irregularProblemOrder) {
        throw new Error(`Irregular problem ${domainCoachIrregular.problemName}'s irregular problem order must not be empty`);
      };
      if (!isNotionMentionString(domainCoachIrregular.problemName as string)) { throw new Error(`Irregular problem ${domainCoachIrregular.problemName}'s mention string must be a string`); } 
      const studentProblemPageId = (getMentionDetailsArrayFromInlineText(domainCoachIrregular.problemName as NotionMentionString)[0] as MentionDetailId).id;
      if (!isNotionMentionString(domainCoachIrregular.formerBlock as string)) { throw new Error(`Irregular problem ${domainCoachIrregular.formerBlock}'s irregular problem order must not be empty`); }
      const formerBlockData = getMentionDetailsArrayFromInlineText(domainCoachIrregular.formerBlock as NotionMentionString)[0] as MentionDetailId;
      if (!isNotionMentionString(domainCoachIrregular.insertBlock as string)) { throw new Error(`Irregular problem ${domainCoachIrregular.insertBlock}'s insert block must not be empty`); }
      const insertBlockData = getMentionDetailsArrayFromInlineText(domainCoachIrregular.insertBlock as NotionMentionString)[0] as MentionDetailId;
      return {
        studentProblemPageId: studentProblemPageId,
        isModified: domainCoachIrregular.isModified ?? false,
        insertOrder: domainCoachIrregular.insertOrder,
        subfieldName: domainCoachIrregular.subfieldName as SubfieldsSubfieldNameEnum,
        irregularProblemOrder: domainCoachIrregular.irregularProblemOrder,
        formerBlockName: formerBlockData.displayText,
        formerBlockPageId: formerBlockData.id,
        insertBlockName: insertBlockData.displayText,
        insertBlockPageId: insertBlockData.id,
        irregularPageId: domainCoachIrregular.irregularPageId as NotionUUID
      }
    });
    const studentProblems = await StudentProblems.findWithSubfieldIdByStudentId(studentId);
    const result : {
      assignedBlocksArray: AssignedBlocksInfo[];
      assignedProblemsArray: AssignedProblemsInfo[];
    } = {
      assignedBlocksArray: [] ,
      assignedProblemsArray: [],
    } 
    // TODO: Do we really need to update the ui of irregular databases here?
    const notionCoachIrregulars = new NotionCoachIrregulars();
    // ------------------------
    const promises = subfieldInfoList.map(async subfieldInfo => {
      const specificStudentProblems = studentProblems.filter(problem => problem.subfieldId === subfieldInfo.subfieldId);
      const specificPlannedBlocks = plannedBlocks.filter(plannedBlock => plannedBlock.subfieldName === subfieldInfo.subfieldName);
      const specificIrregularBlocks = await (async irregularProblems => {
        const result = [];
        // TODO: Check this. This sort logic of formerBlockPageId is very suspicious.
        let originalIrregularProblems = irregularProblems
                                        .filter(irregularInfo => irregularInfo.subfieldName === subfieldInfo.subfieldName)
                                        .sort((a,b) => {
                                          if(a.formerBlockPageId > b.formerBlockPageId) return 1;
                                          else if (a.formerBlockPageId < b.formerBlockPageId) return -1;
                                          return a.irregularProblemOrder - b.irregularProblemOrder;
                                        });
        let isModifiedFlag = false; let laterFlagChange = false;
        let insertOrder: Uint | null = null; let insertBlockName: string | null = null; let insertBlockPageId: NotionUUID | null = null; let insertBlockId: MySQLUintID | null = null; let formerBlockId: MySQLUintID | null = null; let formerBlockPageId: NotionUUID | null = null;
        // TODO: You should modify here, maybe. Remove updateProperties?
        originalIrregularProblems = await (async () => {
          const result = [];
          for (const irregularInfo of originalIrregularProblems) {
            // Check if the problem is in modification range.
            if(irregularInfo.isModified && !isModifiedFlag) {
              isModifiedFlag = true;
            } else if (irregularInfo.isModified) {
              laterFlagChange = true;
            };
            // Initialize formerBlockPageId
            if(formerBlockPageId === null) { 
              formerBlockPageId = irregularInfo.formerBlockPageId
              formerBlockId = await ActualBlocks.findByStudentActualBlockDbNotionPageId(irregularInfo.formerBlockPageId)
                .then(block => {
                  if (block === null) {
                    throw new Error(`Former block page id ${irregularInfo.formerBlockPageId} not found in database.`);
                  }
                  return block.actualBlockId as MySQLUintID;
                })
            };
            if(isModifiedFlag){
              // fill empty insert orders
              // fill empty insert block relations and aws ids
              if (irregularInfo.insertOrder && irregularInfo.insertBlockPageId) {
                insertOrder = irregularInfo.insertOrder;
                insertBlockId = await ActualBlocks.findByStudentActualBlockDbNotionPageId(irregularInfo.insertBlockPageId)
                  .then(block => {
                    if (block === null) {
                      throw new Error(`Insert block page id ${irregularInfo.insertBlockPageId} not found in database.`);
                    }
                    return block.actualBlockId as MySQLUintID;
                  }) as MySQLUintID;
                irregularInfo.insertBlockId = insertBlockId;
                insertBlockName = irregularInfo.insertBlockName;
                insertBlockPageId = irregularInfo.insertBlockPageId;
              } else if (!irregularInfo.insertOrder && irregularInfo.insertBlockPageId) {
                if (insertOrder === null) throw new Error("Insert order is undefined");
                irregularInfo.insertOrder = insertOrder;
              } else if (!irregularInfo.insertOrder && !irregularInfo.insertBlockPageId) {
                if (!insertOrder) throw new Error("Insert order is undefined");
                irregularInfo.insertOrder = insertOrder;
                if (!insertBlockId) throw new Error("Insert Block AWS Id is undefined");
                irregularInfo.insertBlockId = insertBlockId;
                if (insertBlockName === null) throw new Error("Insert Block Name is undefined");
                irregularInfo.insertBlockName = insertBlockName;
                if (insertBlockPageId === null) throw new Error("Insert Block Page Id is undefined");
                irregularInfo.insertBlockPageId = insertBlockPageId;
                const insertBlock: NotionMentionString = toNotionMentionString({
                  displayText: insertBlockName,
                  type: 'page',
                  id: insertBlockPageId,
                });
                //TODO: Do we have to update here?
                await notionCoachIrregulars.updatePageProperties(irregularInfo.irregularPageId, 
                  {
                    isModified: isModifiedFlag,
                    insertBlock: insertBlock
                  }
                );
              } else {
                throw new Error("You must specify an Insert BLock if you specify an Insert Order");
              };
              // Add former block AWS ID
              if (irregularInfo.formerBlockPageId !== formerBlockPageId) {
                formerBlockPageId = irregularInfo.formerBlockPageId
                await ActualBlocks.findByStudentActualBlockDbNotionPageId(irregularInfo.formerBlockPageId)
                  .then(block => {
                    formerBlockId = ensureValue(block, `Former block page id ${irregularInfo.formerBlockPageId} not found in database.`)
                                    .actualBlockId as MySQLUintID;
                  })
                irregularInfo.formerBlockId = ensureValue(formerBlockId);
              } else {
                irregularInfo.formerBlockId = ensureValue(formerBlockId);
              };
              if (laterFlagChange) {
                isModifiedFlag = false;
                laterFlagChange = false;
              };
              result.push(irregularInfo);
            }
          }
          return result;
        })();
        while (originalIrregularProblems.length > 0) {
          // TODO: Clarify the difference between order in total and one in a specific block
          const specificIrregularInsertBlockId = originalIrregularProblems[0].insertBlockId;
          if (specificIrregularInsertBlockId === undefined) throw new Error(`specificIrregularInsertBlockId is undefined`);
          const specificIrregularBlockInsertOrder = originalIrregularProblems[0].insertOrder;
          const specificIrregularFormerBLockId = originalIrregularProblems[0].formerBlockId;
          const specificIrregularBlock = originalIrregularProblems
                                          .filter(irregularInfo => 
                                            irregularInfo.insertBlockId === specificIrregularInsertBlockId 
                                            && irregularInfo.insertOrder === specificIrregularBlockInsertOrder
                                            && irregularInfo.formerBlockId === specificIrregularFormerBLockId
                                          );
          const insertedProblemId = await StudentProblems.findByBlockInfoAndStudentInfo(studentId, specificIrregularInsertBlockId, specificIrregularBlockInsertOrder)
                                    .then(problem => {
                                      if (problem?.studentProblemId === undefined) throw new Error ("Failed to find student problem id with block info and student info");
                                      return problem.studentProblemId;
                                    });
          result.push({
            idOrderArray: 
              (await Promise.all(specificIrregularBlock.map(async irregularInfo => {
              const studentProblemId = await StudentProblems.findByNotionPageId(irregularInfo.studentProblemPageId)
                            .then(problem => {
                              if (problem?.studentProblemId === undefined) throw new Error ("Failed to find student problem id with notion page id");
                              return problem.studentProblemId;
                            });
              return {
                studentProblemId: studentProblemId,
                irregularProblemOrder: irregularInfo.irregularProblemOrder
              }
              }))).sort((a,b) => a.irregularProblemOrder - b.irregularProblemOrder),
            insertedProblemId: 
              insertedProblemId,
            newBlockId: 
              specificIrregularInsertBlockId,
            formerBlockId:
              specificIrregularFormerBLockId
          });
          originalIrregularProblems = originalIrregularProblems
                                                .filter(irregularInfo => 
                                                  irregularInfo.insertBlockId !== specificIrregularInsertBlockId
                                                  || irregularInfo.insertOrder !== specificIrregularBlockInsertOrder
                                                  || irregularInfo.formerBlockId !== specificIrregularFormerBLockId
                                                );
        };
        return result;
      })(irregularProblems);
      const formerProblems = specificPlannedBlocks.map(plannedBlock => {
        const specificBlockProblems = specificStudentProblems.filter(problem => problem.actualBlockId === plannedBlock.actualBlockId);
        const idOrderArray = specificBlockProblems.map(problem => {
          // TODO: In Block Order must not be empty. I wanna both infrastructure and domain constraint more secure.
          if (problem.studentProblemId === undefined) throw new Error("student problem not found. student problem id must not be undefined in speccificBlockProblems")
          if (problem.problemInBlockOrder === undefined) throw new Error("problem in block order must not be undefined in speccificBlockProblems");
          return {
            studentProblemId: problem.studentProblemId,
            problemInBlockOrder: problem.problemInBlockOrder
          }
        });
        return {
          idOrderArray: idOrderArray.sort((a,b) => a.problemInBlockOrder - b.problemInBlockOrder),
          blockId: plannedBlock.actualBlockId,
          blockOrder: plannedBlock.blockOrder
        }
      });
      const addNewProblems = formerProblems.map(specificBlock => {
        const insertIrregularBlocks = specificIrregularBlocks.filter(block => block.newBlockId === specificBlock.blockId);
        return (() => {
          for (const irregularBlock of insertIrregularBlocks) {
            const irregularBlockLength = irregularBlock.idOrderArray.length;
            const insertOrder = specificBlock.idOrderArray.filter(problem => problem.studentProblemId === irregularBlock.insertedProblemId)[0].problemInBlockOrder;
            specificBlock.idOrderArray.forEach(idOrder => {
              if (idOrder.problemInBlockOrder > insertOrder) {
                idOrder.problemInBlockOrder = toUint(idOrder.problemInBlockOrder+irregularBlockLength+1); 
              };
            });
            for (let i=1; i <= irregularBlockLength; i++) {
              specificBlock.idOrderArray.push({
                studentProblemId: irregularBlock.idOrderArray[i-1].studentProblemId,
                problemInBlockOrder: toUint(insertOrder + i)
              })
            };
          };
          specificBlock.idOrderArray.sort((a,b) => a.problemInBlockOrder - b.problemInBlockOrder);
          return specificBlock;
        })();
      });
      const removedOldProblems = addNewProblems.map(specificBlock => {
        const removeIrregularBlocks = specificIrregularBlocks.filter(block => block.formerBlockId === specificBlock.blockId);
        const idsToRemove = removeIrregularBlocks.map(removeBlockInfo => removeBlockInfo.idOrderArray.map(idOrder => idOrder.studentProblemId)).flat();
        const removedIdOrderArray = specificBlock.idOrderArray.filter(idOrder => !idsToRemove.includes(idOrder.studentProblemId));
        return {
          idOrderArray: removedIdOrderArray.sort((a,b) => a.problemInBlockOrder - b.problemInBlockOrder),
          blockId: specificBlock.blockId,
          blockOrder: specificBlock.blockOrder
        }
      });
      const { SpecifiAssignedProblems, SpecificAssignedBlocks } = ((): { SpecifiAssignedProblems: SpecificAssignedProblem[], SpecificAssignedBlocks: SpecificAssignedBlock[] } => {
        removedOldProblems.sort((a,b) => a.blockOrder - b.blockOrder);
        const numOfBlocks = removedOldProblems.length;
        const SpecifiAssignedProblems: SpecificAssignedProblem[] = [];
        const SpecificAssignedBlocks: SpecificAssignedBlock[] = [];
        let index: Uint = toUint(1);
        for (let k = 0; k < numOfBlocks; k++) {
          const block = removedOldProblems[k];
          const plannedBlockInfo = specificPlannedBlocks.find(blockInfo => blockInfo.actualBlockId === block.blockId);
          if (plannedBlockInfo === undefined) throw new Error(`Block ${block.blockId} is not in planned block list`);
          for (let i = 1; i <= block.idOrderArray.length; i++) {
            block.idOrderArray[i-1].problemInBlockOrder = toUint(i);
            SpecifiAssignedProblems.push({
              studentProblemId: block.idOrderArray[i-1].studentProblemId,
              problemInBlockOrder: toUint(i),
              problemOverallOrder: index,
              actualBlockId: block.blockId
            });
            index++;
          };
          // TODO: Can I set the output and start date to undefined?
          SpecificAssignedBlocks.push({
            idOrderArray: block.idOrderArray.sort((a,b) => a.problemInBlockOrder - b.problemInBlockOrder),
            actualBlockPageId: plannedBlockInfo.actualBlockPageId,
            actualBlockId: block.blockId,
            inputStartDate: plannedBlockInfo.inputStartDate,
            inputEndDate: plannedBlockInfo.inputEndDate,
            isIrregular: plannedBlockInfo.isIrregular,
            speed: plannedBlockInfo.speed,
            space: plannedBlockInfo.space,
            lap: plannedBlockInfo.lap,
            subfieldName: plannedBlockInfo.subfieldName,
            subfieldLevel: plannedBlockInfo.subfieldLevel,
            blockOrder: plannedBlockInfo.blockOrder,
            planPageId: plannedBlockInfo.planPageId,
            outputStartDate: plannedBlockInfo.outputStartDate !== null ? plannedBlockInfo.outputStartDate : undefined,
            outputEndDate: plannedBlockInfo.outputEndDate !== null ? plannedBlockInfo.outputEndDate : undefined,
            isTail: k === numOfBlocks ? true : false,
          });
        }
        return { 
          SpecifiAssignedProblems: SpecifiAssignedProblems, 
          SpecificAssignedBlocks: SpecificAssignedBlocks,
        };
      })();
      result.assignedBlocksArray.push({
        blocks: SpecificAssignedBlocks,
        subfieldId: subfieldInfo.subfieldId,
        subfieldName: subfieldInfo.subfieldName,
      });
      result.assignedProblemsArray.push({
        problems: SpecifiAssignedProblems,
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
export async function scheduleProblems(
  studentId: MySQLUintID, 
  assignedBlocksArray: Array<AssignedBlocksInfo>, 
  restArray: Array<DomainCoachRest>
): Promise<Array<{subfieldName: SubfieldsSubfieldNameEnum, blocks: SpecificAssignedBlock[]}>> {
  const result = [];
  // TODO: Parallelize this.
  for (const specificAssignedBlocksData of assignedBlocksArray) {
    const specificAssignedBlocks = specificAssignedBlocksData.blocks;
    restArray = restArray.filter(e => e.startDate !== undefined);
    let specificRestArray = restArray
                            .filter(row => row.subfieldList.includes(specificAssignedBlocksData.subfieldName ||'ALL'))
                            .sort((a,b) => { 
                              if(isDate1EarlierThanOrSameWithDate2(a.startDate as NotionDate, b.startDate as NotionDate)) {
                                return 1;
                              } else {
                                return -1;
                              }
                            });
    specificAssignedBlocks.sort((a,b) => a.blockOrder - b.blockOrder);
    // Note that this 'orderCursor' variable is zero indexed!
    let orderCursor: Uint = toUint(0);
    // These are all zero indexed.
    let startOrder: Uint | null = null; let endOrder: Uint | null = null; 
    let remainder: Uint = toUint(0); let startDate: NotionDate | null = null; let endDate: NotionDate | null = null; 
    let restList: {startDate: NotionDate, endDate: NotionDate}[] = []; let restLength: Uint = toUint(0); let remainderRecorder: Uint[] = [];    // TODO: suspicious
    while (orderCursor < specificAssignedBlocks.length) {
      while (startOrder === null) {
        startOrder = specificAssignedBlocks[orderCursor].inputStartDate ? orderCursor : null;
        if (startOrder) {
          while (endOrder === null) {
            if (specificAssignedBlocks[orderCursor].inputEndDate) {
              endOrder = orderCursor;
              startOrder = toUint(orderCursor+1); // Add process of exception for orderCursor + 1 == assignedBlock.length?
            } else if (orderCursor === specificAssignedBlocks.length-1) {
              // fetch student's exam date from students table
              const examDate = await Students.findByStudentId(studentId)
                                .then(student => {
                                  if (student === null){
                                    throw new Error('No student data was found in scheduleProblems for student id:' + studentId);
                                  } else if (student.examDate === null) {
                                    throw new Error('No exam date was found in student data for student id:' + studentId + ' You have to set student exam date');
                                  }
                                  return student.examDate as NotionDate;
                                })
              endOrder = orderCursor;
              specificAssignedBlocks[endOrder as Uint].inputEndDate = mySubDays(examDate, 1);
            } else if (specificAssignedBlocks[orderCursor+1].inputStartDate) {
              endOrder = orderCursor;
              specificAssignedBlocks[orderCursor].inputEndDate = mySubDays(specificAssignedBlocks[orderCursor+1].inputStartDate, 1);
            } else {
              orderCursor = toUint(orderCursor+1);
            }
          }
        };
        // TODO: Do we need to increment the order here?
        orderCursor = toUint(orderCursor+1);
        if (orderCursor > specificAssignedBlocks.length) {
          throw new Error('Must input at least one start date.')
        }
      };
      startDate = specificAssignedBlocks[startOrder].inputStartDate as NotionDate;
      endDate = specificAssignedBlocks[endOrder as Uint].inputEndDate as NotionDate;
      if (!isDate1EarlierThanOrSameWithDate2(startDate, endDate)) throw new Error('startDate must be earlier than or same with endDate');
      // Create size ascending speed list
      const speedManagementList = Array.from(
                                    specificAssignedBlocks.slice(startOrder, endOrder as Uint +1)
                                  ).sort((a,b) => {
                                      return a.idOrderArray.length < b.idOrderArray.length ? 1 : -1;
                                    });
      // Create rest List
      let endDateCandidate = specificRestArray[0].endDate;
      if (endDateCandidate === undefined) throw new Error('end date of rests must not be undefined'); 
      for (let i = 0; i < specificRestArray.length; i++) {
        if (isDate1EarlierThanOrSameWithDate2(
          myAddDays(endDateCandidate,1), 
          ensureValue(specificRestArray[i].startDate, 'start date and end date of rests must not be undefined')
        )) {
          specificRestArray = specificRestArray
                              .filter(restElement => {
                                        if(restElement.startDate === undefined || restElement.endDate === undefined) throw new Error('start date and end date of rests must not be undefined'); 
                                        isDate1EarlierThanOrSameWithDate2(endDateCandidate, restElement.startDate)
                                      });
          specificRestArray
            .sort((a,b) => {
              return isDate1EarlierThanOrSameWithDate2(a.startDate as NotionDate, b.endDate as NotionDate) ? 1 : -1;
            });
          break;
        }
        if (
          isDateBetween(
            endDateCandidate, 
            ensureValue(specificRestArray[i].startDate), 
            ensureValue(specificRestArray[i].endDate)
          ) 
          && isDate1EarlierThanOrSameWithDate2(
            myAddDays(endDateCandidate,1), 
            ensureValue(specificRestArray[i].endDate)
          )
        ){
          restList.push({
            startDate: ensureValue(specificRestArray[i].startDate) ,
            endDate: endDateCandidate
          });
          restLength = toUint(restLength + date2MinusDate1(ensureValue(specificRestArray[i].startDate), endDateCandidate)+1);
          specificRestArray[i].startDate = myAddDays(endDateCandidate, 1);
          specificRestArray
            .filter(
              restElement => isDate1EarlierThanOrSameWithDate2(endDateCandidate, ensureValue(restElement.startDate))
            )
            .sort((a,b) => {
              return isDate1EarlierThanOrSameWithDate2(ensureValue(a.startDate), ensureValue(b.endDate)) ? 1 : -1;
            });
          break;
        } else {
          restList.push({
            startDate: specificRestArray[i].startDate as NotionDate,
            endDate: specificRestArray[i].endDate as NotionDate
          })
          restLength = toUint(restLength + date2MinusDate1(specificRestArray[i].startDate as NotionDate, specificRestArray[i].endDate as NotionDate)+1);
        }
      }
      // Adjust speed
      const actualDayCapacity: Uint = toUint(date2MinusDate1(startDate, endDate) + 1 - restLength);
      let actualDayLength: Uint; let speedManagementCursor: Uint = toUint(0);
      let caluculationResult = actualDayLengthCalculator(specificAssignedBlocks, startOrder, endOrder as Uint, remainder);
      actualDayLength = caluculationResult.actualDayLength; remainderRecorder = caluculationResult.remainderRecorder; 
      remainder = remainderRecorder[ensureValue(endOrder)];
      while (actualDayLength > actualDayCapacity) {
        const speedUpBlockId = speedManagementList[speedManagementCursor].actualBlockId;
        const speedUpBlockIndex = specificAssignedBlocks.findIndex(block => block.actualBlockId === speedUpBlockId);
        specificAssignedBlocks[speedUpBlockIndex].speed = toUint(specificAssignedBlocks[speedUpBlockIndex].speed as Uint + 1);
        speedManagementCursor = toUint(speedManagementCursor + 1 < speedManagementList.length ? speedManagementCursor + 1 : 0);
        caluculationResult = actualDayLengthCalculator(specificAssignedBlocks, startOrder, endOrder as Uint, remainder);
        actualDayLength = caluculationResult.actualDayLength; remainderRecorder = caluculationResult.remainderRecorder; remainder = remainderRecorder[ensureValue(endOrder)];
      };
      // Assign Output Date
      assignOutputDaysToBlocks(specificAssignedBlocks, startOrder, endOrder as Uint, remainderRecorder, restList);
      // Initialize global variables.
      startOrder = null; endOrder = null; restList = []; restLength = toUint(0);
    }
    result.push({
      subfieldName: specificAssignedBlocks[0].subfieldName,
      blocks: specificAssignedBlocks
    });
  }
  return result;
}

function actualDayLengthCalculator(
  actualBlocks: SpecificAssignedBlock[], 
  startOrder: Uint, 
  endOrder: Uint, 
  remainder: Uint
): {
  actualDayLength: Uint;
  remainderRecorder: Uint[];
} {
  try { 
    let actualDayLength: Uint = toUint(0); let remainderRecorder: Uint[] = []
    for (let i = startOrder; i <= endOrder; i++) {
      const blockLength = actualBlocks[i].idOrderArray.length;
      const speed = actualBlocks[i].speed;
      const space = actualBlocks[i].space;
      const lap = actualBlocks[i].lap;
      if (speed === null || space === null || lap === null) {
        throw new Error('speed, space, and lap must not be null');
      }
      if (remainder === 0) {
        actualDayLength = toUint(actualDayLength + Math.floor(((blockLength + (blockLength - 1) * space) * lap) / speed));
        remainder = toUint(((blockLength + (blockLength - 1) * space) * lap) % speed);
        remainderRecorder.push(remainder);
      } else {
        const residual = Math.min(speed, actualBlocks[i-1].speed as Uint - remainder);
        actualDayLength = toUint(actualDayLength + Math.floor(((blockLength + (blockLength - 1) * space) * lap - residual) / speed) + 1);
        remainder = toUint(((blockLength + (blockLength - 1) * space) * lap - residual) % speed);
        remainderRecorder.push(remainder);
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

function assignOutputDaysToBlocks(
  actualBlocks: SpecificAssignedBlock[], 
  startOrder: Uint, 
  endOrder: Uint, 
  remainderRecorder: Uint[], 
  restList: { startDate: NotionDate, endDate: NotionDate }[] 
) {
  try {
    let restCursor: Uint = toUint(0);
    for (let i = startOrder; i <= endOrder; i++) {
      const blockLength = actualBlocks[i].idOrderArray.length;
      const speed = actualBlocks[i].speed;
      const space = actualBlocks[i].space;
      const lap = actualBlocks[i].lap;
      if (speed === null || space === null || lap === null) {
        throw new Error('speed, space, and lap must not be null');
      }
      let periodLength:Uint = toUint(0); let endDateCandidate: NotionDate;
      if (i===0 || remainderRecorder[i-1] === 0) {
        periodLength = toUint(Math.floor(((blockLength + (blockLength - 1) * space) * lap) / speed));
      } else {
        const residual = toUint(Math.min(speed, actualBlocks[i-1].speed as Uint - remainderRecorder[i-1]));
        periodLength = toUint(Math.floor(((blockLength + (blockLength - 1) * space) * lap - residual) / speed) + 1);
      };
      endDateCandidate = myAddDays(actualBlocks[i].inputStartDate, periodLength-1);
      while (restList[restCursor].startDate <= endDateCandidate && restCursor < restList.length) {
        const restLength = toUint(date2MinusDate1(restList[restCursor].startDate, restList[restCursor].endDate) - 1);
        endDateCandidate = myAddDays(endDateCandidate, restLength);
        restCursor = toUint(restCursor+1);
      };
      actualBlocks[i].outputStartDate = actualBlocks[i].inputStartDate;
      actualBlocks[i].outputEndDate = endDateCandidate;
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
export async function adjustSchedule(
  studentId: MySQLUintID, 
  actualBlockId: MySQLUintID, 
  subfieldId: MySQLUintID,
  mode: "delay" | "expedite",
  isTail: boolean = false // Only relevant for expedition
) {
  try {
    const actualBlocks = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    actualBlocks.sort((a, b) => {
      return ensureValue(a.blockOrder, 'Block order not defined for student ' + studentId) - ensureValue(b.blockOrder) > 0 ? 1 : -1;
    });

    const currentBlockIndex = actualBlocks.findIndex(block => block.actualBlockId === actualBlockId);
    const affectedBlocks = actualBlocks.slice(currentBlockIndex);
    let updatedEndIndex = 0;

    const adjustDays = (blockIndex: number): number => {
      if (mode === "delay") return 1;
      if (blockIndex === affectedBlocks.length - 1) return 1; // Last block always moves by 1 day
      if (isTail) return date2MinusDate1(affectedBlocks[0].endDate!, affectedBlocks[1].startDate!);
      return 1;
    };

    for (let i = 0; i < affectedBlocks.length; i++) {
      const moveDays = adjustDays(i);

      if (i === affectedBlocks.length - 1) {
        affectedBlocks[i].endDate = mode === "delay"
          ? myAddDays(ensureValue(affectedBlocks[i].endDate, "Block's end date must be defined"), moveDays)
          : mySubDays(ensureValue(affectedBlocks[i].endDate, "Block's end date must be defined"), moveDays);
        updatedEndIndex = i;
        break;
      }

      const endDate = ensureValue(affectedBlocks[i].endDate);
      const nextStartDate = ensureValue(affectedBlocks[i + 1].startDate);
      const diff = date2MinusDate1(endDate, nextStartDate);

      if ((mode === "delay" && diff <= 1) || (mode === "expedite" && diff <= 1)) {
        affectedBlocks[i].endDate = mode === "delay"
          ? myAddDays(endDate, moveDays)
          : mySubDays(endDate, moveDays);
        affectedBlocks[i + 1].startDate = mode === "delay"
          ? myAddDays(nextStartDate, moveDays)
          : mySubDays(nextStartDate, moveDays);
      } else {
        affectedBlocks[i].endDate = mode === "delay"
          ? myAddDays(endDate, moveDays)
          : mySubDays(endDate, moveDays);
        updatedEndIndex = i;
        break;
      }
    }

    // Prepare data for AWS update
    const updatedBlocksForAWS = affectedBlocks
      .slice(0, updatedEndIndex + 1)
      .map(e => ({
        actualBlockId: ensureValue(e.actualBlockId, "Block's actualBlockId must be defined"), 
        startDate: ensureValue(e.startDate, "Block's start date must be defined"), 
        endDate: ensureValue(e.endDate, "Block's end date must be defined")
      }));

    // Update AWS
    await ActualBlocks.updateForDelayOrExpidite(updatedBlocksForAWS);

    // Update delay in StudentSubfieldTraces
    const currentDelay = ensureValue(
      ensureValue(await StudentSubfieldTraces.findByCompositeKey(studentId, subfieldId)).delay
    );
    
    const delayAdjustment = mode === "delay" ? 1 : -adjustDays(0);
    
    await StudentSubfieldTraces.updateByCompositeKey(studentId, subfieldId, {
      delay: toInt(currentDelay + delayAdjustment),
      ...(updatedEndIndex + 1 === affectedBlocks.length ? { actualEndDate: affectedBlocks[updatedEndIndex].endDate } : {})
    });

    // Update Notion UI
    const updatedBlocksForNotion = affectedBlocks
      .slice(0, updatedEndIndex + 1)
      .map(e => ({
        studentSchedulePageId: ensureValue(e.studentScheduleNotionPageId, "studentScheduleNotionPage is undefined"),
        coachPlanPageId: ensureValue(e.coachPlanNotionPageId, "coachPlanNotionPageId is undefined"),
        startDate: e.startDate,
        endDate: e.endDate
      }));

    const notionCoachPlans = new NotionCoachPlans();
    const notionStudentSchedules = new NotionStudentSchedules();

    await Promise.all(updatedBlocksForNotion.map(async (blockInfo) => {
      await Promise.all([
        notionCoachPlans.updatePageProperties(blockInfo.coachPlanPageId as NotionUUID, {
          outputStartDate: blockInfo.startDate as NotionDate,
          outputEndDate: blockInfo.endDate as NotionDate
        }),
        notionStudentSchedules.updatePageProperties(blockInfo.studentSchedulePageId as NotionUUID, {
          startDate: blockInfo.startDate as NotionDate,
          endDate: blockInfo.endDate as NotionDate
        })
      ]);
    }));

  } catch (error) {
    logger.error(`Something went wrong during ${mode} schedule`, error);
    throw error;
  }
}

export async function calculateNextTrackerAndTodoRemainingCounter(
  studentId: MySQLUintID,
  subfieldId: MySQLUintID, 
  currentActualBlockId: MySQLUintID, 
  currentTracker: Tracker
) {
  try {
    // Current Block Information
    const currentActualBlock = ensureValue(
      await ActualBlocks.findByActualBlockId(currentActualBlockId),
      "There is no current block corresponding to the student tracker. student id:"+`${studentId} and subfield id:${subfieldId}`
    );
    const currentSpeed = ensureValue(currentActualBlock.speed);
    const currentSpace = ensureValue(currentActualBlock.space);
    const maxLap = ensureValue(currentActualBlock.lap);
    const currentBlockSize = ensureValue(currentActualBlock.actualBlockSize);
    const currentBlockOrder = ensureValue(currentActualBlock.blockOrder);
    const currentIsTail = ensureValue(currentActualBlock.isTail);
    // Current Tracker Information
    const currentLap = ensureValue(currentTracker.currentLap, "There is no current lap property in this tracker");
    const currentStudentProblemId = ensureValue(currentTracker.studentProblemId, "There is no student problem property in this tracker");
    const currentProblemInBlockOrder = ensureValue(
      (await StudentProblems.findByStudentProblemId(currentStudentProblemId)).problemInBlockOrder, 
      'There is no student problem'
    );
    const nextProblemInBlockOrder = (currentProblemInBlockOrder < currentBlockSize)? toUint(currentProblemInBlockOrder+1): toUint(1);
    if (currentProblemInBlockOrder+currentSpeed > currentBlockSize && currentLap === maxLap) {
      if (currentIsTail && nextProblemInBlockOrder === 1) {
        const nextTracker: Tracker = {
          isEnabled: false
        }
        const todoRemainingCounter = toUint(0);
        return {
          tracker: nextTracker,
          todoRemainingCounter: todoRemainingCounter
        }
      } else if (currentIsTail) {
        const nextStudentProblem = ensureValue(await StudentProblems.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextProblemInBlockOrder));
        const nextTracker: Tracker = {
          studentProblemId: ensureValue(nextStudentProblem.studentProblemId),
          remainingSpace: currentSpace,
        }
        const todoRemainingCounter = toUint(currentBlockSize - currentProblemInBlockOrder);
        await adjustSchedule(studentId, currentActualBlockId, subfieldId, 'expedite', false);
        return {
          tracker: nextTracker,
          todoRemainingCounter: todoRemainingCounter
        }
      } else {
        const nextBlock = ensureValue(
          await ActualBlocks.findByStudentSubfieldIdAndBlockOrder(studentId, subfieldId, toUint(currentBlockOrder+1)),
          "There is no next block"
        );
        if (nextProblemInBlockOrder === 1) {
          const nextStudentProblem = ensureValue(
            await StudentProblems.findByBlockInfoAndStudentInfo(studentId, ensureValue(nextBlock.actualBlockId), nextProblemInBlockOrder));
          const nextTracker:Tracker = {
            actualBlockId: ensureValue(nextBlock.actualBlockId),
            studentProblemId: ensureValue(nextStudentProblem.studentProblemId),
            remainingSpace: ensureValue(nextBlock.blockOrder),
            currentLap: toUint(1)
          }
          const todoRemainingCounter = ensureValue(nextBlock.speed);
          await adjustSchedule(studentId, currentActualBlockId, subfieldId, 'expedite', true);
          return {
            tracker: nextTracker,
            todoRemainingCounter: todoRemainingCounter
          }
        } else {
          const nextStudentProblem = ensureValue(
            await StudentProblems.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextProblemInBlockOrder),
            "There is no next student problem"
          );
          const nextTracker: Tracker = {
            studentProblemId: ensureValue(nextStudentProblem.studentProblemId),
            remainingSpace: nextBlock.blockOrder,
          }
          const todoRemainingCounter = toUint(
            Math.min(
              currentSpace- (currentBlockSize - currentProblemInBlockOrder), 
              ensureValue(nextBlock.space)) + (currentBlockSize - currentProblemInBlockOrder
              )
            );
          await adjustSchedule(studentId, currentActualBlockId, subfieldId, 'expedite', false);
          return {
            tracker: nextTracker,
            todoRemainingCounter: todoRemainingCounter
          }
        }
      }
    } else if (currentProblemInBlockOrder+currentSpeed > currentBlockSize && nextProblemInBlockOrder === 1) {
      const nextStudentProblem = ensureValue(
        await StudentProblems.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextProblemInBlockOrder)
      );
      const nextTracker: Tracker = {
        studentProblemId: ensureValue(nextStudentProblem.studentProblemId),
        remainingSpace: currentSpace,
        currentLap: toUint(currentLap + 1)
      };
      const todoRemainingCounter = currentSpeed;
      await adjustSchedule(studentId, currentActualBlockId, subfieldId, 'expedite', true);
      return {
        tracker: nextTracker,
        todoRemainingCounter: todoRemainingCounter
      }
    } else {
      const nextStudentProblem = ensureValue(
        await StudentProblems.findByBlockInfoAndStudentInfo(studentId, currentActualBlockId, nextProblemInBlockOrder)
      )
      const nextTracker: Tracker = {
        studentProblemId: ensureValue(nextStudentProblem.studentProblemId),
        remainingSpace: currentSpace,
      };
      const todoRemainingCounter = currentSpeed;
      await adjustSchedule(studentId, currentActualBlockId, subfieldId, 'expedite', false);
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