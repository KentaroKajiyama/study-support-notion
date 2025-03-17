import { 
  NotionDate,
  SubfieldsSubfieldNameEnum, 
  NotionMentionString, 
  NotionUUID,
  Uint,
  ActualBlocksProblemLevelEnum
} from "@domain/types/index.js";

export interface DomainCoachPlan {
  blockName?: NotionMentionString;
  inputStartDate?: NotionDate;
  inputEndDate?: NotionDate;
  speed?: Uint | null;
  space?: Uint | null
  lap?: Uint | null;
  blockOrder?: Uint;
  isTail?: boolean;
  actualBlockSize?: Uint;
  problemLevel?: ActualBlocksProblemLevelEnum;
  isIrregular?: boolean;
  outputStartDate?: NotionDate;
  outputEndDate?: NotionDate;
  subfieldName?: SubfieldsSubfieldNameEnum;
  planPageId?: NotionUUID;
}