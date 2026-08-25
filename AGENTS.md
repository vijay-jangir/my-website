# AGENTS.md

## Mission

Keep vijayjangir.com a fast, honest, SEO-strong portfolio and resume generator without introducing paid infrastructure.

## Read First

1. `docs/site-review.md` (current review + disposition)
2. `docs/implementation-plan.md` (migration history)
3. `README.md`

## Current Architecture

This is an **Astro 6** app deployed to Vercel in server mode. The legacy Next.js app is quarantined under `legacy-next/` and must not be imported.

- Public routes: `/`, `/projects`, `/projects/[slug]`, `/resume`, `/blog`, `/blog/[slug]`, plus `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/404`.
- Private routes: `/admin`, `/admin/content`, `/assistant` (noindex; GitHub allowlist auth via `src/lib/auth.ts`, arctic OAuth + jose JWT session cookies).
- Content pipeline: Astro DB (`db/config.ts`) → GitHub backup (`lib/content-backup.ts`) → bundled fallback (`content/portfolio.ts`). Loader with fallback chain lives in `lib/portfolio-content.ts`.
- Focus engine + resume variants: `lib/portfolio.ts`; deterministic JD parser: `lib/jd.ts`. Both operate on any snapshot via the `*FromContent` / `*InContent` variants.
- Admin mutations: Astro Actions in `src/actions/index.ts`; every publish writes a GitHub backup snapshot before rewriting Astro DB tables.
- PDF export: `src/pages/api/resume/pdf.ts` renders `AtsResumeDocument` (Helvetica-only, ATS-safe).
- Blog: Wix API via `src/lib/wix.ts`; posts render locally at `/blog/[slug]`.

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
- Publishing rewrites all content tables non-transactionally after the backup succeeds; single-admin usage keeps the risk low.
- `parseFocusIdsInContent` fixed the fallback-vs-DB split, but tests still exercise mostly the fallback path.
- Real deployment validation (`vercel build` with linked project) still requires local Vercel auth.

## Implementation Rules

- Use built-in `fetch`. Next.js-only options (`next.revalidate`, `cache: "force-cache"`) are no-ops here; cache via response headers instead.
- Every external fetch gets a timeout (`AbortSignal.timeout`). Fallback paths log warnings; do not reintroduce silent `catch {}`.
- New URL params that reference taxonomy (focus ids) must validate against live content (`parseFocusIdsInContent`), not the bundled fallback.
- Any new page passes a unique `description` to `BaseLayout` and sets appropriate cache headers.
- Validate with `npm run check` (lint + typecheck + tests + build) before pushing.
