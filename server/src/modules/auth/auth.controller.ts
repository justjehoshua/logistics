import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { ACCESS_TTL_MS, REFRESH_TTL_MS } from "../../utils/tokens.js";
import { registerUser, loginUser } from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";

const isProd = env.NODE_ENV === "production";

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  // httpOnly: JavaScript can't read it. secure: HTTPS only (off in dev, where we use plain HTTP)
  const base = { httpOnly: true, secure: isProd, sameSite: "lax" as const };
  res.cookie("access_token", accessToken, {
    ...base,
    maxAge: ACCESS_TTL_MS,
    path: "/",
  });
  // The refresh cookie is only sent to /auth routes, so it travels far less often
  res.cookie("refresh_token", refreshToken, {
    ...base,
    maxAge: REFRESH_TTL_MS,
    path: "/api/v1/auth",
  });
}

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterInput);
  res.status(201).json({ success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await loginUser(
    req.body as LoginInput,
  );
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ success: true, data: { user } }); // tokens live in cookies, never in the body
}
