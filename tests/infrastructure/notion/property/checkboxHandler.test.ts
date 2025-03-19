import { describe, it, expect } from "vitest";
import { checkboxResponseHandler, checkboxRequestHandler } from "@infrastructure/notion/property/checkboxHandler.js"; // Adjust the path
import { CheckboxPropertyRequest, CheckboxPropertyResponse } from "@domain/types/index.js";

describe("Checkbox Handlers", () => {
  describe("checkboxResponseHandler", () => {
    it("should return the checkbox value from CheckboxPropertyResponse", () => {
      const mockResponse: CheckboxPropertyResponse = { checkbox: true, type: "checkbox", id: "mock" };
      expect(checkboxResponseHandler(mockResponse, "")).toBe(true);

      const mockResponseFalse: CheckboxPropertyResponse = { checkbox: false, type: "checkbox", id: "mock" };
      expect(checkboxResponseHandler(mockResponseFalse, "")).toBe(false);
    });

    it("should throw an error for an invalid option", () => {
      const mockResponse: CheckboxPropertyResponse = { checkbox: true, type: "checkbox", id: "mock" };
      expect(() => checkboxResponseHandler(mockResponse, "invalid" as any)).toThrowError(
        "Invalid checkbox option: invalid"
      );
    });
  });

  describe("checkboxRequestHandler", () => {
    it("should return a CheckboxPropertyRequest object", () => {
      const result: CheckboxPropertyRequest = checkboxRequestHandler(true, "");
      expect(result).toEqual({ checkbox: true });

      const resultFalse: CheckboxPropertyRequest = checkboxRequestHandler(false, "");
      expect(resultFalse).toEqual({ checkbox: false });
    });

    it("should throw an error for an invalid option", () => {
      expect(() => checkboxRequestHandler(true, "invalid" as any)).toThrowError(
        "Invalid checkbox option: invalid"
      );
    });
  });
});
