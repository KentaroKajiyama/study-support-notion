// File: tests/utils/dateConversion.test.ts
import { describe, it, expect } from "vitest";
import {
  formatDateWithOffset,
  convertTimeMySQLToNotion,
  convertTimeNotionToMySQL,
  myAddDays,
  mySubDays,
  date2MinusDate1,
  isDate1EarlierThanOrSameWithDate2,
  isDateBetween,
} from "@utils/index.js"; // Adjust path as needed
import { NotionDate, NotionDateTimeString } from "@domain/types/myNotionTypes.js";

// --- Tests for formatDateWithOffset ---
describe("formatDateWithOffset", () => {
  it("should format a date without time when includeTime is false", () => {
    const dateObj = new Date("2025-03-12T12:34:56.789Z");
    const result = formatDateWithOffset(dateObj, false);
    // Expect a string in format YYYY-MM-DD
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should format a date with time in JST when includeTime is true and isTimestamp is false", () => {
    // 2025-03-12T03:00:00.000Z equals 2025-03-12T12:00:00+09:00
    const dateObj = new Date("2025-03-12T03:00:00.000Z");
    const result = formatDateWithOffset(dateObj, true, false);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000\+09:00$/);
  });

  it("should format a date as UTC timestamp when isTimestamp is true", () => {
    const dateObj = new Date("2025-03-12T03:00:00.000Z");
    const result = formatDateWithOffset(dateObj, true, true);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/);
  });
});

// --- Tests for convertTimeMySQLToNotion ---
describe("convertTimeMySQLToNotion", () => {
  it("should convert MySQL Date (YYYY-MM-DD) to Notion date string", () => {
    const input = "2025-03-12";
    const result = convertTimeMySQLToNotion(input);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should convert MySQL Datetime (YYYY-MM-DD HH:MM:SS) to Notion date with time", () => {
    const input = "2025-03-12 15:30:45";
    const result = convertTimeMySQLToNotion(input);
    // Expected format: YYYY-MM-DDTHH:MM:SS.000+09:00 (JST) because our function appends "+09:00" if not a timestamp.
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000\+09:00$/);
  });

  it("should throw an error for invalid MySQL date format", () => {
    expect(() => convertTimeMySQLToNotion("03/12/2025")).toThrow("Invalid MySQL date format");
  });
});

// --- Tests for convertTimeNotionToMySQL ---
describe("convertTimeNotionToMySQL", () => {
  it("should convert Notion Date (YYYY-MM-DD) to MySQL Date", () => {
    const input = "2025-03-12";
    const result = convertTimeNotionToMySQL(input);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should convert Notion DateTime (YYYY-MM-DDTHH:MM:SS.sssZ) to MySQL Timestamp", () => {
    const input = "2025-03-12T15:30:45.000Z";
    const result = convertTimeNotionToMySQL(input as NotionDateTimeString);
    // Expected format: YYYY-MM-DD HH:MM:SSZ (UTC format as per our function)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}Z$/);
  });

  it("should throw an error for invalid Notion date format", () => {
    expect(() => convertTimeNotionToMySQL("03/12/2025")).toThrow("Invalid Notion date format");
  });
});

// --- Tests for myAddDays and mySubDays ---
describe("myAddDays and mySubDays", () => {
  it("should add days to a Notion Date string (YYYY-MM-DD)", () => {
    const input = "2025-03-12" as unknown as NotionDate; // cast to NotionDate
    const result = myAddDays(input, 5);
    expect(result).toBe('2025-03-17');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(date2MinusDate1(input, result)).toBe(5);
  });

  it("should subtract days from a Notion Date string (YYYY-MM-DD)", () => {
    const input = "2025-03-12" as unknown as NotionDate;
    const result = mySubDays(input, 3);
    expect(result).toBe('2025-03-09');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Since date2MinusDate1 returns absolute difference:
    expect(date2MinusDate1(result, input)).toBe(3);
  });
});

// --- Tests for date2MinusDate1 ---
describe("date2MinusDate1", () => {
  it("should return the correct difference in days between two Notion dates", () => {
    const date1 = "2025-03-12" as NotionDate;
    const date2 = "2025-03-15" as NotionDate;
    expect(date2MinusDate1(date1, date2)).toBe(3);
    expect(date2MinusDate1(date2, date1)).toBe(3);
  });
});

// --- Tests for isDate1EarlierThanOrSameWithDate2 ---
describe("isDate1EarlierThanOrSameWithDate2", () => {
  it("should return true if the first date is earlier than the second", () => {
    const date1 = "2025-03-12" as NotionDate;
    const date2 = "2025-03-15" as NotionDate;
    expect(isDate1EarlierThanOrSameWithDate2(date1, date2)).toBe(true);
  });

  it("should return true if the dates are the same", () => {
    const date1 = "2025-03-12" as NotionDate;
    expect(isDate1EarlierThanOrSameWithDate2(date1, date1)).toBe(true);
  });

  it("should return false if the first date is later than the second", () => {
    const date1 = "2025-03-16" as NotionDate;
    const date2 = "2025-03-15" as NotionDate;
    expect(isDate1EarlierThanOrSameWithDate2(date1, date2)).toBe(false);
  });
});

// --- Tests for isDateBetween ---
describe("isDateBetween", () => {
  it("should return true if the target date is between start and end dates", () => {
    const target = "2025-03-14" as NotionDate;
    const start = "2025-03-12" as NotionDate;
    const end = "2025-03-15" as NotionDate;
    expect(isDateBetween(target, start, end)).toBe(true);
  });

  it("should return false if the target date is before the start date", () => {
    const target = "2025-03-10" as NotionDate;
    const start = "2025-03-12" as NotionDate;
    const end = "2025-03-15" as NotionDate;
    expect(isDateBetween(target, start, end)).toBe(false);
  });

  it("should return false if the target date is after the end date", () => {
    const target = "2025-03-16" as NotionDate;
    const start = "2025-03-12" as NotionDate;
    const end = "2025-03-15" as NotionDate;
    expect(isDateBetween(target, start, end)).toBe(false);
  });
});

