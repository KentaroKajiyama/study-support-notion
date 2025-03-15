import { 
  StudentSubjectInformationSubjectGoalLevelEnum, 
  StudentSubjectInformationSubjectLevelEnum,
  Email, 
  PhoneNumber,
  NotionDate
} from "@domain/types/index.js";


export interface DomainStudentDetailInformation {
  studentName?: string;
  parentName?: string;
  parentEmail?: Email;
  parentPhoneNumber?: PhoneNumber;
  examDate?: NotionDate
  goal?: string;
  japaneseLevel?: StudentSubjectInformationSubjectLevelEnum;
  japaneseGoalDescription?: string;
  japaneseGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  mathLevel?: StudentSubjectInformationSubjectLevelEnum;
  mathGoalDescription?: string;
  mathGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  englishLevel?: StudentSubjectInformationSubjectLevelEnum;
  englishGoalDescription?: string;
  englishGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  physicsLevel?: StudentSubjectInformationSubjectLevelEnum;
  physicsGoalDescription?: string;
  physicsGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  chemistryLevel?: StudentSubjectInformationSubjectLevelEnum;
  chemistryGoalDescription?: string;
  chemistryGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  biologyLevel?: StudentSubjectInformationSubjectLevelEnum;
  biologyGoalDescription?: string;
  biologyGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  japaneseHistoryLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  japaneseHistoryGoalDescription?: string;
  japaneseHistoryGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  worldHistoryLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  worldHistoryGoalDescription?: string;
  worldHistoryGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  geographyLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  geographyGoalDescription?: string;
  geographyGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
}