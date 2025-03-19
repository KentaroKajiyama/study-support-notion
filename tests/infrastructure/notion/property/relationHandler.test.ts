import { describe, it, expect, vi } from "vitest";
import { 
  relationResponseHandler, 
  relationRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import { 
  NotionUUID, 
  toNotionUUID, 
  RelationPropertyResponse, 
  RelationPropertyRequest 
} from "@domain/types/index.js";

import { logger } from "@utils/index.js";

// Mock the `toNotionUUID` function
vi.mock("@domain/types/index.js", () => ({
  toNotionUUID: vi.fn((id) => id),
}));

// Mock the logger
vi.spyOn(logger, "warn").mockImplementation(() => {});
vi.spyOn(logger, "error").mockImplementation(() => {});

describe("relationResponseHandler", () => {
  it("should return a single page ID when 'a page id' option is used", () => {
    const mockResponse: RelationPropertyResponse = {
      id: "mock",
      type: "relation",
      relation: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }]
    };

    const result = relationResponseHandler(mockResponse, "a page id");

    expect(result).toBe("1a9b95a4c61981818087dbf2a21465b6");
  });

  it("should log a warning and return undefined when 'a page id' option is used but no relations exist", () => {
    const mockResponse: RelationPropertyResponse = {
      id: "mock",
      type: "relation",
      relation: []
    };

    const result = relationResponseHandler(mockResponse, "a page id");

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith("Relation has no relation");
  });

  it("should log an error when 'a page id' option is used but multiple relations exist", () => {
    const mockResponse: RelationPropertyResponse = {
      id: "mock",
      type: "relation",
      relation: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }, { id: "1a9b95a4c61981649fffc91c0ac349ff" }]
    };

    relationResponseHandler(mockResponse, "a page id");

    expect(logger.error).toHaveBeenCalledWith("Relation has more than one relation");
  });

  it("should return an array of page IDs when 'page ids' option is used", () => {
    const mockResponse: RelationPropertyResponse = {
      id: "mock",
      type: "relation",
      relation: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }, { id: "1a9b95a4c61981649fffc91c0ac349ff" }]
    };

    const result = relationResponseHandler(mockResponse, "page ids");

    expect(result).toEqual(["1a9b95a4c61981818087dbf2a21465b6", "1a9b95a4c61981649fffc91c0ac349ff"]);
  });

  it("should log a warning and return an empty array when 'page ids' option is used but no relations exist", () => {
    const mockResponse: RelationPropertyResponse = {
      id: "mock",
      type: "relation",
      relation: []
    };

    const result = relationResponseHandler(mockResponse, "page ids");

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Relation has no relations");
  });

  it("should throw an error for an invalid relation option", () => {
    const mockResponse: RelationPropertyResponse = {
      id: "mock",
      type: "relation",
      relation: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }]
    };

    expect(() => relationResponseHandler(mockResponse, "invalid-option" as any)).toThrowError(
      "Invalid relation option"
    );
  });
});

describe("relationRequestHandler", () => {
  it("should return a valid RelationPropertyRequest for 'a page id'", () => {
    const input: NotionUUID = "1a9b95a4c61981818087dbf2a21465b6" as NotionUUID;
    const expected: RelationPropertyRequest = {
      relation: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }]
    };

    const result = relationRequestHandler(input, "a page id");

    expect(result).toEqual(expected);
  });

  it("should log a warning and return an empty relation for 'a page id' if input is null", () => {
    const expected: RelationPropertyRequest = {
      relation: []
    };

    const result = relationRequestHandler(null, "a page id");

    expect(result).toEqual(expected);
    expect(logger.warn).toHaveBeenCalledWith("No page id provided for relation property option:a page id");
  });

  it("should throw an error if 'a page id' is given an array", () => {
    const input: NotionUUID[] = ["1a9b95a4c61981818087dbf2a21465b6", "1a9b95a4c61981649fffc91c0ac349ff"] as NotionUUID[];

    expect(() => relationRequestHandler(input, "a page id")).toThrowError(
      "Input for relation property option:a page idmust be a single page id"
    );

    expect(logger.error).toHaveBeenCalledWith("Input for relation property option:a page idmust be a single page id");
  });

  it("should return a valid RelationPropertyRequest for 'page ids'", () => {
    const input: NotionUUID[] = ["1a9b95a4c61981818087dbf2a21465b6", "1a9b95a4c61981649fffc91c0ac349ff"] as NotionUUID[];
    const expected: RelationPropertyRequest = {
      relation: [{ id: "1a9b95a4c61981818087dbf2a21465b6" }, { id: "1a9b95a4c61981649fffc91c0ac349ff" }]
    };

    const result = relationRequestHandler(input, "page ids");

    expect(result).toEqual(expected);
  });

  it("should log a warning and return an empty relation for 'page ids' if input is an empty array", () => {
    const input: NotionUUID[] = [];
    const expected: RelationPropertyRequest = {
      relation: []
    };

    const result = relationRequestHandler(input, "page ids");

    expect(result).toEqual(expected);
    expect(logger.warn).toHaveBeenCalledWith("No page ids provided for relation property option:page ids");
  });

  it("should throw an error if 'page ids' is given a non-array input", () => {
    const input: NotionUUID = "1a9b95a4c61981818087dbf2a21465b6" as NotionUUID;

    expect(() => relationRequestHandler(input, "page ids")).toThrowError(
      "Input for relation property option:page idsmust be an array of page ids"
    );

    expect(logger.error).toHaveBeenCalledWith("Input for relation property option:page idsmust be an array of page ids");
  });

  it("should throw an error for an invalid relation request option", () => {
    const input: NotionUUID = "1a9b95a4c61981818087dbf2a21465b6" as NotionUUID;

    expect(() => relationRequestHandler(input, "invalid-option" as any)).toThrowError(
      "Invalid relation option"
    );
  });
});
