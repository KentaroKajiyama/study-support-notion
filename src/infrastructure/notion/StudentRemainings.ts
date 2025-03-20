import { DomainStudentRemaining } from "@domain/student/index.js";
import { propertyDomainToRequest, propertyResponseToDomain } from '@infrastructure/notionProperty.js';
import { 
  DatePropertyRequest, 
  DatePropertyResponse, 
  FormulaPropertyResponse, 
  NotionPagePropertyType, 
  SelectPropertyRequest, 
  SelectPropertyResponse, 
  TitlePropertyRequest, 
  TitlePropertyResponse,
  NumberPropertyRequest,
  NumberPropertyResponse,
} from "@domain/types/index.js";
import { logger } from "@utils/index.js";
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";

interface NotionStudentRemainingResponse extends Record<string, any> {
  '科目'?: TitlePropertyResponse;
  '教科'?: SelectPropertyResponse;
  '入試までの日数'?: NumberPropertyResponse;
  '目標日'?: DatePropertyResponse;
  'Student Schedule Page ID'?: FormulaPropertyResponse;
}

interface NotionStudentRemainingRequest extends Record<string, any> {
  '科目'?: TitlePropertyRequest;
  '教科'?: SelectPropertyRequest;
  '入試までの日数'?: NumberPropertyRequest;
  '目標日'?: DatePropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string}> = {
  subfieldName: { type: 'title', name: '科目' },
  subjectName: { type: 'select', name: '教科' },
  remainingDay: { type: 'number', name: '入試までの日数'},
  targetDate: { type: 'date', name: '目標日' },
  pageId: { type: 'formula', name: 'Student Schedule Page ID' },
}

function toDomain(res: NotionStudentRemainingResponse): DomainStudentRemaining {
  try {
    const transformed = {
      subfieldName: 
        res['科目'] !== undefined ? propertyResponseToDomain(res['科目'], 'a subfield name') : undefined,
      subjectName:
        res['教科']!== undefined? propertyResponseToDomain(res['教科'], 'a subject name') : undefined,
      remainingDay:
        res['入試までの日数']!== undefined? propertyResponseToDomain(res['入試までの日数'], 'uint'): undefined,
      targetDate:
        res['目標日']!== undefined? propertyResponseToDomain(res['目標日'], 'start date') : undefined,
      pageId:
        res['Student Schedule Page ID']!== undefined? propertyResponseToDomain(res['Student Schedule Page ID'], 'a page id') : undefined,
    }

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting NotionStudentRemainingResponse to DomainStudentRemaining:', error);
    throw error;
  }
}

function toNotion(data: DomainStudentRemaining): NotionStudentRemainingRequest {
  try {
    const transformed: NotionStudentRemainingRequest = {
      [propertyInfo.subfieldName.name]: 
        data.subfieldName !== undefined? propertyDomainToRequest(data.subfieldName, propertyInfo.subfieldName.type, 'a subfield name') as TitlePropertyRequest: undefined,
      [propertyInfo.subjectName.name]:
        data.subjectName !== undefined? propertyDomainToRequest(data.subjectName, propertyInfo.subjectName.type, 'a subject name') as SelectPropertyRequest: undefined,
      [propertyInfo.remainingDay.name]:
        data.remainingDay !== undefined? propertyDomainToRequest(data.remainingDay, propertyInfo.remainingDay.type, 'uint') as NumberPropertyRequest : undefined,
      [propertyInfo.targetDate.name]: 
        data.targetDate !== undefined ? propertyDomainToRequest({start: data.targetDate, end: null}, propertyInfo.targetDate.type,'date') as DatePropertyRequest : undefined,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting DomainStudentRemaining to NotionStudentRemainingRequest:', error);
    throw error;
  }
}

export class NotionStudentRemainings extends NotionRepository<
  DomainStudentRemaining,
  NotionStudentRemainingResponse,
  NotionStudentRemainingRequest
  > 
    {
    protected toDomain(response: NotionStudentRemainingResponse): DomainStudentRemaining {
      return toDomain(response);
    };
    protected toNotion(data: DomainStudentRemaining): NotionStudentRemainingRequest {
      return toNotion(data);
  };
}