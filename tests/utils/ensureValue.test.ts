// File: tests/utils/ensureValue.test.ts
import { describe, it, expect } from "vitest";
import { ensureValue } from "@utils/index.js"; // Adjust the import path as needed

describe("ensureValue", () => {
  it("should return the value if it is not null or undefined", () => {
    expect(ensureValue(5)).toBe(5);
    expect(ensureValue("hello")).toBe("hello");

    const arr:Partial<number[]> = [];
    expect(ensureValue(arr)).toBe(arr);
  });

  it("should throw an error with the default message if value is null", () => {
    expect(() => ensureValue(null)).toThrow("Value cannot be null or undefined!");
  });

  it("should throw an error with the default message if value is undefined", () => {
    expect(() => ensureValue(undefined)).toThrow("Value cannot be null or undefined!");
  });

  it("should throw an error with a custom message if provided", () => {
    const customMessage = "Custom error message";
    expect(() => ensureValue(null, customMessage)).toThrow(customMessage);
    expect(() => ensureValue(undefined, customMessage)).toThrow(customMessage);
  });
});
