import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from "../../middleware/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas.js";
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from "./auth.controller.js";

export const authRouter = Router();

// The limiter runs FIRST, so blocked requests never reach bcrypt or the database
authRouter.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  register,
);
authRouter.post("/login", loginLimiter, validate(loginSchema), login);
authRouter.post("/refresh", refresh); // no body: the refresh token travels in its cookie
authRouter.post("/logout", logout);
authRouter.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);
