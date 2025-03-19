import { describe, it, expect } from "vitest";
import { 
  numberResponseHandler, 
  numberRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import { 
  NumberPropertyResponse, 
  NumberPropertyRequest, 
  Uint, 
  toUint, 
  Int, 
  toInt, 
  isUint, 
  isInt 
} from "@domain/types/index.js";

// Mock Uint and Int conversion functions
const mockToUint = (value: number): Uint => Math.max(0, Math.floor(value)) as Uint;
const mockToInt = (value: number): Int => Math.floor(value) as Int;

// Mock Uint and Int validators
const mockIsUint = (value: number): boolean => value >= 0 && Number.isInteger(value);
const mockIsInt = (value: number): boolean => Number.isInteger(value);

describe("numberResponseHandler", () => {
  it("should return a uint when given a valid number and option 'uint'", () => {
    const mockResponse: NumberPropertyResponse = { id: "mock", type: "number", number: 10 };
    const result = numberResponseHandler(mockResponse, "uint");

    expect(result).toBe(toUint(10));
  });

  it("should return an int when given a valid number and option 'int'", () => {
    const mockResponse: NumberPropertyResponse = { id: "mock", type: "number", number: -5 };
    const result = numberResponseHandler(mockResponse, "int");

    expect(result).toBe(toInt(-5));
  });

  it("should return the raw number when given a valid number and option 'any'", () => {
    const mockResponse: NumberPropertyResponse = { id: "mock", type: "number", number: 3.14 };
    const result = numberResponseHandler(mockResponse, "any");

    expect(result).toBe(3.14);
  });

  it("should return 0.0 when given null and option 'any'", () => {
    const mockResponse: NumberPropertyResponse = { id: "mock", type: "number", number: null };
    const result = numberResponseHandler(mockResponse, "any");

    expect(result).toBe(0.0);
  });

  it("should return null when given null and option 'uint'", () => {
    const mockResponse: NumberPropertyResponse = { id: "mock", type: "number", number: null };
    const result = numberResponseHandler(mockResponse, "uint");

    expect(result).toBeNull();
  });

  it("should throw an error when given an invalid option", () => {
    const mockResponse: NumberPropertyResponse = { id: "mock", type: "number", number: 42 };
    expect(() => numberResponseHandler(mockResponse, "invalid_option" as any)).toThrowError(
      "Invalid number option: invalid_option"
    );
  });
});

describe("numberRequestHandler", () => {
  it("should return a valid NumberPropertyRequest for uint", () => {
    const input: Uint = 10 as Uint;
    const expected: NumberPropertyRequest = { number: 10, type: "number" };

    const result = numberRequestHandler(input, "uint");

    expect(result).toEqual(expected);
  });

  it("should return a valid NumberPropertyRequest for int", () => {
    const input: Int = -7 as Int;
    const expected: NumberPropertyRequest = { number: -7, type: "number" };

    const result = numberRequestHandler(input, "int");

    expect(result).toEqual(expected);
  });

  it("should return a valid NumberPropertyRequest for any", () => {
    const input: number = 3.5;
    const expected: NumberPropertyRequest = { number: 3.5, type: "number" };

    const result = numberRequestHandler(input, "any");

    expect(result).toEqual(expected);
  });

  it("should return a valid NumberPropertyRequest for null input", () => {
    const expected: NumberPropertyRequest = { number: null, type: "number" };

    const result = numberRequestHandler(null, "uint");

    expect(result).toEqual(expected);
  });

  it("should throw an error when given an invalid uint", () => {
    const input: number = -1; // Invalid uint

    expect(() => numberRequestHandler(input, "uint")).toThrowError(
      `Invalid uint: -1`
    );
  });

  it("should throw an error when given an invalid int", () => {
    const input: number = 3.5; // Not an integer

    expect(() => numberRequestHandler(input, "int")).toThrowError(
      `Invalid int: 3.5`
    );
  });

  it("should throw an error when given NaN as input", () => {
    expect(() => numberRequestHandler(NaN, "any")).toThrowError(
      "Invalid number: NaN"
    );
  });

  it("should throw an error when given an invalid option", () => {
    expect(() => numberRequestHandler(42, "invalid_option" as any)).toThrowError(
      "Invalid number option: invalid_option"
    );
  });
});
