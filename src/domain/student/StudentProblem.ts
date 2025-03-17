import { 
  Uint, 
  NotionUUID, 
  StudentProblemsAnswerStatusEnum, 
  StudentProblemsReviewLevelEnum, 
  SubfieldsSubfieldNameEnum
} from "@domain/types/index.js";

export interface DomainStudentProblem {
  answerStatus?: StudentProblemsAnswerStatusEnum;
  isDifficult?: boolean;
  tryCount?: Uint;
  difficultCount?: Uint;
  wrongCount?: Uint;
  reviewLevel?: StudentProblemsReviewLevelEnum;
  problemInBlockOrder?: Uint;
  problemOverallOrder?: Uint;
  studentProblemPageId?: NotionUUID;
  blockPageId?: NotionUUID;
  subfieldName?: SubfieldsSubfieldNameEnum
}