import { 
  NotionPagePropertyType, 
  SelectPropertyResponse,
  CheckboxPropertyResponse,
  NumberPropertyRequest,
  CheckboxPropertyRequest,
  NumberPropertyResponse,
  SelectPropertyRequest,
  FormulaPropertyResponse,
  RelationPropertyResponse,
  RelationPropertyRequest,
  StudentProblemsAnswerStatusEnum,
  Uint,
  StudentProblemsReviewLevelEnum,
  NotionUUID,
  SubfieldsSubfieldNameEnum,
  StatusPropertyRequest,
  StatusPropertyResponse,
} from "@domain/types/index.js";
import {
  logger
} from "@utils/index.js";
import { DomainStudentProblem } from '@domain/student/index.js';
import { propertyDomainToRequest, propertyResponseToDomain } from "@infrastructure/notionProperty.js";
import {
  NotionRepository
} from "@infrastructure/notion/NotionRepository.js";

export interface NotionStudentProblemResponse extends Record<string, any> {
  '回答'?: StatusPropertyResponse;
  '理解できない'?: CheckboxPropertyResponse;
  '挑戦回数'?: NumberPropertyResponse;
  '理解できなかった回数'?: NumberPropertyResponse;
  '不正解回数'?: NumberPropertyResponse;
  '復習レベル'?: StatusPropertyResponse;
  '全体順番'?: NumberPropertyResponse;
  'ブロック内順番'?: NumberPropertyResponse;
  'Student Problem ID'?: FormulaPropertyResponse;
  'ブロック参照'?: RelationPropertyResponse;
  '科目'?: SelectPropertyResponse;
}

export interface NotionStudentProblemRequest extends Record<string, any> {
  '回答'?: StatusPropertyRequest;
  '理解できない'?: CheckboxPropertyRequest;
  '挑戦回数'?: NumberPropertyRequest;
  '理解できなかった回数'?: NumberPropertyRequest;
  '不正解回数'?: NumberPropertyRequest;
  '復習レベル'?: StatusPropertyRequest;
  '全体順番'?: NumberPropertyRequest;
  'ブロック内順番'?: NumberPropertyRequest;
  'ブロック参照'?: RelationPropertyRequest;
  '科目'?: SelectPropertyRequest;
}

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
  subfieldName: { type: 'select', name: '科目'}
}

function toDomain(res: NotionStudentProblemResponse): DomainStudentProblem {
  try {
    const transformed: DomainStudentProblem= {
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
      subfieldName:
        res["科目"]!== undefined? propertyResponseToDomain(res["科目"], 'a subfield name') as SubfieldsSubfieldNameEnum : undefined,
    };
    return Object.fromEntries(
      Object.entries(transformed).filter(([_, value]) => value !== undefined)
    );
  } catch (error) {
    logger.error(`Failed to transform NotionStudentProblemResponse to DomainStudentProblem: ${error}`);
    throw error;
  }
}

function toNotion(data: DomainStudentProblem): NotionStudentProblemRequest {
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
    logger.error(`Failed to transform DomainStudentProblem to NotionStudentProblemRequest: ${error}`);
    throw error;
  }
}

export class NotionStudentProblems extends NotionRepository<
  DomainStudentProblem,
  NotionStudentProblemResponse,
  NotionStudentProblemRequest
> {
  protected toDomain(response: NotionStudentProblemResponse): DomainStudentProblem {
    return toDomain(response);
  }
  protected toNotion(data: DomainStudentProblem): NotionStudentProblemRequest {
    return toNotion(data);
  }
}
  