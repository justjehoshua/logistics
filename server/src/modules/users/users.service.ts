import { AppError } from "../../utils/AppError.js";
import { findUserById, updateUserProfile } from "./users.queries.js";
import type { UpdateProfileInput } from "./users.schemas.js";

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
