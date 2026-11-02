import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/password.js";
import { insertUser } from "./auth.queries.js";
import type { RegisterInput } from "./auth.schemas.js";

export async function registerUser(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password);
  try {
    return await insertUser({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone ?? null,
    });
  } catch (err) {
    // 23505 = PostgreSQL unique_violation. We let the DATABASE enforce uniqueness
    if ((err as { code?: string }).code === "23505") {
      throw new AppError(
        409,
        "EMAIL_TAKEN",
        "This email is already registered",
      );
    }
    throw err; // anything else is unexpected: the error handler turns it into a generic 500
  }
}
