import type { Request, Response } from "express";
import { registerUser } from "./auth.service.js";
import type { RegisterInput } from "./auth.schemas.js";

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterInput); // body was cleaned by validate()
  res.status(201).json({ success: true, data: { user } });
}
