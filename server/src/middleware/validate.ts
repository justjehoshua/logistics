import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

// A function that RETURNS a middleware, so one file works for every schema
export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(
        new AppError(400, "VALIDATION_ERROR", "Invalid request data", details),
      );
    }
    req.body = result.data; // replace the raw body with the cleaned one (trimmed, lowercased email)
    next();
  };
