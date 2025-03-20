import { DomainNecessaryStudyTime } from "@domain/coach/NecessaryStudyTime.js";
import { 
  NotionPagePropertyType,
  NumberPropertyRequest,
  NumberPropertyResponse,
  TitlePropertyRequest,
  TitlePropertyResponse, 
  Uint
} from "@domain/types/index.js";
import { propertyDomainToRequest, propertyResponseToDomain } from "@infrastructure/notionProperty.js";
import {
  logger
} from '@utils/index.js';
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";


export interface NotionNecessaryStudyTimeResponse extends Record<string, any> {
  'パターン'?: TitlePropertyResponse;
  '現代文'?: NumberPropertyResponse;
  '古文'?: NumberPropertyResponse;
  '漢文'?: NumberPropertyResponse;
  '数学'?: NumberPropertyResponse;
  'Reading'?: NumberPropertyResponse;
  'Listening & Speaking'?: NumberPropertyResponse;
  'Writing'?: NumberPropertyResponse;
  '物理'?: NumberPropertyResponse;
  '化学'?: NumberPropertyResponse;
  '生物'?: NumberPropertyResponse;
  '日本史'?: NumberPropertyResponse;
  '世界史'?: NumberPropertyResponse;
  '地理'?: NumberPropertyResponse;
  '回数'?: NumberPropertyResponse;
  '合計日数'?: NumberPropertyResponse;
  'Order'?: NumberPropertyResponse;
}

export interface NotionNecessaryStudyTimeRequest extends Record<string, any> {
  'パターン'?: TitlePropertyRequest;
  '現代文'?: NumberPropertyRequest;
  '古文'?: NumberPropertyRequest;
  '漢文'?: NumberPropertyRequest;
  '数学'?: NumberPropertyRequest;
  'Reading'?: NumberPropertyRequest;
  'Listening & Speaking'?: NumberPropertyRequest;
  'Writing'?: NumberPropertyRequest;
  '物理'?: NumberPropertyRequest;
  '化学'?: NumberPropertyRequest;
  '生物'?: NumberPropertyRequest;
  '日本史'?: NumberPropertyRequest;
  '世界史'?: NumberPropertyRequest;
  '地理'?: NumberPropertyRequest;
  '回数'?: NumberPropertyRequest;
  '合計日数'?: NumberPropertyRequest;
  'Order'?: NumberPropertyRequest;
}

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string }> = {
  pattern: { type: 'title', name: 'パターン' },
  modernJapanese: { type: 'number', name: '現代文' },
  ancientJapanese: { type: 'number', name: '古文' },
  ancientChinese: { type: 'number', name: '漢文' },
  math: { type: 'number', name: '数学' },
  reading: { type: 'number', name: 'Reading' },
  listeningSpeaking: { type: 'number', name: 'Listening&Speaking' },
  writing: { type: 'number', name: 'Writing' },
  physics: { type: 'number', name: '物理' },
  chemistry: { type: 'number', name: '化学' },
  biology: { type: 'number', name: '生物' },
  japaneseHistory: { type: 'number', name: '日本史' },
  worldHistory: { type: 'number', name: '世界史' },
  geography: { type: 'number', name: '地理' },
  howManyTimes: { type: 'number', name: '回数' },
  totalOpportunity: { type: 'number', name: '合計日数' },
  order: { type: 'number', name: 'Order' }
};

function toDomain(res: NotionNecessaryStudyTimeResponse): DomainNecessaryStudyTime {
  try {
    const transformed: DomainNecessaryStudyTime = {
      pattern:
        res['パターン'] !== undefined ? propertyResponseToDomain(res['パターン'], 'string') as string: undefined,
      modernJapanese:
        res['現代文']!== undefined? propertyResponseToDomain(res['現代文'], 'uint') as Uint : undefined,
      ancientJapanese:
        res['古文']!== undefined? propertyResponseToDomain(res['古文'], 'uint') as Uint : undefined,
      ancientChinese:
        res['漢文']!== undefined? propertyResponseToDomain(res['漢文'], 'uint') as Uint : undefined,
      math:
        res['数学']!== undefined? propertyResponseToDomain(res['数学'], 'uint') as Uint : undefined,
      reading:
        res['Reading']!== undefined? propertyResponseToDomain(res['Reading'], 'uint') as Uint : undefined,
      listeningAndSpeaking:
        res['Listening & Speaking']!== undefined? propertyResponseToDomain(res['Listening & Speaking'], 'uint') as Uint : undefined,
      writing:
        res['Writing']!== undefined? propertyResponseToDomain(res['Writing'], 'uint') as Uint : undefined,
      physics:
        res['物理']!== undefined? propertyResponseToDomain(res['物理'], 'uint') as Uint : undefined,
      chemistry:
        res['化学']!== undefined? propertyResponseToDomain(res['化学'], 'uint') as Uint : undefined,
      biology:
        res['生物']!== undefined? propertyResponseToDomain(res['生物'], 'uint') as Uint : undefined,
      japaneseHistory:
        res['日本史']!== undefined? propertyResponseToDomain(res['日本史'], 'uint') as Uint : undefined,
      worldHistory:
        res['世界史']!== undefined? propertyResponseToDomain(res['世界史'], 'uint') as Uint : undefined,
      geography:
        res['地理']!== undefined? propertyResponseToDomain(res['地理'], 'uint') as Uint : undefined,
      howManyTimes:
        res['回数']!== undefined? propertyResponseToDomain(res['回数'], 'uint') as Uint : undefined,
      totalOpportunity:
        res['合計日数']!== undefined? propertyResponseToDomain(res['合計日数'], 'uint') as Uint : undefined,
      order:
        res['Order']!== undefined? propertyResponseToDomain(res['Order'], 'uint') as Uint : undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, v]) => v!= undefined)
    )
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

