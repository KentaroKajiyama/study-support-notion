import { 
  NotionPagePropertyType, 
  NumberPropertyRequest,
  NumberPropertyResponse,
  TitlePropertyResponse,
  TitlePropertyRequest,
  RichTextPropertyResponse,
  RichTextPropertyRequest,
  MultiSelectPropertyResponse,
  MultiSelectPropertyRequest,
  StatusPropertyResponse,
  StatusPropertyRequest,
  StudentsOverviewsChatStatusEnum,
  StudentsOverviewsDistributionStatusEnum,
  NotionMentionString,
  StudentsOverviewsPlanStatusEnum,
  Int,
  FormulaPropertyResponse,
  NotionUUID,
  SubfieldsSubfieldNameEnum,
} from "@domain/types/index.js";
import {
  logger
} from "@utils/index.js";
import { DomainStudentOverview  } from '@domain/coach/index.js';
import { propertyDomainToRequest, propertyResponseToDomain } from "@infrastructure/notionProperty.js";
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";

export interface NotionStudentOverviewResponse extends Record<string, any> {
  '氏名'?: TitlePropertyResponse;
  'LINE名前'?: RichTextPropertyResponse;
  'アラート科目'?: MultiSelectPropertyResponse;
  'チャット'?: StatusPropertyResponse;
  '配信状況'?: StatusPropertyResponse;
  '生徒ページ'?: RichTextPropertyResponse;
  '計画状況'?: StatusPropertyResponse;
  '計画変更'?: MultiSelectPropertyResponse;
  '現代文遅れ日数'?: NumberPropertyResponse;
  '古文遅れ日数'?: NumberPropertyResponse;
  '漢文遅れ日数'?: NumberPropertyResponse;
  '数学遅れ日数'?: NumberPropertyResponse;
  'Reading 遅れ日数'?: NumberPropertyResponse;
  'Listening&Speaking 遅れ日数'?: NumberPropertyResponse;
  'Writing 遅れ日数'?: NumberPropertyResponse;
  '物理遅れ日数'?: NumberPropertyResponse;
  '化学遅れ日数'?: NumberPropertyResponse;
  '生物遅れ日数'?: NumberPropertyResponse;
  '日本史遅れ日数'?: NumberPropertyResponse;
  '世界史遅れ日数'?: NumberPropertyResponse;
  '地理遅れ日数'?: NumberPropertyResponse;
  'Student Overview Page ID'?: FormulaPropertyResponse
}

export interface NotionStudentOverviewRequest extends Record<string, any> {
  '氏名'?: TitlePropertyRequest;
  'LINE名前'?: RichTextPropertyRequest;
  'アラート科目'?: MultiSelectPropertyRequest;
  'チャット'?: StatusPropertyRequest;
  '配信状況'?: StatusPropertyRequest;
  '生徒ページ'?: RichTextPropertyRequest;
  '計画状況'?: StatusPropertyRequest;
  '計画変更'?: MultiSelectPropertyRequest;
  '現代文遅れ日数'?: NumberPropertyRequest;
  '古文遅れ日数'?: NumberPropertyRequest;
  '漢文遅れ日数'?: NumberPropertyRequest;
  '数学遅れ日数'?: NumberPropertyRequest;
  'Reading 遅れ日数'?: NumberPropertyRequest;
  'Listening&Speaking 遅れ日数'?: NumberPropertyRequest;
  'Writing 遅れ日数'?: NumberPropertyRequest;
  '物理遅れ日数'?: NumberPropertyRequest;
  '化学遅れ日数'?: NumberPropertyRequest;
  '生物遅れ日数'?: NumberPropertyRequest;
  '日本史遅れ日数'?: NumberPropertyRequest;
  '世界史遅れ日数'?: NumberPropertyRequest;
  '地理遅れ日数'?: NumberPropertyRequest
}

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string }> = {
  studentName: { type: 'title', name: '氏名'},
  lineName: { type: 'rich_text', name: 'LINE名前' },
  alertSubfieldNames: { type:'multi_select', name: 'アラート科目' },
  chatStatus: { type:'status', name: 'チャット' },
  distStatus: { type:'status', name: '配信状況' },
  studentPage: { type: 'rich_text', name: '生徒ページ' },
  planStatus: { type:'status', name: '計画状況' },
  modifiedPlanSubfieldNames: { type:'multi_select', name: '計画変更科目' },
  modernJapaneseDelay: { type: 'number', name: '現代文遅れ日数' },
  ancientJapaneseDelay: { type: 'number', name: '古文遅れ日数' },
  ancientChineseDelay: { type: 'number', name: '漢文遅れ日数' },
  mathDelay: { type: 'number', name: '数学遅れ日数' },
  readingDelay: { type: 'number', name: 'Reading 遅れ日数' },
  listeningAndSpeakingDelay: { type: 'number', name: 'Listening&Speaking 遅れ日数' },
  writingDelay: { type: 'number', name: 'Writing 遅れ日数' },
  physicsDelay: { type: 'number', name: '物理遅れ日数' },
  chemistryDelay: { type: 'number', name: '化学遅れ日数' },
  biologyDelay: { type: 'number', name: '生物遅れ日数' },
  japaneseHistoryDelay: { type: 'number', name: '日本史遅れ日数' },
  worldHistoryDelay: { type: 'number', name: '世界史遅れ日数' },
  geographyDelay: { type: 'number', name: '地理遅れ日数' },
  studentOverviewPageId: { type: 'formula', name: 'Student Overview Page ID' }
}

