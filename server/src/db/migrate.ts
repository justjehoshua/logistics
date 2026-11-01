import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool.js";

// Run this from the /server folder, so "migrations" is found relative to it
const dir = path.resolve(process.cwd(), "migrations");

async function migrate() {
  // Remembers which migration files have already run
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);

  const result = await pool.query("SELECT filename FROM schema_migrations");
  const done = new Set(result.rows.map((r) => r.filename));

  // Throws a clear error if the folder doesn't exist
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  console.log(`Found ${files.length} migration file(s) in ${dir}`);

  let appliedCount = 0;

  for (const file of files) {
    if (done.has(file)) continue; // already applied, skip

    const sql = await readFile(path.join(dir, file), "utf8");
    const client = await pool.connect(); // one connection, so BEGIN and COMMIT share a session
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file],
      );
      await client.query("COMMIT");
      console.log(`applied ${file}`);
      appliedCount++;
    } catch (err) {
      await client.query("ROLLBACK"); // undo this file completely if anything failed
      console.error(`failed ${file}:`, err);
      process.exitCode = 1;
      break; // stop, so later files don't run on top of a broken one
    } finally {
      client.release(); // always give the connection back
    }
  }

  if (appliedCount === 0 && process.exitCode !== 1) {
    console.log("Nothing to apply: database is up to date.");
  }

  await pool.end();
}

// This line actually starts the function. Without it, nothing happens.
migrate().catch(async (err) => {
  console.error("Migration failed:", err);
  await pool.end();
  process.exit(1);
});
