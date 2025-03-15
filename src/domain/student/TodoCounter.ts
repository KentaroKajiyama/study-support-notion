import { 
  SubfieldsSubfieldNameEnum, 
  Int, 
  Uint 
} from "@domain/types/index.js";


export interface DomainTodoCounter {
  subfieldName ?: SubfieldsSubfieldNameEnum;
  remainingProblemNumber ?: Uint;
  delay ?: Int;
};