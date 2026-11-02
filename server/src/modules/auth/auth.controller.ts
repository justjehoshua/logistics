import type { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterInput); // body was cleaned by validate()
  res.status(201).json({ success: true, data: { user } });
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body as LoginInput);
  res.status(200).json({ success: true, data: { user } });
}
