import { 
  SubfieldsSubfieldNameEnum, 
  Int, 
  Uint 
} from "@domain/types/index.js";


export interface DomainStudentTodoCounter {
  subfieldName ?: SubfieldsSubfieldNameEnum;
  remainingProblemNumber ?: Uint;
  delay ?: Int;
};