import { Request, Response, NextFunction } from "express";
import logger from "./logger.js";

// Middleware to log requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
};

// Middleware to log errors
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error in ${req.method} ${req.url}: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
};
