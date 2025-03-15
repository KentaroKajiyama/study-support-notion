import { 
  SubfieldsSubfieldNameEnum,
  NotionDate, 
  NotionMentionString,
  NotionUUID
} from "@domain/types/index.js";

export interface DomainStudentSchedule {
  blockName?: NotionMentionString;
  subfieldName?: SubfieldsSubfieldNameEnum;
  startDate?: NotionDate;
  endDate?: NotionDate;
  pageId?: NotionUUID;
}