# Plan: portfolio-platform-v2

- slug: portfolio-platform-v2
- intent: clear
- review_required: false
- status: approved — ready for execution
- approved: 2026-09-01
- executor entrypoint: `$start-work`

## Goal

Turn vijayjangir.com into the owner's primary professional surface: a private
JD-driven ATS resume generator, a dual-source blog with an AI-assisted authoring
studio, and a private market-intelligence loop — on a single consolidated database,
at $0, without bloat.

## Architectural spine (binding constraint on every task)

**All LLM calls happen privately, behind auth, off the request path. Public pages
render ONLY pre-computed, owner-approved artifacts.**

Consequences the executor MUST honor:

- No public route may call an LLM provider at request time.
- The site MUST build, serve, and pass all tests with every AI env var unset.
- No LLM output reaches a resume or a public page without an explicit owner approval action.
- LLM may only REPHRASE facts already present in approved content. It MUST NOT
  introduce metrics, employers, dates, technologies, or claims. Any task that would
  allow new factual content is out of scope.

## Context the executor needs

- Astro 6.1.3 SSR on Vercel Hobby, ONE serverless function (`_render`), Node 24.
- `@astrojs/db` is REMOVED in Astro 7 and unmaintained
  (https://docs.astro.build/en/guides/upgrade-to/v7/#removed-astrojsdb). This forces
  the migration in Phase 2.
- Currently TWO databases: Astro DB/libSQL (19 content tables, `db/config.ts`) and
  Neon Postgres (`resume_variants`, `jd_requests`, `db/schema.sql`).
- Content read chain is Astro DB -> GitHub backup snapshot -> bundled
  `content/portfolio.ts`. This three-tier resilience MUST survive the migration.
- Vercel Hobby cron minimum frequency is once per DAY. Use GitHub Actions for anything finer.
- Test count is currently 42; auth/actions/persistence have ZERO coverage.

## Non-negotiables (from AGENTS.md, still binding)

- Free Vercel Hobby compatible. No paid SaaS. Contact stays mailto-only.
- Public SSR pages keep `Cache-Control: s-maxage` headers. No build-time prerender
  on content pages.
- Never invent facts, metrics, or claims in personal content.
- Public features work with no LLM and no AI provider configured.
- Every external fetch gets `AbortSignal.timeout`. No silent `catch {}`.
- New taxonomy-referencing URL params validate via `parseFocusIdsInContent`.
- Every new page passes a unique `description` to `BaseLayout`.
- `npm run check` passes before any push.

## Must NOT have (guardrails against unrequested additions)

- NO Astro 7 upgrade. The migration unblocks it; performing it is separate work.
- NO public or unauthenticated resume generator. The JD tool is owner-only.
- NO paid services, no email-delivery service, no analytics vendor.
- NO programmatic publishing to Wix. Wix stays a manual authoring surface.
- NO image-CDN migration. Media stays on `raw.githubusercontent.com`.
- NO focus-taxonomy redesign (deferred review finding #12).
- NO replacement of the GitHub backup snapshot layer.
- NO new UI framework, component library, CSS framework, or state library.
- NO `EDITOR_GITHUB_LOGINS` role. Single owner only.

## Test strategy

Tests-after for Phase 0. **TDD for Phase 1** (the tests ARE the deliverable).
Tests-first for every subsequent behavior change: Phase 1 locks the critical paths
BEFORE Phase 2 moves them, so the migration is verified against pinned behavior.
Every task carries agent-executed QA — happy path plus failure path, exact command,
zero human intervention.

## Dependency matrix

| Phase                   | Depends on | Reason                                     |
| ----------------------- | ---------- | ------------------------------------------ |
| 0 Safety (1)            | —          | Must precede all mutation                  |
| 1 Test lock (2–9)       | 0          | Pin behavior before moving it              |
| 2 DB migration (10–18)  | 1          | Migration verified against pinned tests    |
| 3 Security (19–23)      | 2          | Guards reference the new data layer        |
| 4 Resume engine (24–28) | 2, 3       | Needs new store + owner-only auth          |
| 5 Blog (29–33)          | 2          | Independent of 3/4; needs new data layer   |
| 6 Studio (34–35)        | 4, 5       | Needs LLM adapter + markdown collection    |
| 7 Intelligence (36–37)  | 4          | Needs LLM adapter + jd_requests on Drizzle |
| 8 De-bloat/CI (38–41)   | all        | Final cleanup and automation               |

Phases 4 and 5 may run in parallel after 3. Phases 6 and 7 may run in parallel after 4+5.

---

## Todos

### Phase 0 — Safety net

- [ ] 1. Create backup branches and tag capturing the pre-change state
  - Files: none (git only)
  - Do:
    - Record current state: `git rev-parse --abbrev-ref HEAD` and `git status --short`.
    - Commit or stash any untracked/dirty files FIRST so nothing is lost. Known
      untracked at plan time: `.omo/`, `docs/superpowers/plans/seo-aeo-geo-wave.md`.
      Commit them on the current branch with message
      `chore: checkpoint working tree before platform-v2`.
    - Create `backup/pre-platform-v2-head` from current HEAD; push to origin.
    - Create `backup/pre-platform-v2-main` from `origin/main`; push to origin.
    - Create annotated tag `pre-platform-v2` on `origin/main` with message
      `Deployed site state before platform-v2 work`; push the tag.
    - Create and switch to the working branch `feat/platform-v2` off the current HEAD.
  - Acceptance: both backup branches and the tag exist on origin; `git log` on each
    matches the recorded pre-change SHAs; working branch `feat/platform-v2` is checked out;
    `git status --short` is clean.
  - QA:
    - Happy: `git ls-remote --heads origin | grep -E 'backup/pre-platform-v2-(head|main)'`
      returns 2 lines; `git ls-remote --tags origin | grep pre-platform-v2` returns 1 line.
      Save output to `.omo/evidence/01-backup.txt`.
    - Failure: `git rev-parse backup/pre-platform-v2-head` on a fresh clone resolves to
      the recorded SHA. If any push fails, STOP the whole plan and report.
  - Commit: `chore: branch and tag pre-platform-v2 backups`

### Phase 1 — Lock critical paths with tests (TDD; these tests are the deliverable)

- [ ] 2. Enable vitest coverage reporting and thresholds
  - Files: `vitest.config.ts`, `package.json`, `.gitignore`
  - Do: add `@vitest/coverage-v8` devDep; configure `coverage` with `provider: "v8"`,
    `reporter: ["text","json-summary"]`, `include: ["lib/**","src/lib/**","src/actions/**","src/pages/api/**"]`,
    `exclude: ["legacy-next/**","**/*.d.ts"]`. Set initial thresholds to the CURRENT
    measured numbers (floor, not aspiration) so coverage can only go up. Add
    `"test:coverage": "vitest run --coverage"`. Gitignore `coverage/`.
  - Acceptance: `npm run test:coverage` succeeds and prints a summary; thresholds equal
    measured baseline; existing 42 tests still pass.
  - QA:
    - Happy: `npm run test:coverage` exits 0. Save summary to `.omo/evidence/02-coverage-baseline.txt`.
    - Failure: temporarily lower a threshold by +5 points above actual, confirm the run
      exits non-zero, then restore.
  - Commit: `test: add coverage reporting with baseline thresholds`

- [ ] 3. Test `lib/env.ts` and `lib/db.ts`
  - Files: `tests/env.test.ts` (new), `tests/db.test.ts` (new)
  - Do: cover every `readEnv` key; `SESSION_SECRET` -> `NEXTAUTH_SECRET` fallback;
    `WIX_SITE_ID` default; `CONTENT_HISTORY_LIMIT` default 10 and invalid/non-positive
    coercion to 10 (`lib/env.ts:47-50`); `isAuthConfigured()` true only with secret +
    GITHUB_ID + GITHUB_SECRET + >=1 admin login. For `db.ts`: `getDbPool()` returns null
    with no `DATABASE_URL`; `dbQuery` returns null rather than throwing.
  - Acceptance: both files pass; every branch in `lib/env.ts:8-60` exercised.
  - QA:
    - Happy: `npx vitest run tests/env.test.ts tests/db.test.ts` exits 0.
    - Failure: invert the `CONTENT_HISTORY_LIMIT` default in source, confirm a test fails, revert.
  - Commit: `test: cover env parsing and db pool fallbacks`

- [ ] 4. Test `src/lib/auth.ts`
  - Files: `tests/auth.test.ts` (new)
  - Do: cover `resolveRole` allowlist normalization (trim/lowercase, admin precedence,
    rejection of unlisted); session JWT sign/verify round-trip; expired token -> null;
    tampered signature -> null; missing `payload.login` -> null; role RE-RESOLVED from
    live allowlist so a removed login invalidates an otherwise-valid token
    (`src/lib/auth.ts:99-131`); cookie flags — name `vj_session`, HttpOnly, SameSite=Lax,
    path `/`, 7-day maxAge, Secure only when `NODE_ENV=production`; OAuth state cookie
    `vj_oauth_state` 600s TTL and exact-match validation.
  - Acceptance: all above assert; no real network calls (stub the GitHub profile fetch).
  - QA:
    - Happy: `npx vitest run tests/auth.test.ts` exits 0.
    - Failure: change `SameSite` to `None` in source, confirm the flag test fails, revert.
  - Commit: `test: cover GitHub OAuth session and allowlist logic`

- [ ] 5. Test `lib/resume-store.ts`
  - Files: `tests/resume-store.test.ts` (new)
  - Do: mock `dbQuery`. Assert `saveResumeVariant` generates a 24-char hex token, passes
    correct params, returns row; on DB throw returns null and logs a warning (never throws).
    `getResumeVariantByToken` maps `focus_ids`->`focusIds`, `created_at`->`createdAt`,
    null analysis -> undefined; unknown token -> null; DB throw -> null + warning.
  - Acceptance: all assert; the swallow-and-warn contract is pinned in both functions.
  - QA:
    - Happy: `npx vitest run tests/resume-store.test.ts` exits 0.
    - Failure: make `saveResumeVariant` rethrow, confirm the resilience test fails, revert.
  - Commit: `test: cover resume variant persistence and fallbacks`

- [ ] 6. Test `lib/content-backup.ts`
  - Files: `tests/content-backup.test.ts` (new)
  - Do: mock `fetch`. Assert repo parsing `owner/repo`; branch default `content-backup`;
    Bearer PAT header; branch-create-from-default when absent (`:69-114`); snapshot path
    scheme `snapshots/{YYYY}/{MM}/{timestamp}.json` and `state/current.json` (`:214-224`);
    base64 encoding; existing-SHA preserved on update; raw read URL shape; 8s
    `AbortSignal.timeout` present on every call; read failure returns null + warning.
  - Acceptance: all assert; zero real network.
  - QA:
    - Happy: `npx vitest run tests/content-backup.test.ts` exits 0.
    - Failure: remove the timeout signal in source, confirm the timeout test fails, revert.
  - Commit: `test: cover GitHub content backup publishing and reads`

- [ ] 7. Test `src/actions/index.ts` authorization
  - Files: `tests/actions-auth.test.ts` (new)
  - Do: assert `requireAdmin` rejects: no session; non-admin role; missing backup repo;
    missing backup PAT; and in production only, missing remote DB config (`:235-262`).
    Then assert EVERY one of the 13 exported actions calls it — enumerate them explicitly
    (`upsertProfile`, `createSkill`, `updateSkill`, `deleteSkill`, `createProject`,
    `updateProject`, `deleteProject`, `createExperience`, `updateExperience`,
    `deleteExperience`, `publishContentSnapshot`, `uploadMedia`, `listRevisions`) and fail
    if any new export lacks a guard.
  - Acceptance: all 13 covered; the test fails if an unguarded action is added.
  - QA:
    - Happy: `npx vitest run tests/actions-auth.test.ts` exits 0.
    - Failure: add a temporary unguarded export, confirm the enumeration test fails, remove it.
  - Commit: `test: pin admin authorization on every content action`

- [ ] 8. Test `/api/jd/analyze`
  - Files: `tests/api-jd-analyze.test.ts` (new)
  - Do: 503 when auth unconfigured; 401 when no session; 400 when `jobDescription` < 80 or
    > 10000 chars; happy path returns `ok`, `saved`, `resumeUrl`, `pdfUrl`, trimmed analysis
    > (focusScores<=6, skillScores<=10) and the variant subset; when persistence returns null,
    > URLs fall back to `?focus=` form (`:91-96`); `jd_requests` insert failure does NOT fail
    > the request.
  - Acceptance: all assert; auth and validation boundaries pinned exactly.
  - QA:
    - Happy: `npx vitest run tests/api-jd-analyze.test.ts` exits 0.
    - Failure: lower the min length to 10 in source, confirm the 400 boundary test fails, revert.
  - Commit: `test: cover JD analyze endpoint contract and fallbacks`

- [ ] 9. Test `/api/resume/pdf` and `AtsResumeDocument`
  - Files: `tests/api-resume-pdf.test.ts` (new)
  - Do: stored `variant` token takes precedence over `focus`; invalid token falls back to
    focus-built variant; cache headers — `private, no-store` for stored,
    `public, max-age=3600, s-maxage=86400` otherwise; `Content-Disposition` filename;
    `Content-Type: application/pdf`. ATS-safety regression: render to buffer and assert the
    PDF is non-empty, and assert the component's stylesheet uses ONLY `Helvetica` and
    contains no table/image/multi-column constructs.
  - Acceptance: all assert; the ATS-safety guard fails if a non-Helvetica font or an image
    is introduced.
  - QA:
    - Happy: `npx vitest run tests/api-resume-pdf.test.ts` exits 0.
    - Failure: change `fontFamily` to `Times-Roman`, confirm the ATS guard fails, revert.
  - Commit: `test: cover PDF endpoint contract and ATS-safety invariants`

### Phase 2 — Consolidate onto Neon Postgres + Drizzle

- [ ] 10. Add Drizzle tooling and the Neon client
  - Files: `package.json`, `drizzle.config.ts` (new), `lib/drizzle.ts` (new), `.env.example`
  - Do: add `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`. Create a single
    exported Drizzle client in `lib/drizzle.ts` reading `DATABASE_URL`, returning null when
    unset (mirror the existing `lib/db.ts` null-safe contract). Use the Neon HTTP driver —
    it suits serverless and avoids pool exhaustion. Add scripts `db:generate`, `db:migrate`,
    `db:studio`. Keep `pg` installed until task 16.
  - Acceptance: client imports cleanly; returns null with no `DATABASE_URL`; `npm run build` passes.
  - QA:
    - Happy: a temporary script imports the client with `DATABASE_URL` unset and logs `null`; exit 0.
    - Failure: with an invalid `DATABASE_URL`, a query rejects with a caught error and logs a
      warning rather than crashing the process.
  - Commit: `feat: add drizzle orm and neon serverless client`

- [ ] 11. Author the Drizzle schema for all content and resume tables
  - Files: `db/drizzle/schema.ts` (new)
  - Do: port ALL 19 tables from `db/config.ts:8-249` — `SiteProfile`, `PortfolioLink`,
    `FocusDefinition`, `Skill`, `SkillFocusWeight`, `Project`, `ProjectLink`,
    `ProjectSkillLink`, `ProjectFocusWeight`, `Experience`, `ExperienceFocusWeight`,
    `ExperienceBullet`, `ExperienceBulletSkillLink`, `ExperienceBulletFocusWeight`,
    `ProfileHighlight`, `ProfileHighlightFocusWeight`, `SummaryTemplate`, `MediaAsset`,
    `ContentRevision` — plus `resume_variants` and `jd_requests` from `db/schema.sql:5-26`.
    Preserve every column name, type, nullability, default, and sort/order column. Map
    libSQL JSON columns to Postgres `jsonb`, string arrays to `text[]`. Add the existing
    GIN indexes on `focus_ids`. Do NOT port `project_fragments` or the `vector` extension.
  - Acceptance: `npm run db:generate` produces a migration; generated SQL contains all 21
    tables and no `project_fragments`/`vector`; typecheck passes.
  - QA:
    - Happy: `npm run db:generate` exits 0; assert generated SQL has exactly 21 `CREATE TABLE`
      statements. Save to `.omo/evidence/11-schema.sql`.
    - Failure: `grep -c 'project_fragments\|CREATE EXTENSION.*vector'` on the generated SQL returns 0.
  - Commit: `feat: drizzle schema for consolidated content and resume tables`

- [ ] 12. Build the one-time Astro DB -> Neon migration script
  - Files: `scripts/migrate-to-neon.mjs` (new), `docs/infra.md`
  - Do: read the current snapshot via the EXISTING chain (Astro DB, else GitHub backup
    `state/current.json`, else bundled fallback) and insert into Neon via Drizzle inside a
    single transaction. Idempotent: `--dry-run` prints row counts per table without writing;
    a real run refuses to proceed if target tables are non-empty unless `--force`. Print a
    per-table source-vs-target row-count reconciliation at the end. Document the runbook in
    `docs/infra.md`.
  - Acceptance: `--dry-run` reports counts for all 21 tables; a real run reconciles exactly;
    a second run without `--force` refuses and exits non-zero.
  - QA:
    - Happy: run `--dry-run` against the bundled fallback; save reconciliation to
      `.omo/evidence/12-migration-dryrun.txt`; every table count matches the source snapshot.
    - Failure: run twice without `--force`; second run exits non-zero with a clear message and
      writes nothing (verify counts unchanged).
  - Commit: `feat: one-time astro db to neon migration script`

- [ ] 13. Move the content READ path onto Drizzle
  - Files: `lib/portfolio-content.ts`
  - Do: replace `loadPortfolioContentFromDb` (`:175-509`) with a Drizzle implementation
    producing a BYTE-IDENTICAL `PortfolioSnapshot`. Preserve: the parallel table fetch, all
    sort orders, `buildWeightRecord`/`sortByOrder` grouping, `toIsoString` normalization,
    `getContentHistoryLimit()` on revisions, and the warn-and-return-null-on-failure contract.
    Delete `loadAstroDbModule`/`shouldLoadAstroDb`/`requireAstroDbModule` and the module-promise
    cache. `getPortfolioContent()` keeps the exact three-tier chain: Drizzle -> GitHub backup ->
    bundled fallback.
  - Acceptance: snapshot shape identical to pre-migration; the three-tier fallback still works
    with `DATABASE_URL` unset; all Phase 1 tests still pass.
  - QA:
    - Happy: with `DATABASE_URL` unset, `getPortfolioContent()` returns the bundled fallback and
      the site builds. `npm run check` exits 0.
    - Failure: point `DATABASE_URL` at an unreachable host; assert the loader logs a warning,
      returns the backup/fallback snapshot, and does NOT throw.
  - Commit: `refactor: read portfolio content via drizzle`

- [ ] 14. Move the content WRITE/publish path onto Drizzle
  - Files: `lib/portfolio-content.ts`, `lib/portfolio-admin.ts`, `src/actions/index.ts`
  - Do: port `applyPortfolioContentSnapshot`, `clearContentTables`, `insertMany`, and the
    publish flow (`:873-912`) to Drizzle. Preserve backup-FIRST ordering (GitHub snapshot
    succeeds before DB rewrite) and the `db-apply-failed` error identity. **Improvement in
    scope:** wrap the table rewrite in a single Drizzle transaction, resolving deferred review
    finding #13 (non-transactional publish) for free, since Postgres supports it and libSQL
    did not.
  - Acceptance: publish writes backup then rewrites tables transactionally; a mid-rewrite
    failure rolls back with the DB unchanged and the backup still present; all 13 actions work.
  - QA:
    - Happy: publish a snapshot against a scratch Neon database; assert backup written first,
      then all tables reflect it. Save to `.omo/evidence/14-publish.txt`.
    - Failure: inject a fault on the last table insert; assert the transaction rolls back, prior
      content is intact, and the error identifies `db-apply-failed`.
  - Commit: `refactor: transactional content publish via drizzle`

- [ ] 15. Move `resume-store` and the `jd_requests` write onto Drizzle
  - Files: `lib/resume-store.ts`, `src/pages/api/jd/analyze.ts`
  - Do: replace raw `dbQuery` SQL with Drizzle queries. Preserve every behavior pinned by
    task 5: 24-hex token, null-on-failure, warn-not-throw, field mapping. Replace the silent
    `catch {}` on the `jd_requests` insert (`analyze.ts:82-84`) with a logged warning per the
    AGENTS.md no-silent-catch rule.
  - Acceptance: tasks 5 and 8 tests pass unmodified; no silent catch remains.
  - QA:
    - Happy: `npx vitest run tests/resume-store.test.ts tests/api-jd-analyze.test.ts` exits 0.
    - Failure: `grep -rn 'catch {}' src/ lib/` returns zero matches.
  - Commit: `refactor: resume store and jd requests via drizzle`

- [ ] 16. Remove `@astrojs/db` and the `pg` client entirely
  - Files: `package.json`, `astro.config.mjs`, `db/config.ts` (delete), `db/seed.ts`
    (rewrite or delete), `lib/db.ts` (delete), `scripts/astro-build.mjs`, `.env.example`
  - Do: remove `@astrojs/db` and `pg`/`@types/pg` from deps; remove `db()` from
    `astro.config.mjs:9,18`; delete `db/config.ts` and `lib/db.ts`; port `db/seed.ts` to
    Drizzle or delete it if task 12 supersedes it; remove `db:seed*`, `db:push:remote`,
    `db:verify:remote` scripts. Remove `ASTRO_DB_REMOTE_URL`, `ASTRO_DB_APP_TOKEN`,
    `ASTRO_DATABASE_FILE` from `.env.example` and all code.
  - Acceptance: zero references to `astro:db`, `@astrojs/db`, or `pg` outside `legacy-next/`;
    `npm run check` passes; the serverless bundle no longer contains libSQL.
  - QA:
    - Happy: `grep -rn "astro:db\|@astrojs/db\|from \"pg\"" --include='*.ts' --include='*.astro' --include='*.mjs' . | grep -v legacy-next` returns zero. `npm run check` exits 0.
    - Failure: `npm ls @astrojs/db pg` reports both absent.
  - Commit: `chore: remove @astrojs/db and pg in favor of drizzle on neon`

- [ ] 17. Retire the dead speculative schema
  - Files: `db/schema.sql` (delete or replace with a Drizzle-generated baseline), `docs/infra.md`
  - Do: `project_fragments`, its three indexes, and the `vector`/`pg_trgm` extensions
    (`db/schema.sql:1-3,28-53`) are referenced nowhere in application code — verified by grep.
    Remove them. Replace hand-maintained `db/schema.sql` with the Drizzle-generated migration
    as the single source of truth. Document in `docs/infra.md` that schema changes now go
    through `npm run db:generate`.
  - Acceptance: no hand-maintained SQL remains; no unused extensions created; infra doc updated.
  - QA:
    - Happy: `grep -rn "project_fragments\|pgvector\|CREATE EXTENSION" --include='*.sql' --include='*.ts' . | grep -v legacy-next` returns zero.
    - Failure: applying migrations to an empty scratch database creates exactly the 21 intended
      tables and no extensions. Save `\dt` output to `.omo/evidence/17-tables.txt`.
  - Commit: `chore: drop unused project_fragments table and pgvector extension`

- [ ] 18. Simplify the build wrapper
  - Files: `scripts/astro-build.mjs`, `package.json`, `README.md`
  - Do: the local-file-vs-`--remote` switch (`:14-21`) existed only for Astro DB. With Drizzle
    the build no longer needs a database. Reduce the script to a plain `astro build`, or delete
    it and set `"build": "astro build"`. Update `README.md` deployment notes.
  - Acceptance: `npm run build` succeeds with NO database env vars set; README no longer
    references Astro DB build modes.
  - QA:
    - Happy: `env -u DATABASE_URL npm run build` exits 0. Save to `.omo/evidence/18-build.txt`.
    - Failure: `grep -rn "ASTRO_DATABASE_FILE\|--remote" scripts/ package.json README.md` returns zero.
  - Commit: `chore: simplify build now that the database is build-independent`

### Phase 3 — Harden the private surface

- [ ] 19. Add a central route guard in middleware
  - Files: `src/middleware.ts` (new), `tests/middleware.test.ts` (new)
  - Do: create Astro middleware protecting `/admin/*`, `/assistant/*`, and every private API
    route. Unauthenticated HTML requests REDIRECT to `/admin` with a sign-in prompt (do not
    render private shells). Unauthenticated API requests return 401 JSON. Public routes and
    `/api/auth/*` are explicitly allowlisted. Middleware sets the noindex `X-Robots-Tag` on
    every private response so it can no longer be forgotten per-page.
  - Acceptance: private paths redirect/401 when unauthenticated; public paths unaffected;
    `/api/resume/pdf` stays public (token-gated by design).
  - QA:
    - Happy: table-driven test over every route in `src/pages/**` asserting expected
      public/private classification; exits 0.
    - Failure: add a new `/admin/foo` page with no page-level check; assert middleware still
      blocks it. This is the regression this task exists to prevent.
  - Commit: `feat: central middleware guard for private routes`

- [ ] 20. Close the `/assistant` auth hole and make it the private tools home
  - Files: `src/pages/assistant/index.astro`
  - Do: `/assistant` currently performs NO session check (`:1-10`) — it is a public page
    labelled private. Bring it under the task-19 guard and convert the placeholder into the
    signed-in tools dashboard shell that Phases 4/6/7 will populate: Resume Lab, Content Studio,
    Market Signals. Navigation only; no feature logic here.
  - Acceptance: unauthenticated request redirects; authenticated request renders the dashboard;
    unique `description` passed to `BaseLayout`; noindex retained.
  - QA:
    - Happy: authenticated fetch returns 200 with all three tool links; unauthenticated returns
      a redirect. Save both to `.omo/evidence/20-assistant.txt`.
    - Failure: assert an unauthenticated response body contains NO tool links (no shell leakage).
  - Commit: `fix: require authentication on /assistant and add tools dashboard`

- [ ] 21. Collapse roles to a single owner
  - Files: `src/lib/auth.ts`, `lib/env.ts`, `.env.example`, `src/pages/admin/index.astro`,
    `src/pages/admin/content.astro`, `src/actions/index.ts`, `tests/auth.test.ts`, `README.md`
  - Do: per owner decision, only the owner's login is permitted. Remove the `editor` role and
    `EDITOR_GITHUB_LOGINS` entirely (`lib/env.ts:22-25`, `src/lib/auth.ts:11-40`). `SessionRole`
    becomes a single `owner`. Remove editor-specific UI branches. Rename `requireAdmin` to
    `requireOwner`. Add a startup validation warning if `ADMIN_GITHUB_LOGINS` contains more
    than one entry.
  - Acceptance: no `editor` references remain; a non-owner login is rejected at callback; all
    13 actions require owner; task 4 and 7 tests updated and passing.
  - QA:
    - Happy: `npm run check` exits 0; `grep -rn "EDITOR_GITHUB_LOGINS\|'editor'\|\"editor\"" src/ lib/ .env.example` returns zero.
    - Failure: simulate a callback for a login not in the allowlist; assert no session cookie is
      set and the redirect carries an error.
  - Commit: `refactor: single owner role, drop editor allowlist`

- [ ] 22. Add expiry to resume tokens and retention to stored JD text
  - Files: `db/drizzle/schema.ts`, `lib/resume-store.ts`, `src/pages/api/jd/analyze.ts`,
    `src/pages/resume.astro`, `src/pages/api/resume/pdf.ts`, `tests/resume-store.test.ts`
  - Do: resume variant tokens are currently unauthenticated AND never expire, so a resume
    tailored to a named employer stays live forever. Add `expires_at` (default now + 90 days)
    and filter it in `getResumeVariantByToken`. Expired token -> treated as not-found, falling
    back to the focus-based variant (never a hard error). Add `expires_at` to `jd_requests`
    (default now + 180 days) since it stores full raw JD text. Add a purge routine callable by
    the Phase 8 scheduled job.
  - Acceptance: expired tokens do not resolve; unexpired do; purge deletes only expired rows;
    the fallback path is graceful.
  - QA:
    - Happy: insert one expired and one live variant; assert only the live one resolves and the
      expired one renders the focus fallback. Exit 0.
    - Failure: run purge with only live rows present; assert zero rows deleted.
  - Commit: `feat: expire resume variant tokens and stored job description text`

- [ ] 23. Fix the robots.txt AI-crawler override
  - Files: `src/pages/robots.txt.ts`, `tests/robots.test.ts`
  - Do: named AI-crawler groups currently receive `Allow: /` (`:7-18,36-40`), which in
    group-scoped robots semantics OVERRIDES the wildcard disallow of `/admin`, `/assistant`,
    `/api` for those bots. Repeat the private-path `Disallow` lines inside every named group so
    the intent holds per-group. Keep public content allowed for AI crawlers.
  - Acceptance: every user-agent group disallows all three private paths; public paths stay allowed.
  - QA:
    - Happy: extend `tests/robots.test.ts` to iterate EVERY emitted group and assert all three
      Disallow lines present in each; exits 0.
    - Failure: remove one Disallow from one group; confirm the test fails; restore.
  - Commit: `fix: disallow private paths for named AI crawler groups`

### Phase 4 — Finish the resume engine

- [ ] 24. Move hardcoded focus presets into content
  - Files: `db/drizzle/schema.ts`, `content/portfolio.ts`, `lib/portfolio-types.ts`,
    `src/pages/resume.astro`, `lib/portfolio-content.ts`, `src/components/admin/ContentManager.tsx`
  - Do: the three preset groups are hardcoded at `src/pages/resume.astro:71-87` — the same
    CMS-bypass pattern review finding #8 marked Fixed. Add a `focus_preset` table (id, label,
    description, focusIds, sortOrder), include it in the snapshot, load it in `resume.astro`,
    and expose CRUD in ContentManager. Seed with the current three values verbatim so rendering
    is unchanged.
  - Acceptance: `/resume` renders identical presets from content; editing a preset in admin
    changes the page after publish; no hardcoded preset array remains.
  - QA:
    - Happy: snapshot the rendered preset markup before and after; assert byte-identical.
      Save to `.omo/evidence/24-presets.txt`.
    - Failure: `grep -n "focusPresetGroups" src/pages/resume.astro` returns zero.
  - Commit: `refactor: drive resume focus presets from content`

- [ ] 25. Add a deterministic JD gap report
  - Files: `lib/jd.ts`, `lib/portfolio-types.ts`, `src/components/admin/ResumeLab.tsx`,
    `src/pages/api/jd/analyze.ts`, `tests/jd.test.ts`
  - Do: highest-value non-LLM feature currently missing. Extend `JobDescriptionAnalysis` with
    `gaps`: JD terms that scored as significant but matched NO skill or focus alias. Derive from
    the existing section-weighted tokenizer — no new dependency, no LLM. Classify each gap as
    `unmatched` (absent from taxonomy entirely) or `weak` (alias exists but low weight). Surface
    in ResumeLab as "keywords this JD wants that your content does not cover", with the source
    section for each.
  - Acceptance: gaps computed deterministically; identical input yields identical output; a JD
    fully covered by the taxonomy yields an empty list.
  - QA:
    - Happy: fixture JD containing a term absent from the taxonomy (e.g. `Rust`) yields it as
      `unmatched`; a fully-covered JD yields `[]`. Exits 0.
    - Failure: run the same JD twice, assert byte-identical output (determinism guard).
  - Commit: `feat: deterministic job description coverage gap report`

- [ ] 26. Add ATS-safe DOCX export
  - Files: `package.json`, `src/pages/api/resume/docx.ts` (new),
    `src/components/resume/AtsResumeDocx.ts` (new), `src/pages/resume.astro`,
    `tests/api-resume-docx.test.ts` (new)
  - Do: research is clear that DOCX is the safer format when an employer accepts it. Add the
    `docx` npm package (pure JS, no headless browser — keeps the bundle under the 250MB limit).
    Mirror `AtsResumeDocument` section-for-section: single column, no tables, no text boxes, no
    header/footer content, one standard embedded font. Accept the same `focus` and `variant`
    params with identical precedence. Offer DOCX alongside PDF on `/resume`.
  - Acceptance: DOCX downloads with correct filename and MIME type; section order matches the
    PDF exactly; same variant/focus precedence; no headless browser dependency added.
  - QA:
    - Happy: generate a DOCX, unzip `word/document.xml`, assert it contains every section
      heading in order and zero `<w:tbl>` elements. Save to `.omo/evidence/26-docx.txt`.
    - Failure: assert `package.json` contains no `puppeteer`/`playwright`, and the built function
      bundle stays under 250MB.
  - Commit: `feat: ATS-safe DOCX resume export`

- [ ] 27. Add an optional provider-agnostic LLM adapter
  - Files: `lib/llm/index.ts` (new), `lib/llm/providers/gemini.ts` (new),
    `lib/llm/providers/groq.ts` (new), `lib/env.ts`, `.env.example`, `tests/llm.test.ts` (new)
  - Do: a thin adapter with ONE interface: `complete({system, prompt, maxTokens})`. Gemini
    default, Groq fallback (research ranks these most durable; GitHub Models was retired
    2026-07-30). Every call gets `AbortSignal.timeout`. `isLlmConfigured()` returns false when
    no key is set, and EVERY caller must degrade gracefully. Add strict per-day and per-request
    call caps so a free tier cannot be blown. NEVER import this from a public route — enforced
    by task 41's lint rule.
  - Acceptance: adapter works with a key; `isLlmConfigured()` false and all callers degrade
    without one; timeouts and caps enforced; provider swappable via env.
  - QA:
    - Happy: with a mocked provider, `complete()` returns text; with all keys unset,
      `isLlmConfigured()` is false and `complete()` throws a typed `LlmUnavailable` error callers
      handle. Exits 0.
    - Failure: mock a hanging provider; assert the timeout fires and the error is typed, not a
      crash. Assert exceeding the daily cap returns `LlmQuotaExceeded`.
  - Commit: `feat: optional provider-agnostic llm adapter with quota caps`

- [ ] 28. Add LLM bullet rephrasing behind explicit owner diff-approval
  - Files: `src/pages/api/resume/rephrase.ts` (new), `src/components/admin/ResumeLab.tsx`,
    `lib/llm/prompts/bullet-rephrase.ts` (new), `tests/api-resume-rephrase.test.ts` (new)
  - Do: owner-only endpoint. Input: an EXISTING approved bullet plus the JD analysis. Output:
    rephrasings that mirror the JD's vocabulary. The prompt hard-constrains: rephrase only,
    introduce NO new metric, employer, date, technology, or claim. Post-validate every candidate
    — reject any containing a number not present in the source bullet, and reject any introducing
    a skill alias absent from the source. ResumeLab shows a side-by-side ORIGINAL vs PROPOSED
    diff; nothing is used until the owner clicks accept. Accepted text applies to THAT variant
    only and is never auto-written to site content.
  - Acceptance: endpoint is owner-only; candidates violating the no-new-facts rule are rejected
    server-side; nothing persists without explicit acceptance; feature hidden when LLM unconfigured.
  - QA:
    - Happy: mocked provider returns a clean rephrasing; assert it surfaces as a proposal and the
      stored variant is UNCHANGED until acceptance. Exits 0.
    - Failure: mocked provider returns a bullet containing an invented metric (`"reduced cost by
40%"` where the source has no number); assert the validator REJECTS it and it never reaches
      the UI. This guards the "never invent facts" non-negotiable.
  - Commit: `feat: llm bullet rephrasing with no-new-facts validation and diff approval`

### Phase 5 — Dual-source blog

- [ ] 29. Add a local Markdown/MDX content collection
  - Files: `astro.config.mjs`, `src/content.config.ts` (new), `src/content/blog/` (new),
    `package.json`, `tests/blog-collection.test.ts` (new)
  - Do: add `@astrojs/mdx`. Define a `blog` collection with a Zod schema: `title`, `description`,
    `publishedAt`, `updatedAt?`, `tags[]`, `draft` (default true), `canonicalUrl?`. Add one real
    seed post. Drafts MUST be excluded from every public surface. `canonicalUrl` exists so a post
    cross-published to Wix can point at the Wix canonical, preventing duplicate-content penalties.
  - Acceptance: collection type-checks; drafts excluded from listings; a published post renders
    with full code blocks and images.
  - QA:
    - Happy: seed post renders with a fenced code block producing highlighted `<pre><code>`;
      exits 0.
    - Failure: a `draft: true` post is absent from the collection query, RSS, and sitemap.
  - Commit: `feat: local markdown blog collection with draft support`

- [ ] 30. Merge Wix and Markdown into one unified blog index
  - Files: `src/pages/blog/index.astro`, `lib/blog.ts` (new), `tests/blog-merge.test.ts` (new)
  - Do: create `lib/blog.ts` exposing a normalized `BlogPost` union over both sources, each
    tagged with `source: "wix" | "local"`. Merge, dedupe by slug (local wins on collision),
    sort by published date descending. `/blog` renders the merged list. Wix failure MUST degrade
    to local-only, never 500 — preserve the existing graceful degradation.
  - Acceptance: both sources appear in one date-sorted list; slug collisions resolve to local;
    Wix outage still renders local posts.
  - QA:
    - Happy: fixtures from both sources produce one correctly ordered list; exits 0.
    - Failure: mock Wix returning `status: "error"`; assert the page still renders local posts
      with HTTP 200.
  - Commit: `feat: unified blog index across wix and local markdown`

- [ ] 31. Render Wix posts as rich content instead of flattened text
  - Files: `src/lib/wix.ts`, `src/pages/blog/[slug].astro`, `tests/wix.test.ts`
  - Do: current code requests `CONTENT_TEXT` and splits on blank lines into `<p>`
    (`wix.ts:176-185`, `[slug].astro:200-216`), destroying code blocks, images, links, headings,
    and lists. Request Wix's rich-content fieldset instead and write an explicit node-type
    converter (paragraph, heading, list, code, image, link, quote) emitting sanitized HTML.
    Unknown node types fall back to text — never dropped silently. Keep the 8s timeout and all
    existing status handling.
  - Acceptance: code blocks, images, headings, lists, and links survive; unknown nodes degrade to
    text; existing Wix tests still pass.
  - QA:
    - Happy: rich-content fixture containing a code block, image, and link renders `<pre><code>`,
      `<img>`, and `<a>`. Save to `.omo/evidence/31-wix-render.txt`.
    - Failure: fixture with an unrecognized node type renders its text and logs a warning; no
      crash, no silent drop. Assert output is HTML-escaped against injection.
  - Commit: `fix: render wix rich content instead of flattened paragraphs`

- [ ] 32. Include both sources in RSS, sitemap, and llms.txt
  - Files: `src/pages/rss.xml.ts`, `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts`,
    `tests/rss.test.ts` (new), `tests/sitemap.test.ts`, `tests/llms.test.ts`
  - Do: all three currently see only Wix. Feed them from `lib/blog.ts`. Sitemap `lastmod` uses
    `updatedAt ?? publishedAt`. Posts with a `canonicalUrl` emit that as the RSS guid/link so
    cross-published content does not compete with itself. Exclude drafts everywhere. Add
    `tests/rss.test.ts` — RSS has no test file today.
  - Acceptance: all three surfaces list both sources; drafts absent; canonical URLs honored;
    sitemap lastmod correct.
  - QA:
    - Happy: assert a local and a Wix post both appear in RSS and sitemap; XML is well-formed.
      Save to `.omo/evidence/32-feeds.txt`.
    - Failure: assert a draft post appears in NONE of the three outputs.
  - Commit: `feat: include local and wix posts in rss, sitemap, and llms.txt`

- [ ] 33. Add blog pagination
  - Files: `src/pages/blog/index.astro`, `src/pages/blog/[...page].astro` (new),
    `lib/blog.ts`, `tests/blog-pagination.test.ts` (new)
  - Do: Wix is capped at 20 posts per query (`wix.ts:121-128`) and there is no pagination at all.
    Page the merged list at 12 per page with prev/next links and `rel="prev"/"next"`. Page 1 stays
    at `/blog` (no redirect, no duplicate-content split). Fetch all available Wix pages rather
    than a single capped request.
  - Acceptance: >12 posts paginate correctly; `/blog` remains page 1; pagination links are
    crawlable anchors, not JS-only.
  - QA:
    - Happy: 25 fixture posts produce 3 pages with correct boundaries and links; exits 0.
    - Failure: with 5 posts, no pagination controls render and `/blog/2` returns 404.
  - Commit: `feat: paginate the merged blog index`

### Phase 6 — Content studio (two-step authoring)

- [ ] 34. Build the topic recommendation engine
  - Files: `src/pages/assistant/studio.astro` (new), `lib/studio/topics.ts` (new),
    `src/pages/api/studio/topics.ts` (new), `tests/studio-topics.test.ts` (new)
  - Do: step one of the owner's two-step flow. Owner-only. Generate ranked topic suggestions from
    THREE deterministic inputs — the owner's focus/skill taxonomy, aggregated JD demand signals
    (Phase 7 data), and gaps between existing published posts and those signals. Each suggestion
    carries: working title, target keywords, why it is high-visibility (citing the signal that
    produced it), and suggested angle. LLM optionally ENRICHES phrasing; the ranking itself stays
    deterministic so the feature works with no LLM configured.
  - Acceptance: suggestions render ranked with rationale; each cites its driving signal; works
    with LLM unconfigured (deterministic-only mode); owner-only.
  - QA:
    - Happy: with fixture JD signals and posts, assert suggestions are ranked, deduped against
      already-published topics, and each has a non-empty rationale. Exits 0.
    - Failure: with LLM unconfigured, assert suggestions still generate and the UI shows a clear
      "AI enrichment unavailable" state rather than an error.
  - Commit: `feat: deterministic blog topic recommendation engine`

- [ ] 35. Build AI drafting with owner review and publish
  - Files: `src/pages/assistant/studio.astro`, `src/pages/api/studio/draft.ts` (new),
    `lib/studio/draft.ts` (new), `lib/llm/prompts/blog-draft.ts` (new),
    `tests/studio-draft.test.ts` (new)
  - Do: step two. Owner picks a topic and supplies their OWN inputs (notes, bullet points, facts,
    links). The LLM drafts a post structured to best practices — clear H2/H3 hierarchy, intro
    stating the problem, concrete examples, conclusion, meta description, tag suggestions. The
    prompt hard-constrains the model to the owner's supplied inputs; it must NOT introduce facts,
    metrics, or claims of its own. Output is written as a Markdown file with `draft: true` into
    `src/content/blog/` via the existing GitHub backup mechanism. Owner reviews the rendered
    preview, edits, and flips `draft: false` to publish. NOTHING auto-publishes. NOTHING is
    pushed to Wix.
  - Acceptance: draft lands as `draft: true` markdown; never auto-published; never reaches Wix;
    feature hidden when LLM unconfigured; owner-only.
  - QA:
    - Happy: mocked provider produces a draft; assert the file is created with `draft: true`,
      valid frontmatter matching the task-29 schema, and it is absent from `/blog`. Exits 0.
    - Failure: assert no code path can set `draft: false` automatically —
      `grep -rn "draft: false" src/pages/api/ lib/studio/` returns zero. Assert no Wix write
      call exists in the studio path.
  - Commit: `feat: ai-assisted blog drafting with mandatory owner review`

### Phase 7 — Private market intelligence + public showcase

- [ ] 36. Turn accumulated JD data into market signals
  - Files: `lib/intelligence/signals.ts` (new), `src/pages/assistant/signals.astro` (new),
    `src/pages/api/intelligence/signals.ts` (new), `tests/intelligence-signals.test.ts` (new)
  - Do: `jd_requests` is currently write-only dead data. Aggregate it into signals: most-demanded
    skills across submitted JDs, trend over time, terms recurring in `gaps` from task 25 (what the
    market wants that the owner's content does not cover), and concrete recommended portfolio
    updates (skills to add, aliases to extend, projects to reweight). Aggregation is fully
    deterministic. Owner-only. Respect the task-22 retention window — expired rows are excluded.
  - Acceptance: signals compute from stored JDs; recommendations are actionable and cite the JD
    count behind each; deterministic; excludes expired rows.
  - QA:
    - Happy: fixture set of 10 JDs produces a ranked demand list and at least one taxonomy gap
      recommendation. Save to `.omo/evidence/36-signals.txt`.
    - Failure: with zero stored JDs, the page renders a clear empty state and does not error or
      divide by zero.
  - Commit: `feat: market demand signals from accumulated job descriptions`

- [ ] 37. Publish a pre-computed public market-signals showcase
  - Files: `src/pages/api/intelligence/publish.ts` (new), `src/pages/market-signals.astro` (new),
    `lib/intelligence/publish.ts` (new), `src/pages/sitemap.xml.ts`,
    `tests/market-signals-public.test.ts` (new)
  - Do: the public demonstration of meaningful AI use, built to the architectural spine. The owner
    triggers a private publish action that snapshots the current signals into an owner-approved
    artifact. The PUBLIC page renders ONLY that stored artifact — it never calls an LLM, never
    reads raw JDs, and never exposes any employer name, JD text, or company identifier. Aggregate
    counts and skill terms only. Standard `s-maxage` caching, unique `description`, added to the
    sitemap.
  - Acceptance: public page renders from the stored artifact with zero LLM calls at request time;
    no raw JD text or employer name is reachable; page works with all AI keys unset; owner-approved
    publish only.
  - QA:
    - Happy: publish an artifact, fetch the public page unauthenticated with all AI env vars
      UNSET, assert 200 and correct content plus cache header. Save to
      `.omo/evidence/37-public-signals.txt`.
    - Failure: assert the public route imports nothing from `lib/llm/` and nothing from the raw
      `jd_requests` query path. Assert that with no published artifact the page renders an empty
      state, not an error. Assert no employer string from the fixture JDs appears in the response body.
  - Commit: `feat: pre-computed public market signals showcase`

### Phase 8 — De-bloat and automate

- [ ] 38. Delete `legacy-next/` and add deployment excludes
  - Files: `legacy-next/` (delete), `.vercelignore` (new), `tsconfig.json`, `.eslintrc.cjs`,
    `README.md`, `AGENTS.md`
  - Do: 208KB / 43 files, including a duplicate `AtsResumeDocument`. Verified: no active-app
    import references it. Task 1's backup branches preserve it permanently, so deletion is safe.
    Delete the directory, add `.vercelignore` (which does not exist today) excluding `docs/`,
    `tests/`, `.omo/`, and `scripts/`. Remove the now-dead `legacy-next` exclusions from tsconfig
    and eslint. Update README and AGENTS.md.
  - Acceptance: directory gone; no references remain; `.vercelignore` present; `npm run check` passes.
  - QA:
    - Happy: `grep -rn "legacy-next" . --exclude-dir=.git --exclude-dir=node_modules` returns zero.
      `npm run check` exits 0.
    - Failure: `git show backup/pre-platform-v2-head:legacy-next/package.json` still resolves,
      proving the backup is intact.
  - Commit: `chore: remove quarantined legacy next app and add vercelignore`

- [ ] 39. Split `ContentManager.tsx`
  - Files: `src/components/admin/ContentManager.tsx`, `src/components/admin/content/*` (new)
  - Do: 1,132 lines in one file. Split by entity into `ProfileEditor`, `SkillsEditor`,
    `ProjectsEditor`, `ExperienceEditor`, `MediaEditor`, `RevisionsPanel`, plus shared form
    primitives. `ContentManager` becomes composition and shared state only. Target: no file over
    300 lines. This is a PURE refactor — zero behavior change.
  - Acceptance: no file exceeds 300 lines; every admin capability behaves identically; typecheck
    and lint pass.
  - QA:
    - Happy: `find src/components/admin -name '*.tsx' | xargs wc -l | sort -rn | head -5` shows
      max under 300. `npm run check` exits 0.
    - Failure: exercise each editor against a scratch database; assert every action from task 7's
      enumeration still succeeds — proving the refactor changed nothing.
  - Commit: `refactor: split content manager into per-entity editors`

- [ ] 40. Add CI and scheduled maintenance workflows
  - Files: `.github/workflows/ci.yml` (new), `.github/workflows/maintenance.yml` (new)
  - Do: `.github/workflows/` is EMPTY — quality gates run only via local git hooks today.
    `ci.yml`: on push and PR, Node 24, `npm ci`, `npm run check`, upload coverage. `maintenance.yml`:
    scheduled daily to run the task-22 purge of expired resume variants and JD rows, and refresh
    task-36 signals. Use GitHub Actions rather than Vercel Cron because Hobby cron is limited to
    once-daily with ±59min precision and Actions gives finer control at no cost. Secrets referenced,
    never inlined.
  - Acceptance: CI runs on push and fails on a broken build; maintenance workflow is scheduled and
    manually dispatchable; no secret values in the repo.
  - QA:
    - Happy: push a branch; assert the CI run completes green. Save the run URL to
      `.omo/evidence/40-ci.txt`.
    - Failure: push a deliberately failing test on a scratch branch; assert CI goes red; revert.
  - Commit: `ci: add build gate and scheduled maintenance workflows`

- [ ] 41. Add an architecture guard rule and update the docs
  - Files: `.eslintrc.cjs`, `AGENTS.md`, `README.md`, `docs/infra.md`, `docs/site-review.md`
  - Do: add a `no-restricted-imports` rule forbidding any import from `lib/llm/` inside public
    route files, mechanically enforcing the architectural spine so a future change cannot violate
    it silently. Rewrite the AGENTS.md "Current Architecture" section for the post-migration
    reality: Neon + Drizzle single database, dual-source blog, owner-only auth, private LLM
    surfaces. Update `docs/infra.md` for the new env var set. Add a `docs/site-review.md` entry
    resolving findings #13 (now transactional, task 14) and noting the corrected test count.
  - Acceptance: lint rule fires on a violating import; all docs match the shipped architecture;
    no stale references to Astro DB, `pg`, or editor roles.
  - QA:
    - Happy: add a temporary `import { complete } from "@/lib/llm"` to a public page; assert
      `npm run lint` fails; remove it and assert lint passes.
    - Failure: `grep -rn "astro:db\|@astrojs/db\|EDITOR_GITHUB_LOGINS\|ASTRO_DB_REMOTE_URL" *.md docs/`
      returns zero.
  - Commit: `docs: update architecture docs and enforce the private-llm boundary`

---

## Final verification wave

- [ ] F1. Full gate passes clean
  - Run `npm run check` (lint + typecheck + tests + build) plus `npm run test:coverage`.
  - Acceptance: exit 0; coverage at or above the task-2 baseline for every threshold; zero lint
    warnings. Save to `.omo/evidence/F1-check.txt`.

- [ ] F2. Zero-configuration public site still works
  - Start the built site with `DATABASE_URL`, `WIX_API_KEY`, all `GITHUB_*`, and all AI keys UNSET.
  - Acceptance: `/`, `/projects`, `/resume`, `/blog`, `/market-signals`, `/rss.xml`,
    `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/404` all return 200 (404 returns 404) and render
    from the bundled fallback. No 500s anywhere. This proves the "public features work with no LLM
    and no provider configured" non-negotiable. Save to `.omo/evidence/F2-zero-config.txt`.

- [ ] F3. Private surfaces are actually private
  - Unauthenticated: assert `/admin`, `/admin/content`, `/assistant`, `/assistant/studio`,
    `/assistant/signals` all redirect or 401 and leak no tool markup. Assert `/api/jd/analyze`,
    `/api/studio/*`, `/api/intelligence/*`, `/api/resume/rephrase` all return 401.
  - Acceptance: every private route blocked; no private content in any response body.
    Save to `.omo/evidence/F3-private.txt`.

- [ ] F4. Resume pipeline works end-to-end and stays ATS-safe
  - Authenticated: paste a JD, generate a variant, confirm the gap report renders, download both
    PDF and DOCX.
  - Acceptance: PDF text layer extracts in correct reading order (headings, dates, employers,
    bullets); DOCX contains zero `<w:tbl>`; both single-column with one standard font; the
    variant token resolves and respects expiry. Save extracted text to
    `.omo/evidence/F4-ats-extraction.txt`.

- [ ] F5. Cost and bloat posture verified
  - Acceptance: exactly ONE Vercel serverless function in `.vercel/output/functions`; bundle under
    250MB; zero references to `@astrojs/db`, `pg`, `legacy-next`, `project_fragments`, or
    `EDITOR_GITHUB_LOGINS`; exactly ONE database in the env surface; no paid service added; no
    headless browser dependency. Save to `.omo/evidence/F5-bloat.txt`.

---

## Rollback

Task 1 creates `backup/pre-platform-v2-head`, `backup/pre-platform-v2-main`, and the
`pre-platform-v2` tag on origin. To restore the live site at any point:
`git checkout main && git reset --hard pre-platform-v2 && git push --force-with-lease origin main`.
The Neon migration in task 12 is additive and refuses to overwrite non-empty tables without
`--force`, so the pre-existing Astro DB content remains untouched until task 16 removes the
integration.
