import { DomainCoachRest } from "@domain/coach/index.js";
import { propertyDomainToRequest, propertyResponseToDomain } from '@infrastructure/notionProperty.js';
import { 
  DatePropertyRequest, 
  DatePropertyResponse, 
  FormulaPropertyResponse, 
  NotionDate, 
  NotionPagePropertyType, 
  NotionUUID, 
  SelectPropertyRequest, 
  SelectPropertyResponse, 
  SubfieldsSubfieldNameEnum, 
  TitlePropertyRequest, 
  TitlePropertyResponse
} from "@domain/types/index.js";
import { logger } from "@utils/index.js";
import {
  NotionRepository
} from '@infrastructure/notion/index.js';

interface NotionCoachRestResponse extends Record<string, any> {
  'Name'?: TitlePropertyResponse;
  '科目'?: SelectPropertyResponse;
  '開始日/終了日'?: DatePropertyResponse;
  'Coach Rest Page ID'?: FormulaPropertyResponse;
}

interface NotionCoachRestRequest extends Record<string, any> {
  'Name'?: TitlePropertyRequest;
  '科目'?: SelectPropertyRequest;
  '開始日/終了日'?: DatePropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string}> = {
  restName: { type: 'title', name: 'Name' },
  subfieldNames: { type: 'multi_select', name: '科目' },
  period: { type: 'date', name: '開始日/終了日' },
  pageId: { type: 'formula', name: 'Coach Rest Page ID' },
}

function toDomain(res: NotionCoachRestResponse): DomainCoachRest {
  try {
    const transformed: DomainCoachRest = {
      restName: 
      res['Name'] !== undefined ? propertyResponseToDomain(res['Name'], 'a mention string') as string: undefined,
      subfieldNames:
      res['科目']!== undefined? propertyResponseToDomain(res['科目'], 'subfield names') as SubfieldsSubfieldNameEnum[]: undefined,
      startDate:
      res['開始日/終了日']!== undefined? propertyResponseToDomain(res['開始日/終了日'], 'start date') as NotionDate: undefined,
      endDate:
      res['開始日/終了日']!== undefined? propertyResponseToDomain(res['開始日/終了日'], 'end date') as NotionDate : undefined,
      restPageId:
      res['Coach Rest Page ID']!== undefined? propertyResponseToDomain(res['Coach Rest Page ID'], 'a page id') as NotionUUID : undefined,
    }

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting NotionCoachRestResponse to DomainCoachRest:', error);
    throw error;
  }
}

function toNotion(data: DomainCoachRest): NotionCoachRestRequest {
  try {
    const transformed = {
      [propertyInfo.restName.name]: propertyDomainToRequest(data.restName, propertyInfo.restName.type, 'a mention string') as TitlePropertyRequest,
      [propertyInfo.subfieldNames.name]: propertyDomainToRequest(data.subfieldNames, propertyInfo.SubfieldNames.type, 'a subfield name') as SelectPropertyRequest,
      [propertyInfo.period.name]: 
        data.startDate !== undefined && data.endDate != undefined ? propertyDomainToRequest({start: data.startDate, end: data.endDate}, propertyInfo.period.type,'date') as DatePropertyRequest : undefined,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Error converting DomainCoachRest to NotionCoachRestRequest:', error);
    throw error;
  }
}

export class NotionCoachRests extends NotionRepository<
  DomainCoachRest,
  NotionCoachRestResponse,
  NotionCoachRestRequest
  > 
    {
    protected toDomain(response: NotionCoachRestResponse): DomainCoachRest {
      return toDomain(response);
    };
    protected toNotion(data: DomainCoachRest): NotionCoachRestRequest {
      return toNotion(data);
  };
}