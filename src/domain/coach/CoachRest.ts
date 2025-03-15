import { 
  SubfieldsSubfieldNameEnum,
  NotionDate
} from "@domain/types/index.js";

export interface DomainCoachRest {
  restName?: string;
  startDate?: NotionDate;
  endDate?: NotionDate;
  subfieldList: SubfieldsSubfieldNameEnum[];
}