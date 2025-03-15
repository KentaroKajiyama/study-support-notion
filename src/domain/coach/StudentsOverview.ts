import { 
  StudentsOverviewsAlertSubfieldEnum,
  StudentsOverviewsChatStatusEnum,
  StudentsOverviewsDistStatusEnum,
  StudentsOverviewsModifiedPlanSubfieldEnum,
  StudentsOverviewsPlanStatusEnum,
  NotionMentionString,
  Int
} from "@domain/types/index.js";

export interface DomainStudentOverview {
  studentName?: string;
  lineName?: string;
  alertSubfields?: StudentsOverviewsAlertSubfieldEnum[];
  chatStatus?: StudentsOverviewsChatStatusEnum;
  distStatus?: StudentsOverviewsDistStatusEnum;
  studentPage?: NotionMentionString;
  planStatus?: StudentsOverviewsPlanStatusEnum;
  modifiedPlanSubfieldNames?: StudentsOverviewsModifiedPlanSubfieldEnum;
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
}