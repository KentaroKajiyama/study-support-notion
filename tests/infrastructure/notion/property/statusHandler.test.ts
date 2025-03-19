import { describe, it, expect } from "vitest";
import { 
  statusResponseHandler, 
  statusRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import {
  StatusPropertyResponse,
  StatusPropertyRequest,
  StudentDetailInformationSubjectChangeEnum,
  StudentProblemsReviewLevelEnum,
  StudentProblemsAnswerStatusEnum, 
  ActualBlocksProblemLevelEnum,
  SubjectsSubjectNameEnum,
  SubfieldsSubfieldNameEnum,
  StudentsOverviewsChatStatusEnum,
  StudentsOverviewsDistributionStatusEnum,
  StudentsOverviewsPlanStatusEnum,
  isValidStudentsOverviewsChatStatusEnum,
  isValidStudentsOverviewsDistributionStatusEnum,
  isValidStudentsOverviewsPlanStatusEnum,
  isValidProblemsProblemLevelEnum,
  isValidSubfieldsSubfieldNameEnum,
  isValidSubjectsSubjectNameEnum,
  isValidStudentProblemsAnswerStatusEnum,
} from "@domain/types/index.js";
import { PartialSelectResponse } from "@notionhq/client/build/src/api-endpoints.js";

describe("statusResponseHandler", () => {
  it("should return a valid subject name when option is 'a subject name'", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": {
        "id": "ou@_",
        "name": "数学",
        "color": "purple"
      }
    };

    const result = statusResponseHandler(mockResponse, "a subject name");

    expect(result).toBe("数学");
  });

  it("should throw an error for an invalid subject name", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": {
        "id": "ou@_",
        "name": "数学３",
        "color": "purple"
      }
    };

    expect(() => statusResponseHandler(mockResponse, "a subject name"))
      .toThrowError("Invalid subject name: 数学３");
  });

  it("should return a valid problem level when option is 'a problem level'", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": {
        "id": "ou@_",
        "name": "基礎２",
        "color": "purple"
      }
    };

    expect(isValidProblemsProblemLevelEnum((mockResponse.status as PartialSelectResponse).name)).toBeTruthy();

    const result = statusResponseHandler(mockResponse, "a problem level");

    expect(result).toBe("基礎２");
  });

  it("should throw an error if problem level is missing", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": null
    };

    expect(() => statusResponseHandler(mockResponse, "a problem level"))
      .toThrowError("Problem level is missing.");
  });

  it("should return a valid chat status when option is 'a chat status'", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": {
        "id": "ou@_",
        "name": "Chat",
        "color": "purple"
      }
    };

    expect(isValidStudentsOverviewsChatStatusEnum((mockResponse.status as PartialSelectResponse).name)).toBeTruthy();

    const result = statusResponseHandler(mockResponse, "a chat status");

    expect(result).toBe("Chat");
  });

  it("should throw an error if chat status is missing", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": null
    };

    expect(() => statusResponseHandler(mockResponse, "a chat status"))
      .toThrowError("Chat status is missing.");
  });

  it("should return a valid distribution status when option is 'a distribution status'", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": {
        "id": "ou@_",
        "name": "正常",
        "color": "purple"
      }
    };

    expect(isValidStudentsOverviewsDistributionStatusEnum((mockResponse.status as PartialSelectResponse).name)).toBeTruthy();

    const result = statusResponseHandler(mockResponse, "a distribution status");

    expect(result).toBe("正常");
  });

  it("should return an empty string when status is null for 'string' option", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": null
    };

    const result = statusResponseHandler(mockResponse, "string");

    expect(result).toBe("");
  });

  it("should throw an error for an invalid option", () => {
    const mockResponse: StatusPropertyResponse = {
      "id": "Yc%3FJ",
      "type": "status",
      "status": {
        "id": "ou@_",
        "name": "正常",
        "color": "purple"
      }
    };

    expect(() => statusResponseHandler(mockResponse, "invalid-option" as any))
      .toThrowError("Invalid option for statusResponseHandler: invalid-option");
  });
});

describe("statusRequestHandler", () => {
  it("should return a valid StatusPropertyRequest for 'a subject name'", () => {
    const input: SubjectsSubjectNameEnum = "数学";
    const expected: StatusPropertyRequest = {
      type: "status",
      status: { name: "数学" },
    };

    const result = statusRequestHandler(input, "a subject name");

    expect(result).toEqual(expected);
  });

  it("should throw an error if input is invalid for 'a subject name'", () => {
    expect(() => statusRequestHandler("InvalidSubject" as any, "a subject name"))
      .toThrowError("Invalid input for status property option:a subject name. input : InvalidSubject");
  });

  it("should return a valid StatusPropertyRequest for 'a problem level'", () => {
    const input: ActualBlocksProblemLevelEnum = "基礎１";
    expect(isValidProblemsProblemLevelEnum(input)).toBeTruthy();

    const expected: StatusPropertyRequest = {
      type: "status",
      status: { name: "基礎１" },
    };

    const result = statusRequestHandler(input, "a problem level");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid problem level", () => {
    expect(() => statusRequestHandler("Impossible" as any, "a problem level"))
      .toThrowError("Invalid input for status property option:a problem level. input : Impossible");
  });

  it("should return a valid StatusPropertyRequest for 'a chat status'", () => {
    const input: StudentsOverviewsChatStatusEnum = "Nope";
    expect(isValidStudentsOverviewsChatStatusEnum(input)).toBeTruthy();

    const expected: StatusPropertyRequest = {
      type: "status",
      status: { name: "Nope" },
    };

    const result = statusRequestHandler(input, "a chat status");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid chat status", () => {
    expect(() => statusRequestHandler("InNope" as any, "a chat status"))
      .toThrowError("Invalid input for status property option:a chat status. input : InNope");
  });

  it("should return a valid StatusPropertyRequest for 'a plan status'", () => {
    const input: StudentsOverviewsPlanStatusEnum = "シミュレーション中";
    expect(isValidStudentsOverviewsPlanStatusEnum(input)).toBeTruthy();

    const expected: StatusPropertyRequest = {
      type: "status",
      status: { name: "シミュレーション中" },
    };

    const result = statusRequestHandler(input, "a plan status");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid option", () => {
    expect(() => statusRequestHandler("ValidName" as any, "invalid-option" as any))
      .toThrowError("Invalid option for statusRequestHandler: invalid-option");
  });
});
