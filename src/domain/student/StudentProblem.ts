import { 
  Uint, 
  NotionUUID, 
  StudentProblemsAnswerStatusEnum, 
  StudentProblemsReviewLevelEnum 
} from "@domain/types/index.js";

export interface DomainStudentProblem {
  pageId?: NotionUUID;
  answerStatus?: StudentProblemsAnswerStatusEnum;
  isDifficult?: boolean;
  tryCount?: Uint;
  difficultCount?: Uint;
  wrongCount?: Uint;
  reviewLevel?: StudentProblemsReviewLevelEnum;
}