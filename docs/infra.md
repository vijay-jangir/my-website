# Zero-Cost Infra Checklist

## Required

- `Vercel Hobby` for hosting
- `Node 22+` locally and in Vercel project settings
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
2. Set the Vercel project Node version to `22.x`.
3. Create a free Neon project and run `db/schema.sql`.
4. Create a GitHub OAuth app and allow only your GitHub login.
5. Add Wix keys for the blog integration.
6. Add Resend only if you want the form to send email directly.
7. Add Turnstile only if or when a public form or public query surface is exposed.

## Notes

- The public site works without any LLM or vector embedding provider.
- `pgvector` is enabled now, but embeddings are not required for launch.
- If `DATABASE_URL` is missing, private resume analysis still works and falls back to focus-based public links instead of saved variants.
- OpenClaw stays out of the Vercel runtime and should be exposed later through a separate private bridge or private subdomain.
