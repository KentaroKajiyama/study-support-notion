import { 
  StudentsOverviewsAlertSubfieldEnum,
  StudentsOverviewsChatStatusEnum,
  StudentsOverviewsDistributionStatusEnum,
  StudentsOverviewsModifiedPlanSubfieldEnum,
  StudentsOverviewsPlanStatusEnum,
  NotionMentionString,
  Int,
  NotionUUID
} from "@domain/types/index.js";

export interface DomainStudentOverview {
  studentName?: string;
  lineName?: string;
  alertSubfieldNames?: StudentsOverviewsAlertSubfieldEnum[];
  chatStatus?: StudentsOverviewsChatStatusEnum;
  distStatus?: StudentsOverviewsDistributionStatusEnum;
  studentPage?: NotionMentionString;
  planStatus?: StudentsOverviewsPlanStatusEnum;
  modifiedPlanSubfieldNames?: StudentsOverviewsModifiedPlanSubfieldEnum[];
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