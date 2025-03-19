import { describe, it, expect, vi } from "vitest";
import { 
  selectResponseHandler, 
  selectRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import {
  SelectPropertyResponse,
  SelectPropertyRequest,
  SubfieldsSubfieldNameEnum,
  ActualBlocksProblemLevelEnum,
  isValidProblemsProblemLevelEnum,
  isValidSubfieldsSubfieldNameEnum,
  SubjectsSubjectNameEnum,
  isValidSubjectsSubjectNameEnum,
  StudentProblemsAnswerStatusEnum,
  isValidStudentProblemsAnswerStatusEnum,
  StudentProblemsReviewLevelEnum,
  StudentSubjectInformationSubjectGoalLevelEnum,
  isValidStudentSubjectInformationSubjectGoalLevelEnum,
  StudentSubjectInformationSubjectLevelEnum,
  isValidStudentSubjectInformationSubjectLevelEnum,
} from "@domain/types/index.js";

import { logger } from "@utils/index.js";

// Mock `logger` to suppress warnings/errors in test output
vi.mock("@utils/index.js", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// vi.mock("@domain/types/index.js", () => ({
//   isValidProblemsProblemLevelEnum: vi.fn((value) => Object.values(ActualBlocksProblemLevelEnum).includes(value)),
//   isValidSubfieldsSubfieldNameEnum: vi.fn((value) => Object.values(SubfieldsSubfieldNameEnum).includes(value)),
//   isValidSubjectsSubjectNameEnum: vi.fn((value) => Object.values(SubjectsSubjectNameEnum).includes(value)),
//   isValidStudentProblemsAnswerStatusEnum: vi.fn((value) => Object.values(StudentProblemsAnswerStatusEnum).includes(value)),
//   isValidStudentSubjectInformationSubjectGoalLevelEnum: vi.fn((value) => Object.values(StudentSubjectInformationSubjectGoalLevelEnum).includes(value)),
//   isValidStudentSubjectInformationSubjectLevelEnum: vi.fn((value) => Object.values(StudentSubjectInformationSubjectLevelEnum).includes(value)),
// }));

describe("selectResponseHandler", () => {
  it("should return a valid subject name when option is 'a subject name'", () => {
    const mockResponse: SelectPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "select",
      "select": {
        "id": "ou@_",
        "name": "数学",
        "color": "purple"
      }
    };

    const result = selectResponseHandler(mockResponse, "a subject name");

    expect(result).toBe("数学");
  });

  it("should throw an error for an invalid subject name", () => {
    const mockResponse: SelectPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "select",
      "select": {
        "id": "ou@_",
        "name": "InvalidSubject",
        "color": "purple"
      }
    };

    expect(() => selectResponseHandler(mockResponse, "a subject name")).toThrowError("Invalid subject name: InvalidSubject");
  });

  it("should return null when option is 'a subject level' and select is null", () => {
    const mockResponse: SelectPropertyResponse = {
      id: "Yc%3FJ",
      type: "select",
      select: null
    };

    const result = selectResponseHandler(mockResponse, "a subject level");

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith("subject level is missing");
  });

  it("should throw an error for an invalid option", () => {
    const mockResponse: SelectPropertyResponse = {
      id: "Yc%3FJ",
      type: "select",
      select: { name: "数学", id: "Yc%3FJ", color: "red" }
    };

    expect(() => selectResponseHandler(mockResponse, "invalid-option" as any)).toThrowError("Invalid option for selectResponseHandler: invalid-option");
  });

  it("should return a problem level if valid", () => {

    const mockResponse: SelectPropertyResponse = {
      id: "Yc%3FJ",
      type: "select",
      select: { name: "基礎３", id: "Yc%3FJ", color: "red" }
    };

    const result = selectResponseHandler(mockResponse, "a problem level");

    expect(result).toBe("基礎３");
  });

  it("should throw an error if problem level is missing", () => {
    const mockResponse: SelectPropertyResponse = {
      select: null,
      id: "Yc%3FJ",
      type: "select",
    };

    expect(() => selectResponseHandler(mockResponse, "a problem level")).toThrowError("Problem level is missing.");
  });
});

describe("selectRequestHandler", () => {
  it("should return a valid SelectPropertyRequest for 'a subject name'", () => {
    const input: SubjectsSubjectNameEnum = "数学";
    const expected: SelectPropertyRequest = {
      type: "select",
      select: { name: "数学" },
    };

    const result = selectRequestHandler(input, "a subject name");

    expect(result).toEqual(expected);
  });

  it("should throw an error if input is a number for 'a subject name'", () => {
    expect(() => selectRequestHandler(123 as any, "a subject name")).toThrowError("Number is not allowed as a subject name");
  });

  it("should throw an error for an invalid input for 'a problem level'", () => {

    expect(() => selectRequestHandler("Impossible" as any, "a problem level")).toThrowError("Invalid input for select property option:a problem level. input : Impossible");
  });

  it("should return a valid SelectPropertyRequest for 'a problem level'", () => {

    const input: ActualBlocksProblemLevelEnum = "基礎２";
    const expected: SelectPropertyRequest = {
      type: "select",
      select: { name: "基礎２" },
    };

    const result = selectRequestHandler(input, "a problem level");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid option", () => {
    expect(() => selectRequestHandler("数学" as any, "invalid-option" as any)).toThrowError("Invalid option for selectRequestHandler: invalid-option");
  });
});
