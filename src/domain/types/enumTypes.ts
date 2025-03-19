// TODO: Automation - Auto-generate from MySQL ENUM 🚀
import { NotionPagePropertyType } from "./myNotionTypes.js";

/** ✅ Notion Page Property Types */
export type NotionDbPropertiesPropertyTypeEnum = NotionPagePropertyType;

const NotionPropertyTypes = {
  title: true,
  rich_text: true,
  number: true,
  select: true,
  multi_select: true,
  date: true,
  formula: true,
  relation: true,
  rollup: true,
  people: true,
  files: true,
  checkbox: true,
  url: true,
  email: true,
  phone_number: true,
  created_time: true,
  created_by: true,
  last_edited_time: true,
  last_edited_by: true,
  status: true,
  unique_id: true,
  verification: true,
} as const;

export function isValidNotionDbPropertiesPropertyType(
  value: string
): value is NotionDbPropertiesPropertyTypeEnum {
  return value in NotionPropertyTypes;
}

/** ✅ Student Subject Levels */
export const StudentSubjectInformationSubjectLevelEnum = {
  基礎１: "基礎１",
  基礎２: "基礎２",
  基礎３: "基礎３",
} as const;
export type StudentSubjectInformationSubjectLevelEnum =
  typeof StudentSubjectInformationSubjectLevelEnum[keyof typeof StudentSubjectInformationSubjectLevelEnum];

export function isValidStudentSubjectInformationSubjectLevelEnum(
  value: string
): value is StudentSubjectInformationSubjectLevelEnum {
  return value in StudentSubjectInformationSubjectLevelEnum;
}

/** ✅ Student Subject Goal Levels (Numeric) */
export enum StudentSubjectInformationSubjectGoalLevelEnum {
  Lvl48 = 48,
  Lvl50 = 50,
  Lvl52_5 = 52.5,
  Lvl55 = 55,
  Lvl57_5 = 57.5,
  Lvl60 = 60,
  Lvl62_5 = 62.5,
}

export function isValidStudentSubjectInformationSubjectGoalLevelEnum(
  value: string | number
): value is StudentSubjectInformationSubjectGoalLevelEnum {
  return Object.values(StudentSubjectInformationSubjectGoalLevelEnum).includes(Number(value));
}

/** ✅ Problems Problem Levels */
export const ProblemsProblemLevelEnum = {
  基礎１: "基礎１",
  基礎２: "基礎２",
  基礎３: "基礎３",
} as const;
export type ProblemsProblemLevelEnum =
  typeof ProblemsProblemLevelEnum[keyof typeof ProblemsProblemLevelEnum];

export function isValidProblemsProblemLevelEnum(
  value: string
): value is ProblemsProblemLevelEnum {
  return value in ProblemsProblemLevelEnum;
}

export type ActualBlocksProblemLevelEnum = ProblemsProblemLevelEnum;
export type DefaultBlocksProblemLevelEnum = ProblemsProblemLevelEnum;

/** ✅ Subjects */
export const SubjectsSubjectNameEnum = {
  国語: "国語",
  数学: "数学",
  英語: "英語",
  物理: "物理",
  化学: "化学",
  生物: "生物",
  日本史: "日本史",
  世界史: "世界史",
  地理: "地理",
} as const;
export type SubjectsSubjectNameEnum =
  typeof SubjectsSubjectNameEnum[keyof typeof SubjectsSubjectNameEnum];

export function isValidSubjectsSubjectNameEnum(
  value: string
): value is SubjectsSubjectNameEnum {
  return value in SubjectsSubjectNameEnum;
}

/** ✅ Subfields */
export const SubfieldsSubfieldNameEnum = {
  現代文: "現代文",
  古文: "古文",
  漢文: "漢文",
  数学: "数学",
  Reading: "Reading",
  "Listening&Speaking": "Listening&Speaking",
  Writing: "Writing",
  物理: "物理",
  化学: "化学",
  生物: "生物",
  日本史: "日本史",
  世界史: "世界史",
  地理: "地理",
} as const;
export type SubfieldsSubfieldNameEnum =
  typeof SubfieldsSubfieldNameEnum[keyof typeof SubfieldsSubfieldNameEnum];

