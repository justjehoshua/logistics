import { pool } from "../../db/pool.js";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
};

export async function findUserById(id: string) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, role, created_at AS "createdAt" FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] as UserRow | undefined;
}

// One fixed statement: column names never come from request data
export async function updateUserProfile(
  id: string,
  name: string,
  phone: string | null,
) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $1, phone = $2 WHERE id = $3
     RETURNING id, name, email, phone, role, created_at AS "createdAt"`,
    [name, phone, id],
  );
  return rows[0] as UserRow | undefined;
}
