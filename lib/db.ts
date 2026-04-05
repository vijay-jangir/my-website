import { Pool, type QueryResultRow } from "pg";

import { env } from "@/lib/env";

let pool: Pool | null = null;

export function getDbPool() {
  if (!env.databaseUrl) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl:
        env.databaseUrl.includes("localhost") || env.databaseUrl.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
    });
  }

  return pool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  const client = getDbPool();

  if (!client) {
    return null;
  }

  return client.query<T>(text, values);
}
