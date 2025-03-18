import {
  MySQLUintID, 
  NotionUUID,
  ActualBlocksProblemLevelEnum, 
  SubfieldsSubfieldNameEnum,
  Uint,
  toUint,
  NotionDate
} from '@domain/types/index.js';
import {
  Subfields,
  DefaultBlocks,
  ActualBlocks,
  ActualBlock,
  StudentSubfieldTraces,
  Rests,
} from '@infrastructure/mysql/index.js';
import { 
  ensureValue,
  logger, 
  isDate1EarlierThanOrSameWithDate2,
  isDateBetween,
  formatDateWithOffset, 
  myAddDays
} from "@utils/index.js";
import { 
  NotionCoachIrregulars,
  NotionCoachPlans 
} from "@infrastructure/notion/index.js";
import { DomainCoachPlan } from "@domain/coach/CoachPlan.js";
import { DomainNecessaryStudyTime } from "@domain/coach/NecessaryStudyTime.js";
import { sum } from "lodash";
import { NotionNecessaryStudyTimes } from "@infrastructure/notion/NecessaryStudyTimes.js";

// TODO: Confirm whether the arugment should be subfield 'Id' or 'Name'.
export async function sendBlockDefault(
  studentId: MySQLUintID,
  planDBId: NotionUUID, 
  irregularDBId: NotionUUID, 
  subfieldId: MySQLUintID, 
  subfieldLevel: ActualBlocksProblemLevelEnum
) {
  try {
    // Instatiation of notion database class.
    const notionCoachPlans = new NotionCoachPlans();
    const notionCoachIrregulars = new NotionCoachIrregulars();
    // 0. Delete all the existing blocks in the coach db & irregular db
    const subfieldName = ensureValue(
      ensureValue(await Subfields.findBySubfieldId(subfieldId)).subfieldName
    );
    const existingBlocksInCoachPlan = await notionCoachPlans.queryADatabaseWithSubfieldNameFilter(planDBId, subfieldName);
    const promises = existingBlocksInCoachPlan
      .map(async block => await notionCoachPlans.deleteAPage(
        ensureValue(
          block.planPageId, 
          'There is a problem in notionCoachPlans.queryWithSubfieldNameFilter because the elements of the result of the function has no plan page id attribute.'
        )
      )) as Promise<any>[];
    const existingBlocksInIrregular = await notionCoachIrregulars.queryADatabaseWithSubfieldFilter(irregularDBId, subfieldName);
    promises.push(
      existingBlocksInIrregular
      .map(async block => await notionCoachIrregulars.deleteAPage(
        ensureValue(
          block.irregularPageId,
          'There is a problem in notionCoachIrregulars.queryWithSubfieldNameFilter because the elements of the result of the function has no irregular page id attribute.')
      )) as unknown as Promise<any>
    );
    // 1. fetch the information from aws
    const defaultBlocks = await DefaultBlocks.findBySubfieldIdUnderSpecificLevel(subfieldId, subfieldLevel);
    const acutalBlocks = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    // 2. send the block to the coach db
    // sort in descending order
    const blockPageIdDict: Record<MySQLUintID, NotionUUID> = {};
    defaultBlocks.sort(
      (a, b) => ensureValue(b.blockOrder) - ensureValue(a.blockOrder)
    );
    promises.push((async () => {
      for (const block of defaultBlocks) {
        const domainProperties: DomainCoachPlan = {
          blockName: ensureValue(block.blockName),
          speed: ensureValue(block.speed),
          space: ensureValue(block.space),
          lap: ensureValue(block.lap),
          blockOrder: ensureValue(block.blockOrder),
          subfieldName: subfieldName,
        }
        const createdPageId = await notionCoachPlans.createAPageOnlyWithProperties(
          planDBId,
          "database_id",
          domainProperties,
        )
        if(acutalBlocks.length === 0) blockPageIdDict[ensureValue(block.defaultBlockId)] = ensureValue(createdPageId);
        logger.info(`Created block "${block.blockName}" with properties "${domainProperties}"`);
      }
    })())
    await Promise.all(promises);
    // 3. Check if it's initialiezation or not
    if (acutalBlocks.length === 0) {
      // TODO: Add page id in student block page and plans.
      const newActualBlocks: ActualBlock[] = defaultBlocks.map(block => {
        return {
          studentId: studentId,
          subfieldId: subfieldId,
          defaultBlockId: block.defaultBlockId,
          actualBlockName: block.blockName,
          blockOrder: block.blockOrder,
          space: block.space,
          speed: block.speed,
          lap: block.lap,
          coachPlanNotionPageId: blockPageIdDict[ensureValue(block.defaultBlockId)]
        }
      });
      await ActualBlocks.createMultiple(newActualBlocks);
    }
  } catch(error) {
    logger.error("Error in sendBlockDefault", error);
    throw error;
  }
}


