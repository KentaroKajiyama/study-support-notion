import { 
  SelectPropertyRequest,
  SelectPropertyResponse,
  SubfieldsSubfieldNameEnum,
  ActualBlocksProblemLevelEnum,
  isValidProblemsProblemLevelEnum,
  isValidSubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum,
  isValidSubjectsSubjectNameEnum,
  StudentProblemsAnswerStatusEnum,
  isValidStudentProblemsAnswerStatusEnum,
  StudentProblemsReviewLevelEnum,
  StudentSubjectInformationSubjectGoalLevelEnum,
  isValidStudentSubjectInformationSubjectGoalLevelEnum,
  StudentSubjectInformationSubjectLevelEnum,
  isValidStudentSubjectInformationSubjectLevelEnum,
} from "@domain/types/index.js";
import { 
  logger
} from "@utils/index.js";

export type SelectResponseOption = 
  | 'a subject level'
  | 'a goal level'
  | 'a review level'
  | 'an answer status' 
  | 'a subject name' 
  | 'a subfield name' 
  | 'a problem level' 
  | 'string' 
  | '';
export type SelectResponseReturnType = 
  | null
  | StudentSubjectInformationSubjectGoalLevelEnum
  | StudentSubjectInformationSubjectLevelEnum
  | StudentProblemsReviewLevelEnum
  | StudentProblemsAnswerStatusEnum 
  | ActualBlocksProblemLevelEnum 
  | SubjectsSubjectNameEnum 
  | SubfieldsSubfieldNameEnum 
  | string ;

export function selectResponseHandler(selectProp: SelectPropertyResponse, option: SelectResponseOption): SelectResponseReturnType {
  switch (option) {
    case 'a subfield name':
      if (selectProp.select !== null && !isValidSubfieldsSubfieldNameEnum(selectProp.select?.name)){
        throw new Error("Invalid subfield name: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Subfield name is missing.");
      }
      return selectProp.select.name;
    case 'a subject name':
      if (selectProp.select !== null &&!isValidSubjectsSubjectNameEnum(selectProp.select?.name)){
        throw new Error("Invalid subject name: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Subject name is missing.");
      }
      return selectProp.select.name;
    case 'an answer status':
      if (selectProp.select !== null &&!isValidStudentProblemsAnswerStatusEnum(selectProp.select.name)){
        throw new Error("Invalid answer status: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Answer status is missing.");
      }
      return selectProp.select.name;
    case 'a review level':
      if (selectProp.select!== null &&!isValidStudentProblemsAnswerStatusEnum(selectProp.select.name)){
        throw new Error("Invalid review level: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Review level is missing.");
      }
      return selectProp.select.name;
    case 'a subject level':
      if (selectProp.select!==null &&!isValidStudentSubjectInformationSubjectLevelEnum) {
        throw new Error("Invalid subject level: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        logger.warn("subject level is missing");
        return null;
      } 
      return selectProp.select.name;
    case 'a goal level':
      if (selectProp.select !== null &&!isValidStudentSubjectInformationSubjectLevelEnum(selectProp.select.name)){
        throw new Error("Invalid goal level: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        logger.warn("goal level is missing");
        return null;
      }
      return selectProp.select.name;
    case 'a problem level':
      if (selectProp.select !== null && !isValidProblemsProblemLevelEnum(selectProp.select.name)){
        throw new Error("Invalid problem level: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Problem level is missing.");
      }
      return selectProp.select.name;
    case 'string':
    case '':
      return selectProp.select != null ? selectProp.select.name : "";
    default:
      throw new Error ("Invalid option for selectResponseHandler: " + option);
  }
}

export type SelectRequestOption = 
  | 'a subject level'
  | 'a goal level'  
  | 'a review level' 
  | 'an answer status' 
  | 'a subject name' 
  | 'a subfield name'
  | 'a problem level';
export type SelectRequestInputType = 
  | StudentSubjectInformationSubjectGoalLevelEnum
  | StudentSubjectInformationSubjectLevelEnum
  | StudentProblemsReviewLevelEnum
  | StudentProblemsAnswerStatusEnum 
  | ActualBlocksProblemLevelEnum 
  | SubjectsSubjectNameEnum 
  | SubfieldsSubfieldNameEnum 
  | ActualBlocksProblemLevelEnum;

export function selectRequestHandler(input: SelectRequestInputType, option: SelectRequestOption): SelectPropertyRequest {
  switch (option) {
    case 'a subfield name':
      if (typeof input === 'number') throw new Error('Number is not allowed as a subfield name');
      else if (!isValidSubfieldsSubfieldNameEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a subject name':
      if (typeof input === 'number') throw new Error('Number is not allowed as a subject name');
      else if (!isValidSubjectsSubjectNameEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'an answer status':
      if (typeof input === 'number') throw new Error('Number is not allowed as an answer status');
      else if (!isValidStudentProblemsAnswerStatusEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a review level':
      if (typeof input === 'number') throw new Error('Number is not allowed as a review level');
      else if (!isValidStudentProblemsAnswerStatusEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a problem level':
      if (typeof input === 'number') throw new Error('Number is not allowed as a problem level');
      else if (!isValidProblemsProblemLevelEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a subject level':
      if (typeof input === 'number') throw new Error('Number is not allowed as a subject level');
      else if (!isValidStudentSubjectInformationSubjectLevelEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a goal level':
      if (!isValidStudentSubjectInformationSubjectGoalLevelEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: String(input),
        },
      };
    default:
      throw new Error ("Invalid option for selectRequestHandler: " + option);
  }
}