import { 
  SelectPropertyRequest,
  SelectPropertyResponse,
  SubfieldsSubfieldNameEnum,
  ActualBlocksProblemLevelEnum,
  isValidActualBlocksProblemLevelEnum,
  isValidSubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum,
  isValidSubjectsSubjectNameEnum,
  StudentProblemsAnswerStatusEnum,
  isValidStudentProblemsAnswerStatusEnum,
  StudentProblemsReviewLevelEnum,
} from "@domain/types/index.js";

export type SelectResponseOption = 
  | 'a review level'
  | 'an answer status' 
  | 'a subject name' 
  | 'a subfield name' 
  | 'a problem level' 
  | 'string' 
  | '';
export type SelectResponseReturnType = 
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
    case 'a problem level':
      if (selectProp.select !== null && !isValidActualBlocksProblemLevelEnum(selectProp.select.name)){
        throw new Error("Invalid problem level: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Problem level is missing.");
      }
      return selectProp.select.name;
    case '':
    case 'string':
    case '':
      return selectProp.select != null ? selectProp.select.name : "";
    default:
      throw new Error ("Invalid option for selectResponseHandler: " + option);
  }
}

export type SelectRequestOption = 
  | 'a review level' 
  | 'an answer status' 
  | 'a subject name' 
  | 'a subfield name'
  | 'a problem level';
export type SelectRequestInputType = 
  | StudentProblemsReviewLevelEnum
  | StudentProblemsAnswerStatusEnum 
  | ActualBlocksProblemLevelEnum 
  | SubjectsSubjectNameEnum 
  | SubfieldsSubfieldNameEnum 
  | ActualBlocksProblemLevelEnum;

export function selectRequestHandler(input: SelectRequestInputType, option: SelectRequestOption): SelectPropertyRequest {
  switch (option) {
    case 'a subfield name':
      if (!isValidSubfieldsSubfieldNameEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a subject name':
      if (!isValidSubjectsSubjectNameEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'an answer status':
      if (!isValidStudentProblemsAnswerStatusEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a review level':
      if (!isValidStudentProblemsAnswerStatusEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    case 'a problem level':
      if (!isValidActualBlocksProblemLevelEnum(input)) throw new Error ("Invalid input for select property option:" + option + ". input : " + input);
      return {
        type: "select",
        select: {
          name: input,
        },
      };
    default:
      throw new Error ("Invalid option for selectRequestHandler: " + option);
  }
}