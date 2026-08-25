# Progress Log

## 2026-04-05

### Wave 0.1

- Audited the current repo state and confirmed the branch was clean before migration work.
- Confirmed the current app already contains useful structured portfolio data and deterministic JD-analysis logic worth preserving.
- Reframed the project as an Astro migration instead of continuing incremental Next.js changes.

### Wave 0.2

- Added the migration plan with explicit phases, waves, and exit criteria.
- Added the authority index to keep local and external sources of truth explicit.

### Wave 1.1

- Replaced the active runtime/tooling path with Astro on the Vercel adapter.
- Added Node 22 pinning, Astro config, Vitest, ESLint, Prettier, Husky, and lint-staged.
- Quarantined the previous Next.js app under `legacy-next/` instead of deleting it blindly.

### Wave 1.2

- Rebuilt the public shell in Astro with pages for `/`, `/resume`, `/work`, `/blog`, `/admin`, and `/assistant`.
- Preserved the structured portfolio data, deterministic focus engine, JD parser, Wix integration, and PDF export path.
- Added private GitHub allowlist auth scaffolding for admin-only tooling.

### Wave 1.3

- Moved the runtime target from Node 22 to Node 24 so it matches the latest Vercel-supported Node major.
- Confirmed Astro is already on the latest registry version available during this pass.
- Added a Vite override so the dependency graph stays on Astro-supported Vite 7 instead of Vite 8.

### Wave 1.4

- Installed `node@24` locally and reran the full project checks under Node `24.14.1`.
- Started the Astro dev server locally on `http://127.0.0.1:4321`.
- Verified `200` responses for `/`, `/resume`, `/work`, `/blog`, `/admin`, and `/api/resume/pdf`.

### Wave 2.1

- Rewrote the public content language to remove awkward labels and make the site easier to scan quickly.
- Replaced the placeholder glass-card visual system with a stronger editorial layout, clearer hierarchy, and a more intentional palette.
- Rebuilt the public pages for `/`, `/resume`, `/work`, and `/blog` so they feel like one coherent portfolio instead of an app shell with content inside it.

### Wave 2.2

- Reset the homepage direction around the strengths of the live site: centered hero, floating navigation, anchor-based storytelling, and lighter visual composition.
- Added client-side page transitions, scroll-aware navigation highlighting, and reveal-on-scroll motion in the shared Astro layout.
- Rebuilt the homepage as a premium single-page introduction while keeping `/resume`, `/work`, and `/blog` as deeper supporting routes.

### Wave 2.3

- Switched the public visual layer to a Tailwind-first implementation instead of relying on the large custom stylesheet.
- Replaced the brittle custom transition script with a smaller, community-backed motion stack: `framer-motion` for homepage interaction and native browser view transitions for page navigation.
- Rebuilt the public Astro pages and shared cards around reusable Tailwind patterns so the UI no longer feels like an afterthought layered on top of the migration.

### Wave 2.4

- Polished the UX around clarity and maintainability instead of adding new visual noise.
- Improved the homepage copy, simplified CTA labels, and added visible freshness signals so the site reads as current rather than static.
- Made the floating navigation safer on smaller screens, added a skip link, and added clear reset actions on filtered resume/work views.

### Wave 3.1

- Added Astro DB-backed portfolio content storage with normalized tables in `db/config.ts` and local seed support in `db/seed.ts`.
- Added DB-first content loading with fallback order: Astro DB, GitHub backup snapshot, bundled file snapshot.
- Added GitHub snapshot publishing and media upload plumbing so content is not stored only in the database.

### Wave 3.2

- Switched the public pages, PDF endpoint, and JD analysis endpoint to read through the new content loader instead of importing the bundled portfolio file directly.
- Added a private `/admin/content` surface with direct publishing for profile, skills, projects, experience, advanced collections, media, and revision history.
- Reworked `/admin` into an actual hub that links resume tooling and content management together.

### Failure Log

- Hit an Astro/Tailwind integration incompatibility while trying `@astrojs/tailwind` with Astro 6.
  Resolution: switched to the current Tailwind Vite plugin path.
- Hit a Node runtime mismatch because Astro 6 requires Node 22.12+ and the machine was still using Node 20.
  Resolution: installed `node@22`, pinned `.nvmrc`, and ran the toolchain under Node 22.
- Hit a dev-server compatibility warning because the dependency graph resolved Vite 8 while Astro 6 expects Vite 7.
  Resolution: pinned the project to the latest Vite 7 line through `package.json` overrides.
- Hit a JD parser ranking miss where an AI-focused title was not surfacing `ai` strongly enough.
  Resolution: added a failing unit test first, then increased title-section weighting in the deterministic focus scoring.
