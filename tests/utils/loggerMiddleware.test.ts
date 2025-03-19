// File: tests/middleware/loggerMiddleware.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, requestLogger, errorLogger  } from "@utils/index.js"; // Adjust path as needed

describe("Logger Middlewares", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requestLogger", () => {
    it("should log the incoming request and call next()", () => {
      // Create dummy request, response, and next function
      const req = { method: "GET", url: "/test" } as any;
      const res = {} as any;
      const next = vi.fn();

      // Spy on logger.info
      const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

      // Call the middleware
      requestLogger(req, res, next);

      // Assert that logger.info was called with the expected message
      expect(infoSpy).toHaveBeenCalledWith("Incoming Request: GET /test");
      // Assert that next() was called
      expect(next).toHaveBeenCalled();
    });
  });

  describe("errorLogger", () => {
    it("should log the error and respond with a 500 status", () => {
      // Create a dummy error, request, and response objects.
      const err = new Error("Test error");
      const req = { method: "POST", url: "/error" } as any;
      
      // Create a dummy response with chainable methods.
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock } as any;
      const next = vi.fn();

      // Spy on logger.error
      const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

      // Call the error logger middleware
      errorLogger(err, req, res, next);

      // Verify that logger.error was called with the expected message
      expect(errorSpy).toHaveBeenCalledWith("Error in POST /error: Test error");
      // Verify that response status was set to 500
      expect(statusMock).toHaveBeenCalledWith(500);
      // Verify that the JSON response is correct
      expect(jsonMock).toHaveBeenCalledWith({ error: "Internal Server Error" });
    });
  });
});
