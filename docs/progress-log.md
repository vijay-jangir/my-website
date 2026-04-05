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

### Failure Log

- Hit an Astro/Tailwind integration incompatibility while trying `@astrojs/tailwind` with Astro 6.
  Resolution: switched to the current Tailwind Vite plugin path.
- Hit a Node runtime mismatch because Astro 6 requires Node 22.12+ and the machine was still using Node 20.
  Resolution: installed `node@22`, pinned `.nvmrc`, and ran the toolchain under Node 22.
- Hit a JD parser ranking miss where an AI-focused title was not surfacing `ai` strongly enough.
  Resolution: added a failing unit test first, then increased title-section weighting in the deterministic focus scoring.
- Hit local Vercel build validation blockers.
  Resolution: confirmed the app-side build is valid and logged the actual environment blockers below.

### Verification

- `npm run lint` passed under Node 22.
- `npm run typecheck` passed under Node 22.
- `npm run test:run` passed under Node 22.
- `npm run build` passed under Node 22 with the Astro Vercel adapter.
- `npm run check` passed under Node 22.

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
