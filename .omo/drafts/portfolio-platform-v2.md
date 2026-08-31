# Draft plan: portfolio-platform-v2

- slug: portfolio-platform-v2
- intent: clear
- review_required: false
- status: plan-written
- created: 2026-09-01
- approved: 2026-09-01
- plan: `.omo/plans/portfolio-platform-v2.md` (41 tasks + 5 final verifiers)
- next action: user starts a separate worker session (`$start-work`). Optional dual
  high-accuracy review (momus + Oracle) not yet run — offered, not requested.

## Post-approval amendment

Owner added at the approval gate: create a backup branch of the current state before
any change. Encoded as Task 1 (Phase 0), which captures BOTH the current HEAD
(`improve/seo-aeo-geo`) and deployed `main`, plus a `pre-platform-v2` tag, because the
working tree was dirty and HEAD is not main. Rollback procedure documented at the end
of the plan. D9 (public AI showcase = pre-computed market-signals page) was accepted
without correction and is encoded as Task 37.

## Request (verbatim intent)

Analyze repo state and plan improvements to vijayjangir.com: on-the-fly ATS resume
generated from a pasted job description; keep hosting free (Vercel); periodic blog
posts; avoid bloat; make it the owner's go-to site with a private signed-in tools
area the public cannot see.

## Grounding: verified facts

Stack: Astro 6.1.3 SSR, Vercel Hobby, ONE serverless function (`_render`), Node 24,
React islands, Tailwind 4. 42 tests. `vercel.json` has headers only (no crons).

### JD -> resume already exists end-to-end (admin-gated)

- `src/components/admin/ResumeLab.tsx` -> `POST /api/jd/analyze` (auth required,
  `src/pages/api/jd/analyze.ts:18-39`)
- `lib/jd.ts` deterministic alias scoring; section weights title 6 / required 5 /
  responsibilities 3 / preferred 1.5 / company 0.5; title boost 1.8, required 1.1;
  skill->focus propagation 60/40 (`lib/jd.ts:15-61,158-275`)
- `lib/portfolio.ts` ranking + truncation: projects top 4, highlights top 3,
  skills tiers 1-8/9-14/15-20, experiences top 3 x 3 bullets
  (`lib/portfolio.ts:120-195,288-291`)
- Persistence: `lib/resume-store.ts` -> Neon Postgres `resume_variants`, 24-hex token
- Render: `/resume?variant=TOKEN`, `/api/resume/pdf?variant=TOKEN`
- `src/components/resume/AtsResumeDocument.tsx` is ATS-correct: A4, Helvetica-only,
  single column, no tables/images/header-footer content, real text layer

### BLOCKING: `@astrojs/db` is removed upstream

Verified at https://docs.astro.build/en/guides/upgrade-to/v7/#removed-astrojsdb —
"The `@astrojs/db` package has been removed in Astro v7.0 and is no longer maintained."
Repo uses `@astrojs/db ^0.20.1` for all 19 content tables (`db/config.ts:8-249`).
Astro-recommended replacements: Drizzle, Turso, Neon, node:sqlite.

### Bloat inventory

- TWO databases: Astro DB/libSQL (content) + Neon Postgres (`pg`, resume variants)
- Dead schema: `project_fragments` + `vector` extension in `db/schema.sql:28-53`,
  grepped — referenced ONLY in schema.sql, never queried
- `legacy-next/` 208KB / 43 files, duplicate AtsResumeDocument, no `.vercelignore`
- `content/portfolio.ts` ~2,700 lines bundled into the function
- `ContentManager.tsx` 1,132 lines; `lib/portfolio-content.ts` 923 lines

### Test gaps (zero coverage)

`src/lib/auth.ts`, `src/actions/index.ts` (13 mutating actions), `lib/resume-store.ts`,
`lib/content-backup.ts`, `lib/portfolio-content.ts`, `lib/db.ts`, `lib/env.ts`,
`/api/resume/pdf`, `/api/jd/analyze`. No coverage thresholds in `vitest.config.ts`.

### Blog weaknesses

- `src/lib/wix.ts:176-185` + `blog/[slug].astro:200-216`: renders Wix `contentText` by
  splitting on blank lines into `<p>`. Destroys code blocks, images, links, headings, lists.
- 20-post hard cap (`src/lib/wix.ts:121-128`), no pagination
- `.github/workflows/` EMPTY. No CI, no cron. Gates run only via local git hooks.
- No `src/content/`, no content collections, no MDX integration

