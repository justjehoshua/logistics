import { Router } from "express";
import { authenticate, requireRole } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  createStaffSchema,
  listUsersQuerySchema,
} from "./users.schemas.js";
import { getMe, updateMe, createStaff, listUsers } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, getMe);
usersRouter.patch("/me", authenticate, validate(updateProfileSchema), updateMe);

// Admin only. authenticate (401) -> requireRole (403) -> validate (400)
usersRouter.get(
  "/",
  authenticate,
  requireRole("admin"),
  validate(listUsersQuerySchema, "query"),
  listUsers,
);
usersRouter.post(
  "/staff",
  authenticate,
  requireRole("admin"),
  validate(createStaffSchema),
  createStaff,
);
