import { 
  NotionUUID,
  NotionPagePropertyType,
  Uint,
  StudentProblemsAnswerStatusEnum,
  StudentProblemsReviewLevelEnum,
  FormulaPropertyResponse,
  SubfieldsSubfieldNameEnum,
} from "@domain/types/index.js";
import { 
  NotionStudentProblemResponse,
  NotionStudentProblemRequest, 
} from "./StudentProblems.js";
import { 
  DomainTopProblem 
} from "@domain/student/index.js";
import {
  propertyResponseToDomain,
  propertyDomainToRequest
} from "@infrastructure/notionProperty.js"
import {
  logger
} from '@utils/index.js';
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";


interface NotionTopProblemResponse extends NotionStudentProblemResponse {
  'Top Problem Page ID'?: FormulaPropertyResponse;
}

interface NotionTopProblemRequest extends NotionStudentProblemRequest {
};

const propertyInfo: Record<string, { type: NotionPagePropertyType, name: string }> = {
  answerStatus: { type: 'status', name: '回答'},
  isDifficult: { type: 'checkbox', name: '理解できない'},
  tryCount: { type: 'number', name: '挑戦回数'},
  difficultCount: { type: 'number', name: '理解できなかった回数'},
  wrongCount: { type: 'number', name: '不正解回数'},
  reviewLevel: { type:'status', name: '復習レベル'},
  problemOverallOrder: { type: 'number', name: '全体順番' },
  problemInBlockOrder: { type: 'number', name: 'ブロック内順番' },
  studentProblemPageId: { type: 'formula', name: 'Student Problem ID'},
  blockPageId: { type: 'relation', name: 'ブロック参照'},
  subfieldName: { type: 'select', name: '科目' }
}

function toDomain(res: NotionTopProblemResponse): DomainTopProblem {
  try {
    const transformed: DomainTopProblem= {
      answerStatus: 
        res['回答'] !== undefined? propertyResponseToDomain(res['回答'], 'an answer status') as StudentProblemsAnswerStatusEnum: undefined,
      isDifficult:
        res['理解できない']!== undefined? propertyResponseToDomain(res['理解できない'], '') as boolean: undefined,
      tryCount:
        res['挑戦回数']!== undefined? propertyResponseToDomain(res['挑戦回数'], 'uint') as Uint: undefined,
      difficultCount:
        res['理解できなかった回数']!== undefined? propertyResponseToDomain(res['理解できなかった回数'], 'uint') as Uint: undefined,
      wrongCount:
        res['不正解回数']!== undefined? propertyResponseToDomain(res['不正解回数'], 'uint') as Uint: undefined,
      reviewLevel:
        res['復習レベル']!== undefined? propertyResponseToDomain(res['復習レベル'], 'a review level') as StudentProblemsReviewLevelEnum: undefined,
      problemOverallOrder:
        res['全体順番']!== undefined? propertyResponseToDomain(res['全体順番'], 'uint') as Uint: undefined,
      problemInBlockOrder:
        res['ブロック内順番']!== undefined? propertyResponseToDomain(res['ブロック内順番'], 'uint') as Uint: undefined,
      studentProblemPageId:
        res['Student Problem ID']!== undefined? propertyResponseToDomain(res['Student Problem ID'], 'a page id') as NotionUUID : undefined,
      blockPageId:
        res['ブロック参照']!== undefined? propertyResponseToDomain(res['ブロック参照'], 'a page id') as NotionUUID : undefined,
      topProblemPageId:
        res['Top Problem Page ID']!== undefined? propertyResponseToDomain(res['Top Problem Page ID'], 'a page id') as NotionUUID : undefined,
      subfieldName:
        res['科目']!== undefined? propertyResponseToDomain(res['科目'], 'a subfield name') as SubfieldsSubfieldNameEnum : undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    );
  } catch (error) {
    logger.error(`Failed to transform NotionTopProblemResponse to DomainTopProblem: ${error}`);
    throw error;
  }
}

function toNotion(data: DomainTopProblem): NotionStudentProblemRequest {
  try {
    const transformed: NotionStudentProblemRequest = {
      [propertyInfo.answerStatus.name]:
        data.answerStatus !== undefined ? propertyDomainToRequest(data.answerStatus, propertyInfo.answerStatus.type, 'an answer status'): undefined,
      [propertyInfo.isDifficult.name]:
        data.isDifficult !== undefined? propertyDomainToRequest(data.isDifficult, propertyInfo.isDifficult.type, '') : undefined,
      [propertyInfo.tryCount.name]:
        data.tryCount !== undefined? propertyDomainToRequest(data.tryCount, propertyInfo.tryCount.type, 'uint') : undefined,
      [propertyInfo.difficultCount.name]:
        data.difficultCount !== undefined? propertyDomainToRequest(data.difficultCount, propertyInfo.difficultCount.type, 'uint') : undefined,
      [propertyInfo.wrongCount.name]:
        data.wrongCount !== undefined? propertyDomainToRequest(data.wrongCount, propertyInfo.wrongCount.type, 'uint') : undefined,
      [propertyInfo.reviewLevel.name]:
        data.reviewLevel !== undefined? propertyDomainToRequest(data.reviewLevel, propertyInfo.reviewLevel.type, 'a review level') : undefined,
      [propertyInfo.problemOverallOrder.name]:
        data.problemOverallOrder !== undefined? propertyDomainToRequest(data.problemOverallOrder, propertyInfo.problemOverallOrder.type, 'uint') : undefined,
      [propertyInfo.problemInBlockOrder.name]:
        data.problemInBlockOrder !== undefined? propertyDomainToRequest(data.problemInBlockOrder, propertyInfo.problemInBlockOrder.type, 'uint') : undefined,
      [propertyInfo.studentProblemPageId.name]:
        data.studentProblemPageId!== undefined? propertyDomainToRequest(data.studentProblemPageId, propertyInfo.studentProblemPageId.type, 'a page id') : undefined,
      [propertyInfo.blockPageId.name]:
        data.blockPageId!== undefined? propertyDomainToRequest(data.blockPageId, propertyInfo.blockPageId.type, 'a page id') : undefined,
      [propertyInfo.subfieldName.name]:
        data.subfieldName!== undefined? propertyDomainToRequest(data.subfieldName, propertyInfo.subfieldName.type, 'a subfield name') : undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value!== undefined)
    )
  } catch (error) {
    logger.error(`Failed to transform DomainTopProblem to NotionStudentProblemRequest: ${error}`);
    throw error;
  }
}

export class NotionTopProblems extends NotionRepository<
  DomainTopProblem,
  NotionTopProblemResponse,
  NotionTopProblemRequest
> {
  protected toDomain(response: NotionTopProblemResponse): DomainTopProblem {
    return toDomain(response);
  };
  protected toNotion(data: DomainTopProblem): NotionTopProblemRequest {
    return toNotion(data);
  }

  async queryADatabaseWithOnlyReviews(databaseId: NotionUUID): Promise<DomainTopProblem[]>{
    const level0: StudentProblemsReviewLevelEnum = '初学';
    const level1: StudentProblemsReviewLevelEnum = 'レベル１';
    return await this.queryADatabase(
      databaseId,
      [],
      {
        and: [
          { property: propertyInfo.reviewLevel.name, 'status': { 'does_not_equal': level0 }},
          { property: propertyInfo.reviewLevel.name, 'status': { 'does_not_equal': level1 }},
        ]
      }
    )
  }
}