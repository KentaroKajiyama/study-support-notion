import { describe, it, expect } from "vitest";
import {
  toMySQLUintID,
  isMySQLUintID,
  toBoolean,
  toMySQLBoolean,
  dbEscape,
  MySQLUintID,
  MySQLBoolean
} from "@domain/types/index.js"; // Adjust the import path if needed

describe("MySQL Type Utilities", () => {

  describe("toMySQLUintID", () => {
    it("should convert a valid non-negative integer to MySQLUintID", () => {
      expect(toMySQLUintID(123)).toBe(123 as MySQLUintID);
    });

    it("should throw an error for negative values", () => {
      expect(() => toMySQLUintID(-1)).toThrowError("Value must be a non-negative integer in toMySQLUintID function.");
    });

    it("should throw an error for non-integer values", () => {
      expect(() => toMySQLUintID(12.34)).toThrowError("Value must be a non-negative integer in toMySQLUintID function.");
    });

    it("should throw an error for non-number values", () => {
      expect(() => toMySQLUintID(NaN)).toThrowError("Value must be a non-negative integer in toMySQLUintID function.");
    });
  });

  describe("isMySQLUintID", () => {
    it("should return true for valid MySQLUintID", () => {
      expect(isMySQLUintID(123)).toBe(true);
    });

    it("should return false for negative numbers", () => {
      expect(isMySQLUintID(-1)).toBe(false);
    });

    it("should return false for non-integer numbers", () => {
      expect(isMySQLUintID(12.34)).toBe(false);
    });

    it("should return false for non-number values", () => {
      expect(isMySQLUintID(NaN)).toBe(false);
    });
  });

  describe("toBoolean & toMySQLBoolean", () => {
    it("should convert MySQLBoolean (1) to true", () => {
      expect(toBoolean(1)).toBe(true);
    });

    it("should convert MySQLBoolean (0) to false", () => {
      expect(toBoolean(0)).toBe(false);
    });

    it("should convert true to MySQLBoolean (1)", () => {
      expect(toMySQLBoolean(true)).toBe(1);
    });

    it("should convert false to MySQLBoolean (0)", () => {
      expect(toMySQLBoolean(false)).toBe(0);
    });
  });

  describe("dbEscape", () => {
    it("should return NULL for null value", () => {
      expect(dbEscape(null)).toBe("NULL");
    });

    it("should return NULL for undefined value", () => {
      expect(dbEscape(undefined)).toBe("NULL");
    });

    it("should escape single quotes in strings", () => {
      expect(dbEscape("O'Reilly")).toBe("'O''Reilly'");
    });

    it("should return quoted string for normal text", () => {
      expect(dbEscape("hello")).toBe("'hello'");
    });

    it("should return numeric values as is", () => {
      expect(dbEscape(123)).toBe("123");
    });

    it("should return 1 for true boolean", () => {
      expect(dbEscape(true)).toBe("1");
    });

    it("should return 0 for false boolean", () => {
      expect(dbEscape(false)).toBe("0");
    });
  });

});
