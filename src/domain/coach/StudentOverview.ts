import { 
  StudentsOverviewsChatStatusEnum,
  StudentsOverviewsDistributionStatusEnum,
  StudentsOverviewsPlanStatusEnum,
  NotionMentionString,
  Int,
  NotionUUID,
  SubfieldsSubfieldNameEnum
} from "@domain/types/index.js";

export interface DomainStudentOverview {
  studentName?: string;
  lineName?: string;
  alertSubfieldNames?: SubfieldsSubfieldNameEnum[];
  chatStatus?: StudentsOverviewsChatStatusEnum;
  distStatus?: StudentsOverviewsDistributionStatusEnum;
  studentPage?: NotionMentionString;
  planStatus?: StudentsOverviewsPlanStatusEnum;
  modifiedPlanSubfieldNames?: SubfieldsSubfieldNameEnum[];
  modernJapaneseDelay?: Int;
  ancientJapaneseDelay?: Int;
  ancientChineseDelay?: Int;
  mathDelay?: Int;
  readingDelay?: Int;
  listeningAndSpeakingDelay?: Int;
  writingDelay?: Int;
  physicsDelay?: Int;
  chemistryDelay?: Int;
  biologyDelay?: Int;
  japaneseHistoryDelay?: Int;
  worldHistoryDelay?: Int;
  geographyDelay?: Int;
  studentOverviewPageId?: NotionUUID;
}