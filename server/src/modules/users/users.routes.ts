import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { updateProfileSchema } from "./users.schemas.js";
import { getMe, updateMe } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, getMe);
// authenticate runs BEFORE validate, so a logged-out caller gets 401, not a 400 about the body
usersRouter.patch("/me", authenticate, validate(updateProfileSchema), updateMe);