export function isValidSubfieldsSubfieldNameEnum(
  value: string
): value is SubfieldsSubfieldNameEnum {
  return value in SubfieldsSubfieldNameEnum;
}

/** ✅ Answer Status */
export const StudentProblemsAnswerStatusEnum = {
  未回答: "未回答",
  不正解: "不正解",
  正解: "正解",
} as const;
export type StudentProblemsAnswerStatusEnum =
  typeof StudentProblemsAnswerStatusEnum[keyof typeof StudentProblemsAnswerStatusEnum];

export function isValidStudentProblemsAnswerStatusEnum(
  value: string
): value is StudentProblemsAnswerStatusEnum {
  return value in StudentProblemsAnswerStatusEnum;
}

export function isUndoneAnswerStatus(status: StudentProblemsAnswerStatusEnum): boolean {
  return status === "未回答";
}
export function isWrongAnswerStatus(status: StudentProblemsAnswerStatusEnum): boolean {
  return status === "不正解";
}
export function isCorrectAnswerStatus(status: StudentProblemsAnswerStatusEnum): boolean {
  return status === "正解";
}

/** ✅ Understanding Levels (Numeric) */
export enum StudentProblemsUnderstandingLevelEnum {
  Lvl1 = 1,
  Lvl2 = 2,
  Lvl3 = 3,
  Lvl4 = 4,
  Lvl5 = 5,
}

export function isValidStudentProblemsUnderstandingLevelEnum(
  value: number
): value is StudentProblemsUnderstandingLevelEnum {
  return Object.values(StudentProblemsUnderstandingLevelEnum).includes(value);
}

/** ✅ Review Levels */
export const StudentProblemsReviewLevelEnum = {
  初学: "初学",
  レベル１: "レベル１",
  レベル２: "レベル２",
  レベル３: "レベル３",
  レベル４: "レベル４",
} as const;
export type StudentProblemsReviewLevelEnum =
  typeof StudentProblemsReviewLevelEnum[keyof typeof StudentProblemsReviewLevelEnum];

export function isValidStudentProblemsReviewLevelEnum(
  value: string
): value is StudentProblemsReviewLevelEnum {
  return value in StudentProblemsReviewLevelEnum;
}

/** ✅ Overview Status */
export const StudentsOverviewsChatStatusEnum = {
  Chat: "Chat",
  Nope: "Nope",
} as const;
export type StudentsOverviewsChatStatusEnum =
  typeof StudentsOverviewsChatStatusEnum[keyof typeof StudentsOverviewsChatStatusEnum];

export function isValidStudentsOverviewsChatStatusEnum(
  value: string
): value is StudentsOverviewsChatStatusEnum {
  return value in StudentsOverviewsChatStatusEnum;
}

export const StudentsOverviewsDistributionStatusEnum = {
  正常: "正常",
  エラー発生: "エラー発生",
} as const;

export type StudentsOverviewsDistributionStatusEnum =
  typeof StudentsOverviewsDistributionStatusEnum[keyof typeof StudentsOverviewsDistributionStatusEnum];

export function isValidStudentsOverviewsDistributionStatusEnum(
  value: string
): value is StudentsOverviewsDistributionStatusEnum {
  return value in StudentsOverviewsDistributionStatusEnum;
}

/** ✅ Plan Status */
export const StudentsOverviewsPlanStatusEnum = {
  NotStarted: "Not Started",
  シミュレーション中: "シミュレーション中",
  確定: "確定",
} as const;
export type StudentsOverviewsPlanStatusEnum =
  typeof StudentsOverviewsPlanStatusEnum[keyof typeof StudentsOverviewsPlanStatusEnum];

export function isValidStudentsOverviewsPlanStatusEnum(
  value: string
): value is StudentsOverviewsPlanStatusEnum {
  return value in StudentsOverviewsPlanStatusEnum;
}

export const StudentDetailInformationSubjectChangeEnum = {
  変更なし: "変更なし",
  変更あり: "変更あり",
} as const;

export type StudentDetailInformationSubjectChangeEnum = 
  typeof StudentDetailInformationSubjectChangeEnum[keyof typeof StudentDetailInformationSubjectChangeEnum];

export function isValidStudentDetailInformationSubjectChangeEnum(
  value: string
): value is StudentDetailInformationSubjectChangeEnum {
  return value in StudentDetailInformationSubjectChangeEnum;
}