- Hit a typecheck failure in the new homepage motion layer because `useReducedMotion()` can return `null`.
  Resolution: added a focused unit test for reduced-motion normalization first, then introduced a small helper and used it across the homepage section animation flow.
- Hit local Vercel build validation blockers.
  Resolution: confirmed the app-side build is valid and logged the actual environment blockers below.
- Hit an Astro preview limitation while validating the built server.
  Resolution: used `astro dev` for route-level runtime verification because the Vercel adapter does not support `astro preview`.
- Hit a recurring stale local `astro dev` process that stayed bound to port `4321` and served `500` responses after previous sessions.
  Resolution: killed the stale listener and restarted the dev server cleanly before route validation.
- Hit an Astro DB production-build blocker because `astro build` requires either a local database file or the `--remote` flag.
  Resolution: added a small build wrapper that automatically selects local file mode for local builds and `--remote` when remote libSQL credentials are configured.
- Hit a type mismatch between readonly portfolio model types and Astro Action input types.
  Resolution: kept the public domain types readonly, then added explicit conversion points at the action boundaries instead of weakening the domain model.

### Verification

- `npm run lint` passed under Node 22.
- `npm run typecheck` passed under Node 22.
- `npm run test:run` passed under Node 22.
- `npm run build` passed under Node 22 with the Astro Vercel adapter.
- `npm run check` passed under Node 22.
- `npm run check` passed under Node 24 after the runtime pin was updated.
- `npm run format` passed after the public redesign pass.
- `npm run check` passed under Node 24 after the public redesign pass.
- `npm run format && npm run check` passed under Node 24 after the homepage reset toward the live-site interaction model.
- `npm run format` passed under Node 24 after the Tailwind-first refactor and transition cleanup.
- `npm run check` passed under Node 24 after the `framer-motion` homepage transition pass.
- `npm run format && npm run check` passed under Node 24 after the UX polish and freshness pass.
- `npm run lint` passed after the Astro DB/content-management implementation wave.
- `npm run typecheck` passed after the Astro DB/content-management implementation wave.
- `npm run test:run` passed after the Astro DB/content-management implementation wave.
- `npm run build` passed after the Astro DB/content-management implementation wave.
- Local dev server responded successfully on the main public routes and the PDF endpoint.

### Deployment Check

- `npx vercel build` initially failed because no local project settings were present.
- `npx vercel build --yes` then failed because the current Vercel token on this machine is invalid.
- Result: deployment validation is blocked by local Vercel authentication/linkage, not by the app build.

### Working Rules

- If a failure is found, add a focused unit test first, then fix the issue.
- Keep the log updated at the end of every completed wave and after every blocked deployment check.

### Open Items

- Wire a real logged-in admin flow locally with valid GitHub OAuth credentials.
- Link the repo to Vercel with a valid token and rerun `npm run vercel:build`.
- Decide whether to port or delete any remaining legacy Next.js-only assets after the Astro migration settles.

## 2026-08-25 — Hardening, SEO, and content wave (`rebuild/hardening-seo-content`)

### Changes

- Removed dead modules (`lib/auth.ts`, `lib/hooks.ts`, `lib/utils.ts`, `lib/types.ts`, `lib/data.ts`, `lib/turnstile.ts`) and unused deps (`resend`, `clsx`, `@vercel/analytics`, `@vercel/speed-insights`); pruned ghost env vars.
- Added `Cache-Control: s-maxage` + stale-while-revalidate to public SSR pages and the PDF endpoint; 8s timeouts on Wix and backup fetches; removed Next-only fetch cache options.
- Replaced silent catches with warnings in content loader, backup loader, and resume store; reset poisoned astro:db module-promise cache on failure.
- Focus URL params now validate against live content via `parseFocusIdsInContent`.
- JD alias matching uses lookaround boundaries so `C++`/`C#`-style aliases match; regression tests added.
- Removed fake blog category filter; homepage mobile pitch and featured lineup now derive from snapshot data.
- SEO: `/rss.xml` + autodiscovery, sitemap lastmod for posts, Article/Breadcrumb/CreativeWork JSON-LD, `og:type=article`, dedicated 404 page, `favicon.ico/png` naming, apex-host consistency, security headers in `vercel.json`.
- Content: added `enterprise-text-to-sql-agent` case study (RASL schema linking per arXiv:2507.23104, Trino governed execution, LangGraph subgraphs, MCP servers, Langfuse, Open WebUI); added MCP skill entry.
- Docs: rewrote AGENTS.md for Astro reality; replaced stale site-review.md with findings + disposition.

### Validation

- `npm run check` green under Node 24 (lint, astro check, 24 unit tests, production build).
