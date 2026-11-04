import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

// Our error envelope for every limiter, so clients see one consistent shape
const tooMany = (_req: Request, _res: Response, next: NextFunction) =>
  next(
    new AppError(
      429,
      "TOO_MANY_REQUESTS",
      "Too many requests, please try again later",
    ),
  );

function limiter(
  windowMinutes: number,
  limit: number,
  extra: { skipSuccessfulRequests?: boolean } = {},
) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true, // RateLimit headers tell clients their remaining budget
    legacyHeaders: false,
    handler: tooMany,
    skip: () => env.NODE_ENV === "test", // automated tests (Phase 6) shouldn't trip limits
    ...extra,
  });
}

// General safety net for the whole API
export const apiLimiter = limiter(15, 300);

// Only FAILED logins count, so correct logins never lock anyone out
export const loginLimiter = limiter(15, 10, { skipSuccessfulRequests: true });

export const registerLimiter = limiter(60, 10);

// Shared by forgot-password and reset-password (the same limiter instance shares one counter)
export const passwordResetLimiter = limiter(60, 10);

// Each call hashes a password, so it is expensive as well as sensitive
export const staffCreateLimiter = limiter(60, 20);

// Public and unauthenticated: the likeliest target for scraping
export const trackLimiter = limiter(15, 60);
