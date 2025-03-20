import { DomainStudentActualBlock } from "@domain/student/index.js";
import { 
  ActualBlocksProblemLevelEnum,
  DatePropertyRequest, 
  DatePropertyResponse, 
  NotionDate, 
  NotionPagePropertyType, 
  NotionUUID, 
  NumberPropertyRequest, 
  NumberPropertyResponse, 
  RelationPropertyRequest, 
  RelationPropertyResponse, 
  SelectPropertyRequest, 
  SelectPropertyResponse, 
  TitlePropertyRequest, 
  TitlePropertyResponse, 
  Uint
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
} from "@infrastructure/notion/NotionRepository.js";

interface NotionStudentActualBlockResponse extends Record<string, any> {
  'ブロック名'?: TitlePropertyResponse;
  '開始日/終了日'?: DatePropertyResponse;
  '問題参照'?: RelationPropertyResponse;
  '配信数/回'?: NumberPropertyResponse;
  '配信間隔'?: NumberPropertyResponse
  '周回数'?: NumberPropertyResponse;
  'Order'?: NumberPropertyResponse;
  'レベル'?: SelectPropertyResponse;
  'Coach Plan Page ID'?: SelectPropertyResponse;
}

interface NotionStudentActualBlockRequest extends Record<string, any> {
  'ブロック名'?: TitlePropertyRequest;
  '開始日/終了日'?: DatePropertyRequest;
  '問題参照'?: RelationPropertyRequest;
  '配信数/回'?: NumberPropertyRequest;
  '配信間隔'?: NumberPropertyRequest
  '周回数'?: NumberPropertyRequest;
  'Order'?: NumberPropertyRequest;
  'レベル'?: SelectPropertyRequest;
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string}> = {
  blockName: { type: 'title', name: 'ブロック名' },
  outputDate: { type: 'date', name: '開始日/終了日' },
  studentProblemRelations: { type: 'relation', name: '問題参照'},
  speed: { type: 'number', name: '配信数/回' },
  space: { type: 'number', name: '配信間隔' },
  lap: { type: 'number', name: '周回数' },
  blockOrder: { type: 'number', name:'Order' },
  problemLevel: { type:'select', name: 'レベル' },
  pageId: { type: 'formula', name: 'Coach Plan Page ID' },
}

function toDomain(res: NotionStudentActualBlockResponse): DomainStudentActualBlock {
  try {
    const transformed: DomainStudentActualBlock = {
      blockName:
        res['ブロック名'] !== undefined? propertyResponseToDomain(res['ブロック名'], 'string') as string: undefined,
      problemLevel:
        res['レベル']!== undefined? propertyResponseToDomain(res['レベル'], 'a problem level') as ActualBlocksProblemLevelEnum: undefined,
      speed:
        res['配信数/回']!== undefined? propertyResponseToDomain(res['配信数/回'], 'uint') as Uint: undefined,
      space:
        res['配信間隔']!== undefined? propertyResponseToDomain(res['配信間隔'], 'uint') as Uint: undefined,
      lap:
        res['周回数']!== undefined? propertyResponseToDomain(res['周回数'], 'uint') as Uint: undefined,
      blockOrder:
        res['Order']!== undefined? propertyResponseToDomain(res['Order'], 'uint') as Uint: undefined,
      startDate:
        res['開始日/終了日']!== undefined? propertyResponseToDomain(res['開始日/終了日'], 'start date') as NotionDate: undefined,
      endDate:
        res['開始日/終了日']!== undefined? propertyResponseToDomain(res['開始日/終了日'], 'end date') as NotionDate: undefined,
      blockPageId:
        res['Coach Plan Page ID']!== undefined? propertyResponseToDomain(res['Coach Plan Page ID'], 'a page id') as NotionUUID: undefined,
      studentProblemRelations:
        res['studentProblemRelations']!== undefined? propertyResponseToDomain(res['studentProblemRelations'], 'page ids') as NotionUUID[]: undefined,
    }; 

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Failed to transform Notion Coach Plan response to Domain StudentActualBlock', error);
    throw error;
  }
}

function toNotion(data: DomainStudentActualBlock): NotionStudentActualBlockRequest {
  try {
    const transformed = {
      [propertyInfo.blockName.name]: propertyDomainToRequest(data.blockName, propertyInfo.blockName.type, 'a mention string') as TitlePropertyRequest,
      [propertyInfo.outputDate.name]:
        data.startDate!== undefined && data.endDate? propertyDomainToRequest({start: data.startDate, end: data.endDate}, propertyInfo.outputDate.type, '') as DatePropertyRequest: undefined,
      [propertyInfo.studentProblemRelations.name]: 
        data.studentProblemRelations!== undefined? propertyDomainToRequest(data.studentProblemRelations, propertyInfo.studentProblemRelations.type, 'page ids') as RelationPropertyRequest: undefined,
      [propertyInfo.speed.name]: propertyDomainToRequest(data.speed, propertyInfo.speed.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.space.name]: propertyDomainToRequest(data.space, propertyInfo.space.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.lap.name]: propertyDomainToRequest(data.lap, propertyInfo.lap.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.blockOrder.name]: propertyDomainToRequest(data.blockOrder, propertyInfo.blockOrder.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.problemLevel.name]: propertyDomainToRequest(data.problemLevel, propertyInfo.problemLevel.type, 'a problem level') as SelectPropertyRequest,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error('Failed to transform Domain Coach Plan to Notion Coach Plan request', error);
    throw error;
  }
}

export class NotionStudentActualBlocks extends NotionRepository<
  DomainStudentActualBlock,
  NotionStudentActualBlockResponse,
  NotionStudentActualBlockRequest
> 
{
  protected toDomain(response: NotionStudentActualBlockResponse): DomainStudentActualBlock {
    return toDomain(response);
  };
  protected toNotion(data: DomainStudentActualBlock): NotionStudentActualBlockRequest {
    return toNotion(data);
  };
}