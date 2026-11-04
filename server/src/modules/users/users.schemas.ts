import { z } from "zod";

export const updateProfileSchema = z
  .strictObject({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(1).max(30).nullable().optional(), // null = clear it; missing = leave it alone
  })
  .refine((v) => v.name !== undefined || v.phone !== undefined, {
    message: "Provide at least one field to update",
  });

// strictObject: sending "role" is rejected. This endpoint can only ever create STAFF
export const createStaffSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72), // same rule as register
  phone: z.string().trim().max(30).optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["customer", "staff", "admin"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
