# PRD: SEO + AEO + GEO roadmap implementation for vijayjangir.com

## Metadata

- Source strategy: `docs/seo-aeo-geo-strategy.md`
- Context docs: `docs/site-review.md`, `docs/implementation-plan.md`, `README.md`, `AGENTS.md`
- Planning mode: `$ralplan` (non-interactive)
- Repo context: Astro on Vercel, Wix remains blog source of truth, free-hosting compatible, static/cached first, no paid infra, no new dependencies without explicit request

## RALPLAN-DR summary

### Principles

1. Keep authority on `vijayjangir.com` without replacing Wix as the writing workflow.
2. Prefer native Astro/Vercel capabilities over new packages or infrastructure.
3. Improve discoverability with verifiable, honest signals rather than SEO theater.
4. Preserve graceful degradation when Wix credentials or content are unavailable.
5. Ship measurement hooks early so ranking claims are tied to baselines, not guesses.

### Decision drivers

1. **Free-hosting fit:** all work must stay compatible with Vercel Hobby and current repo constraints.
2. **Primary-domain authority:** blog and entity signals should accrue to `vijayjangir.com`, not only the Wix subdomain.
3. **Execution safety:** work must be deliverable incrementally with build/test verification and no speculative dependencies.

### Viable options

#### Option A — Technical SEO first, defer on-domain blog rendering

- **Pros:** smallest delivery risk; fast wins on metadata, crawler files, and structured data; minimal Wix API work.
- **Cons:** long-form authority still leaks to Wix; biggest SEO/GEO upside stays deferred; split reading experience remains.

#### Option B — Staged full roadmap: technical foundation first, then content pass, then local blog detail pages using Wix as CMS

- **Pros:** aligns with repo guidance; moves authority onto the primary domain; keeps authoring flow intact; supports SEO, AEO, and GEO together.
- **Cons:** requires additional Wix normalization/detail-route work; broader verification surface than Option A.

### Chosen option

**Option B**. It matches the documented product direction, keeps Wix as source of truth, and delivers the highest upside without violating hosting or dependency constraints.

## ADR

### Decision

Implement the roadmap in three execution waves: (1) technical SEO foundation, (2) public-content/AEO-GEO pass, and (3) on-domain Wix-backed blog detail pages, with measurement gates before and after changes.

### Drivers

- Current metadata foundation exists but lacks OG image, crawler files, structured data, homepage positioning metadata, and icon wiring.
- Current blog cards still send readers off-domain.
- Repo rules require free-hosting compatibility, no paid infra, and no unnecessary dependencies.

### Alternatives considered

- **Stop after technical SEO fixes.** Rejected because it leaves the largest authority gap unresolved.
- **Replace Wix or migrate content locally.** Rejected because it breaks the editing-flow constraint and expands scope.
- **Add a sitemap package immediately.** Rejected because repo guidance prefers no new dependencies without explicit approval when a native route is sufficient.

### Why chosen

This approach captures quick technical wins first, then improves content clarity, then resolves the domain-authority problem without changing CMS ownership or hosting shape.

### Consequences

- Requires a small Wix detail-route discovery/normalization step before local post pages.
- Introduces more files touched than a metadata-only pass.
- Demands stronger verification across metadata, routing, and graceful-fallback behavior.
- Keeps the blog-routing cutover gated on data-shape parity so the team does not ship brittle detail pages just to satisfy the roadmap.

### Follow-ups

- Record 5–15 target queries and baseline dates in `docs/seo-aeo-geo-strategy.md` before claiming ranking improvement.
- Add dated results to `docs/seo-audit-log.md` after launch and after the next 4–8 week review.

## Scope

### In scope

- Homepage metadata refinement
- Default OG/Twitter image support
- `robots.txt`, `llms.txt`, and dependency-free sitemap output
- Public `Person` JSON-LD with `sameAs`
- Favicon/app-icon head wiring
- Sharper public copy and internal linking for SEO/AEO/GEO
- Local `/blog/[slug]` rendering backed by Wix data while preserving `/blog`
- Graceful Wix fallback behavior
- Search Console / audit-log readiness

### Out of scope

- Replacing Wix
- Paid tooling or infrastructure
- Private `/admin` or `/assistant` feature work
- Broad visual redesign unrelated to discoverability and clarity
- Public AI/chat features

## Users and jobs-to-be-done

- **Recruiters / hiring managers:** quickly verify who Vijay is, what he does, and why the work is credible.
- **Search engines / answer engines:** extract accurate, structured, citable facts from the domain.
- **Readers of technical writing:** stay on `vijayjangir.com` instead of bouncing to a Wix subdomain.

## Execution phases and stories

### Phase 0 — Measurement + guardrails

**Goal:** lock the ranking/measurement frame before code changes.

Stories:

1. Record canonical host decision (WWW vs apex) in docs + deploy config notes.
2. Fill at least 5 target queries with baseline dates in `docs/seo-aeo-geo-strategy.md`.
3. Confirm public one-line positioning statement for homepage metadata/copy.

### Phase 1 — Technical SEO foundation

**Goal:** close the highest-impact technical gaps with native Astro/Vercel patterns.

Stories:

