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

// Atomic: validity check and revoke in ONE statement, so only one concurrent caller can win
export async function revokeRefreshToken(tokenHash: string) {
  const { rows } = await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
     RETURNING user_id AS "userId"`,
    [tokenHash],
  );
  return rows[0] as { userId: string } | undefined;
}

export async function findRefreshToken(tokenHash: string) {
  const { rows } = await pool.query(
    `SELECT user_id AS "userId", revoked_at AS "revokedAt" FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] as { userId: string; revokedAt: Date | null } | undefined;
}

export async function revokeAllUserTokens(userId: string) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId],
  );
}

// Older unused reset links stop working when a new one is requested
export async function invalidateUserResetTokens(userId: string) {
  await pool.query(
    `UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );
}

export async function insertResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

// One transaction: mark the token used, change the password, revoke all sessions.
// Returns false if the token is unknown, already used, or expired.
export async function resetPasswordWithToken(
  tokenHash: string,
  newPasswordHash: string,
): Promise<boolean> {
  const client = await pool.connect(); // one connection so BEGIN/COMMIT share a session
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE password_reset_tokens SET used_at = now()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING user_id AS "userId"`,
      [tokenHash],
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }
    const userId = rows[0].userId as string;
    await client.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
      newPasswordHash,
      userId,
    ]);
    await client.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release(); // always give the connection back
  }
}
