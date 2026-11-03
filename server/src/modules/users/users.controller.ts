import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { findUserById } from "./users.queries.js";

export async function getMe(req: Request, res: Response) {
  const user = await findUserById(req.user!.id); // authenticate guarantees req.user exists here
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found"); // e.g. account deleted after token issued
  res.json({ success: true, data: { user } });
}
