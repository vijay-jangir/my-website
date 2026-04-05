# Vijay Jangir Website

Personal portfolio rebuilt on Astro with a Vercel deployment target, a Wix-backed blog, deterministic JD parsing, ATS-safe PDF export, and a private admin path that stays off the public signup model.

## What Is In This Repo

- Public Astro pages for `/`, `/resume`, `/work`, `/blog`, `/admin`, and `/assistant`
- Deterministic focus engine and JD parser under [`lib/portfolio.ts`](./lib/portfolio.ts) and [`lib/jd.ts`](./lib/jd.ts)
- GitHub allowlist auth flow for private admin surfaces under [`src/lib/auth.ts`](./src/lib/auth.ts)
- ATS-safe PDF generation under [`src/pages/api/resume/pdf.ts`](./src/pages/api/resume/pdf.ts)
- Neon-ready schema under [`db/schema.sql`](./db/schema.sql)
- Legacy Next.js code quarantined under [`legacy-next/`](./legacy-next/)

## Working Docs

- [`AGENTS.md`](./AGENTS.md)
- [`docs/implementation-plan.md`](./docs/implementation-plan.md)
- [`docs/progress-log.md`](./docs/progress-log.md)
- [`docs/authority-index.md`](./docs/authority-index.md)
- [`docs/infra.md`](./docs/infra.md)

## Runtime

- Node `22+`
- Astro `6`
- Vercel adapter in server mode

Local shell note for this machine:

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

## Environment

Create `.env.local` from `.env.example`.

Minimum public setup:

- `WIX_API_KEY`
- `WIX_SITE_ID`

Private admin setup:

- `SESSION_SECRET` or `NEXTAUTH_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`
- `ADMIN_GITHUB_LOGINS`
- `EDITOR_GITHUB_LOGINS` (optional)

Database-backed variant storage:

- `DATABASE_URL`

Optional extras:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `CONTACT_TO_EMAIL`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `OPENAI_API_KEY`
- `OPENCLAW_BASE_URL`
- `OPENCLAW_TOKEN`

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run check
npm run vercel:build
```

## Hooks

- `pre-commit`: `lint-staged` + `npm run test:run`
- `pre-push`: `npm run check`

## Deployment Notes

- Local Astro build is green.
- Vercel adapter build is green.
- A real `vercel build --yes` still requires a valid authenticated Vercel token and linked project settings on the machine running it.

## Constraints

- Keep deployment compatible with free Vercel hosting.
- Keep Wix as the current blog authoring source unless there is an explicit product decision to replace it.
- Keep OpenClaw off Vercel and behind a private future integration path.
- Public features must work without any LLM or paid AI provider.
