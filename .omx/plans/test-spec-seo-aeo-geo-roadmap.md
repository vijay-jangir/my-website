# Test Spec: SEO + AEO + GEO roadmap implementation

## Scope under test

Implementation work derived from `.omx/plans/prd-seo-aeo-geo-roadmap.md` and `docs/seo-aeo-geo-strategy.md`.

## Test strategy

Use a mix of static inspection, automated repo validation, and manual browser-level checks. Prioritize dependency-free technical SEO changes first, then route/content checks, then Wix fallback behavior.

## Test areas

### 1. Metadata and structured data

- Homepage sets explicit `title` and `description`.
- Shared layout includes:
  - canonical
  - `og:title`
  - `og:description`
  - `og:url`
  - `og:image`
  - `twitter:card`
  - `twitter:title`
  - `twitter:description`
  - `twitter:image`
  - favicon/app-icon links
- Public pages emit `Person` JSON-LD with expected `sameAs` values.

### 2. Crawl/index assets

- `/robots.txt` exists and disallows `/admin`, `/assistant`, `/api`.
- `/llms.txt` exists and accurately summarizes the site.
- Sitemap URL exists and excludes private/admin/API routes.
- Canonical host is consistent across generated URLs.

### 3. Content and internal linking

- Homepage headline and supporting copy match the chosen positioning statement.
- `/`, `/projects`, `/resume`, and `/blog` contain meaningful internal links.
- AEO-friendly answer paragraphs/headings do not introduce keyword stuffing or false claims.

### 4. Blog routing and Wix behavior

- `/blog` still renders when Wix data is present.
- Blog cards point to local detail pages only after the detail-page path is verified.
- At least one `/blog/[slug]` page renders expected content when data exists.
- Detail-page fetching uses the intended cached/revalidated path rather than an unbounded per-request fetch.
- Missing Wix credentials or fetch failures produce a stable empty/fallback state, not a server crash.
- Missing/unknown slug produces a clear not-found or fallback experience.

### 5. Regression and deployment safety

- Existing public routes still build and render.
- No admin/private/API routes are accidentally linked in sitemap or crawl files.
- No new dependency is introduced unless explicitly approved and documented.

## Commands

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:run`
4. `npm run build`
5. `npm run vercel:build` (when local auth/project linking is available)

## Manual verification checklist

- Inspect homepage `<head>` output.
- Open `/robots.txt`.
- Open `/llms.txt`.
- Open sitemap URL.
- Open `/blog`.
- Open one local blog detail page.
- Confirm the local detail page has enough body content/metadata parity to replace the outbound Wix CTA.
- Simulate or verify Wix-missing fallback behavior.
- Confirm favicon renders in browser tab.

## Acceptance gates

- All commands above pass.
- Manual checks pass for metadata, crawler files, and at least one local blog detail route.
- Blog fallback state remains graceful.
- No known crawl-policy mistakes remain.
- Search Console/audit-log follow-up tasks are documented even if external verification must happen post-deploy.

## Risks to watch

- Wix API may not expose all detail content in the same shape as the listing endpoint.
- Dynamic blog routes may need careful caching/fallback handling in Astro server mode.
- Metadata/canonical host changes can regress silently without head inspection.
- Search Console validation may require post-deploy confirmation outside the local shell.
- If Wix detail parity is weaker than expected, the plan should pause CTA cutover rather than ship thin local post pages.
