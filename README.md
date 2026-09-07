# Vijay Jangir Website

Personal portfolio rebuilt on Astro with a Vercel deployment target, a Wix-backed blog, deterministic JD parsing, ATS-safe PDF export, Neon Postgres-backed portfolio content via Drizzle ORM, and private admin paths that stay off the public signup model.

## What Is In This Repo

- Public Astro pages for `/`, `/resume`, `/work`, `/blog`, `/admin`, and `/assistant`
- Private content management at `/admin/content` backed by Astro DB plus GitHub snapshot publishing
- Deterministic focus engine and JD parser under [`lib/portfolio.ts`](./lib/portfolio.ts) and [`lib/jd.ts`](./lib/jd.ts)
- DB-backed portfolio content loader and backup publisher under [`lib/portfolio-content.ts`](./lib/portfolio-content.ts) and [`lib/content-backup.ts`](./lib/content-backup.ts)
- GitHub allowlist auth flow for private admin surfaces under [`src/lib/auth.ts`](./src/lib/auth.ts)
- ATS-safe PDF generation under [`src/pages/api/resume/pdf.ts`](./src/pages/api/resume/pdf.ts)
- Legacy Next.js code quarantined under [`legacy-next/`](./legacy-next/)

## Working Docs

- [`AGENTS.md`](./AGENTS.md)
- [`docs/implementation-plan.md`](./docs/implementation-plan.md)
- [`docs/progress-log.md`](./docs/progress-log.md)
- [`docs/authority-index.md`](./docs/authority-index.md)
- [`docs/seo-aeo-geo-strategy.md`](./docs/seo-aeo-geo-strategy.md)
- [`docs/seo-audit-log.md`](./docs/seo-audit-log.md)
- [`docs/infra.md`](./docs/infra.md)

## Runtime

- Node `24.x`
- Astro `6`
- Vercel adapter in server mode

Local shell note for this machine:

```bash
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
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

Portfolio content storage:

- `DATABASE_URL`
- `CONTENT_BACKUP_REPO`
- `CONTENT_BACKUP_PAT`
- `CONTENT_BACKUP_BRANCH` (optional, default `content-backup`)
- `CONTENT_HISTORY_LIMIT` (optional, default `10`)

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

- `npm run build` runs `astro build` directly. Content is fetched at request time from Neon Postgres (or falls back to GitHub backup / bundled snapshot).
- Vercel adapter build is green.
- A real `vercel build --yes` still requires a valid authenticated Vercel token and linked project settings on the machine running it.

## Constraints

- Keep deployment compatible with free Vercel hosting.
- Keep Wix as the current blog authoring source unless there is an explicit product decision to replace it.
- Public pages use edge-cached server rendering (`Cache-Control: s-maxage`) so admin publishes appear without redeploys.
- Contact is mailto-only by product decision; no email-delivery service is used.
- Public features must work without any LLM or paid AI provider.
