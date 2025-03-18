import { describe, expect, it } from "vitest";
import {
  isValidNotionDbPropertiesPropertyType,
  isValidStudentSubjectInformationSubjectLevelEnum,
  isValidStudentSubjectInformationSubjectGoalLevelEnum,
  isValidProblemsProblemLevelEnum,
  isValidSubjectsSubjectNameEnum,
  isValidSubfieldsSubfieldNameEnum,
  isValidStudentProblemsAnswerStatusEnum,
  isUndoneAnswerStatus,
  isWrongAnswerStatus,
  isCorrectAnswerStatus,
  isValidStudentProblemsUnderstandingLevelEnum,
  isValidStudentProblemsReviewLevelEnum,
  isValidStudentsOverviewsChatStatusEnum,
  isValidStudentsOverviewsDistributionStatusEnum,
  isValidStudentsOverviewsPlanStatusEnum,
} from "@domain/types/enumTypes.js"; 

describe("Enum Validations", () => {
  it("should validate NotionDbPropertiesPropertyType", () => {
    expect(isValidNotionDbPropertiesPropertyType("title")).toBe(true);
    expect(isValidNotionDbPropertiesPropertyType("invalid_type")).toBe(false);
  });

  it("should validate StudentSubjectInformationSubjectLevelEnum", () => {
    expect(isValidStudentSubjectInformationSubjectLevelEnum("基礎１")).toBe(true);
    expect(isValidStudentSubjectInformationSubjectLevelEnum("基礎５")).toBe(false);
  });

  it("should validate StudentSubjectInformationSubjectGoalLevelEnum", () => {
    expect(isValidStudentSubjectInformationSubjectGoalLevelEnum(48)).toBe(true);
    expect(isValidStudentSubjectInformationSubjectGoalLevelEnum("50")).toBe(true);
    expect(isValidStudentSubjectInformationSubjectGoalLevelEnum(100)).toBe(false);
  });

  it("should validate ProblemsProblemLevelEnum", () => {
    expect(isValidProblemsProblemLevelEnum("基礎２")).toBe(true);
    expect(isValidProblemsProblemLevelEnum("基礎５")).toBe(false);
  });

  it("should validate SubjectsSubjectNameEnum", () => {
    expect(isValidSubjectsSubjectNameEnum("数学")).toBe(true);
    expect(isValidSubjectsSubjectNameEnum("漢文")).toBe(false);
  });

  it("should validate SubfieldsSubfieldNameEnum", () => {
    expect(isValidSubfieldsSubfieldNameEnum("Listening&Speaking")).toBe(true);
    expect(isValidSubfieldsSubfieldNameEnum("国語")).toBe(false);
  });

  it("should validate StudentProblemsAnswerStatusEnum", () => {
    expect(isValidStudentProblemsAnswerStatusEnum("未回答")).toBe(true);
    expect(isValidStudentProblemsAnswerStatusEnum("解答済み")).toBe(false);
  });

  it("should validate answer status functions", () => {
    expect(isUndoneAnswerStatus("未回答")).toBe(true);
    expect(isWrongAnswerStatus("不正解")).toBe(true);
    expect(isCorrectAnswerStatus("正解")).toBe(true);
    expect(isCorrectAnswerStatus("未回答")).toBe(false);
  });

  it("should validate StudentProblemsUnderstandingLevelEnum", () => {
    expect(isValidStudentProblemsUnderstandingLevelEnum(3)).toBe(true);
    expect(isValidStudentProblemsUnderstandingLevelEnum(6)).toBe(false);
  });

  it("should validate StudentProblemsReviewLevelEnum", () => {
    expect(isValidStudentProblemsReviewLevelEnum("レベル３")).toBe(true);
    expect(isValidStudentProblemsReviewLevelEnum("レベル１０")).toBe(false);
  });

  it("should validate StudentsOverviewsChatStatusEnum", () => {
    expect(isValidStudentsOverviewsChatStatusEnum("Chat")).toBe(true);
    expect(isValidStudentsOverviewsChatStatusEnum("Unknown")).toBe(false);
  });

  it("should validate StudentsOverviewsDistributionStatusEnum", () => {
    expect(isValidStudentsOverviewsDistributionStatusEnum("正常")).toBe(true);
    expect(isValidStudentsOverviewsDistributionStatusEnum("Failed")).toBe(false);
  });

  it("should validate StudentsOverviewsPlanStatusEnum", () => {
    expect(isValidStudentsOverviewsPlanStatusEnum("確定")).toBe(true);
    expect(isValidStudentsOverviewsPlanStatusEnum("Pending")).toBe(false);
  });
});
