import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { registerSchema } from "./auth.schemas.js";
import { register } from "./auth.controller.js";

export const authRouter = Router();
authRouter.post("/register", validate(registerSchema), register);
