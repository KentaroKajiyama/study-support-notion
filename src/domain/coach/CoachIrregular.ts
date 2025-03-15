import { 
  SubfieldsSubfieldNameEnum,
  NotionMentionString, 
  NotionUUID,
  Uint 
} from "@domain/types/index.js";

export interface DomainCoachIrregular {
  problemName?: NotionMentionString;
  isModified?: boolean;
  insertOrder?: Uint;
  subfieldName?: SubfieldsSubfieldNameEnum;
  irregularProblemOrder?: Uint;
  insertBlock?: NotionMentionString;
  formerBlock?: NotionMentionString;
  irregularPageId?: NotionUUID;
}