# Vijay Jangir Website

Personal website built with Next.js, Tailwind CSS, Framer Motion, a Wix-backed blog, and a zero-cost-first portfolio stack.

## What Is In This Repo
- Homepage with recruiter-friendly positioning and selected work
- `/resume` for focus-based resume variants and ATS-safe PDF export
- `/work` for project filtering and technical review
- `/admin` for private JD analysis and resume tailoring
- Wix blog listing under `/blog`
- Neon-ready schema under `db/schema.sql`

## Working Docs
- `AGENTS.md`
- `docs/site-review.md`
- `docs/implementation-plan.md`
- `docs/infra.md`

## Environment
Create `.env.local` from `.env.example`.

Minimum useful setup:
- `WIX_API_KEY`
- `WIX_SITE_ID`

Private resume lab setup:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `ADMIN_GITHUB_LOGINS`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

Optional contact delivery:
- `RESEND_API_KEY`
- `RESEND_FROM`
- `CONTACT_TO_EMAIL`

## Local Development
```bash
npm install
npm run dev
```

## Database
Provision a free Neon Postgres project and run:

```sql
\i db/schema.sql
```

This enables:
- saved resume variants
- JD analysis storage
- lexical and trigram search infrastructure
- `pgvector` extension for future embedding search

## Commands
- `npm run dev`
- `npm run lint`
- `npm run build`

## Constraints
- Keep deployment compatible with free Vercel hosting.
- Keep Wix as the current blog authoring source unless there is an explicit product decision to replace it.
- Public features must work without any LLM or paid AI provider.
