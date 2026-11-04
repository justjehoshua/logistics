import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function signAccessToken(user: { id: string; role: string }): string {
  // subject = who the token is about; payload holds only the role (JWTs are readable by anyone)
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: ACCESS_TTL_MS / 1000, // seconds
  });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({}, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: REFRESH_TTL_MS / 1000,
    jwtid: randomUUID(), // unique per token, so two logins in the same second get different hashes
  });
}

// Fast hash is fine here: the token is long and random, and we must look it up by hash
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
