import { describe, it, expect } from "vitest";
import { 
  multiSelectResponseHandler, 
  multiSelectRequestHandler 
} from "@infrastructure/notion/property/multiSelectHandler.js"; // Adjust path

import { 
  MultiSelectPropertyResponse, 
  MultiSelectPropertyRequest, 
  SubfieldsSubfieldNameEnum, 
  isValidSubfieldsSubfieldNameEnum, 
  SubjectsSubjectNameEnum, 
  isValidSubjectsSubjectNameEnum 
} from "@domain/types/index.js";

// Mocking valid enums
enum MockSubjectsSubjectNameEnum {
  MATH = "Mathematics",
  PHYSICS = "Physics"
}

enum MockSubfieldsSubfieldNameEnum {
  ALGEBRA = "Algebra",
  GEOMETRY = "Geometry"
}

// Mock functions
const isValidSubjectsSubjectNameEnumMock = (name: string): name is MockSubjectsSubjectNameEnum =>
  Object.values(MockSubjectsSubjectNameEnum).includes(name as MockSubjectsSubjectNameEnum);

const isValidSubfieldsSubfieldNameEnumMock = (name: string): name is MockSubfieldsSubfieldNameEnum =>
  Object.values(MockSubfieldsSubfieldNameEnum).includes(name as MockSubfieldsSubfieldNameEnum);

describe("multiSelectResponseHandler", () => {
  it("should return valid subject names when given a correct multi_select response", () => {
    const mockResponse: MultiSelectPropertyResponse = {
      id: "mock",
      type: "multi_select",
      multi_select: [
        { id: "mock", color: "default", name: "数学" },
        { id: "mock", color: "default",  name: "物理" }
      ]
    };

    const result = multiSelectResponseHandler(mockResponse, "subject names");

    expect(result).toEqual(["数学", "物理"]);
  });

  it("should return valid subfield names when given a correct multi_select response", () => {
    const mockResponse: MultiSelectPropertyResponse = {
      id: "mock",
      type: "multi_select",
      multi_select: [
        { id: "mock", color: "default", name: "Listening&Speaking" },
        { id: "mock", color: "default", name: "漢文" }
      ]
    };

    const result = multiSelectResponseHandler(mockResponse, "subfield names");

    expect(result).toEqual(["Listening&Speaking", "漢文"]);
  });

  it("should throw an error if an invalid subfield name is found", () => {
    const mockResponse: MultiSelectPropertyResponse = {
      id: "mock",
      type: "multi_select",
      multi_select: [
        { id: "mock", color: "default", name: "InvalidSubfield" }
      ]
    };

    expect(() => multiSelectResponseHandler(mockResponse, "subfield names")).toThrowError(
      "Invalid subfield name: InvalidSubfield"
    );
  });

  it("should throw an error if an invalid subject name is found", () => {
    const mockResponse: MultiSelectPropertyResponse = {
      id: "mock",
      type: "multi_select",
      multi_select: [
        { id: "mock", color: "default",  name: "InvalidSubject" }
      ]
    };

    expect(() => multiSelectResponseHandler(mockResponse, "subject names")).toThrowError(
      "Invalid subject name: InvalidSubject"
    );
  });

  it("should throw an error if an invalid response option is given", () => {
    const mockResponse: MultiSelectPropertyResponse = {
      id: "mock",
      type: "multi_select",
      multi_select: [
        { id: "mock", color: "default", name: "数学" }
      ]
    };

    expect(() => multiSelectResponseHandler(mockResponse, "invalid_option" as any)).toThrowError(
      "Invalid option for selectResponseHandler: invalid_option"
    );
  });
});

describe("multiSelectRequestHandler", () => {
  it("should return a valid MultiSelectPropertyRequest for subject names", () => {
    const input: SubjectsSubjectNameEnum[] = [
      "数学",
      "物理"
    ];

    const expected: MultiSelectPropertyRequest = {
      type: "multi_select",
      multi_select: [
        { name: "数学" },
        { name: "物理" }
      ]
    };

    const result = multiSelectRequestHandler(input, "subject names");

    expect(result).toEqual(expected);
  });

  it("should return a valid MultiSelectPropertyRequest for subfield names", () => {
    const input: SubfieldsSubfieldNameEnum[] = [
      "Listening&Speaking",
      "漢文"
    ];

    const expected: MultiSelectPropertyRequest = {
      type: "multi_select",
      multi_select: [
        { name: "Listening&Speaking" },
        { name: "漢文" }
      ]
    };

    const result = multiSelectRequestHandler(input, "subfield names");

    expect(result).toEqual(expected);
  });

  it("should throw an error if an invalid subfield name is provided", () => {
    const input = ["InvalidSubfield"];

    expect(() => multiSelectRequestHandler(input as any, "subfield names")).toThrowError(
      "Invalid subfield name: InvalidSubfield"
    );
  });

  it("should throw an error if an invalid subject name is provided", () => {
    const input = ["InvalidSubject"];

    expect(() => multiSelectRequestHandler(input as any, "subject names")).toThrowError(
      "Invalid subject name: InvalidSubject"
    );
  });

  it("should throw an error if an invalid request option is given", () => {
    const input = ["数学"];

    expect(() => multiSelectRequestHandler(input as any, "invalid_option" as any)).toThrowError(
      "Invalid option for multiSelectRequestHandler: invalid_option"
    );
  });
});
