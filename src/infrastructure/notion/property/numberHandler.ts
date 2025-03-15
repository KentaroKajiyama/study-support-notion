import { 
  NumberPropertyResponse,
  Uint,
  toUint,
  Int,
  toInt, 
  NumberPropertyRequest,
  isUint,
  isInt
} from '@domain/types/index.js';


export type NumberResponseOption = 'uint' | 'int' | 'any' | '';
export type NumberResponseReturnType = Uint | Int | number | null;

export function numberResponseHandler(numberProp: NumberPropertyResponse, option: NumberResponseOption): NumberResponseReturnType{
  switch (option) {
    case 'uint':
      return numberProp.number !== null ? toUint(numberProp.number) : null;
    case 'int':
      return numberProp.number !== null ? toInt(numberProp.number) : null;
    case 'any':
    case '':
      return numberProp.number || 0.0;
    default:
      throw new Error(`Invalid number option: ${option}`);
  }
}

export type NumberRequestOption = 'uint' | 'int' | 'any' | '';
export type NumberRequestInputType = Uint | Int | number | null;

export function numberRequestHandler(input: NumberRequestInputType, option: NumberRequestOption): NumberPropertyRequest {
  switch (option) {
    case 'uint':
      if (input !== null && !isUint(input)) {
        throw new Error(`Invalid uint: ${input}`);
      }
      return { number: input!== null ? input : null, type: 'number' };
    case 'int':
      if (input!== null &&!isInt(input)) {
        throw new Error(`Invalid int: ${input}`);
      }
      return { number: input!== null ? input : null, type: 'number' };
    case 'any':
    case '':
      if (Number.isNaN(input)) {
        throw new Error(`Invalid number: ${input}`);
      }
      return { number: input, type: 'number' };
    default:
      throw new Error(`Invalid number option: ${option}`);
  }
}