### Security / privacy

- `/assistant` has NO auth check (`src/pages/assistant/index.astro:1-10`) — public page
- No `src/middleware.ts`; per-page checks only, no redirects
- Resume variant tokens NEVER expire (`db/schema.sql:5-12` has no expiry; loader does no
  age check) and `/resume?variant=`, `/api/resume/pdf?variant=` are unauthenticated
- `jd_requests.raw_text` stores full JD text indefinitely, no retention policy
- `robots.txt` named AI-crawler groups get `Allow: /`, overriding wildcard disallow of
  `/admin`, `/assistant`, `/api` (`src/pages/robots.txt.ts:7-18,36-40`)
- Focus presets hardcoded `src/pages/resume.astro:71-87` (repeats reviewed finding #8)

### Platform research (as of 2026-09-01)

- Vercel Hobby: $0; 100GB transfer; 1M invocations; 4 Active-CPU-hours; 360 GB-hours;
  250MB standard bundle; 300s max duration (Fluid); 45min build cap
- Vercel Cron IS on Hobby: max 100 jobs/project, **minimum frequency once per DAY**,
  +/-59min precision
- Hobby is formally "non-commercial personal use only" (no ads/donations/paid client work)
- Neon Free: 100 CU-hours/project/mo, 0.5GB storage, 5GB egress, scale-to-zero after 5min
- GitHub Models RETIRED 2026-07-30. Gemini most durable free tier, Groq second.
- ATS: DOCX safest when accepted; text-layer PDF generally parses; avoid columns/tables/
  headers-footers/images. Universal "ATS score" is NOT established; recruiter keyword
  SEARCH is real.

## Owner decisions (answered)

1. Blog source: KEEP BOTH Wix and Markdown. Wix retained for SEO maturity/reach.
2. Cadence: TWO steps — (a) topic recommendations, keyword/visibility-driven, with
   suggested content angles; (b) owner adds/updates own inputs -> AI drafts post per
   best practices -> owner reviews -> publishes.
3. LLM: mix of private assist AND direct tailored-bullet generation. Public surface
   should demonstrate meaningful AI capability. Private loop keeps site content current
   based on JDs posted + market demand.
4. Resume tool audience: PRIVATE, owner only.
5. Database: consolidate to SINGLE Neon Postgres + Drizzle.
6. Auth: keep GitHub OAuth; allowlist must contain ONLY the owner's user.

## Adopted defaults (announced at gate; owner may override)

- D1. Architectural spine: ALL LLM calls happen privately/offline behind auth. Public
  pages render only pre-computed, owner-approved artifacts. This satisfies both
  "public features work with no LLM" and "never invent facts" simultaneously, and
  reconciles the answer to Q3 with the answer to Q4.
- D2. LLM bullet generation is constrained to REPHRASING facts already present in
  approved content. No new metrics/claims. Every generated bullet passes an explicit
  owner diff-approval before it can enter a resume or the site. Never auto-persisted.
- D3. Provider: thin provider-agnostic adapter; Gemini default, Groq fallback; entire
  feature optional and absent-key-safe.
- D4. AI-drafted blog posts land as in-repo Markdown for review. Wix remains the
  owner's manual authoring surface; nothing is programmatically pushed to Wix.
- D5. Wix renderer upgraded to rich content. Implied by "keep Wix" — keeping a source
  means keeping it working, not preserving a defect.
- D6. Collapse admin/editor roles to a single owner role; drop `EDITOR_GITHUB_LOGINS`.
- D7. Astro 7 upgrade is OUT of scope. The @astrojs/db migration UNBLOCKS it; doing it
  is a separate decision.
- D8. Cron cadence is daily-max (Hobby constraint). Anything needing finer granularity
  uses GitHub Actions scheduled workflows instead.
- D9. Public AI showcase = pre-computed, cached "market signals" content derived from
  the private JD/market-intelligence loop. FLAGGED at the gate for correction.

## Scope OUT (guardrails, not reductions)

- No Astro 7 upgrade
- No public/unauthenticated resume generator
- No paid services; no email-delivery service (contact stays mailto)
- No programmatic publishing to Wix
- No image CDN migration (media stays on raw.githubusercontent.com)
- No focus-taxonomy redesign (deferred finding #12)
- No replacement of the GitHub backup layer

## Open at gate

- D9 (public AI showcase shape) needs owner confirmation or correction.
