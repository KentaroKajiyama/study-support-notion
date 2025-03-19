import { describe, it, expect, vi } from "vitest";
import { dateResponseHandler, dateRequestHandler } from "@infrastructure/notion/property/dateHandler.js"; // Adjust the path
import { DatePropertyResponse, DatePropertyRequest, NotionDate } from "@domain/types/index.js";
import { logger } from "@utils/index.js";

vi.spyOn(logger, "warn").mockImplementation(() => {}); // Mock logger to prevent console output during tests

describe("Date Handlers", () => {
  describe("dateResponseHandler", () => {
    it("should return the start date when option is empty or 'start date'", () => {
      const mockResponse: DatePropertyResponse = { id: "mock", type: "date", date: { start: "2025-03-19", end: "2025-03-20", time_zone: null } };

      expect(dateResponseHandler(mockResponse, "")).toBe("2025-03-19");
      expect(dateResponseHandler(mockResponse, "start date")).toBe("2025-03-19");
    });

    it("should return the end date when option is 'end date'", () => {
      const mockResponse: DatePropertyResponse = { id: "mock", type: "date", date: { start: "2025-03-19", end: "2025-03-20", time_zone: null } };

      expect(dateResponseHandler(mockResponse, "end date")).toBe("2025-03-20");
    });

    it("should return null and log a warning when date property is null", () => {
      const mockResponse: DatePropertyResponse = { id: "mock", type: "date", date: null };

      expect(dateResponseHandler(mockResponse, "start date")).toBeNull();
      expect(dateResponseHandler(mockResponse, "end date")).toBeNull();
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it("should throw an error for an invalid option", () => {
      const mockResponse: DatePropertyResponse = { id: "mock", type: "date",date: { start: "2025-03-19", end: "2025-03-20", time_zone: null } };

      expect(() => dateResponseHandler(mockResponse, "invalid" as any)).toThrowError(
        "Invalid date response option: invalid"
      );
    });
  });

  describe("dateRequestHandler", () => {
    it("should return a DatePropertyRequest object", () => {
      const input = { start: "2025-03-19" as NotionDate, end: "2025-03-20" as NotionDate };

      const result: DatePropertyRequest = dateRequestHandler(input, "");
      expect(result).toEqual({
        date: { start: "2025-03-19", end: "2025-03-20" },
        type: "date",
      });

      const resultDate: DatePropertyRequest = dateRequestHandler(input, "date");
      expect(resultDate).toEqual({
        date: { start: "2025-03-19", end: "2025-03-20" },
        type: "date",
      });
    });

    it("should throw an error for an invalid option", () => {
      const input = { start: "2025-03-19" as NotionDate, end: null };

      expect(() => dateRequestHandler(input, "invalid" as any)).toThrowError(
        "Invalid date request option: invalid"
      );
    });
  });
});