1. Add homepage-specific `title` and `description`.
2. Add default social preview image support (`og:image`, `twitter:image`) and the base asset in `public/`.
3. Wire favicon/app-icon links in `src/layouts/BaseLayout.astro` using existing assets.
4. Add `robots.txt` and `llms.txt`.
5. Implement dependency-free sitemap generation and exclude `/admin`, `/assistant`, `/api`.
6. Emit `Person` JSON-LD with public `sameAs` links.

### Phase 2 — Public-copy, AEO, and GEO pass

**Goal:** make core pages more extractable, credible, and internally connected.

Stories:

1. Tighten homepage headline/metadata to one clear role statement with proof.
2. Add extractable answer-style paragraphs and better heading hierarchy where natural.
3. Improve route-to-route internal linking among `/`, `/projects`, `/resume`, and `/blog`.
4. Remove weak/generic claims that dilute trust.

### Phase 3 — On-domain blog detail pages

**Goal:** keep Wix authoring, but move reading authority onto the main domain.

Stories:

1. Confirm the Wix detail payload/slug lookup shape and choose a cached Astro-compatible fetch path before changing routing.
2. Extend Wix data fetching to support slug/detail-page rendering without introducing paid infra or brittle scraping.
3. Add `src/pages/blog/[slug].astro` (or equivalent Astro dynamic route) with cached fetch behavior and graceful fallback.
4. Update blog cards and listing links to point to local detail pages only after one detail route reaches acceptable content parity.
5. Preserve outbound canonical/source references only where they add clarity, not as the primary CTA.
6. Keep empty/error states clean when Wix data is unavailable.

### Phase 4 — Validation and measurement loop

**Goal:** prove the changes work technically and create a repeatable measurement loop.

Stories:

1. Run lint, typecheck, tests, build, and Vercel build validation when auth/linking permits.
2. Submit or verify sitemap/coverage in Search Console.
3. Log first post-launch audit notes in `docs/seo-audit-log.md`.

## PRD-style acceptance criteria

### Product acceptance

- The homepage has a single, specific positioning line in metadata and visible copy.
- Shared layout outputs canonical, Open Graph, Twitter, favicon, and JSON-LD signals consistently.
- `robots.txt`, `llms.txt`, and sitemap output are publicly reachable and reflect intended crawl policy.
- `/blog` remains stable, and blog detail pages render on `vijayjangir.com` while Wix stays the source of truth.
- Missing Wix credentials or missing post data do not break the blog experience.
- Blog-card CTA changes happen only after the detail-page fetch path proves it can render a useful local page from Wix data.

### Quality acceptance

- No new paid infrastructure is introduced.
- No new dependency is added unless explicitly approved and documented.
- Public claims remain specific and verifiable.
- No admin/private surfaces are exposed to crawlers.

### Measurement acceptance

- `docs/seo-aeo-geo-strategy.md` contains at least 5 target queries with baseline dates.
- `docs/seo-audit-log.md` records a post-change audit entry.
- Search Console can discover the intended crawl/index assets after deployment.

## Verification steps

1. Static inspection of generated metadata/crawler assets.
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:run`
5. `npm run build`
6. `npm run vercel:build` when the local machine is authenticated and the project is linked.
7. Manual checks:
   - homepage metadata and OG image tags
   - `/robots.txt`
   - `/llms.txt`
   - sitemap URL
   - `/blog` listing and one local blog detail page
   - detail-page cache/fallback behavior
   - Wix-failure fallback state

## Available-agent-types roster

- `planner`
- `architect`
- `critic`
- `executor`
- `writer`
- `verifier`
- `test-engineer`
- `debugger`
- `explore`

## Recommended execution staffing

### If using `$ralph`

- **Owner:** `executor` (high reasoning)
- **Support loop:** `writer` for content copy adjustments, `verifier` for evidence collection, `test-engineer` if blog routing introduces regressions
- **Best for:** one-owner sequential delivery with verification after each phase

### If using `$team`

- **Lane 1:** `executor` — technical SEO foundation (`BaseLayout`, public assets/files, sitemap/robots/llms)
- **Lane 2:** `writer` or `executor` — homepage/blog copy, internal linking, AEO/GEO wording
- **Lane 3:** `executor` or `debugger` — Wix detail-route normalization + local blog pages
- **Lane 4:** `verifier` / `test-engineer` — commands, manual route checks, Search Console/audit-log checklist
- **Best for:** faster parallel delivery because metadata/crawler work, content work, and blog-route work are partially independent

## Launch hints

- **Ralph:** `$ralph .omx/plans/prd-seo-aeo-geo-roadmap.md`
- **Team:** `$team .omx/plans/prd-seo-aeo-geo-roadmap.md`

## Team verification path

1. Complete Phase 1 and verify metadata/crawler assets before Phase 3 begins.
2. Merge content/AEO changes only after homepage positioning is reviewed for clarity.
3. Verify Wix detail payload parity, local blog detail pages, and fallback states before changing blog-card CTAs.
4. Run full repo validation at the end and record results in docs.

## Consensus review outcome

- **Architect steelman antithesis:** stop after technical SEO and content clarity work until Wix detail-page data shape proves reliable; otherwise the plan risks shipping thin local blog pages that add complexity without enough authority gain.
- **Real tradeoff tension:** on-domain blog pages have the biggest SEO/GEO upside, but they also carry the highest adapter, caching, and fallback risk.
- **Synthesis applied:** keep the local-blog direction, but gate CTA cutover on detail-page parity and cached fetch behavior verification.
- **Critic verdict:** APPROVE after one revision.
