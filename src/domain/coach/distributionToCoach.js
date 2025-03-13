import { Subfields } from "../../infrastructure/aws_database/Subfields.js";
import NotionAPI from "../infrastructure/notionAPIotionAPI.js";
import { DefaultBlocks } from "../../infrastructure/aws_database/DefaultBlocks.js";
import { Title } from "../const/notion_template";
import { Date } from "../const/notion_template";
import { Number } from "../const/notion_template";
import { Properties } from "../const/notion_template.js";
import { Parent } from "../const/notion_template.js";
import { ActualBlocks } from "../../infrastructure/aws_database/ActualBlocks.js";
import { StudentsSubfields } from "../infrastructure/aws_database/StudentsSubfields.js";
import { Rests } from "../infrastructure/aws_database/Rest.js";
import { coachPlanProperties } from "../../const/notionDatabaseProperties.js";
import { propertyToNotion } from '../../utils/propertyHandler.js';

// TODO: Confirm whether the arugment should be subfield 'Id' or 'Name'.
export async function sendBlockDefault(studentId, planDBId, irregularDBId, subfieldId, subfieldLevel) {
  try {
    // 0. Delete all the existing blocks in the coach db & irregular db
    const subfieldName = await Subfields.findBySubfieldId(subfieldId)[0].subfield_name;
    const filter = {
      property: coachPlanProperties.subfieldName.name,
      select: { 'equals': subfieldName },
    };
    const existingBlocksInCoachPlan = await NotionAPI.queryADatabase(planDBId, filter=filter).results;
    const promises = existingBlocksInCoachPlan.map(async block => await NotionAPI.deleteABlock(block.id));
    const existingBlocksInIrregular = await NotionAPI.queryADatabase(irregularDBId, filter=filter).results;
    promises.push(existingBlocksInIrregular.map(async block => await NotionAPI.deleteABlock(block.id)));
    // 1. fetch the information from aws
    const defaultBlocks = await DefaultBlocks.findBySubfieldIdUnderSpecificLevel(subfieldId, subfieldLevel);
    const acutalBlocks = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    // 2. send the block to the coach db
    // sort in descending order
    const blockPageIdDict = {};
    defaultBlocks.sort((a, b) = b.block_order - a.block_order);
    promises.push(async () => {
      for (const block of defaultBlocks) {
        const parent = Parent('database_id', planDBId);
        const response = await NotionAPI.createAPage(parent=parent, properties=Properties([
          propertyToNotion({
            propertyName: coachPlanProperties.blockName.name,
            propertyContent: block.block_name,
            propertyType: coachPlanProperties.blockName.type,
          }),
          propertyToNotion({
            propertyName: coachPlanProperties.speed.name,
            propertyContent: block.speed,
            propertyType: coachPlanProperties.speed.type,
          }),
          propertyToNotion({
            propertyName: coachPlanProperties.space.name,
            propertyContent: block.space,
            propertyType: coachPlanProperties.space.type,
          }),
          propertyToNotion({
            propertyName: coachPlanProperties.lap.name,
            propertyContent: block.lap,
            propertyType: coachPlanProperties.lap.type,
          }),
          propertyToNotion({
            propertyName: coachPlanProperties.subfieldName.name,
            propertyContent: subfieldName,
            propertyType: coachPlanProperties.subfieldName.type,
          }),
          propertyToNotion({
            propertyName: coachPlanProperties.blockOrder.name,
            propertyContent: block.block_order,
            propertyType: coachPlanProperties.blockOrder.type,
          }),
        ]));
        if(acutalBlocks.length === 0) blockPageIdDict[block.default_block_id] = response.id;
        logger.info(`Created block "${block.block_name}" with properties "${properties}"`);
      }
    })
    await Promise.all(promises);
    // 3. Check if it's initialiezation or not
    if (acutalBlocks.length === 0) {
      // TODO: Add page id in student block page and plans.
      await ActualBlocks.createMultiple(defaultBlocks.map(async block => {
        return convertToSnakeCase({
          studentId: studentId,
          subfieldId: subfieldId,
          defaultBlockId: block.default_block_id,
          actualBlockName: block.block_name,
          blockOrder: block.block_order,
          space: block.space,
          speed: block.speed,
          lap: block.lap,
          notionPageIdForCoachPlan: blockPageIdDict[block.default_block_id]
        });
      }))
    }
  } catch(error) {
    logger.error("Error in sendBlockDefault", error.message);
    throw error;
  }
}



