import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { ACCESS_TTL_MS, REFRESH_TTL_MS } from "../../utils/tokens.js";
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";

const isProd = env.NODE_ENV === "production";
const baseCookie = { httpOnly: true, secure: isProd, sameSite: "lax" as const };

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("access_token", accessToken, {
    ...baseCookie,
    maxAge: ACCESS_TTL_MS,
    path: "/",
  });
  // The refresh cookie is only sent to /auth routes, so it travels far less often
  res.cookie("refresh_token", refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_TTL_MS,
    path: "/api/v1/auth",
  });
}

function clearAuthCookies(res: Response) {
  // The path must match the one used when the cookie was set, or the browser won't remove it
  res.clearCookie("access_token", { ...baseCookie, path: "/" });
  res.clearCookie("refresh_token", { ...baseCookie, path: "/api/v1/auth" });
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
  res.status(200).json({ success: true, data: { user } });
}

export async function refresh(req: Request, res: Response) {
  const { accessToken, refreshToken } = await refreshSession(
    req.cookies?.refresh_token,
  );
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ success: true, data: { refreshed: true } });
}

export async function logout(req: Request, res: Response) {
  await logoutUser(req.cookies?.refresh_token);
  clearAuthCookies(res);
  res.status(204).send();
}
