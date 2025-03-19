import { describe, it, expect, vi } from "vitest";
import { 
  phoneNumberResponseHandler, 
  phoneNumberRequestHandler 
} from "@infrastructure/notion/property/index.js"; // Adjust path

import { 
  PhoneNumber, 
  PhoneNumberPropertyResponse, 
  PhoneNumberPropertyRequest, 
  toPhoneNumber 
} from "@domain/types/index.js";

import { logger } from "@utils/index.js";

// Mock the `toPhoneNumber` function
vi.mock("@domain/types/index.js", () => ({
  toPhoneNumber: vi.fn((phone) => phone),
}));

// Mock the logger
vi.spyOn(logger, "warn").mockImplementation(() => {});

describe("phoneNumberResponseHandler", () => {
  it("should return a valid phone number when provided", () => {
    const mockResponse: PhoneNumberPropertyResponse = {
      id: "mock",
      type: "phone_number",
      phone_number: "08026231847"
    };

    const result = phoneNumberResponseHandler(mockResponse, "phone number");

    expect(result).toBe("08026231847");
  });

  it("should return null when the phone number is null", () => {
    const mockResponse: PhoneNumberPropertyResponse = {
      id: "mock",
      type: "phone_number",
      phone_number: null
    };

    const result = phoneNumberResponseHandler(mockResponse, "phone number");

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith("Phone number is null");
  });

  it("should throw an error for an invalid response option", () => {
    const mockResponse: PhoneNumberPropertyResponse = {
      id: "mock",
      type: "phone_number",
      phone_number: "08026231847"
    };

    expect(() => phoneNumberResponseHandler(mockResponse, "invalid-option" as any)).toThrowError(
      "Invalid option for phoneNumberResponseHandler"
    );
  });
});

describe("phoneNumberRequestHandler", () => {
  it("should return a valid PhoneNumberPropertyRequest", () => {
    const input: string = "08026231847";
    const expected: PhoneNumberPropertyRequest = {
      phone_number: "08026231847"
    };

    const result = phoneNumberRequestHandler(input, "phone number");

    expect(result).toEqual(expected);
  });

  it("should return a PhoneNumberPropertyRequest with null if input is null", () => {
    const expected: PhoneNumberPropertyRequest = {
      phone_number: null
    };

    const result = phoneNumberRequestHandler(null, "phone number");

    expect(result).toEqual(expected);
  });

  it("should throw an error for an invalid request option", () => {
    const input: string = "08026231847";

    expect(() => phoneNumberRequestHandler(input, "invalid-option" as any)).toThrowError(
      "Invalid option for phoneNumberRequestHandler"
    );
  });
});
