import pg from "pg";
import { env } from "../config/env.js";

// A pool keeps a few connections open and lends them out, instead of opening a new one per request
export const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
