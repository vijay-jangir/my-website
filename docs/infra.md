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

## Notes

- The public site works without any LLM or vector embedding provider.
- Public portfolio pages now read content in this order: Astro DB, GitHub backup snapshot, bundled fallback snapshot.
- Direct content publishing is blocked until GitHub backup configuration is present because backup happens before Astro DB apply.
- `pgvector` is enabled now, but embeddings are not required for launch.
- If `DATABASE_URL` is missing, private resume analysis still works and falls back to focus-based public links instead of saved variants.
- OpenClaw stays out of the Vercel runtime and should be exposed later through a separate private bridge or private subdomain.
