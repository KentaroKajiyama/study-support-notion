import { describe, it, expect, vi } from "vitest";
import { emailResponseHandler, emailRequestHandler } from "@infrastructure/notion/property/index.js"; // Adjust path
import { EmailPropertyResponse, EmailPropertyRequest, isEmail, Email } from "@domain/types/index.js";
import { logger } from "@utils/index.js";

vi.spyOn(logger, "warn").mockImplementation(() => {}); // Mock logger to prevent console output
vi.spyOn(console, "error").mockImplementation(() => {}); // Suppress error logs

describe("Email Handlers", () => {
  describe("emailResponseHandler", () => {
    it("should return the email if valid", () => {
      const mockResponse: EmailPropertyResponse = { id: "mock", type: "email", email: "test@example.com" };

      expect(emailResponseHandler(mockResponse, "email")).toBe("test@example.com");
    });

    it("should return null and log a warning if email property is null", () => {
      const mockResponse: EmailPropertyResponse = { id: "mock", type: "email", email: null };

      expect(emailResponseHandler(mockResponse, "email")).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith("Email property response is null");
    });

    it("should throw an error if email property is invalid", () => {
      vi.spyOn(isEmail, "default").mockReturnValue(false); // Mock isEmail to return false
      const mockResponse: EmailPropertyResponse = { id: "mock", type: "email", email: "invalid-email" };

      expect(() => emailResponseHandler(mockResponse, "email")).toThrowError("Invalid email property response");
    });
  });

  describe("emailRequestHandler", () => {
    it("should return a valid EmailPropertyRequest object when given a valid email", () => {
      const input = "test@example.com" as Email;

      const result: EmailPropertyRequest = emailRequestHandler(input, "email");
      expect(result).toEqual({
        type: "email",
        email: "test@example.com",
      });
    });

    it("should return a null EmailPropertyRequest when input is null", () => {
      const result: EmailPropertyRequest = emailRequestHandler(null, "email");

      expect(result).toEqual({
        type: "email",
        email: null,
      });
    });

    it("should throw an error if given an invalid email", () => {
      vi.spyOn(isEmail, "default").mockReturnValue(false); // Mock isEmail to return false

      expect(() => emailRequestHandler("invalid-email" as Email, "email")).toThrowError("Invalid email input");
    });

    it("should throw an error for an invalid request option", () => {
      expect(() => emailRequestHandler("test@example.com" as Email, "invalid" as any)).toThrowError(
        "Invalid email request option"
      );
    });
  });
});