function toDomain(res: NotionStudentOverviewResponse): DomainStudentOverview  {
  try {
    const transformed: DomainStudentOverview = {
      studentName: 
        res['氏名'] !== undefined? propertyResponseToDomain(res['氏名'], 'string') as string: undefined,
      lineName:
        res['LINE名前']!== undefined? propertyResponseToDomain(res['LINE名前'], 'string') as string : undefined,
      alertSubfieldNames:
        res['アラート科目']!== undefined? propertyResponseToDomain(res['アラート科目'], 'subfield names') as SubfieldsSubfieldNameEnum[] : undefined,
      chatStatus:
        res['チャット']!== undefined? propertyResponseToDomain(res['チャット'], 'a chat status') as StudentsOverviewsChatStatusEnum : undefined,
      distStatus:
        res['配信状況']!== undefined? propertyResponseToDomain(res['配信状況'], 'a distribution status') as StudentsOverviewsDistributionStatusEnum : undefined,
      studentPage:
        res['生徒ページ']!== undefined? propertyResponseToDomain(res['生徒ページ'], 'a mention string') as NotionMentionString : undefined,
      planStatus:
        res['計画状況']!== undefined? propertyResponseToDomain(res['計画状況'], 'a plan status') as StudentsOverviewsPlanStatusEnum : undefined,
      modifiedPlanSubfieldNames:
        res['計画変更']!== undefined? propertyResponseToDomain(res['計画変更'], 'subfield names') as SubfieldsSubfieldNameEnum[] : undefined,
      modernJapaneseDelay:
        res['現代文遅れ日数']!== undefined? propertyResponseToDomain(res['現代文遅れ日数'], 'int') as Int : undefined,
      ancientJapaneseDelay:
        res['古文遅れ日数']!== undefined? propertyResponseToDomain(res['古文遅れ日数'], 'int') as Int : undefined,
      ancientChineseDelay:
        res['漢文遅れ日数']!== undefined? propertyResponseToDomain(res['漢文遅れ日数'], 'int') as Int : undefined,
      mathDelay:
        res['数学遅れ日数']!== undefined? propertyResponseToDomain(res['数学遅れ日数'], 'int') as Int : undefined,
      readingDelay:
        res['Reading 遅れ日数']!== undefined? propertyResponseToDomain(res['Reading 遅れ日数'], 'int') as Int : undefined,
      listeningAndSpeakingDelay:
        res['Listening&Speaking 遅れ日数']!== undefined? propertyResponseToDomain(res['Listening&Speaking 遅れ日数'], 'int') as Int : undefined,
      writingDelay:
        res['Writing 遅れ日数']!== undefined? propertyResponseToDomain(res['Writing 遅れ日数'], 'int') as Int : undefined,
      physicsDelay:
        res['物理遅れ日数']!== undefined? propertyResponseToDomain(res['物理遅れ日数'], 'int') as Int : undefined,
      chemistryDelay:
        res['化学遅れ日数']!== undefined? propertyResponseToDomain(res['化学遅れ日数'], 'int') as Int : undefined,
      biologyDelay:
        res['生物遅れ日数']!== undefined? propertyResponseToDomain(res['生物遅れ日数'], 'int') as Int : undefined,
      japaneseHistoryDelay:
        res['日本史遅れ日数']!== undefined? propertyResponseToDomain(res['日本史遅れ日数'], 'int') as Int : undefined,
      worldHistoryDelay:
        res['世界史遅れ日数']!== undefined? propertyResponseToDomain(res['世界史遅れ日数'], 'int') as Int : undefined,
      geographyDelay:
        res['地理遅れ日数']!== undefined? propertyResponseToDomain(res['地理遅れ日数'], 'int') as Int : undefined,
      studentOverviewPageId:
        res['Student Overview Page ID']!== undefined? propertyResponseToDomain(res['Student Overview Page ID'], 'a page id') as NotionUUID: undefined
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    );
  } catch (error) {
    logger.error(`Failed to transform NotionStudentOverviewResponse to DomainStudentOverview : ${error}`);
    throw error;
  }
}

