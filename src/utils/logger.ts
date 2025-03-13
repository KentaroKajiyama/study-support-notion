import debug from "debug";
import winston from "winston";

// Debug namespaces
const debugLog = {
  info: debug("app:info"),
  warn: debug("app:warn"),
  debug: debug("app:debug"),
  error: debug("app:error"),
  fatal: debug("app:fatal")
};

// Create Winston Logger
const winstonLogger = winston.createLogger({
  level: "debug", // Capture all levels
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`)
  ),
  transports: [
    new winston.transports.Console(), // Console log
    new winston.transports.File({ filename: "logs/app.log" }) // File log
  ]
});

// Unified logger
const logger = {
  info: (...message: any[]) => {
    const msg = message.join(" ");
    if (process.env.NODE_ENV === "development") debugLog.info(msg);
    winstonLogger.info(msg);
  },
  warn: (...message: any[]) => {
    const msg = message.join(" ");
    if (process.env.NODE_ENV === "development") debugLog.warn(msg);
    winstonLogger.warn(msg);
  },
  debug: (...message: any[]) => {
    const msg = message.join(" ");
    if (process.env.NODE_ENV === "development") debugLog.debug(msg);
    winstonLogger.debug(msg);
  },
  error: (...message: any[]) => {
    const msg = message.join(" ");
    if (process.env.NODE_ENV === "development") debugLog.error(msg);
    winstonLogger.error(msg);
  },
  fatal: (...message: any[]) => {
    const msg = message.join(" ");
    if (process.env.NODE_ENV === "development") debugLog.fatal(msg);
    winstonLogger.log("error", `FATAL: ${msg}`); // Use "error" level for fatal logs
  }
};

export default logger;
