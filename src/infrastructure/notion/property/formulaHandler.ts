import { 
  FormulaPropertyResponse,
  NotionUUID,
  toNotionUUID
} from "@domain/types/index.js";


export type FormulaResponseOption = 'a page id';
export type FormulaResponseReturnType = NotionUUID

export function formulaResponseHandler(formulaProp: FormulaPropertyResponse, option: FormulaResponseOption): FormulaResponseReturnType {
  switch (option) {
    case 'a page id':
      if (formulaProp.formula.type !== 'string') {
        throw new Error('Invalid formula type. If you want a page id, you must provide a string value.');
      } else if (formulaProp.formula.string === null) {
        throw new Error('Invalid formula value. Null is not allowed');
      }
      return toNotionUUID(formulaProp.formula.string);
    default:
      throw new Error('Invalid formula option');
  }
}