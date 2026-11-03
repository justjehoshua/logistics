import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    return next(
      new AppError(401, "UNAUTHENTICATED", "Authentication required"),
    );
  }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
    if (typeof payload === "string" || !payload.sub)
      throw new Error("Unexpected token payload");
    req.user = { id: payload.sub, role: String(payload.role) };
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Invalid or expired token")); // same message for every failure
  }
}

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user)
      return next(
        new AppError(401, "UNAUTHENTICATED", "Authentication required"),
      );
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, "FORBIDDEN", "You do not have permission to do this"),
      );
    }
    next();
  };
