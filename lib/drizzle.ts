import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";

import { env } from "@/lib/env";

let db: NeonHttpDatabase | null = null;
let sqlFn: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> | null {
  if (!env.databaseUrl) return null;
  if (!sqlFn) {
    sqlFn = neon(env.databaseUrl);
  }
  return sqlFn;
}

/**
 * Returns a Drizzle ORM instance backed by the Neon HTTP driver,
 * or null when DATABASE_URL is not configured.
 *
 * The HTTP driver is stateless — no connection pool to exhaust in
 * serverless, and each query is a single HTTPS round-trip.
 */
export function getDrizzleDb(): NeonHttpDatabase | null {
  if (!env.databaseUrl) {
    return null;
  }

  if (!db) {
    const sql = getSql()!;
    db = drizzle({ client: sql });
  }

  return db;
}

/**
 * Execute a raw parameterized SQL query via the Neon HTTP driver.
 * Returns pg-compatible `{ rows: T[] }` shape for callers that
 * still use raw SQL (resume_variants, jd_requests).
 * Returns null when DATABASE_URL is not configured.
 */
export async function dbQuery<
  T extends Record<string, unknown> = Record<string, unknown>,
>(text: string, values: unknown[] = []): Promise<{ rows: T[] } | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = (await sql(text, values)) as T[];
  return { rows };
}

/**
 * Execute a Drizzle callback against the shared instance.
 * Returns null when the database is not configured.
 * Catches and logs errors — never throws (mirrors lib/db.ts dbQuery contract).
 */
export async function drizzleQuery<T>(
  fn: (db: NeonHttpDatabase) => Promise<T>,
): Promise<T | null> {
  const instance = getDrizzleDb();
  if (!instance) {
    return null;
  }

  try {
    return await fn(instance);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown Drizzle query error";
    console.warn("[drizzle] query failed:", message);
    return null;
  }
}
