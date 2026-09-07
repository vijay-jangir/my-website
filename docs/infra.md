# Zero-Cost Infra Checklist

## Required

- `Vercel Hobby` for hosting
- `Node 24.x` locally and in Vercel project settings
- `Astro DB` with remote libSQL credentials for the portfolio content domain
- `GitHub backup repo` plus a fine-grained PAT for durable public content snapshots and media
- `Wix` API key and site ID for blog fetches
- `Neon Postgres` with `db/schema.sql` applied
- `GitHub OAuth app` for admin-only resume tooling

## Optional

- `Resend` for direct contact-form delivery
- `Cloudflare Turnstile`
- `Vercel Analytics`
- `Vercel Speed Insights`
- `Vercel Cron`
- `OpenAI`, `Ollama`, or `OpenClaw`

## Setup order

1. Link the repo to a Vercel project and make sure the CLI token is valid.
2. Set the Vercel project Node version to `24.x`.
3. Create a remote libSQL database and add `ASTRO_DB_REMOTE_URL` and `ASTRO_DB_APP_TOKEN`.
4. Create a dedicated public GitHub backup repo and a fine-grained PAT scoped only to that repo.
5. Create a free Neon project and run `db/schema.sql`.
6. Create a GitHub OAuth app and allow only your GitHub login.
7. Add Wix keys for the blog integration.
8. Add Resend only if you want the form to send email directly.
9. Add Turnstile only if or when a public form or public query surface is exposed.

## Migration Runbook: Astro DB → Neon Postgres

One-time migration that reads the current content snapshot and inserts it
into the consolidated Neon Postgres database via Drizzle. The script lives
at `scripts/migrate-to-neon.mjs`.

### Prerequisites

1. Drizzle schema applied to the Neon database: `npm run db:migrate`
2. `DATABASE_URL` set to the Neon connection string.
3. Node 24+ (uses native `.ts` type-stripping for schema import).
4. Optional: `CONTENT_BACKUP_REPO` / `CONTENT_BACKUP_BRANCH` — if set the
   script reads `state/current.json` from the GitHub backup before falling
   back to the bundled `content/portfolio.ts`.

### Dry run (safe, no writes)

```bash
node scripts/migrate-to-neon.mjs --dry-run
```

Prints per-table source row counts. If `DATABASE_URL` is set, also shows
existing target row counts. Never modifies the database.

### Real migration

```bash
DATABASE_URL=postgres://… node scripts/migrate-to-neon.mjs
```

All 19 content tables are inserted inside a single Drizzle transaction.
Exits non-zero if any content table is already non-empty.

### Force re-migration

```bash
DATABASE_URL=postgres://… node scripts/migrate-to-neon.mjs --force
```

Deletes existing content rows in reverse FK order, then re-inserts.
Does **not** touch `resume_variants` or `jd_requests` (already in Neon).

### Post-migration verification

1. Confirm the reconciliation table printed at the end shows ✓ on every row.
2. Spot-check a few rows in Drizzle Studio: `npm run db:studio`.
3. Once verified, proceed to Task 13 (move the content READ path onto Drizzle).

### Rollback

The migration only writes to the 19 content tables. To undo:

```sql
TRUNCATE site_profile, portfolio_link, focus_definition, skill,
         skill_focus_weight, project, project_link, project_skill_link,
         project_focus_weight, experience, experience_focus_weight,
         experience_bullet, experience_bullet_skill_link,
         experience_bullet_focus_weight, profile_highlight,
         profile_highlight_focus_weight, summary_template, media_asset,
         content_revision CASCADE;
```

The Astro DB / GitHub backup read chain remains functional as the fallback.

## Notes

- The public site works without any LLM or vector embedding provider.
- Public portfolio pages now read content in this order: Astro DB, GitHub backup snapshot, bundled fallback snapshot.
- After migration, the read order becomes: Neon Postgres (Drizzle), GitHub backup snapshot, bundled fallback snapshot.
- Direct content publishing is blocked until GitHub backup configuration is present because backup happens before DB apply.
- `pgvector` is enabled now, but embeddings are not required for launch.
- If `DATABASE_URL` is missing, private resume analysis still works and falls back to focus-based public links instead of saved variants.
- OpenClaw stays out of the Vercel runtime and should be exposed later through a separate private bridge or private subdomain.