// TODO: implement
export async function sendNecessaryStudyTimes(studentId, databaseId){
  // 0. fetch all problems the student has
  const subfieldIds = await StudentsSubfields.findByStudentID(studentId);
  const actualBlocks = {};
  const subfieldNames = [];
  Promise.all(subfieldIds.map(async subfieldId => {
    const actualBlocksInSubfield = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    const subfieldName = await Subfields.findBySubfieldId(subfieldId)[0].subfield_name;
    subfieldNames.push(subfieldName);
    // sort in ascending
    actualBlocksInSubfield.sort((a,b) => a.head_order - b.head_order);
    actualBlocks[subfieldName] = actualBlocksInSubfield;
  }));
  // 1. explore the all patterns of the study times
  // TODO: You have to care about the rest of the students.
  const isPatternExists = (pattern, table) => {
    const index = table.findIndex(row =>
      Object.keys(pattern).every(key => row[key] === pattern[key])
    );
    return { exists: index !== -1, index };
};
  const necessaryStudyTimes = [];
  let date = addDays(new Date(), 1);
  const tmpTracker = (async () => {
    const result = {};
    for (const subfieldName of subfieldNames) {
      const defaultBlockId = actualBlocks[subfieldName][0].default_block_id;
      const averageExpectedTime = await DefaultBlocks.findByDefaultBlockId(defaultBlockId)[0].average_expected_time;
      const space = actualBlocks[subfieldName][0].space;
      const speed = actualBlocks[subfieldName][0].speed;
      const repeat = actualBlocks[subfieldName][0].number_of_repeats;
      const tailOrder = actualBlocks[subfieldName][0].tail_order;
      result[subfieldName] = {
        defaultBlockId: defaultBlockId,
        averageExpectedTime: averageExpectedTime,
        problemCussor: 1, 
        remainingSpace: 0, 
        space: space, 
        blockCussor: 0, 
        lap: 1, 
        repeat: repeat, 
        speed: speed, 
        headOrder: 1, 
        tailOrder: tailOrder,
        endFlag: 0
      };
    }
    return result;
  })();
  const rests = (async ()=>{
    let result = {};
    for(const subfieldName of subfieldNames) {
      const subfieldId = actualBlocks[subfieldName][0].subfieldId;
      const restStartDate = await Rests.findByCompositeKey(studentId, subfieldId)[0].start_date;
      const restEndDate = await Rests.findByCompositeKey(studentId, subfieldId)[0].end_date;
      result[subfieldName] = []
      for(let i=1; i<actualBlock.number_of_repeats; i++){
        result[subfieldName].push(
          { 
            startDate: restStartDate,
            endDate: restEndDate,
          }
        );
      }
    }
    return result;
  })();
  const checkRest = (subfieldName, date) => {
    let result = false;
    for (let i=0; i<length.rests[subfieldName]; i++){
      const restStartDate = rests[subfieldName][i]
      const restEndDate = rests[subfieldName][i]
      if (date >= restStartDate && date <= restEndDate) {
        result = true;
      }
    }
    return result;
  }
  // explore each subfield
  let multipleEndFlag = (() => {
    let result = 1;
    subfieldNames.forEach(subfieldName => {
      result *= tmpTracker[subfieldName].endFlag;
    });
    return result;
  })();
  let order = 1;
  let totalNumber = 0
  while (!multipleEndFlag) {
    totalNumber++;
    let candidate = (async () => {
      let result = {};
      for (const subfieldName of subfieldNames) {
        const tmpTrackerSub = tmpTracker[subfieldName]
        if (tmpTrackerSub.endFlag){
          result[subfieldName] = 0;
        } else if(checkRest(date, subfieldName)){
          result[subfieldName] = 0;
        } else if (tmpTrackerSub.remainingSpace > 0){
          result[subfieldName] = 0;
          tmpTrackerSub.remainingSpace -= 1;
        } else if (tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 < tmpTrackerSub.tailOrder) {
          result[subfieldName] = tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime;
          tmpTrackerSub.problemCussor += tmpTrackerSub.speed;
          tmpTrackerSub.remainingSpace = tmpTrackerSub.space;
        } else if (tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 === tmpTrackerSub.tailOrder && tmpTrackerSub.lap < tmpTrackerSub.repeat){
          result[subfieldName] = tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime;
          tmpTrackerSub.problemCussor = tmpTrackerSub.headOrder;
          tmpTrackerSub.remainingSpace = tmpTrackerSub.space;
          tmpTrackerSub.lap += 1;
        } else if (tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 === tmpTrackerSub.tailOrder){
          if (tmpTrackerSub.blockCussor+1 === actualBlocks[subfieldName].length){
            result[subfieldName] = tmpTrackerSub.averageExpectedTime*tmpTrackerSub.speed
            tmpTrackerSub.endFlag = 1;
          } else {
            result[subfieldName] = tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime;
            const nextActualBlock = actualBlocks[tmpTrackerSub.blockCussor+1]
            const nextDefaultBlockId = nextActualBlock.default_block_id;
            const nextAverageExpectedTime = await DefaultBlocks.findByDefaultBlockId(nextDefaultBlockId)[0].average_expected_time;
            const nextProblemCussor = nextActualBlock.problemCussor+tmpTrackerSub.speed;
            result[subfieldName] = tmpTrackerSub.spped * tmpTrackerSub.averageExpectedTime 
            tmpTrackerSub.defaultBlockId = nextDefaultBlockId;
            tmpTrackerSub.averageExpectedTime = nextAverageExpectedTime;
            tmpTrackerSub.problemCussor = nextProblemCussor;
            tmpTrackerSub.remainingSpace = nextActualBlock.space;
            tmpTrackerSub.space = nextActualBlock.space;
            tmpTrackerSub.blockCussor += 1;
            tmpTrackerSub.lap = 0;
            tmpTrackerSub.repeat = nextActualBlock.repeat;
            tmpTrackerSub.speed = nextActualBlock.speed;
            tmpTrackerSub.headOrder = nextActualBlock.headOrder;
            tmpTrackerSub.tailOrder = nextActualBlock.tailOrder;
          }
        } else if (tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 > tmpTrackerSub.tailOrder && tmpTrackerSub.lap < tmpTrackerSub.repeat ){
          result[subfieldName] = tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime;
          tmpTrackerSub.problemCussor = tmpTrackerSub.headOrder + tmpTrackerSub.speed - (tmpTrackerSub.tailOrder - tmpTrackerSub.problemCussor + 1 );
          tmpTrackerSub.remainingSpace = tmpTrackerSub.space;
          tmpTrackerSub.lap += 1;
        } else {
          if (tmpTrackerSub.blockCussor+1 === actualBlocks[subfieldName].length){
            result[subfieldName] = tmpTrackerSub.averageExpectedTime*(tmpTrackerSub.tailOrder - tmpTrackerSub.problemCussor + 1);
            tmpTrackerSub.endFlag = 1;
          } else {
            const nextActualBlock = actualBlocks[tmpTrackerSub.blockCussor+1]
            const nextSpeed = nextActualBlock.speed;
            const secondDist = Math.min(tmpTracker.speed - (tmpTrackerSub.tailOrder-tmpTrackerSub.problemCussor+1), nextSpeed);
            const nextDefaultBlockId = nextActualBlock.default_block_id;
            const nextAverageExpectedTime = await DefaultBlocks.findByDefaultBlockId(nextDefaultBlockId)[0].average_expected_time;
            const nextProblemCussor = nextActualBlock.problemCussor+secondDist+1;
            result[subfieldName] = (tmpTrackerSub.tailOrder-tmpTrackerSub.problemCussor+1)*tmpTrackerSub.averageExpectedTime + nextDist*nextAverageExpectedTime;
            tmpTrackerSub.defaultBlockId = nextDefaultBlockId;
            tmpTrackerSub.averageExpectedTime = nextAverageExpectedTime;
            tmpTrackerSub.problemCussor = nextProblemCussor;
            tmpTrackerSub.remainingSpace = nextActualBlock.space;
            tmpTrackerSub.space = nextActualBlock.space;
            tmpTrackerSub.blockCussor += 1;
            tmpTrackerSub.lap = 0;
            tmpTrackerSub.repeat = nextActualBlock.repeat;
            tmpTrackerSub.speed = nextActualBlock.speed;
            tmpTrackerSub.headOrder = nextActualBlock.headOrder;
            tmpTrackerSub.tailOrder = nextActualBlock.tailOrder;
          }
        }
      }
      return result;
    })();
    const { exists, index} = isPatternExists(candidate, necessaryStudyTimes);
    if (!exists){
      candidate["回数"] = 1;
      candidate["Order"] = order;
      order++;
      necessaryStudyTimes.push(candidate);
    } else {
      necessaryStudyTimes[index]["回数"] += 1;
    }
    multipleEndFlag = (() => {
      let result = 1;
      subfieldNames.forEach(subfieldName => {
        result *= tmpTracker[subfieldName].endFlag;
      });
      return result;
    })();
    date = addDays(date, 1);
  }
  // 2. send necessary study time data
  Promise.all(necessaryStudyTimes.map(async row => {
    const properties = Properties()
    Object.entries(row).forEach(
      ([key, value]) => {
        properties.addProperty(Number(key, value).getJSON());
      }
    );
    const total = Number("合計日数", totalNumber).getJSON();
    const title = Title("パターン", `パターン${row.Order}`);
    properties.addProperty(total);
    properties.addProperty(title);
    const parent = Parent("database_id", databaseId);
    await NotionAPI.createAPage(parent=parent, properties=properties);
  }))
}


