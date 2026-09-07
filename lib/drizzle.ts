import { neon } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";

import { env } from "@/lib/env";

let db: NeonHttpDatabase | null = null;

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
    const sql = neon(env.databaseUrl);
    db = drizzle({ client: sql });
  }

  return db;
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
