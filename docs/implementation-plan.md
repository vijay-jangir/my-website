# Astro Migration Plan

## Objective

Rebuild the portfolio as an extensible Astro application on Vercel while keeping:

- Wix as the current blog authoring system
- Neon Postgres as the free database layer
- OpenClaw off Vercel and behind a private future integration path
- public features working with no LLM, no paid AI provider, and no signup flow

## Delivery Rules

- Every failure found during implementation gets a unit test before the fix.
- Keep one authoritative source for public profile facts and focus weights.
- Avoid speculative infrastructure. Only add services with a clear use now or a low-cost future path.
- Keep Vercel deployment compatibility intact at every wave.

## Phase 0: Governance and Guardrails

### Wave 0.1

- Audit the current repo and dependency state.
- Confirm what public features exist and what logic is worth carrying into Astro.
- Write the migration plan, progress log, and authority index.

### Wave 0.2

- Add baseline quality gates:
  - lint
  - typecheck
  - unit tests
  - production build
- Add pre-commit and pre-push hooks.
- Document how Vercel deployment validation is performed before pushing.

### Exit Criteria

- Plan artifacts exist and are current.
- Local validation has one command.
- Hooks are active and documented.

## Phase 1: Astro Foundation

### Wave 1.1

- Replace Next.js runtime/build tooling with Astro.
- Add the Astro Vercel adapter and server output.
- Preserve React only where it is useful for interactive islands and PDF generation.
- Carry over Tailwind and shared TypeScript utilities.

### Wave 1.2

- Move the public app shell to Astro:
  - site layout
  - navigation
  - footer
  - metadata
  - global styles
- Keep a clean route structure under `src/pages`.

### Exit Criteria

- `astro dev` works locally.
- `astro build` succeeds.
- The site deploy target remains Vercel-compatible.

## Phase 2: Public Product Surfaces

### Wave 2.1

- Rebuild the homepage as a content-first Astro page.
- Rebuild `/resume` with deterministic focus switching.
- Rebuild `/work` with manager-facing filtering and search.

### Wave 2.2

- Rebuild `/blog` using the existing Wix API integration.
- Preserve graceful degradation when Wix credentials are missing.
- Keep direct-contact fallback alive even if email delivery is not configured.

### Exit Criteria

- Public routes render from Astro.
- Core recruiter and manager flows work without AI configuration.

## Phase 3: Private Surfaces and API Endpoints

### Wave 3.1

- Port deterministic JD analysis and resume variant generation to Astro endpoints.
- Keep database storage optional; feature should still work in fallback mode.

### Wave 3.2

- Add admin authentication with an allowlist model and no public signup.
- Gate private routes and future assistant routes from the start.

### Wave 3.3

- Port ATS-safe PDF generation into an Astro server endpoint.

### Exit Criteria

- `/admin` is protected when auth is configured.
- `/api/jd/analyze` and `/api/resume/pdf` work in Astro.
- No private tooling is exposed by default.

## Phase 4: Future-Ready Extensions

### Wave 4.1

- Reserve clean integration points for:
  - a private `/assistant` page
  - same-domain OpenRouter-compatible HTTP endpoints
  - homelab service subdomains

### Wave 4.2

- Keep vector-search schema and fragment indexing ready without making embeddings a launch dependency.
- Document how future OpenClaw and homelab surfaces fit the domain layout.

### Exit Criteria

- Future expansion paths are documented and do not require redoing the public app foundation.

## Deployment Gate

Before any push intended for deploy:

1. Run local validation.
2. Run a Vercel build validation if the repo is linked and the CLI is authenticated.
3. Record the result in the progress log.

## Out of Scope For This Migration

- Public AI chat
- Public OpenClaw control surfaces
- A custom scheduler replacing Calendly
- Automatic syncing from private employer systems
- A separate always-on Python backend
