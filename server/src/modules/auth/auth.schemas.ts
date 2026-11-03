import { z } from "zod";

// strictObject REJECTS unknown keys, so { "role": "admin" } makes the whole request invalid
export const registerSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72), // bcrypt ignores everything past 72 bytes
  phone: z.string().trim().max(30).optional(),
});

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(72), // no length rules at login: we only check that it matches
});

export const forgotPasswordSchema = z.strictObject({
  email: z.string().trim().toLowerCase().email().max(255),
});

export const resetPasswordSchema = z.strictObject({
  token: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(72), // same rule as register
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
