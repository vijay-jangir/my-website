# Plan: SEO / AEO / GEO technical wave

## Context

vijayjangir.com is an Astro 6 SSR portfolio on Vercel. A prior hardening wave
(docs/site-review.md #10, #11) already shipped: apex canonical host, sitemap with
blog lastmod, robots.txt, llms.txt generated from profile data, RSS, favicon
links, Article/Breadcrumb/CreativeWork JSON-LD on detail pages, og/twitter tags,
and X-Robots-Tag noindex on private routes (verified wired in admin/index,
admin/content, assistant/index).

The versioned strategy doc (docs/seo-aeo-geo-strategy.md) is the SPEC for this
wave. Its Phase-1 gap list predates the hardening wave and is stale; this plan
treats CURRENT CODE AS BASELINE and closes what measurably remains:

1. robots.txt has no explicit AI-crawler policy (GEO lever; strategy doc lists
   llms.txt/AI surfaces as in-scope, "safe to decide").
2. Structured data is inconsistent: home has no ProfilePage/WebSite markup,
   /projects has no ItemList, /resume has no BreadcrumbList, the Person JSON-LD
   carries a dead `"worksFor": undefined` key, and BreadcrumbList objects are
   duplicated inline in projects/[slug].astro and blog/[slug].astro.
3. Blog posts declare `og:type=article` without `article:published_time` /
   `article:modified_time` metas, and Article JSON-LD lacks an image.
4. llms.txt omits the case-study URLs (the strongest citable evidence) and any
   freshness line.

Deferred deliberately (recorded, not planned): dynamic per-route OG images
(needs a new dependency — strategy doc requires explicit approval for deps),
homepage client-island de-JS for CWV (perf wave of its own), FAQ/question-shaped
copy rewrites (content pass touching owner facts).

## Spec

docs/seo-aeo-geo-strategy.md — decision boundaries apply: metadata, robots.txt,
llms.txt, structured data are safe to decide; no paid infrastructure; no new
dependencies when Astro-native suffices; no misleading schema or fake freshness.

## Global Constraints

- Apex host `https://vijayjangir.com` stays canonical everywhere (astro.config
  `site` is the source of absolute URLs; fallback constant is the same apex).
- No new npm dependencies. Astro-native code only.
- Never invent facts, metrics, or freshness signals. Every emitted value must
  restate data that already exists in `content/portfolio.ts`, the live snapshot,
  or the Wix post payload.
- Public endpoints keep current caching/prerender behavior exactly:
  robots.txt.ts and llms.txt.ts stay `prerender = true`; sitemap/rss stay
  server-rendered with their existing Cache-Control headers.
- Private routes (/admin, /assistant, /api) remain out of the sitemap and
  disallowed in robots.txt.
- Validation gate: `npm run check` (lint + typecheck + tests + build) green
  before committing; pre-commit hooks run lint-staged + vitest.
- Node 24 local shell: `export PATH="/opt/homebrew/opt/node@24/bin:$PATH"`.

## Task 1: Explicit AI-crawler policy in robots.txt

File: `src/pages/robots.txt.ts`. Add unit tests following the existing vitest
style (see tests/sitemap.test.ts for conventions; create tests/robots.test.ts).

Requirements:

1. Keep `prerender = true` and the existing `User-agent: *` block exactly as it
   behaves today: `Allow: /`, then `Disallow:` for `/admin`, `/assistant`,
   `/api`, then the `Sitemap:` line built from `site`.
2. After the wildcard block, append explicit allow sections documenting the
   GEO stance for these user agents, one block each, in this order:
   `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`,
   `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`,
   `CCbot` is WRONG CASE — use `CCBot`. Each block is exactly:
   `User-agent: <NAME>` newline `Allow: /` newline blank line.
3. Precede everything with these comment lines at the top of the body:
   `# vijayjangir.com crawl policy`, `# Search and answer engines may crawl all
public paths.`, `# Private app surfaces are disallowed below.` Comments use
   leading `# `. The `Sitemap:` line stays last.
4. Export a pure builder `buildRobotsTxt(baseUrl: URL): string` from the module;
   the GET handler delegates to it (mirrors buildSitemapEntries/buildRssItems
   pattern). Tests import the builder: assert the wildcard block order, the
   presence of every named AI crawler section, that `/admin`, `/assistant`,
   `/api` appear as Disallow lines exactly once each, that the sitemap URL ends
   with `/sitemap.xml`, and that comments exist. No snapshot tests.

## Task 2: Shared JSON-LD builders + missing route-level schema

New file `src/lib/jsonld.ts` plus edits to `src/layouts/BaseLayout.astro`,
`src/pages/index.astro`, `src/pages/projects.astro`, `src/pages/resume.astro`,
`src/pages/projects/[slug].astro`, `src/pages/blog/[slug].astro`. Unit tests in
tests/jsonld.test.ts for the pure builders.

Requirements:

1. `buildPersonJsonLd(input: { siteProfile: SiteProfile; baseUrl: URL }): Record<string, unknown>`
   returns exactly the fields the current inline BaseLayout object emits
   (`@context`, `@type: "Person"`, description, email, image, jobTitle,
   knowsAbout, mainEntityOfPage, name, sameAs, url) MINUS the dead
   `"worksFor": undefined` key. Image resolution logic moves into the builder
   (profileImageUrl when present, else socialImagePath fallback passed via
   input — extend input with `fallbackImagePath: string`).
2. `buildProfilePageJsonLd(input)` returns `{ "@context", "@type":
"ProfilePage", mainEntity: <person object>, url: <home absolute> }`.
3. `buildWebsiteJsonLd(input)` returns `{ "@context", "@type": "WebSite", name:
siteProfile.name, url: home absolute }`.
4. `buildBreadcrumbJsonLd(input: { baseUrl: URL; items: { name: string; path?
: string }[] })` returns the same shape as the existing inline breadcrumb
   objects (Home position 1, then items in order; ListItem includes `item`
   absolute URL only when `path` is provided, else name-only trailing entry —
   match existing behavior: trailing current page HAS item+position).
5. `buildItemListJsonLd(input: { baseUrl: URL; name: string; items: { name:
string; path: string }[] })` returns `{ "@context", "@type": "ItemList",
name, itemListElement: [{ "@type": "ListItem", position: i+1, name, url }] }`.
6. BaseLayout.astro: replace the inline personJsonLd object with
   `buildPersonJsonLd` output. Nothing else changes in BaseLayout in this task.
7. index.astro (home): additionally emit ProfilePage and WebSite script tags
   using the builders (follow the existing `<script is:inline set:html ...>`
   pattern used in projects/[slug].astro).
8. projects.astro: emit ItemList over public projects (name = project.title,
   path = `/projects/${slug}`), list name "Public projects".
9. resume.astro: emit BreadcrumbList: Home `/`, Resume `/resume`.
10. projects/[slug].astro and blog/[slug].astro: replace their inline
    breadcrumb objects with `buildBreadcrumbJsonLd` calls producing identical
    output shapes (projects: Project index `/projects`, current title;
    blog: Blog `/blog`, current title when post exists).
11. No JSON-LD on 404/error states of dynamic pages beyond what exists today
    (blog/[slug] keeps emitting breadcrumbs even when post is null, as today).

## Task 3: Article metadata completeness for blog posts

Files: `src/layouts/BaseLayout.astro`, `src/pages/blog/[slug].astro`.

Requirements:

1. BaseLayout renders a new `<slot name="head" />` immediately before
   `<title>` inside `<head>` (order irrelevant to validity; place after the
   JSON-LD script tag, before `<title>{title}</title>`).
2. blog/[slug].astro passes `<Fragment slot="head">` containing, ONLY when
   `post` is truthy: `<meta property="article:published_time" content=...>`
   and `<meta property="article:modified_time" content=...>`. Values are ISO
   strings: `new Date(value).toISOString()` from `post.firstPublishedDate` and
   `post.lastPublishedDate ?? post.firstPublishedDate`; guard invalid dates
   (skip the tag rather than emit `Invalid Date`).
3. Add `image` to the existing articleJsonLd object: absolute URL of
   `/og-preview.jpg` resolved against `Astro.site ?? Astro.url`.
4. Evidence requirement beyond npm run check: start dev server, curl one real
   post URL (or a synthetic slug returning the fallback path — metas only
   render when post exists, so prefer a real Wix-backed slug if credentials
   exist locally; otherwise demonstrate against a stubbed fetch in a vitest
   test asserting the meta tags render). Paste the relevant HTML excerpt into
   the report file.

## Task 4: llms.txt enrichment

File: `src/pages/llms.txt.ts`. Unit tests in tests/llms.test.ts.

Requirements:

1. Extract a pure exported builder
   `buildLlmsTxt(input: { profile: SiteProfile; projects: readonly { title:
string; slug?: string; visibility: string; summary: string }[]; baseUrl:
URL }): string`; GET delegates, reading from `fallbackPortfolioSnapshot` as
   today.
2. Preserve every existing line and ordering of the current body.
3. After the existing `Citable facts:` bullet list, append:
   - blank line, then `Last updated: ${profile.lastUpdatedLabel}.`
   - blank line, then `Case studies:` followed by one line per PUBLIC project
     that has a slug: `- ${title}: ${clampedSummary} ${absoluteUrl}`
     where clampedSummary is `summary` clamped to at most 160 characters cut on
     a whitespace boundary with a single trailing `…` when truncation happened.
     Order follows the projects array order.
4. Tests: builder output contains the Last updated line, every public slugged
   project URL exactly once, no draft/unslugged entries, clamp behavior
   (<=161 chars incl. ellipsis, no partial words), and existing anchor lines
   (Canonical:, Projects:, Resume:, Blog:, RSS:) still present.
