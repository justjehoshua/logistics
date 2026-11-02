import { AppError } from "../../utils/AppError.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { insertUser, findUserByEmail } from "./auth.queries.js";
import type { RegisterInput, LoginInput } from "./auth.schemas.js";

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
    // 23505 = PostgreSQL unique_violation: the DATABASE enforces unique emails
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

// Computed once at startup. Lets an unknown email cost the same time as a wrong password
const dummyHashPromise = hashPassword("not-a-real-password");

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  const hash = user ? user.passwordHash : await dummyHashPromise;
  const passwordOk = await verifyPassword(input.password, hash); // bcrypt always runs

  if (!user || !passwordOk) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const { passwordHash: _removed, ...safeUser } = user; // never return the hash
  return safeUser;
}
