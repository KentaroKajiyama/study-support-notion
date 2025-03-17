import { DomainCoachPlan } from "@domain/coach/index.js";
import { 
  CheckboxPropertyRequest, 
  CheckboxPropertyResponse, 
  DatePropertyRequest, 
  DatePropertyResponse, 
  NotionPagePropertyType, 
  NotionUUID, 
  NumberPropertyRequest, 
  NumberPropertyResponse, 
  SelectPropertyRequest, 
  SelectPropertyResponse, 
  SubfieldsSubfieldNameEnum, 
  TitlePropertyRequest, 
  TitlePropertyResponse 
} from "@domain/types/index.js";
import { 
  propertyDomainToRequest,
  propertyResponseToDomain 
} from "@infrastructure/notionProperty.js";
import {
  logger 
} from "@utils/index.js";
import {
  NotionRepository
} from "@infrastructure/notion/index.js";

interface NotionCoachPlanResponse extends Record<string, any> {
  'ブロック名'?: TitlePropertyResponse;
  '（入力）開始日'?: DatePropertyResponse;
  '（入力）終了日'?: DatePropertyResponse;
  '配信数/回'?: NumberPropertyResponse;
  '配信間隔'?: NumberPropertyResponse
  '周回数'?: NumberPropertyResponse;
  'Order'?: NumberPropertyResponse;
  'レベル'?: SelectPropertyResponse;
  '例外'?: CheckboxPropertyResponse;
  '開始日/終了日'?: DatePropertyResponse;
  '科目'?: SelectPropertyResponse;
  'Coach Plan Page ID'?: SelectPropertyResponse;
}

interface NotionCoachPlanRequest extends Record<string, any> {
  'ブロック名'?: TitlePropertyRequest;
  '（入力）開始日'?: DatePropertyRequest;
  '（入力）終了日'?: DatePropertyRequest;
  '配信数/回'?: NumberPropertyRequest;
  '配信間隔'?: NumberPropertyRequest
  '周回数'?: NumberPropertyRequest;
  'Order'?: NumberPropertyRequest;
  'レベル'?: SelectPropertyRequest;
  '例外'?: CheckboxPropertyRequest;
  '開始日/終了日'?: DatePropertyRequest;
  '科目'?: SelectPropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string}> = {
  blockName: { type: 'title', name: 'ブロック名' },
  inputStartDate: { type: 'date', name: '（入力）開始日' },
  inputEndDate: { type: 'date', name: '（入力）終了日' },
  speed: { type: 'number', name: '配信数/回' },
  space: { type: 'number', name: '配信間隔' },
  lap: { type: 'number', name: '周回数' },
  blockOrder: { type: 'number', name:'Order' },
  problemLevel: { type:'select', name: 'レベル' },
  isIrregular: { type: 'checkbox', name: '例外' },
  outputDate: { type: 'date', name: '開始日/終了日' },
  subfieldName: { type: 'select', name: '科目' },
  pageId: { type: 'formula', name: 'Coach Plan Page ID' },
}

function toDomain(res: NotionCoachPlanResponse): DomainCoachPlan {
  try {
    const transformed = {
      blockName:
        res['ブロック名'] !== undefined? propertyResponseToDomain(res['ブロック名'], 'a mention string'): undefined,
      inputStartDate:
        res['（入力）開始日'] !== undefined? propertyResponseToDomain(res['（入力）開始日'], 'start date'): undefined,
      inputEndDate:
        res['（入力）終了日']!== undefined? propertyResponseToDomain(res['（入力）終了日'], 'end date'): undefined,
      speed:
        res['配信数/回']!== undefined? propertyResponseToDomain(res['配信数/回'], 'uint'): undefined,
      space:
        res['配信間隔']!== undefined? propertyResponseToDomain(res['配信間隔'], 'uint'): undefined,
      lap:
        res['周回数']!== undefined? propertyResponseToDomain(res['周回数'], 'uint'): undefined,
      blockOrder:
        res['Order']!== undefined? propertyResponseToDomain(res['Order'], 'uint'): undefined,
      isIrregular:
        res['例外']!== undefined? propertyResponseToDomain(res['例外'], ''): undefined,
      problemLevel:
        res['レベル']!== undefined? propertyResponseToDomain(res['レベル'], 'a problem level'): undefined,
      outputStartDate:
        res['開始日/終了日']!== undefined? propertyResponseToDomain(res['開始日/終了日'], 'start date'): undefined,
      outputEndDate:
        res['開始日/終了日']!== undefined? propertyResponseToDomain(res['開始日/終了日'], 'end date'): undefined,
      subfieldName:
        res['科目']!== undefined? propertyResponseToDomain(res['科目'], 'a subfield name'): undefined,
      planPageId:
        res['Coach Plan Page ID']!== undefined? propertyResponseToDomain(res['Coach Plan Page ID'], 'a page id'): undefined,
    }; 

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Failed to transform Notion Coach Plan response to Domain CoachPlan', error);
    throw error;
  }
}

