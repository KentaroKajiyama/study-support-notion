// TODO: Automation
// 🚀 Auto-generated from MySQL ENUM
import { NotionPagePropertyType } from "./myNotionType.js";
export type NotionDbPropertiesPropertyTypeEnum = NotionPagePropertyType;

export function isValidNotionDbPropertiesPropertyType(value: string): value is NotionDbPropertiesPropertyTypeEnum {
  return ["title", "rich_text", "number", "select", "multi_select", "date", "formula", "relation", "rollup", "people", "files", "checkbox", "url", "email", "phone_number", "created_time", "created_by", "last_edited_time", "last_edited_by", "status", "unique_id", "verification"].includes(value);
}

export type StudentSubjectInformationSubjectLevelEnum = '基礎１'|'基礎２'|'基礎３';
export function isValidStudentSubjectInformationSubjectLevelEnum(value: string): value is StudentSubjectInformationSubjectLevelEnum {
  return ['基礎１', '基礎２', '基礎３'].includes(value);
}

export type StudentSubjectInformationSubjectGoalLevelEnum = 48 | 50 | 52.5 | 55 | 57.5 | 60 | 62.5
export function isValidStudentSubjectInformationSubjectGoalLevelEnum(value: string | number): value is StudentSubjectInformationSubjectGoalLevelEnum {
  if (typeof value === 'string') value = Number(value)
  return [48, 50, 52.5, 55, 57.5, 60, 62.5].includes(Number(value));
}

export type ProblemsProblemLevelEnum = '基礎１'|'基礎２'|'基礎３';
export function isValidProblemsProblemLevelEnum(value: string): value is ProblemsProblemLevelEnum {
  return ['基礎１', '基礎２', '基礎３'].includes(value);
}

export type ActualBlocksProblemLevelEnum = ProblemsProblemLevelEnum;
export function isValidActualBlocksProblemLevelEnum(value: string): value is ActualBlocksProblemLevelEnum {
  return ['基礎１', '基礎２', '基礎３'].includes(value);
}

export type DefaultBlocksProblemLevelEnum = ProblemsProblemLevelEnum;
export function isValidDefaultBlocksProblemLevelEnum(value: string): value is DefaultBlocksProblemLevelEnum {
  return ['基礎１', '基礎２', '基礎３'].includes(value);
}

export type SubjectsSubjectNameEnum = '国語'|'数学'|'英語'|'物理'|'化学'|'生物'|'日本史'|'世界史'|'地理';
export function isValidSubjectsSubjectNameEnum(value: string): value is SubjectsSubjectNameEnum {
  return ['国語', '数学', '英語', '物理', '化学', '生物', '日本史', '世界史', '地理'].includes(value);
}

export type SubfieldsSubfieldNameEnum = '現代文'|'古文'|'漢文'|'数学'|'Reading'|'Listening&Speaking'|'Writing'|'物理'|'化学'|'生物'|'日本史'|'世界史'|'地理';
export function isValidSubfieldsSubfieldNameEnum(value: string): value is SubfieldsSubfieldNameEnum {
  return ['現代文', '古文', '漢文', '数学', 'Reading', 'Listening&Speaking', 'Writing', '物理', '化学', '生物', '日本史', '世界史', '地理'].includes(value);
}

export type StudentProblemsAnswerStatusEnum = '未回答'|'不正解'|'正解'
export function isValidStudentProblemsAnswerStatusEnum(value: string): value is StudentProblemsAnswerStatusEnum {
  return ['未回答', '不正解', '正解'].includes(value);
}
export function isUndoneAnswerStatus(status: StudentProblemsAnswerStatusEnum): boolean {
  return status === '未回答';
}
export function isWrongAnswerStatus(status: StudentProblemsAnswerStatusEnum): boolean {
  return status === '不正解';
}
export function isCorrectAnswerStatus(status:StudentProblemsAnswerStatusEnum): boolean {
  return status === '正解';
}

export type StudentProblemsUnderstandingLevelEnum = 1 | 2 | 3 | 4 | 5 ;
export function isValidStudentProblemsUnderstandingLevelEnum(value: number): value is StudentProblemsUnderstandingLevelEnum {
  return [1, 2, 3, 4, 5].includes(value);
}

export type StudentProblemsReviewLevelEnum = '初学'|'レベル１'|'レベル２'|'レベル３'|'レベル４';
export function isValidStudentProblemsReviewLevelEnum(value: string): value is StudentProblemsReviewLevelEnum {
  return ['初学', 'レベル１', 'レベル２', 'レベル３', 'レベル４'].includes(value);
}

export type StudentsOverviewsAlertSubfieldEnum = SubfieldsSubfieldNameEnum;
export function isValidStudentsOverviewsAlertSubfieldEnum(value: string): value is StudentsOverviewsAlertSubfieldEnum {
  return ['現代文', '古文', '漢文', '数学', 'Reading', 'Listening&Speaking', 'Writing', '物理', '化学', '生物', '日本史', '世界史', '地理'].includes(value);
}

export type StudentsOverviewsChatStatusEnum = 'Chat' | 'Nope';
export function isValidStudentsOverviewsChatStatusEnum(value: string): value is StudentsOverviewsChatStatusEnum {
  return ['Chat', 'Nope'].includes(value);
}

export type StudentsOverviewsDistributionStatusEnum = '正常' | 'エラー発生';
export function isValidStudentsOverviewsDistributionStatusEnum(value: string):value is StudentsOverviewsDistributionStatusEnum {
  return ['正常', 'エラー発生'].includes(value);
}

export type StudentsOverviewsPlanStatusEnum = 'Not Started' | 'シミュレーション中' | '確定';
export function isValidStudentsOverviewsPlanStatusEnum(value: string): value is StudentsOverviewsPlanStatusEnum {
  return ['Not Started', 'シミュレーション中', '確定'].includes(value);
}

export type StudentsOverviewsModifiedPlanSubfieldEnum = SubfieldsSubfieldNameEnum;

export type StudentDetailInformationSubjectChangeEnum = '変更なし' | '変更あり'
export function isValidStudentDetailInformationSubfieldChangeEnum(value: string): value is StudentDetailInformationSubjectChangeEnum {
  return ['変更なし', '変更あり'].includes(value);
}
