import { CheckboxPropertyRequest, CheckboxPropertyResponse } from "@domain/types/myNotionType.js";


export type CheckboxResponseOption = '';
export type CheckboxResponseReturnType = boolean;

export function checkboxResponseHandler(checkboxProp: CheckboxPropertyResponse, option: CheckboxResponseOption): CheckboxResponseReturnType {
  switch (option) {
    case '':
      return checkboxProp.checkbox;
    default:
      throw new Error(`Invalid checkbox option: ${option}`);
  }
}

export type CheckboxRequestOption = '';
export type CheckboxRequestInputType = boolean;

export function checkboxRequestHandler(input: CheckboxRequestInputType, option: CheckboxRequestOption): CheckboxPropertyRequest {
  switch (option) {
    case '':
      return { checkbox: input };
    default:
      throw new Error(`Invalid checkbox option: ${option}`);
  }
}