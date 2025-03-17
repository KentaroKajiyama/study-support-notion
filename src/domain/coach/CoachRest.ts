import { 
  SubfieldsSubfieldNameEnum,
  NotionDate,
  NotionUUID
} from "@domain/types/index.js";

export interface DomainCoachRest {
  restName?: string;
  startDate?: NotionDate;
  endDate?: NotionDate;
  subfieldNames?: SubfieldsSubfieldNameEnum[];
  restPageId?: NotionUUID;
}