function toNotion(data: DomainStudentOverview ): NotionStudentOverviewRequest {
  try {
    const transformed: NotionStudentOverviewRequest = {
      [propertyInfo.studentName.name]:
        data.studentName !== undefined? propertyDomainToRequest(data.studentName, propertyInfo.studentName.type, 'string'): undefined,
      [propertyInfo.lineName.name]:
        data.lineName !== undefined? propertyDomainToRequest(data.lineName, propertyInfo.lineName.type, 'string'): undefined,
      [propertyInfo.alertSubfieldNames.name]:
        data.alertSubfieldNames!== undefined? propertyDomainToRequest(data.alertSubfieldNames, propertyInfo.alertSubfieldNames.type,'subfield names'): undefined,
      [propertyInfo.chatStatus.name]:
        data.chatStatus !== undefined? propertyDomainToRequest(data.chatStatus, propertyInfo.chatStatus.type, 'a chat status'): undefined,
      [propertyInfo.distStatus.name]:
        data.distStatus !== undefined? propertyDomainToRequest(data.distStatus, propertyInfo.distStatus.type, 'a distribution status'): undefined,
      [propertyInfo.studentPage.name]:
        data.studentPage !== undefined? propertyDomainToRequest(data.studentPage, propertyInfo.studentPage.type, 'a mention string'): undefined,
      [propertyInfo.planStatus.name]:
        data.planStatus !== undefined? propertyDomainToRequest(data.planStatus, propertyInfo.planStatus.type, 'a plan status'): undefined,
      [propertyInfo.modifiedPlanSubfieldNames.name]:
        data.modifiedPlanSubfieldNames !== undefined? propertyDomainToRequest(data.modifiedPlanSubfieldNames, propertyInfo.modifiedPlanSubfieldNames.type,'subfield names'): undefined,
      [propertyInfo.modernJapaneseDelay.name]:
        data.modernJapaneseDelay !== undefined? propertyDomainToRequest(data.modernJapaneseDelay, propertyInfo.modernJapaneseDelay.type, 'int'): undefined,
      [propertyInfo.ancientJapaneseDelay.name]:
        data.ancientJapaneseDelay !== undefined? propertyDomainToRequest(data.ancientJapaneseDelay, propertyInfo.ancientJapaneseDelay.type, 'int'): undefined,
      [propertyInfo.ancientChineseDelay.name]: 
        data.ancientChineseDelay!== undefined? propertyDomainToRequest(data.ancientChineseDelay, propertyInfo.ancientChineseDelay.type, 'int'): undefined,
      [propertyInfo.mathDelay.name]:
        data.mathDelay !== undefined? propertyDomainToRequest(data.mathDelay, propertyInfo.mathDelay.type, 'int'): undefined,
      [propertyInfo.readingDelay.name]:
        data.readingDelay !== undefined? propertyDomainToRequest(data.readingDelay, propertyInfo.readingDelay.type, 'int'): undefined,
      [propertyInfo.listeningAndSpeakingDelay.name]:
        data.listeningAndSpeakingDelay!== undefined? propertyDomainToRequest(data.listeningAndSpeakingDelay, propertyInfo.listeningAndSpeakingDelay.type, 'int'): undefined,
      [propertyInfo.writingDelay.name]:
        data.writingDelay !== undefined? propertyDomainToRequest(data.writingDelay, propertyInfo.writingDelay.type, 'int'): undefined,
      [propertyInfo.physicsDelay.name]:
        data.physicsDelay !== undefined? propertyDomainToRequest(data.physicsDelay, propertyInfo.physicsDelay.type, 'int'): undefined,
      [propertyInfo.chemistryDelay.name]:
        data.chemistryDelay !== undefined? propertyDomainToRequest(data.chemistryDelay, propertyInfo.chemistryDelay.type, 'int'): undefined,
      [propertyInfo.biologyDelay.name]:
        data.biologyDelay !== undefined? propertyDomainToRequest(data.biologyDelay, propertyInfo.biologyDelay.type, 'int'): undefined,
      [propertyInfo.japaneseHistoryDelay.name]:
        data.japaneseHistoryDelay !== undefined? propertyDomainToRequest(data.japaneseHistoryDelay, propertyInfo.japaneseHistoryDelay.type, 'int'): undefined,
      [propertyInfo.worldHistoryDelay.name]:
        data.worldHistoryDelay !== undefined? propertyDomainToRequest(data.worldHistoryDelay, propertyInfo.worldHistoryDelay.type, 'int'): undefined,
      [propertyInfo.geographyDelay.name]:
        data.geographyDelay !== undefined? propertyDomainToRequest(data.geographyDelay, propertyInfo.geographyDelay.type, 'int'): undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error(`Failed to transform DomainStudentOverview  to NotionStudentOverviewRequest: ${error}`);
    throw error;
  }
}

export class NotionStudentOverviews extends NotionRepository<
  DomainStudentOverview ,
  NotionStudentOverviewResponse,
  NotionStudentOverviewRequest
> {
  protected toDomain(response: NotionStudentOverviewResponse): DomainStudentOverview  {
    return toDomain(response);
  }
  protected toNotion(data: DomainStudentOverview ): NotionStudentOverviewRequest {
    return toNotion(data);
  }
  async updatePagePropertiesWithDelay(
    studentOverviewPageId: NotionUUID,
    subfieldName: SubfieldsSubfieldNameEnum,
    delay: Int,
    otherUpdates: DomainStudentOverview,
  ) {
    try {
      switch(subfieldName) {
        case '現代文':
          otherUpdates.modernJapaneseDelay = delay; 
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '古文':
          otherUpdates.ancientJapaneseDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '漢文':
          otherUpdates.ancientChineseDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '数学':
          otherUpdates.mathDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case 'Reading':
          otherUpdates.readingDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case 'Listening&Speaking':
          otherUpdates.listeningAndSpeakingDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case 'Writing':
          otherUpdates.writingDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '物理':
          otherUpdates.physicsDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '化学':
          otherUpdates.chemistryDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '生物':
          otherUpdates.biologyDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '日本史':
          otherUpdates.japaneseHistoryDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '世界史':
          otherUpdates.worldHistoryDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        case '地理':
          otherUpdates.geographyDelay = delay;
          await this.updatePageProperties(studentOverviewPageId, otherUpdates);
          break;
        default:
          throw new Error(`Invalid subfieldName: ${subfieldName}`);
      }
    } catch (error) {
      logger.error(`Failed to update Notion Student Overview page with delay for ${subfieldName}: ${error}`);
      throw error;
    }
  }
  
  async updatePlanStatus(studentOverviewPageId: NotionUUID, isConfirmed: boolean): Promise<void> {
    try {
      const data: DomainStudentOverview = {
        planStatus: isConfirmed ? '確定': 'シミュレーション中',
      };
      await this.updatePageProperties(studentOverviewPageId, data);
    } catch (error) {
      logger.error(`Failed to update Notion Student Overview page with plan status: ${error}`);
      throw error;
    }
  }
}
  