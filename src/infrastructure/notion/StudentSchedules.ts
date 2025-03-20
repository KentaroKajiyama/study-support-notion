import { DomainStudentSchedule } from "@domain/student/index.js";
import { propertyDomainToRequest, propertyResponseToDomain } from '@infrastructure/notionProperty.js';
import { 
  DatePropertyRequest, 
  DatePropertyResponse, 
  FormulaPropertyResponse, 
  NotionPagePropertyType, 
  SelectPropertyRequest, 
  SelectPropertyResponse, 
  TitlePropertyRequest, 
  TitlePropertyResponse
} from "@domain/types/index.js";
import { logger } from "@utils/index.js";
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";

interface NotionStudentScheduleResponse extends Record<string, any> {
  'ブロック名'?: TitlePropertyResponse;
  '科目'?: SelectPropertyResponse;
  '期間'?: DatePropertyResponse;
  'Student Schedule Page ID'?: FormulaPropertyResponse;
}

interface NotionStudentScheduleRequest extends Record<string, any> {
  'ブロック名'?: TitlePropertyRequest;
  '科目'?: SelectPropertyRequest;
  '期間'?: DatePropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string}> = {
  blockName: { type: 'title', name: 'ブロック名' },
  subfieldName: { type: 'select', name: '科目' },
  period: { type: 'date', name: '期間' },
  pageId: { type: 'formula', name: 'Student Schedule Page ID' },
}

function toDomain(res: NotionStudentScheduleResponse): DomainStudentSchedule {
  try {
    const transformed = {
      blockName: 
      res['ブロック名'] !== undefined ? propertyResponseToDomain(res['ブロック名'], 'a mention string') : undefined,
      subfieldName:
      res['科目']!== undefined? propertyResponseToDomain(res['科目'], 'a subfield name') : undefined,
      startDate:
      res['期間']!== undefined? propertyResponseToDomain(res['期間'], 'start date') : undefined,
      endDate:
      res['期間']!== undefined? propertyResponseToDomain(res['期間'], 'end date') : undefined,
      pageId:
      res['Student Schedule Page ID']!== undefined? propertyResponseToDomain(res['Student Schedule Page ID'], 'a page id') : undefined,
    }

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting NotionStudentScheduleResponse to DomainStudentSchedule:', error);
    throw error;
  }
}

function toNotion(data: DomainStudentSchedule): NotionStudentScheduleRequest {
  try {
    const transformed = {
      [propertyInfo.blockName.name]: propertyDomainToRequest(data.blockName, propertyInfo.blockName.type, 'a mention string') as TitlePropertyRequest,
      [propertyInfo.subfieldName.name]: propertyDomainToRequest(data.subfieldName, propertyInfo.subfieldName.type, 'a subfield name') as SelectPropertyRequest,
      [propertyInfo.period.name]: 
        data.startDate !== undefined && data.endDate != undefined ? propertyDomainToRequest({start: data.startDate, end: data.endDate}, propertyInfo.period.type,'date') as DatePropertyRequest : undefined,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting DomainStudentSchedule to NotionStudentScheduleRequest:', error);
    throw error;
  }
}

export class NotionStudentSchedules extends NotionRepository<
  DomainStudentSchedule,
  NotionStudentScheduleResponse,
  NotionStudentScheduleRequest
  > 
    {
    protected toDomain(response: NotionStudentScheduleResponse): DomainStudentSchedule {
      return toDomain(response);
    };
    protected toNotion(data: DomainStudentSchedule): NotionStudentScheduleRequest {
      return toNotion(data);
  };
}