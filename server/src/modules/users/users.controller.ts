import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { findUserById } from "./users.queries.js";
import {
  updateProfile,
  createStaffAccount,
  listUsersForAdmin,
} from "./users.service.js";
import type {
  UpdateProfileInput,
  CreateStaffInput,
  ListUsersQuery,
} from "./users.schemas.js";

export async function getMe(req: Request, res: Response) {
  const user = await findUserById(req.user!.id); // authenticate guarantees req.user exists here
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found"); // e.g. account deleted after token issued
  res.json({ success: true, data: { user } });
}

export async function updateMe(req: Request, res: Response) {
  const user = await updateProfile(
    req.user!.id,
    req.body as UpdateProfileInput,
  );
  res.json({ success: true, data: { user } });
}

export async function createStaff(req: Request, res: Response) {
  const user = await createStaffAccount(req.body as CreateStaffInput);
  res.status(201).json({ success: true, data: { user } });
}

export async function listUsers(_req: Request, res: Response) {
  const result = await listUsersForAdmin(res.locals.query as ListUsersQuery);
  res.json({ success: true, data: result });
}
