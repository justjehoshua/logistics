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
    [u.name, u.email, u.passwordHash, u.phone], // $1..$4 are sent separately from the SQL: no injection
  );
  return rows[0];
}