type SpecifiecTmpTracker = {
  defaultBlockId: MySQLUintID
  averageExpectedTime: Uint
  problemCussor: Uint
  remainingSpace: Uint 
  space: Uint 
  blockCussor: Uint 
  currentLap: Uint
  lap: Uint
  speed: Uint 
  startDate: NotionDate
  endDate: NotionDate
  actualBlockSize: Uint
  isTail: boolean
  endFlag: number
}

type TmpTracker = Record<SubfieldsSubfieldNameEnum, SpecifiecTmpTracker>;

type NecessaryStudyTimePattern = Record<SubfieldsSubfieldNameEnum, Uint> & {
  howManyTimes?: Uint,
  order?: Uint,
};

type RestRow = {
  startDate: NotionDate;
  endDate: NotionDate;
}

type RestData = Record<SubfieldsSubfieldNameEnum, RestRow[]>;

// TODO: implement
export async function sendNecessaryStudyTimes(
  studentId: MySQLUintID,
  databaseId: NotionUUID
){
  // 0. fetch all problems the student has
  const subfieldIds = (await StudentSubfieldTraces.findByStudentId(studentId))
    .map(trace => trace.subfieldId)
    .filter(subfieldId => subfieldId !== undefined);
  const actualBlocks: Partial<Record<SubfieldsSubfieldNameEnum, ActualBlock[]>> = {}
  const subfieldNames: SubfieldsSubfieldNameEnum[] = [];
  Promise.all(subfieldIds.map(async subfieldId => {
    const actualBlocksInSubfield = await ActualBlocks.findByStudentIdAndSubfieldId(studentId, subfieldId);
    const subfieldName = ensureValue(
      ensureValue(await Subfields.findBySubfieldId(subfieldId)).subfieldName
    );
    subfieldNames.push(subfieldName);
    // sort in ascending
    actualBlocksInSubfield.sort((a,b) => ensureValue(a.blockOrder) - ensureValue(b.blockOrder));
    actualBlocks[subfieldName] = actualBlocksInSubfield;
  }));
  // 1. explore the all patterns of the study times
  // TODO: You have to care about the rest of the students.
  const isPatternExists = (pattern: NecessaryStudyTimePattern, table: NecessaryStudyTimePattern[]) => {
    const index = table.findIndex(row =>
      Object.keys(pattern).every(key => row[key as SubfieldsSubfieldNameEnum] === pattern[key as SubfieldsSubfieldNameEnum])
    );
    return { exists: index !== -1, index: index };
  };
  const necessaryStudyTimes: NecessaryStudyTimePattern[] = [];

  let trackDate = formatDateWithOffset(new Date(), false, false);

  const tmpTracker: TmpTracker = await (async () => {
    const result: Partial<TmpTracker> = {};
    for (const subfieldName of subfieldNames) {
      const specificActualBlocks = ensureValue(actualBlocks[subfieldName]);
      const defaultBlockId = ensureValue(specificActualBlocks[0].defaultBlockId);
      // TODO: Input default average expected time.
      const averageExpectedTime = ensureValue(await DefaultBlocks.findByDefaultBlockId(defaultBlockId)).averageExpectedTime ?? toUint(15);
      const space = ensureValue(specificActualBlocks[0].space);
      const speed = ensureValue(specificActualBlocks[0].speed);
      const lap = ensureValue(specificActualBlocks[0].lap);
      const actualBlockSize = ensureValue(specificActualBlocks[0].actualBlockSize);
      const startDate = ensureValue(specificActualBlocks[0].startDate);
      const endDate = ensureValue(specificActualBlocks[0].endDate);
      const isTail = ensureValue(specificActualBlocks[0].isTail);
      result[subfieldName] = {
        defaultBlockId: defaultBlockId,
        averageExpectedTime: averageExpectedTime,
        problemCussor: toUint(1), 
        remainingSpace: toUint(0), 
        space: space, 
        blockCussor: toUint(0), 
        currentLap: toUint(1),
        lap: lap, 
        speed: speed, 
        startDate: startDate,
        endDate: endDate, 
        actualBlockSize: actualBlockSize,
        isTail: isTail,
        endFlag: 0,
      };
    }
    return result as TmpTracker;
  })();
  const restData: RestData = await (async ()=>{
    let result: Partial<RestData> = {};
    for(const subfieldName of subfieldNames) {
      const specificActualBlocks = ensureValue(actualBlocks[subfieldName]);
      const subfieldId = ensureValue(specificActualBlocks[0].subfieldId);
      const specificRests = await Rests.findByCompositeKey(studentId, subfieldId)
      if (specificRests.length === 0) {
        result[subfieldName] = [];
        continue;
      } else {
        specificRests.sort((a,b) => {
          if (isDate1EarlierThanOrSameWithDate2(ensureValue(a.startDate), ensureValue(b.endDate))) {
            return 1;
          } else {
            return -1;
          }
        });
        for (const restRow of specificRests) {
          if (result[subfieldName] === undefined) {
            result[subfieldName] = [{
              startDate: ensureValue(restRow.startDate),
              endDate: ensureValue(restRow.endDate)
            }];
          } else {
            result[subfieldName].push({
              startDate: ensureValue(restRow.startDate),
              endDate: ensureValue(restRow.endDate)
            })
          }
        }
      }
    }
    return result as RestData;
  })();
  const checkRest = (subfieldName: SubfieldsSubfieldNameEnum, date: NotionDate) => {
    let result = false;
    for (let i=0; i<restData[subfieldName].length; i++){
      const restStartDate = restData[subfieldName][i].startDate;
      const restEndDate = restData[subfieldName][i].endDate;
      if (isDateBetween(date, restStartDate, restEndDate)) {
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
  let order = toUint(1);
  let totalNumber = 0
  while (!multipleEndFlag) {
    totalNumber++;
    const candidate = await (async () => {
      let result: Partial<NecessaryStudyTimePattern> = {};
      for (const subfieldName of subfieldNames) {
        const tmpTrackerSub = tmpTracker[subfieldName]
        const specificActualBlocks = ensureValue(actualBlocks[subfieldName]);
        if (tmpTrackerSub.endFlag){
          result[subfieldName] = toUint(0);
        } else if (!isDate1EarlierThanOrSameWithDate2(tmpTrackerSub.startDate, trackDate)){
          result[subfieldName] = toUint(0);
        } else if(checkRest(subfieldName, trackDate)){
          result[subfieldName] = toUint(0);
        } else if (tmpTrackerSub.remainingSpace > 0){
          result[subfieldName] = toUint(0);
          tmpTrackerSub.remainingSpace = toUint(tmpTrackerSub.remainingSpace - 1);
        } else if (tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 < tmpTrackerSub.actualBlockSize) {
          result[subfieldName] = toUint(tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime);
          tmpTrackerSub.problemCussor = toUint(tmpTrackerSub.problemCussor + tmpTrackerSub.speed);
          tmpTrackerSub.remainingSpace = tmpTrackerSub.space;
        } else if (
          tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 === tmpTrackerSub.actualBlockSize 
          && tmpTrackerSub.currentLap < tmpTrackerSub.lap
        ) {
          result[subfieldName] = toUint(tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime);
          tmpTrackerSub.problemCussor = toUint(1);
          tmpTrackerSub.remainingSpace = tmpTrackerSub.space;
          tmpTrackerSub.currentLap = toUint(tmpTrackerSub.currentLap + 1);
        } else if (tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 === tmpTrackerSub.actualBlockSize){
          if (tmpTrackerSub.blockCussor+1 === specificActualBlocks.length){
            result[subfieldName] = toUint(tmpTrackerSub.averageExpectedTime*tmpTrackerSub.speed)
            tmpTrackerSub.endFlag = 1;
          } else {
            result[subfieldName] = toUint(tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime);
            const nextActualBlock = specificActualBlocks[tmpTrackerSub.blockCussor+1]
            const nextDefaultBlockId = ensureValue(nextActualBlock.defaultBlockId);
            const nextAverageExpectedTime = ensureValue(
              ensureValue(await DefaultBlocks.findByDefaultBlockId(nextDefaultBlockId)).averageExpectedTime
            );
            const nextProblemCussor = toUint(1);
            result[subfieldName] = toUint(tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime)
            tmpTrackerSub.defaultBlockId = nextDefaultBlockId;
            tmpTrackerSub.averageExpectedTime = nextAverageExpectedTime;
            tmpTrackerSub.problemCussor = nextProblemCussor;
            tmpTrackerSub.remainingSpace = ensureValue(nextActualBlock.space);
            tmpTrackerSub.space = ensureValue(nextActualBlock.space);
            tmpTrackerSub.blockCussor = toUint(tmpTrackerSub.blockCussor + 1);
            tmpTrackerSub.currentLap = toUint(0);
            tmpTrackerSub.lap = ensureValue(nextActualBlock.lap);
            tmpTrackerSub.speed = ensureValue(nextActualBlock.speed);
            tmpTrackerSub.actualBlockSize = ensureValue(nextActualBlock.actualBlockSize);
            tmpTrackerSub.isTail = ensureValue(nextActualBlock.isTail);
          }
        } else if (
          tmpTrackerSub.problemCussor + tmpTrackerSub.speed -1 > tmpTrackerSub.actualBlockSize 
          && tmpTrackerSub.currentLap < tmpTrackerSub.lap 
        ){
          result[subfieldName] = toUint(tmpTrackerSub.speed * tmpTrackerSub.averageExpectedTime);
          tmpTrackerSub.problemCussor = toUint(1 + tmpTrackerSub.speed - (tmpTrackerSub.actualBlockSize - tmpTrackerSub.problemCussor + 1 ));
          tmpTrackerSub.remainingSpace = tmpTrackerSub.space;
          tmpTrackerSub.lap = toUint(tmpTrackerSub.lap + 1);
        } else {
          if (tmpTrackerSub.blockCussor+1 === specificActualBlocks.length){
            result[subfieldName] = toUint(tmpTrackerSub.averageExpectedTime*(tmpTrackerSub.actualBlockSize - tmpTrackerSub.problemCussor + 1));
            tmpTrackerSub.endFlag = 1;
          } else {
            const nextActualBlock = ensureValue(actualBlocks[subfieldName])[tmpTrackerSub.blockCussor+1]
            const nextSpeed = ensureValue(nextActualBlock.speed);
            const secondDist = Math.min(tmpTrackerSub.speed - (tmpTrackerSub.actualBlockSize-tmpTrackerSub.problemCussor+1), nextSpeed);
            const nextDefaultBlockId = ensureValue(nextActualBlock.defaultBlockId);
            const nextAverageExpectedTime = ensureValue(
              ensureValue(await DefaultBlocks.findByDefaultBlockId(nextDefaultBlockId)).averageExpectedTime
            );
            const nextProblemCussor = toUint(secondDist+1);
            result[subfieldName] = toUint((tmpTrackerSub.actualBlockSize-tmpTrackerSub.problemCussor+1)*tmpTrackerSub.averageExpectedTime + secondDist*nextAverageExpectedTime);
            tmpTrackerSub.defaultBlockId = nextDefaultBlockId;
            tmpTrackerSub.averageExpectedTime = nextAverageExpectedTime;
            tmpTrackerSub.problemCussor = nextProblemCussor;
            tmpTrackerSub.remainingSpace = ensureValue(nextActualBlock.space);
            tmpTrackerSub.space = ensureValue(nextActualBlock.space);
            tmpTrackerSub.blockCussor = toUint(tmpTrackerSub.blockCussor + 1);
            tmpTrackerSub.currentLap = toUint(0);
            tmpTrackerSub.lap = ensureValue(nextActualBlock.lap);
            tmpTrackerSub.speed = ensureValue(nextActualBlock.speed);
            tmpTrackerSub.actualBlockSize = ensureValue(nextActualBlock.actualBlockSize);
            tmpTrackerSub.isTail = ensureValue(nextActualBlock.isTail);
          }
        }
      }
      return result as NecessaryStudyTimePattern;
    })();
    const { exists, index } = isPatternExists(candidate, necessaryStudyTimes);
    if (!exists){
      candidate.howManyTimes= toUint(1);
      candidate.order = order;
      order = toUint(order + 1);
      necessaryStudyTimes.push(candidate);
    } else {
      necessaryStudyTimes[index].howManyTimes = toUint(necessaryStudyTimes[index].howManyTimes as Uint + 1);
    }
    multipleEndFlag = (() => {
      let result = 1;
      subfieldNames.forEach(subfieldName => {
        result *= tmpTracker[subfieldName].endFlag;
      });
      return result;
    })();
    trackDate = myAddDays(trackDate, 1);
  }
  // 2. send necessary study time data
  const notionNecessaryStudyTimes = new NotionNecessaryStudyTimes();
  const domainNecessaryStudyTimes = necessaryStudyTimes
                                    .map(subfieldAssignHelper)
                                    .sort((a,b) => ensureValue(a.order) - ensureValue(b.order));
  const totalOpportunity = sum(domainNecessaryStudyTimes.map(e => e.howManyTimes));
  domainNecessaryStudyTimes.forEach(e => e.totalOpportunity = toUint(totalOpportunity));

  await Promise.all(
    domainNecessaryStudyTimes.map(async domain => await notionNecessaryStudyTimes
      .createAPageOnlyWithProperties(
        databaseId,
        'database_id',
        domain
      ))
  );
}

export function subfieldAssignHelper(necessaryStudyTimePattern: NecessaryStudyTimePattern): DomainNecessaryStudyTime{
  try {
    const result: Partial<DomainNecessaryStudyTime> = {};
    for (const field in necessaryStudyTimePattern) {
      switch (field) {
        case "現代文":
          result.modernJapanese = necessaryStudyTimePattern[field] ?? toUint(0);
          break;
        case "古文":
          result.ancientJapanese = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "漢文":
          result.ancientChinese = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "数学":
          result.math = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "Reading":
          result.reading = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "Listening&Speaking":
          result.listeningAndSpeaking = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "Writing":
          result.writing = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "物理":
          result.physics = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "化学":
          result.chemistry = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "生物":
          result.biology = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "日本史":
          result.japaneseHistory = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "世界史":
          result.worldHistory = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "地理":
          result.geography = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "howManyTimes":
          result.howManyTimes = necessaryStudyTimePattern[field]?? toUint(0);
          break;
        case "order":
          result.order = necessaryStudyTimePattern[field]?? toUint(0);
          result.pattern = `パターン ${necessaryStudyTimePattern[field]?? toUint(0)}`
          break;
        default:
          throw new Error(`Unknown field: ${field}`);
      } 
    };
    return result as DomainNecessaryStudyTime;
  } catch (error) {
    logger.error(`Error in subfieldAssignHelper: ${error}`);
    throw error;
  }
}

