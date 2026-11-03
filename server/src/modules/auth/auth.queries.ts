import { pool } from "../../db/pool.js";

export async function insertUser(u: {
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
}) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, role, created_at AS "createdAt"`,
    [u.name, u.email, u.passwordHash, u.phone],
  );
  return rows[0];
}

export async function findUserByEmail(email: string) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, role, password_hash AS "passwordHash", created_at AS "createdAt"
     FROM users WHERE email = $1`,
    [email],
  );
  return rows[0] as
    | {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: string;
        passwordHash: string;
        createdAt: Date;
      }
    | undefined;
}

export async function insertRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}
