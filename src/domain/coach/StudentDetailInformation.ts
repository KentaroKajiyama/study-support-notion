import { 
  StudentSubjectInformationSubjectGoalLevelEnum, 
  StudentSubjectInformationSubjectLevelEnum,
  Email, 
  PhoneNumber,
  NotionDate,
  StudentDetailInformationSubjectChangeEnum,
  SubjectsSubjectNameEnum
} from "@domain/types/index.js";


export interface DomainStudentDetailInformation {
  studentName?: string;
  parentName?: string;
  parentEmail?: Email;
  parentPhoneNumber?: PhoneNumber;
  examDate?: NotionDate
  goal?: string;
  registeredSubjectNames?: SubjectsSubjectNameEnum[];
  levelModifiedSubjectNames?: SubjectsSubjectNameEnum[];
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
  japaneseHistoryLevel?: StudentSubjectInformationSubjectLevelEnum;
  japaneseHistoryGoalDescription?: string;
  japaneseHistoryGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  worldHistoryLevel?: StudentSubjectInformationSubjectLevelEnum;
  worldHistoryGoalDescription?: string;
  worldHistoryGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  geographyLevel?: StudentSubjectInformationSubjectLevelEnum;
  geographyGoalDescription?: string;
  geographyGoalLevel?: StudentSubjectInformationSubjectGoalLevelEnum;
  japaneseChange?: StudentDetailInformationSubjectChangeEnum;
  mathChange?: StudentDetailInformationSubjectChangeEnum;
  englishChange?: StudentDetailInformationSubjectChangeEnum;
  physicsChange?: StudentDetailInformationSubjectChangeEnum;
  chemistryChange?: StudentDetailInformationSubjectChangeEnum;
  biologyChange?: StudentDetailInformationSubjectChangeEnum;
  japaneseHistoryChange?: StudentDetailInformationSubjectChangeEnum;
  worldHistoryChange?: StudentDetailInformationSubjectChangeEnum;
  geographyChange?: StudentDetailInformationSubjectChangeEnum;
}