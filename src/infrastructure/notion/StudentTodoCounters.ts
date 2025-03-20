import { DomainStudentTodoCounter } from "@domain/student/index.js";
import { logger } from '@utils/index.js';
import { 
  FormulaPropertyResponse,
  Int,
  NotionPagePropertyType,
  NumberPropertyRequest,
  NumberPropertyResponse,
  SubfieldsSubfieldNameEnum,
  TitlePropertyRequest,
  TitlePropertyResponse, 
  Uint
} from "@domain/types/index.js";
import { propertyDomainToRequest, propertyResponseToDomain } from "@infrastructure/notionProperty.js";
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";


export interface NotionStudentTodoCounterResponse extends Record<string, any> {
  '科目'?: TitlePropertyResponse;
  '残り問題数'?: NumberPropertyResponse;
  '目標日との差'?: NumberPropertyResponse;
  'Student Todo Counter Page ID'?: FormulaPropertyResponse;
}

interface NotionStudentTodoCounterRequest extends Record<string, any> {
  '科目'?: TitlePropertyRequest;
  '残り問題数'?: NumberPropertyRequest;
  '目標日との差'?: NumberPropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string}> = {
  subfieldName: { type: 'title', name: '科目' },
  remainingProblemCount: { type: 'number', name: '残り問題数'},
  delay: { type: 'number', name: '目標日との差' },
  pageId: { type: 'formula', name: 'Student Todo Counter Page ID' },
}

function toDomain(res: NotionStudentTodoCounterResponse): DomainStudentTodoCounter {
  try {
    const transformed: DomainStudentTodoCounter = {
      subfieldName:
        res['科目']!== undefined? propertyResponseToDomain(res['科目'], 'a subfield name') as SubfieldsSubfieldNameEnum: undefined,
      remainingProblemNumber:
        res['残り問題数']!== undefined? propertyResponseToDomain(res['残り問題数'], 'uint') as Uint: undefined,
      delay:
        res['目標日との差']!== undefined? propertyResponseToDomain(res['目標日との差'], 'int') as Int: undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error(`Failed to transform NotionStudentTodoCounterResponse to DomainStudentTodoCounter : ${error}`);
    throw error;
  }
};

function toNotion(data: DomainStudentTodoCounter): NotionStudentTodoCounterRequest {
  try {
    const transformed: NotionStudentTodoCounterRequest = {
      [propertyInfo.subfieldName.name]:
        data.subfieldName!== undefined? propertyDomainToRequest(data.subfieldName, propertyInfo.subfieldName.type, 'a subfield name'): undefined,
      [propertyInfo.remainingProblemCount.name]:
        data.remainingProblemNumber!== undefined? propertyDomainToRequest(data.remainingProblemNumber, propertyInfo.remainingProblemCount.type, 'uint') : undefined,
      [propertyInfo.delay.name]:
        data.delay!== undefined? propertyDomainToRequest(data.delay, propertyInfo.delay.type, 'int') : undefined,
    };
    logger.debug(`transformed: ${JSON.stringify(transformed)}`);
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error(`Failed to transform DomainStudentTodoCounter to NotionStudentTodoCounterRequest : ${error}`);
    throw error;
  }
}

export class NotionStudentTodoCounters extends NotionRepository<
  DomainStudentTodoCounter,
  NotionStudentTodoCounterResponse,
  NotionStudentTodoCounterRequest
>{
  protected toDomain(response: NotionStudentTodoCounterResponse): DomainStudentTodoCounter  {
    return toDomain(response);
  }
  protected toNotion(data: DomainStudentTodoCounter): NotionStudentTodoCounterRequest  {
    logger.debug(`toNotion: ${JSON.stringify(toNotion(data))}`);
    return toNotion(data);
  }
}