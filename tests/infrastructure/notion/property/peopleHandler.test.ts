import { describe, it, expect, vi } from "vitest";
import { 
  peopleResponseHandler, 
  peopleRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import { 
  NotionUUID, 
  PeoplePropertyResponse, 
  PeoplePropertyRequest, 
  toNotionUUID 
} from "@domain/types/index.js";

import { logger } from "@utils/index.js";
import { PartialUserObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

// Mock the `toNotionUUID` function
vi.mock("@domain/types/index.js", () => ({
  toNotionUUID: vi.fn((id) => id),
}));

// Mock the logger
vi.spyOn(logger, "warn").mockImplementation(() => {});

describe("peopleResponseHandler", () => {
  it("should return a NotionUUID when a valid person is provided", () => {
    const mockResponse: PeoplePropertyResponse = {
      id: "mock",
      type: "people",
      people: [{ id: "1a9b95a4c61981818087dbf2a21465b6" } as PartialUserObjectResponse]
    };

    const result = peopleResponseHandler(mockResponse, "a person");

    expect(result).toBe("1a9b95a4c61981818087dbf2a21465b6");
  });

  it("should throw an error when the people array is empty", () => {
    const mockResponse: PeoplePropertyResponse = {
      id: "mock",
      type: "people",
      people: []
    };

    expect(() => peopleResponseHandler(mockResponse, "a person")).toThrowError(
      "People property is empty"
    );
  });

  it("should log a warning when there are more than one person in the response", () => {
    const mockResponse: PeoplePropertyResponse = {
      id: "mock",
      type: "people",
      people: [{ id: "person-1" }, { id: "person-2" }] as PartialUserObjectResponse[]
    };

    peopleResponseHandler(mockResponse, "a person");

    expect(logger.warn).toHaveBeenCalledWith(
      "More than 2 people were found in the response"
    );
  });

  it("should throw an error for an invalid response option", () => {
    const mockResponse: PeoplePropertyResponse = {
      id: "mock",
      type: "people",
      people: [{ id: "1a9b95a4c61981818087dbf2a21465b6" } as PartialUserObjectResponse] 
    };

    expect(() => peopleResponseHandler(mockResponse, "invalid-option" as any)).toThrowError(
      "Invalid people response option"
    );
  });
});

describe("peopleRequestHandler", () => {
  it("should return a valid PeoplePropertyRequest", () => {
    const input = "1a9b95a4c61981818087dbf2a21465b6" as NotionUUID;
    const expected: PeoplePropertyRequest = {
      type: "people",
      people: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }]
    };

    const result = peopleRequestHandler(input, "a person");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid request option", () => {
    const input: NotionUUID = "1a9b95a4c61981818087dbf2a21465b6" as NotionUUID;

    expect(() => peopleRequestHandler(input, "invalid-option" as any)).toThrowError(
      "Invalid people request option"
    );
  });
});