function toNotion(data: DomainNecessaryStudyTime): NotionNecessaryStudyTimeRequest {
  try {
    const transformed: NotionNecessaryStudyTimeRequest = {
      [propertyInfo.pattern.name]:
        data.pattern!== undefined? propertyDomainToRequest(data.pattern, propertyInfo.pattern.type, 'string'): undefined,
      [propertyInfo.modernJapanese.name]:
        data.modernJapanese!== undefined? propertyDomainToRequest(data.modernJapanese, propertyInfo.modernJapanese.type, 'uint'): undefined,
      [propertyInfo.ancientJapanese.name]:
        data.ancientJapanese!== undefined? propertyDomainToRequest(data.ancientJapanese, propertyInfo.ancientJapanese.type, 'uint'): undefined,
      [propertyInfo.ancientChinese.name]:
        data.ancientChinese!== undefined? propertyDomainToRequest(data.ancientChinese, propertyInfo.ancientChinese.type, 'uint'): undefined,
      [propertyInfo.math.name]:
        data.math!== undefined? propertyDomainToRequest(data.math, propertyInfo.math.type, 'uint'): undefined,
      [propertyInfo.reading.name]:
        data.reading!== undefined? propertyDomainToRequest(data.reading, propertyInfo.reading.type, 'uint'): undefined,
      [propertyInfo.listeningSpeaking.name]:
        data.listeningAndSpeaking!== undefined? propertyDomainToRequest(data.listeningAndSpeaking, propertyInfo.listeningSpeaking.type, 'uint'): undefined,
      [propertyInfo.writing.name]:
        data.writing!== undefined? propertyDomainToRequest(data.writing, propertyInfo.writing.type, 'uint'): undefined,
      [propertyInfo.physics.name]:
        data.physics!== undefined? propertyDomainToRequest(data.physics, propertyInfo.physics.type, 'uint'): undefined,
      [propertyInfo.chemistry.name]:
        data.chemistry!== undefined? propertyDomainToRequest(data.chemistry, propertyInfo.chemistry.type, 'uint'): undefined,
      [propertyInfo.biology.name]:
        data.biology!== undefined? propertyDomainToRequest(data.biology, propertyInfo.biology.type, 'uint'): undefined,
      [propertyInfo.japaneseHistory.name]:
        data.japaneseHistory!== undefined? propertyDomainToRequest(data.japaneseHistory, propertyInfo.japaneseHistory.type, 'uint'): undefined,
      [propertyInfo.worldHistory.name]:
        data.worldHistory!== undefined? propertyDomainToRequest(data.worldHistory, propertyInfo.worldHistory.type, 'uint'): undefined,
      [propertyInfo.geography.name]:
        data.geography!== undefined? propertyDomainToRequest(data.geography, propertyInfo.geography.type, 'uint'): undefined,
      [propertyInfo.howManyTimes.name]:
        data.howManyTimes!== undefined? propertyDomainToRequest(data.howManyTimes, propertyInfo.howManyTimes.type, 'uint'): undefined,
      [propertyInfo.totalOpportunity.name]:
        data.totalOpportunity!== undefined? propertyDomainToRequest(data.totalOpportunity, propertyInfo.totalOpportunity.type, 'uint'): undefined,
      [propertyInfo.order.name]:
        data.order!== undefined? propertyDomainToRequest(data.order, propertyInfo.order.type, 'uint'): undefined,
    };

    return Object.fromEntries(
      Object.entries(transformed).filter(([_, v]) => v!= undefined)
    )
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export class NotionNecessaryStudyTimes extends NotionRepository<
DomainNecessaryStudyTime,
  NotionNecessaryStudyTimeResponse,
  NotionNecessaryStudyTimeRequest
>{
  protected toDomain(response: NotionNecessaryStudyTimeResponse): DomainNecessaryStudyTime {
    return toDomain(response);
  }
  
  protected toNotion(domain: DomainNecessaryStudyTime): NotionNecessaryStudyTimeRequest {
    return toNotion(domain);
  }
}