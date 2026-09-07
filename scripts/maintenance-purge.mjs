#!/usr/bin/env node
// Purge expired resume variants and JD requests from Neon Postgres.
// Called by .github/workflows/maintenance.yml on a daily schedule.

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("[maintenance-purge] DATABASE_URL not set — skipping.");
  process.exit(0);
}

const sql = neon(DATABASE_URL);

const [variants, jdRequests] = await Promise.all([
  sql`
    with deleted as (
      delete from resume_variants where expires_at < now() returning 1
    )
    select count(*)::text as count from deleted
  `,
  sql`
    with deleted as (
      delete from jd_requests where expires_at < now() returning 1
    )
    select count(*)::text as count from deleted
  `,
]);

const variantCount = Number(variants[0]?.count ?? 0);
const jdCount = Number(jdRequests[0]?.count ?? 0);

if (variantCount > 0) {
  console.info(`[maintenance-purge] purged ${variantCount} expired resume variants`);
}
if (jdCount > 0) {
  console.info(`[maintenance-purge] purged ${jdCount} expired JD requests`);
}
if (variantCount === 0 && jdCount === 0) {
  console.info("[maintenance-purge] nothing to purge");
}
