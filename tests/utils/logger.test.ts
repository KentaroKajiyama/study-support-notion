import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// --- Mock Winston ---
// Use an async mock that returns both a default export and named exports.
vi.mock("winston", async () => {
  const actualWinston = await vi.importActual("winston");
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  };
  const mockedWinston = {
    createLogger: vi.fn(() => mockLogger),
    transports: {
      Console: vi.fn(),
      File: vi.fn(),
    },
    format: actualWinston.format,
  };

  return {
    default: mockedWinston,
    ...mockedWinston,
  };
});

// Now import the logger module after the mock is set up.
import { logger } from "@utils/index.js"; // Adjust path as needed
import winston from "winston";

describe("Logger Module", () => {
  // Retrieve the mock winston logger instance that our logger module uses.
  let mockWinstonLogger: {
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    log: ReturnType<typeof vi.fn>;
  };

  beforeAll(() => {
    // Our logger module calls winston.createLogger during initialization.
    // Retrieve the instance from the mocked createLogger.
    // @ts-expect-error: we know winston.createLogger is mocked
    mockWinstonLogger = winston.createLogger();
  });

  beforeEach(() => {
    // Clear previous calls
    vi.clearAllMocks();
    // Force production mode to avoid debug logging through debug module
    process.env.NODE_ENV = "production";
  });

  it("should log info messages using winston", () => {
    logger.info("Test info");
    expect(mockWinstonLogger.info).toHaveBeenCalledWith("Test info");
  });

  it("should log warn messages using winston", () => {
    logger.warn("Test warn");
    expect(mockWinstonLogger.warn).toHaveBeenCalledWith("Test warn");
  });

  it("should log debug messages using winston", () => {
    logger.debug("Test debug");
    expect(mockWinstonLogger.debug).toHaveBeenCalledWith("Test debug");
  });

  it("should log error messages using winston", () => {
    logger.error("Test error");
    expect(mockWinstonLogger.error).toHaveBeenCalledWith("Test error");
  });

  it("should log fatal messages using winston.log with error level", () => {
    logger.fatal("Fatal error occurred");
    expect(mockWinstonLogger.log).toHaveBeenCalledWith("error", "FATAL: Fatal error occurred");
  });
});
