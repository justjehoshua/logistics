import { z } from "zod";

export const updateProfileSchema = z
  .strictObject({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(1).max(30).nullable().optional(), // null = clear it; missing = leave it alone
  })
  .refine((v) => v.name !== undefined || v.phone !== undefined, {
    message: "Provide at least one field to update",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
