import { 
  StatusPropertyRequest,
  StatusPropertyResponse,
  SubfieldsSubfieldNameEnum,
  ActualBlocksProblemLevelEnum,
  isValidProblemsProblemLevelEnum,
  isValidSubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum,
  isValidSubjectsSubjectNameEnum,
  StudentProblemsAnswerStatusEnum,
  isValidStudentProblemsAnswerStatusEnum,
  StudentProblemsReviewLevelEnum,
  StudentsOverviewsChatStatusEnum,
  StudentsOverviewsDistributionStatusEnum,
  StudentsOverviewsPlanStatusEnum,
  isValidStudentsOverviewsChatStatusEnum,
  isValidStudentsOverviewsDistributionStatusEnum,
  isValidStudentsOverviewsPlanStatusEnum,
  StudentDetailInformationSubjectChangeEnum,
} from "@domain/types/index.js";

export type StatusResponseOption = 
  | 'a subject change'
  | 'a review level'
  | 'an answer status' 
  | 'a subject name' 
  | 'a subfield name' 
  | 'a problem level' 
  | 'a chat status'
  | 'a distribution status'
  | 'a plan status'
  | 'string' 
  | '';
export type StatusResponseReturnType = 
  | StudentDetailInformationSubjectChangeEnum
  | StudentProblemsReviewLevelEnum
  | StudentProblemsAnswerStatusEnum 
  | ActualBlocksProblemLevelEnum 
  | SubjectsSubjectNameEnum 
  | SubfieldsSubfieldNameEnum 
  | StudentsOverviewsChatStatusEnum
  | StudentsOverviewsDistributionStatusEnum
  | StudentsOverviewsPlanStatusEnum
  | string ;

export function statusResponseHandler(statusProp: StatusPropertyResponse, option: StatusResponseOption): StatusResponseReturnType {
  switch (option) {
    case 'a subject change':
      if (statusProp.status!== null &&!isValidProblemsProblemLevelEnum(statusProp.status.name)){
        throw new Error("Invalid subject change: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Subject change is missing.");
      }
      return statusProp.status.name;
    case 'a subfield name':
      if (statusProp.status !== null && !isValidSubfieldsSubfieldNameEnum(statusProp.status?.name)){
        throw new Error("Invalid subfield name: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Subfield name is missing.");
      }
      return statusProp.status.name;
    case 'a subject name':
      if (statusProp.status !== null &&!isValidSubjectsSubjectNameEnum(statusProp.status?.name)){
        throw new Error("Invalid subject name: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Subject name is missing.");
      }
      return statusProp.status.name;
    case 'an answer status':
      if (statusProp.status !== null &&!isValidStudentProblemsAnswerStatusEnum(statusProp.status.name)){
        throw new Error("Invalid answer status: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Answer status is missing.");
      }
      return statusProp.status.name;
    case 'a review level':
      if (statusProp.status!== null &&!isValidStudentProblemsAnswerStatusEnum(statusProp.status.name)){
        throw new Error("Invalid review level: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Review level is missing.");
      }
      return statusProp.status.name;
    case 'a problem level':
      if (statusProp.status !== null && !isValidProblemsProblemLevelEnum(statusProp.status.name)){
        throw new Error("Invalid problem level: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Problem level is missing.");
      }
      return statusProp.status.name;
    case 'a chat status':
      if (statusProp.status !== null && !isValidStudentsOverviewsChatStatusEnum(statusProp.status.name)){
        throw new Error("Invalid chat status: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Chat status is missing.");
      }
      return statusProp.status.name;
    case 'a distribution status':
      if (statusProp.status !== null && !isValidStudentsOverviewsDistributionStatusEnum(statusProp.status.name)){
        throw new Error("Invalid distribution status: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Distribution status is missing.");
      }
      return statusProp.status.name;
    case 'a plan status':
      if (statusProp.status !== null && !isValidStudentsOverviewsPlanStatusEnum(statusProp.status.name)){
        throw new Error("Invalid plan status: " + statusProp.status?.name);
      } else if (statusProp.status === null) {
        throw new Error("Plan status is missing.");
      }
      return statusProp.status.name;
    case 'string':
    case '':
      return statusProp.status != null ? statusProp.status.name : "";
    default:
      throw new Error ("Invalid option for statusResponseHandler: " + option);
  }
}

export type StatusRequestOption = 
  | 'a subject change'
  | 'a review level' 
  | 'an answer status' 
  | 'a subject name' 
  | 'a subfield name'
  | 'a problem level'
  | 'a chat status'
  | 'a distribution status'
  | 'a plan status';

export type StatusRequestInputType = 
  | StudentDetailInformationSubjectChangeEnum
  | StudentProblemsReviewLevelEnum
  | StudentProblemsAnswerStatusEnum 
  | ActualBlocksProblemLevelEnum 
  | SubjectsSubjectNameEnum 
  | SubfieldsSubfieldNameEnum 
  | ActualBlocksProblemLevelEnum
  | StudentsOverviewsChatStatusEnum
  | StudentsOverviewsDistributionStatusEnum
  | StudentsOverviewsPlanStatusEnum;

export function statusRequestHandler(input: StatusRequestInputType, option: StatusRequestOption): StatusPropertyRequest {
  switch (option) {
    case 'a subject change':
      if (!isValidProblemsProblemLevelEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a subfield name':
      if (!isValidSubfieldsSubfieldNameEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a subject name':
      if (!isValidSubjectsSubjectNameEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'an answer status':
      if (!isValidStudentProblemsAnswerStatusEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a review level':
      if (!isValidStudentProblemsAnswerStatusEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a problem level':
      if (!isValidProblemsProblemLevelEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a chat status':
      if (!isValidStudentsOverviewsChatStatusEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a distribution status':
      if (!isValidStudentsOverviewsDistributionStatusEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    case 'a plan status':
      if (!isValidStudentsOverviewsPlanStatusEnum(input)) throw new Error ("Invalid input for status property option:" + option + ". input : " + input);
      return {
        type: "status",
        status: {
          name: input,
        },
      };
    default:
      throw new Error ("Invalid option for statusRequestHandler: " + option);
  }
}