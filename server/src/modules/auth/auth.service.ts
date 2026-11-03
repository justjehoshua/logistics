import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  REFRESH_TTL_MS,
} from "../../utils/tokens.js";
import { findUserById } from "../users/users.queries.js";
import {
  insertUser,
  findUserByEmail,
  insertRefreshToken,
  revokeRefreshToken,
  findRefreshToken,
  revokeAllUserTokens,
} from "./auth.queries.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";

export async function registerUser(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password);
  try {
    return await insertUser({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone ?? null,
    });
  } catch (err) {
    // 23505 = PostgreSQL unique_violation: the DATABASE enforces unique emails
    if ((err as { code?: string }).code === "23505") {
      throw new AppError(
        409,
        "EMAIL_TAKEN",
        "This email is already registered",
      );
    }
    throw err;
  }
}

// Computed once at startup. Lets an unknown email cost the same time as a wrong password
const dummyHashPromise = hashPassword("not-a-real-password");

async function issueTokens(user: { id: string; role: string }) {
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  // Store only the HASH, so a database leak doesn't hand out working tokens
  await insertRefreshToken(
    user.id,
    hashToken(refreshToken),
    new Date(Date.now() + REFRESH_TTL_MS),
  );
  return { accessToken, refreshToken };
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  const hash = user ? user.passwordHash : await dummyHashPromise;
  const passwordOk = await verifyPassword(input.password, hash); // bcrypt always runs

  if (!user || !passwordOk) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokens(user);
  const { passwordHash: _removed, ...safeUser } = user; // never return the hash
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshSession(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
  }

  try {
    // Signature and expiry check first; the database check comes next
    jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "Invalid or expired token");
  }

  const tokenHash = hashToken(refreshToken);
  const revoked = await revokeRefreshToken(tokenHash); // only ONE concurrent caller can win this

  if (!revoked) {
    // Not valid in the database. If it exists and was already revoked, someone is replaying
    // an old token: revoke every session for that user
    const existing = await findRefreshToken(tokenHash);
    if (existing?.revokedAt) await revokeAllUserTokens(existing.userId);
    throw new AppError(401, "INVALID_TOKEN", "Invalid or expired token");
  }

  const user = await findUserById(revoked.userId); // fresh role from the database
  if (!user)
    throw new AppError(401, "INVALID_TOKEN", "Invalid or expired token");

  return issueTokens(user); // rotation: a brand-new pair
}

export async function logoutUser(refreshToken: string | undefined) {
  if (refreshToken) await revokeRefreshToken(hashToken(refreshToken)); // unknown token: nothing happens
}
