import { pool } from "../../db/pool.js";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
};

// password_hash is never selected in this file
const SAFE_COLUMNS = `id, name, email, phone, role, created_at AS "createdAt"`;

export async function findUserById(id: string) {
  const { rows } = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`,
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
    `UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING ${SAFE_COLUMNS}`,
    [name, phone, id],
  );
  return rows[0] as UserRow | undefined;
}

// Is this id a real STAFF user? (customers and admins don't count)
export async function findStaffById(id: string) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE id = $1::uuid AND role = 'staff'`,
    [id],
  );
  return rows[0] as { id: string } | undefined;
}

// The role is written into the SQL itself, so no request data can ever choose it
export async function insertStaff(u: {
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
}) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, 'staff')
     RETURNING ${SAFE_COLUMNS}`,
    [u.name, u.email, u.passwordHash, u.phone],
  );
  return rows[0] as UserRow;
}

export async function listUsers(filter: {
  role?: string;
  limit: number;
  offset: number;
}) {
  const where = `($1::text IS NULL OR role = $1::text)`;
  const [list, count] = await Promise.all([
    pool.query(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE ${where}
       ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
      [filter.role ?? null, filter.limit, filter.offset],
    ),
    pool.query(`SELECT count(*)::int AS total FROM users WHERE ${where}`, [
      filter.role ?? null,
    ]),
  ]);
  return { rows: list.rows as UserRow[], total: count.rows[0].total as number };
}
