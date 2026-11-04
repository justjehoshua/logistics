import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/password.js";
import {
  findUserById,
  updateUserProfile,
  insertStaff,
  listUsers,
} from "./users.queries.js";
import type {
  UpdateProfileInput,
  CreateStaffInput,
  ListUsersQuery,
} from "./users.schemas.js";

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const current = await findUserById(userId);
  if (!current) throw new AppError(404, "NOT_FOUND", "User not found");

  // undefined = not sent (keep the old value); null = clear the phone number
  const name = input.name ?? current.name;
  const phone = input.phone === undefined ? current.phone : input.phone;

  const updated = await updateUserProfile(userId, name, phone);
  if (!updated) throw new AppError(404, "NOT_FOUND", "User not found");
  return updated;
}

export async function createStaffAccount(input: CreateStaffInput) {
  const passwordHash = await hashPassword(input.password);
  try {
    return await insertStaff({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone ?? null,
    });
  } catch (err) {
    // 23505 = unique_violation: the DATABASE enforces unique emails
    if ((err as { code?: string }).code === "23505") {
      throw new AppError(
        409,
        "EMAIL_TAKEN",
        "This email is already registered",
      );
    }
    throw err;
  }
}

export async function listUsersForAdmin(query: ListUsersQuery) {
  const { rows, total } = await listUsers({
    role: query.role,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  });
  return {
    users: rows,
    pagination: { page: query.page, limit: query.limit, total },
  };
}
