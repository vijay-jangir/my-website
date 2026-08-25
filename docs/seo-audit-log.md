# SEO / AEO / GEO audit log

Dated entries for periodic checks (Google Search Console, Lighthouse, manual review). Link or paste evidence in each entry when useful.

---

## Template (copy for new entries)

```markdown
### YYYY-MM-DD — Title

**Scope:** (e.g. full site, homepage only, post-launch meta)

**Checks:**

- GSC: …
- Lighthouse / PSI: …
- Manual: …

**Findings:**

- …

**Follow-ups:**

- …
```

---

### 2026-08-26 — Technical SEO/AEO/GEO wave (branch improve/seo-aeo-geo)

**Scope:** Crawl policy, structured data, blog article metadata, llms.txt.

**Checks:**

- Manual: full read of BaseLayout, robots/sitemap/rss/llms endpoints, blog and project detail pages, admin/assistant noindex wiring.
- Gates: `npm run check` green at each commit; 42/42 vitest tests including new robots/jsonld/llms suites.

**Findings:**

- robots.txt had no explicit AI-crawler stance → added per-agent allow sections (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot) plus policy comments; wildcard semantics unchanged.
- Structured data was inconsistent → home now emits ProfilePage + WebSite, /projects emits an ItemList of public case studies, /resume gained a BreadcrumbList, Person JSON-LD lost its dead `worksFor` key and is now anchored to the home URL via shared builders in `src/lib/jsonld.ts`; breadcrumb duplication across detail pages removed.
- Blog posts declared og:type=article without article metas → article:published_time / article:modified_time now emitted from Wix dates (invalid dates skipped); Article JSON-LD carries the default image.
- llms.txt omitted case-study URLs and freshness → now lists every public slugged case study with a clamped summary and a Last updated line.

**Follow-ups:**

- Dynamic per-route OG images deferred (needs dependency approval per strategy doc).
- Homepage client-island de-JS for CWV deferred to a dedicated perf wave (measure LCP first).
- Fill the target-query table in seo-aeo-geo-strategy.md after Search Console baseline before judging rankings.
- Resubmit sitemap + inspect enhanced-results eligibility in GSC after deploy.

---

### 2026-04-06 — Strategy persisted

**Scope:** Documentation only.

**Checks:** N/A (no audit run).

**Findings:**

- [seo-aeo-geo-strategy.md](./seo-aeo-geo-strategy.md) added as the canonical roadmap (SEO, AEO, GEO, phases, optional Cursor audit agent). No product code or `public/` assets were changed in this step.

**Follow-ups:**

- Fill target-query table in the strategy doc after GSC baseline.
- Implement technical items in Phase 1 when ready (see strategy doc).
