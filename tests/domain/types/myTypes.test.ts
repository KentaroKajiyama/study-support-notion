import { describe, it, expect } from "vitest";
import {
  toUint,
  isUint,
  toInt,
  isInt,
  toPhoneNumber,
  isPhoneNumber,
  toEmail,
  isEmail,
  toURLString,
  isValidURLRegex,
  Uint,
  Int,
  PhoneNumber,
  Email,
  URLString,
} from "@domain/types/index.js"; // Adjust the import path if needed

describe("Type Conversion and Validation Functions", () => {
  
  describe("Uint", () => {
    it("should convert valid non-negative integers to Uint", () => {
      expect(toUint(10)).toBe(10 as Uint);
      expect(toUint(0)).toBe(0 as Uint);
    });

    it("should throw an error for negative values", () => {
      expect(() => toUint(-5)).toThrowError("Value must be a non-negative int in toUint function.");
    });

    it("should throw an error for non-integer values", () => {
      expect(() => toUint(5.5)).toThrowError("Value must be a non-negative int in toUint function.");
    });

    it("should validate Uint values correctly", () => {
      expect(isUint(10)).toBe(true);
      expect(isUint(0)).toBe(true);
      expect(isUint(-1)).toBe(false);
      expect(isUint(3.14)).toBe(false);
    });
  });

  describe("Int", () => {
    it("should convert valid integers to Int", () => {
      expect(toInt(10)).toBe(10 as Int);
      expect(toInt(-5)).toBe(-5 as Int);
      expect(toInt(0)).toBe(0 as Int);
    });

    it("should throw an error for non-integer values", () => {
      expect(() => toInt(5.5)).toThrowError("Invalid int: 5.5");
    });

    it("should validate Int values correctly", () => {
      expect(isInt(10)).toBe(true);
      expect(isInt(-10)).toBe(true);
      expect(isInt(0)).toBe(true);
      expect(isInt(3.14)).toBe(false);
    });
  });

  describe("PhoneNumber", () => {
    it("should convert valid phone numbers to PhoneNumber type", () => {
      expect(toPhoneNumber("+1234567890")).toBe("+1234567890" as PhoneNumber);
      expect(toPhoneNumber("123-456-7890")).toBe("123-456-7890" as PhoneNumber);
    });

    it("should throw an error for invalid phone numbers", () => {
      expect(() => toPhoneNumber("invalid_number")).toThrowError("Invalid phone number format");
      expect(() => toPhoneNumber("123ABC")).toThrowError("Invalid phone number format");
    });

    it("should validate phone numbers correctly", () => {
      expect(isPhoneNumber("+1234567890")).toBe(true);
      expect(isPhoneNumber("123-456-7890")).toBe(true);
      expect(isPhoneNumber("1234567890")).toBe(true);
      expect(isPhoneNumber("invalid_number")).toBe(false);
    });
  });

  describe("Email", () => {
    it("should convert valid emails to Email type", () => {
      expect(toEmail("test@example.com")).toBe("test@example.com" as Email);
    });

    it("should throw an error for invalid email format", () => {
      expect(() => toEmail("invalid-email")).toThrowError("Invalid email format");
      expect(() => toEmail("test@com")).toThrowError("Invalid email format");
    });

    it("should validate emails correctly", () => {
      expect(isEmail("user@example.com")).toBe(true);
      expect(isEmail("john.doe@domain.co")).toBe(true);
      expect(isEmail("invalid-email")).toBe(false);
    });
  });

  describe("URLString", () => {
    it("should convert valid URLs to URLString type", () => {
      expect(toURLString("https://example.com")).toBe("https://example.com" as URLString);
      expect(toURLString("http://www.example.com")).toBe("http://www.example.com" as URLString);
    });

    it("should throw an error for invalid URLs", () => {
      expect(() => toURLString("invalid-url")).toThrowError("Invalid URL format");
      expect(() => toURLString("www.example")).toThrowError("Invalid URL format");
    });

    it("should validate URLs correctly", () => {
      expect(isValidURLRegex("https://example.com")).toBe(true);
      expect(isValidURLRegex("http://example.com")).toBe(true);
      expect(isValidURLRegex("ftp://example.com")).toBe(false);
      expect(isValidURLRegex("invalid-url")).toBe(false);
      expect(isValidURLRegex("www.example.com")).toBe(false);
    });
  });

});
