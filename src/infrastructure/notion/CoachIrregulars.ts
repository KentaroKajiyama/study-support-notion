import { 
  DomainCoachIrregular,
} from "@domain/coach/CoachIrregular.js";
import { 
  CheckboxPropertyRequest,
  NumberPropertyRequest, 
  RichTextPropertyRequest, 
  SelectPropertyRequest, 
  TitlePropertyRequest,
  NotionMentionString,
  TitlePropertyResponse,
  CheckboxPropertyResponse,
  NumberPropertyResponse,
  SelectPropertyResponse,
  RichTextPropertyResponse,
  FormulaPropertyResponse,
  NotionPagePropertyType,
  Uint,
  SubfieldsSubfieldNameEnum,
  NotionUUID,
} from "@domain/types/index.js";
import { NotionRepository } from "@infrastructure/notion/index.js";
import { logger } from "@utils/logger.js";
import { propertyResponseToDomain, propertyDomainToRequest } from "@infrastructure/notionProperty.js";

interface NotionCoachIrregularRequest extends Record<string,any> {
  "問題"?: TitlePropertyRequest;
  "変更"?: CheckboxPropertyRequest;
  "挿入先ブロック内 Order"?: NumberPropertyRequest;
  "科目"?: SelectPropertyRequest;
  "Order"?: NumberPropertyRequest;
  "挿入先ブロック"?: RichTextPropertyRequest;
  "元ブロック"?: RichTextPropertyRequest;
}

interface NotionCoachIrregularResponse extends Record<string,any> {
  "問題": TitlePropertyResponse;
  "変更": CheckboxPropertyResponse;
  "挿入先ブロック内 Order": NumberPropertyResponse;
  "科目": SelectPropertyResponse;
  "Order": NumberPropertyResponse;
  "挿入先ブロック": RichTextPropertyResponse;
  "元ブロック": RichTextPropertyResponse;
  "Irregular Page ID": FormulaPropertyResponse;
}


const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string }> = {
  problem: { type: 'title', name: '問題'},
  isModified: { type: 'checkbox', name: '変更' },
  insertOrder: { type: 'number', name: '挿入先ブロック内 Order' },
  subfieldName: { type:'select', name: '科目' },
  irregularProblemOrder: { type: 'number', name: 'Order' },
  insertBlock: { type: 'rich_text', name: '挿入先ブロック' },
  formerBlock: { type: 'rich_text', name: '元ブロック' }, 
  irregularPageId: { type: 'formula', name: 'Irregular Page ID' },
}

function toDomain(res: NotionCoachIrregularResponse): DomainCoachIrregular {
  try {
    const transformed = {
      problemName: propertyResponseToDomain(res["問題"], 'a mention string') as NotionMentionString,
      isModified: propertyResponseToDomain(res["変更"], '') as boolean,
      insertOrder: propertyResponseToDomain(res["挿入先ブロック内 Order"], 'uint') as Uint,
      subfieldName: propertyResponseToDomain(res["科目"], 'string') as SubfieldsSubfieldNameEnum,
      irregularProblemOrder: propertyResponseToDomain(res["Order"], 'uint') as Uint,
      insertBlock: propertyResponseToDomain(res["挿入先ブロック"], 'a mention string') as NotionMentionString,
      formerBlock: propertyResponseToDomain(res["元ブロック"], 'a mention string') as NotionMentionString,
      irregularPageId: propertyResponseToDomain(res["Irregular Page ID"], 'a page id') as NotionUUID
    }
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== null)
    )
  } catch (error) {
    logger.error('Error converting NotionCoachIrregularResponse to DomainCoachIrregular\n');
    throw error;
  }
}

function toNotion(data: DomainCoachIrregular): NotionCoachIrregularRequest { 
  try {
    const transformed = {
      [propertyInfo.problem.name]: propertyDomainToRequest(data.problemName, propertyInfo.problem.type, 'a mention string') as TitlePropertyRequest,
      [propertyInfo.isModified.name]: propertyDomainToRequest(data.isModified, propertyInfo.isModified.type, '') as CheckboxPropertyRequest,
      [propertyInfo.insertOrder.name]: propertyDomainToRequest(data.insertOrder, propertyInfo.insertOrder.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.subfieldName.name]: propertyDomainToRequest(data.subfieldName, propertyInfo.subfieldName.type, 'a subfield name') as SelectPropertyRequest,
      [propertyInfo.irregularProblemOrder.name]: propertyDomainToRequest(data.irregularProblemOrder, propertyInfo.irregularProblemOrder.type, 'uint') as NumberPropertyRequest,
      [propertyInfo.insertBlock.name]: propertyDomainToRequest(data.insertBlock, propertyInfo.insertBlock.type, 'a mention string') as RichTextPropertyRequest,
      [propertyInfo.formerBlock.name]: propertyDomainToRequest(data.formerBlock, propertyInfo.formerBlock.type, 'a mention string') as RichTextPropertyRequest,
    }
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== null && value!== undefined)
    ) as NotionCoachIrregularRequest
    } catch (error) {
    logger.error('Error converting DomainCoachIrregular to NotionCoachIrregularRequest\n');
    throw error;
  }
}

export class NotionCoachIrregulars extends NotionRepository<
  DomainCoachIrregular, 
  NotionCoachIrregularResponse,
  NotionCoachIrregularRequest
  >{
  protected toDomain(response: NotionCoachIrregularResponse): DomainCoachIrregular {
    return toDomain(response);
  };
  protected toNotion(domain: DomainCoachIrregular): NotionCoachIrregularRequest {
    return toNotion(domain);
  };
  async queryADatabaseWithSubfieldFilter(
    databaseId: NotionUUID, 
    filterSubfieldName: SubfieldsSubfieldNameEnum
  ): Promise<DomainCoachIrregular[]> {
    try {
      return await this.queryADatabase(databaseId, [], {
        property: propertyInfo.SubfieldName.name,
        select: {
          equals: filterSubfieldName
        }
      })
    } catch (error) {
      logger.error('Error querying Notion database with subfield filter\n');
      throw error;
    }
  } 
}