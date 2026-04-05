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