function toNotion(data: DomainCoachPlan): NotionCoachPlanRequest {
  try {
    const transformed = {
      [propertyInfo.blockName.name]: propertyDomainToRequest(data.blockName, propertyInfo.blockName.type, 'a mention string') as TitlePropertyRequest,
      [propertyInfo.inputStartDate.name]: 
        data.inputStartDate !== undefined? propertyDomainToRequest({start: data.inputStartDate, end: null}, propertyInfo.inputStartDate.type,'') as DatePropertyRequest : undefined,
      [propertyInfo.inputEndDate.name]: 
        data.inputEndDate !== undefined? propertyDomainToRequest({start: data.inputEndDate, end: null}, propertyInfo.inputEndDate.type, '') as DatePropertyRequest: undefined,
      [propertyInfo.speed.name]: propertyDomainToRequest(data.speed, propertyInfo.speed.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.space.name]: propertyDomainToRequest(data.space, propertyInfo.space.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.lap.name]: propertyDomainToRequest(data.lap, propertyInfo.lap.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.blockOrder.name]: propertyDomainToRequest(data.blockOrder, propertyInfo.blockOrder.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.problemLevel.name]: propertyDomainToRequest(data.problemLevel, propertyInfo.problemLevel.type, 'a problem level') as SelectPropertyRequest,
      [propertyInfo.isIrregular.name]: propertyDomainToRequest(data.isIrregular, propertyInfo.isIrregular.type, '') as CheckboxPropertyRequest,
      [propertyInfo.outputDate.name]:
        data.outputStartDate!== undefined && data.outputEndDate? propertyDomainToRequest({start: data.outputStartDate, end: data.outputEndDate}, propertyInfo.outputStartDate.type, '') as DatePropertyRequest: undefined,
      [propertyInfo.subfieldName.name]: propertyDomainToRequest(data.subfieldName, propertyInfo.subfieldName.type, 'a subfield name') as SelectPropertyRequest,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Failed to transform Domain Coach Plan to Notion Coach Plan request', error);
    throw error;
  }
}

export class NotionCoachPlans extends NotionRepository<
  DomainCoachPlan,
  NotionCoachPlanResponse,
  NotionCoachPlanRequest
> 
{
  protected toDomain(response: NotionCoachPlanResponse): DomainCoachPlan {
    return toDomain(response);
  };
  protected toNotion(data: DomainCoachPlan): NotionCoachPlanRequest {
    return toNotion(data);
  };
  async queryADatabaseWithSubfieldNameFilter(
    databaseId: NotionUUID, 
    filterSubfieldName: SubfieldsSubfieldNameEnum
  ): Promise<DomainCoachPlan[]> {
    try {
      // TODO: How can I automatically deal with this?
      // const propertyType = ensureValue(propertyInfo.SubfieldName.type) as NotionFilterPropertyType
      return await this.queryADatabase(databaseId, [], {
        property: propertyInfo.subfieldName.name,
        select : { equals: filterSubfieldName },
      })
    } catch (error) {
    logger.error('Failed to query a database with subfieldName filter', error);
    throw error;
  }
  };

}