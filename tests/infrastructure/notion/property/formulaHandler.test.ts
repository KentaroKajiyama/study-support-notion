import { describe, it, expect } from "vitest";
import { formulaResponseHandler } from "@infrastructure/notion/property/formulaHandler.js"; // Adjust path
import { FormulaPropertyResponse, NotionUUID, toNotionUUID } from "@domain/types/index.js";

describe("formulaResponseHandler", () => {
  it("should return a NotionUUID when given a valid string formula", () => {
    const mockResponse: FormulaPropertyResponse = {
      id: "mock",
      type: "formula",
      formula: {
        type: "string",
        string: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
      },
    };

    expect(formulaResponseHandler(mockResponse, "a page id")).toBe(
      toNotionUUID("123e4567-e89b-12d3-a456-426614174000")
    );
  });

  it("should throw an error if the formula type is not a string", () => {
    const mockResponse: FormulaPropertyResponse = {
      id: "mock",
      type: "formula",
      formula: {
        type: "number",
        number: 42, // Invalid type
      } as any, // Force type mismatch for test
    };

    expect(() => formulaResponseHandler(mockResponse, "a page id")).toThrowError(
      "Invalid formula type. If you want a page id, you must provide a string value."
    );
  });

  it("should throw an error if the formula string is null", () => {
    const mockResponse: FormulaPropertyResponse = {
      id: "mock",
      type: "formula",
      formula: {
        type: "string",
        string: null, // Null value
      },
    };

    expect(() => formulaResponseHandler(mockResponse, "a page id")).toThrowError(
      "Invalid formula value. Null is not allowed"
    );
  });

  it("should throw an error if an invalid formula option is provided", () => {
    const mockResponse: FormulaPropertyResponse = {
      id: "mock",
      type: "formula",
      formula: {
        type: "string",
        string: "123e4567-e89b-12d3-a456-426614174000",
      },
    };

    expect(() => formulaResponseHandler(mockResponse, "invalid_option" as any)).toThrowError(
      "Invalid formula option"
    );
  });
});
