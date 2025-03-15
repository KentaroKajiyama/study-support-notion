import { 
  SelectPropertyRequest,
  SelectPropertyResponse,
  SubfieldsSubfieldNameEnum,
  ActualBlocksProblemLevelEnum,
  isValidActualBlocksProblemLevelEnum,
  isValidSubfieldsSubfieldNameEnum
} from "@domain/types/index.js";

export type SelectResponseOption = 'a subfield name' | 'a problem level' | 'string' | '';
export type SelectResponseReturnType = ActualBlocksProblemLevelEnum | SubfieldsSubfieldNameEnum | string ;

export function selectResponseHandler(selectProp: SelectPropertyResponse, option: SelectResponseOption): SelectResponseReturnType {
  switch (option) {
    case 'a subfield name':
      if (selectProp.select !== null && !isValidSubfieldsSubfieldNameEnum(selectProp.select?.name)){
        throw new Error("Invalid subfield name: " + selectProp.select?.name);
      } else if (selectProp.select === null) {
        throw new Error("Subfield name is missing.");
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

export type SelectRequestOption = 'a subfield name'| 'a problem level' ;
export type SelectRequestInputType = SubfieldsSubfieldNameEnum | ActualBlocksProblemLevelEnum;

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