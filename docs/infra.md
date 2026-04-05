# Zero-Cost Infra Checklist

## Required
- `Vercel Hobby` for hosting
- `Wix` API key and site ID for blog fetches
- `Neon Postgres` with `db/schema.sql` applied
- `GitHub OAuth app` for admin-only resume tooling
- `Cloudflare Turnstile` for contact and private JD analysis

## Optional
- `Resend` for contact form delivery
- `Vercel Analytics`
- `Vercel Speed Insights`
- `Vercel Cron`
- `OpenAI`, `Ollama`, or `OpenClaw`

## Setup order
1. Deploy the repo on Vercel.
2. Create a free Neon project and run `db/schema.sql`.
3. Create a GitHub OAuth app and allow only your GitHub login.
4. Create a Cloudflare Turnstile widget and add the keys.
5. Add Wix keys for the blog integration.
6. Add Resend only if you want the form to send email directly.

## Notes
- The public site works without any LLM or vector embedding provider.
- `pgvector` is enabled now, but embeddings are not required for launch.
- If `DATABASE_URL` is missing, the private resume lab still analyzes JDs and falls back to focus-based public links instead of saved variants.
