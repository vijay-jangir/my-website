# AGENTS.md

## Mission

Keep vijayjangir.com a fast, honest, SEO-strong portfolio and resume generator without introducing paid infrastructure.

## Read First

1. `docs/site-review.md` (current review + disposition)
2. `docs/implementation-plan.md` (migration history)
3. `README.md`

## Current Architecture

**Astro 6** SSR on Vercel Hobby (single `_render` serverless function, Node 24).

- **Database:** Single Neon Postgres instance via Drizzle ORM (`db/drizzle/schema.ts`). All 19 content tables plus `resume_variants` and `jd_requests` live in one database. Migrations via `npm run db:generate` / `npm run db:migrate`.
- **Content pipeline:** Neon Postgres (Drizzle) → GitHub backup snapshot → bundled fallback (`content/portfolio.ts`). Loader with three-tier fallback lives in `lib/portfolio-content.ts`. Admin publish writes a GitHub backup snapshot inside a Drizzle transaction before updating the database.
- **Public routes:** `/`, `/projects`, `/projects/[slug]`, `/resume`, `/blog`, `/blog/[slug]`, `/market-signals`, plus `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/404`. All edge-cached via `Cache-Control: s-maxage` headers. **No public route may call an LLM** — enforced by an ESLint `no-restricted-imports` guard.
- **Private routes (owner-only):** `/admin`, `/admin/content`, `/assistant`, `/assistant/studio`, `/assistant/signals` (noindex; GitHub allowlist auth via `src/lib/auth.ts`, arctic OAuth + jose JWT session cookies). Only the owner's GitHub login is allowed.
- **Blog:** Dual-source — Wix API (`src/lib/wix.ts`) for existing posts, plus a private AI-assisted authoring studio at `/assistant/studio` that drafts via `lib/llm/`.
- **LLM surface:** Private only. Providers configured in `lib/llm/` (Groq, Gemini). Used by `/api/resume/rephrase`, `/api/studio/*`, `/api/intelligence/*`. Public features work with all AI env vars unset.
- **Focus engine + resume variants:** `lib/portfolio.ts`; deterministic JD parser: `lib/jd.ts`. Both operate on any snapshot via the `*FromContent` / `*InContent` variants.
- **PDF/DOCX export:** `src/pages/api/resume/pdf.ts` renders `AtsResumeDocument` (Helvetica-only, ATS-safe); DOCX via `src/pages/api/resume/docx.ts`.
- **Market intelligence:** Private signals pipeline at `/api/intelligence/*` with public read-only view at `/market-signals`.
- **CI:** GitHub Actions for lint + typecheck + test + build on push/PR; scheduled daily maintenance purges expired rows.

## Non-Negotiables

- Keep deployment compatible with free Vercel Hobby hosting.
- Keep Wix as the blog authoring source unless there is an explicit product decision to replace it.
- Prefer cached server rendering: public SSR pages carry `Cache-Control: s-maxage` headers so admin publishes appear within minutes without redeploys. Do not trade this away for build-time prerender on content pages.
- No paid SaaS dependencies when a free option or built-in Next/Astro capability suffices. Contact is mailto-only by product decision.
- Never invent facts, metrics, or claims in personal content. Flag gaps to the owner instead.
- Public features must work with no LLM and no AI provider configured.

## Known Issues / Deferred

- Media assets are served from `raw.githubusercontent.com` via the backup repo; acceptable stopgap, not an image CDN.
- The focus taxonomy mixes roles, domains, and technologies (`ai`, `backend-engineering`, `flink`, `python` as sibling focuses). Works, but confusing over time.
- Publishing uses a Drizzle transaction for content table writes, but a backup failure mid-publish is not automatically retried.
- `parseFocusIdsInContent` fixed the fallback-vs-DB split, but tests still exercise mostly the fallback path.
- Real deployment validation (`vercel build` with linked project) still requires local Vercel auth.

## Implementation Rules

- Use built-in `fetch`. Next.js-only options (`next.revalidate`, `cache: "force-cache"`) are no-ops here; cache via response headers instead.
- Every external fetch gets a timeout (`AbortSignal.timeout`). Fallback paths log warnings; do not reintroduce silent `catch {}`.
- New URL params that reference taxonomy (focus ids) must validate against live content (`parseFocusIdsInContent`), not the bundled fallback.
- Any new page passes a unique `description` to `BaseLayout` and sets appropriate cache headers.
- Validate with `npm run check` (lint + typecheck + tests + build) before pushing.
