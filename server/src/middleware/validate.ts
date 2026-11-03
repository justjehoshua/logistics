import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

type Source = "body" | "query" | "params";

// A function that RETURNS a middleware, so one file works for every schema and every request part
export const validate =
  (schema: ZodType, source: Source = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(
        new AppError(400, "VALIDATION_ERROR", "Invalid request data", details),
      );
    }
    if (source === "body") {
      req.body = result.data; // cleaned body (trimmed, lowercased, etc.)
    } else {
      res.locals[source] = result.data; // req.query is read-only in Express 5, so cleaned values live here
    }
    next();
  };
