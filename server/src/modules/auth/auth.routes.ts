import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { register, login } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
