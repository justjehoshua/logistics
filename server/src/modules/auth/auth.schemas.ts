import { z } from "zod";

// strictObject REJECTS unknown keys, so { "role": "admin" } makes the whole request invalid
export const registerSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255), // lowercase so Ana@x.com and ana@x.com are one account
  password: z.string().min(8).max(72), // bcrypt ignores everything past 72 bytes
  phone: z.string().trim().max(30).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
