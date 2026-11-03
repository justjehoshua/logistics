import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { register, login, refresh, logout } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", refresh); // no body: the refresh token travels in its cookie
authRouter.post("/logout", logout);
