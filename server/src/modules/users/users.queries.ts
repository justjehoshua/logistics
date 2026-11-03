import { pool } from "../../db/pool.js";

export async function findUserById(id: string) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, role, created_at AS "createdAt" FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] as
    | {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: string;
        createdAt: Date;
      }
    | undefined;
}
