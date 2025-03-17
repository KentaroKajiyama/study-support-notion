import { 
  MultiSelectPropertyRequest,
  MultiSelectPropertyResponse,
  SubfieldsSubfieldNameEnum,
  isValidSubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum,
  isValidSubjectsSubjectNameEnum,
} from "@domain/types/index.js";

export type MultiSelectResponseOption =  
  | 'subject names' 
  | 'subfield names' 
export type MultiSelectResponseReturnType = 
  | SubjectsSubjectNameEnum[]
  | SubfieldsSubfieldNameEnum[]

export function multiSelectResponseHandler(multiSelectProp: MultiSelectPropertyResponse, option: MultiSelectResponseOption): MultiSelectResponseReturnType {
  switch (option) {
    case 'subfield names':
      return multiSelectProp.multi_select.map(e => {
        if (!isValidSubfieldsSubfieldNameEnum(e.name)) {
          throw new Error("Invalid subfield name: " + e.name)
        }
        return e.name;
      });
    case 'subject names':
      return multiSelectProp.multi_select.map(e => {
        if (!isValidSubjectsSubjectNameEnum(e.name)) {
          throw new Error("Invalid subject name: " + e.name)
        }
        return e.name;
      });
    default:
      throw new Error ("Invalid option for selectResponseHandler: " + option);
  }
}

export type MultiSelectRequestOption = 
  | 'subject names' 
  | 'subfield names'
export type MultiSelectRequestInputType =  
  | SubjectsSubjectNameEnum[]
  | SubfieldsSubfieldNameEnum[]

export function multiSelectRequestHandler(input: MultiSelectRequestInputType, option: MultiSelectRequestOption): MultiSelectPropertyRequest {
  switch (option) {
    case 'subfield names':
      const subfieldNamesArray = input.map(e => {
        if (!isValidSubfieldsSubfieldNameEnum(e)) {
          throw new Error("Invalid subfield name: " + e)
        }
        return { name: e };
      });
      return {
        type: "multi_select",
        multi_select: subfieldNamesArray,
      };
    case 'subject names':
      const subjectNamesArray = input.map(e => {
        if (!isValidSubjectsSubjectNameEnum(e)) {
          throw new Error("Invalid subject name: " + e)
        }
        return { name: e };
      });
      return {
        type: "multi_select",
        multi_select: subjectNamesArray
      };
    default:
      throw new Error ("Invalid option for multiSelectRequestHandler: " + option);
  }
}