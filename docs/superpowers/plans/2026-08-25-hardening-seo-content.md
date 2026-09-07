# Hardening, SEO & Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every issue from the 2026-08-25 deep review: dead code, uncached rendering, split-brain focus parsing, JD regex bug, silent failures, fake UI, missing SEO surfaces — plus add the enterprise text-to-SQL agent case study.

**Architecture:** Astro 6 SSR on Vercel with CDN-edge caching (`Cache-Control: s-maxage` + stale-while-revalidate) instead of build-time prerender, because admin publishes must become visible without a redeploy. Focus parsing becomes snapshot-aware. All silent `catch {}` paths gain warnings. Contact remains mailto-only; Resend/Turnstile/analytics deps are removed.

**Tech Stack:** Astro 6, @astrojs/db, @astrojs/vercel, React islands, Tailwind v4, vitest, arctic/jose auth (untouched).

**Spec:** Approved chat design 2026-08-25 (brainstorming session). Review findings in the conversation; repo docs refreshed in Task 9.

## Global Constraints

- Node `24.x`; run `export PATH="/opt/homebrew/opt/node@24/bin:$PATH"` before npm commands.
- Validation gates: `npm run lint && npm run typecheck && npm run test:run && npm run build` must pass before finishing (pre-commit runs lint-staged + `test:run`).
- Never invent facts, metrics, numbers, or claims in personal content; flag gaps to the owner instead.
- Keep deployment compatible with free Vercel Hobby; no new paid services; no new runtime dependencies.
- Keep Wix as blog source of truth; degrade cleanly when credentials are absent.
- Do not modify auth (`src/lib/auth.ts`), DB schema (`db/config.ts`), or admin actions contracts.
- Branch: `rebuild/hardening-seo-content`.

---

### Task 1: Branch + dead code and dependency removal

**Files:**

- Delete: `lib/auth.ts`, `lib/hooks.ts`, `lib/utils.ts`, `lib/types.ts`, `lib/data.ts`, `lib/turnstile.ts`
- Modify: `package.json` (remove deps), `package-lock.json` (via npm), `lib/env.ts`, `.env.example`, `README.md`

**Interfaces:**

- Produces: `lib/env.ts` exports shrink; nothing in active code imports removed modules (verified by grep in Step 1).

- [ ] **Step 1: Verify nothing active imports the doomed files**

Run: `grep -rn "lib/auth\"\|lib/hooks\|lib/utils\|lib/types\|lib/data\|lib/turnstile\|verifyTurnstileToken" src lib tests scripts db content --include="*.ts" --include="*.tsx" --include="*.astro"`
Expected: no matches outside the doomed files themselves (`lib/types.ts` imports `./data`; `lib/hooks.ts` imports `./types`). If any active file matches, STOP and reassess.

- [ ] **Step 2: Create branch and delete files**

```bash
git checkout -b rebuild/hardening-seo-content
git rm lib/auth.ts lib/hooks.ts lib/utils.ts lib/types.ts lib/data.ts lib/turnstile.ts
```

- [ ] **Step 3: Prune dependencies and env plumbing**

```bash
npm uninstall resend clsx @vercel/analytics @vercel/speed-insights
```

In `lib/env.ts`: delete lines for `resendApiKey`, `resendFrom`, `contactToEmail`, `turnstileSiteKey`, `turnstileSecretKey`, `cronSecret`, `openAiApiKey`, `openClawBaseUrl`, `openClawToken`, plus helpers `isTurnstileConfigured()` and `isEmailConfigured()`.
In `.env.example`: delete `TURNSTILE_*`, `CRON_SECRET`, `RESEND_*`, `CONTACT_TO_EMAIL`, `OPENAI_API_KEY`, `OPENCLAW_*` lines.
In `README.md`: delete "Optional extras" block listing those vars; adjust prose mentioning Resend/Turnstile/OpenClaw contact features.

- [ ] **Step 4: Validate**

Run: `npm run lint && npm run typecheck && npm run test:run`
Expected: all pass (tests must still pass — none of these were imported).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: remove dead modules, unused deps, and ghost env plumbing"
```

---

### Task 2: Content-aware focus parsing (TDD)

**Files:**

- Modify: `lib/portfolio.ts:40-49`
- Modify: `src/pages/resume.astro:14`, `src/pages/projects.astro:10`, `src/pages/api/resume/pdf.ts:14`, `lib/jd.ts:355`
- Test: `tests/portfolio.test.ts`

**Interfaces:**

- Produces: `parseFocusIdsInContent(content: Pick<PortfolioSnapshot,"focusDefinitions">, rawValue?: string | string[] | null): FocusId[]`. Legacy `parseFocusIds(rawValue)` kept as wrapper delegating to fallback snapshot (tests depend on it).

- [ ] **Step 1: Write failing tests**

Append to `tests/portfolio.test.ts`:

```ts
import { parseFocusIdsInContent } from "@/lib/portfolio";
import { fallbackPortfolioSnapshot } from "@/content/portfolio";

describe("content-aware focus parsing", () => {
  it("accepts focuses that exist in live content beyond the fallback set", () => {
    const content = {
      focusDefinitions: [
        ...fallbackPortfolioSnapshot.focusDefinitions,
        {
          id: "custom-focus",
          label: "Custom",
          shortLabel: "Custom",
          category: "domain",
          headline: "h",
          summary: "s",
          description: "d",
          aliases: [],
          relatedSkillIds: [],
        } as (typeof fallbackPortfolioSnapshot.focusDefinitions)[number],
      ],
    } as Parameters<typeof parseFocusIdsInContent>[0];

    expect(parseFocusIdsInContent(content, "ai,custom-focus,bogus")).toEqual([
      "ai",
      "custom-focus",
    ]);
  });

  it("dedupes, trims, and caps at three like the fallback parser", () => {
    expect(
      parseFocusIdsInContent(
        fallbackPortfolioSnapshot,
        " ai, ai,flink,kafka,x ",
      ),
    ).toEqual(["ai", "flink", "kafka"]);
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npx vitest run tests/portfolio.test.ts`
Expected: FAIL — `parseFocusIdsInContent` is not exported.

- [ ] **Step 3: Implement**

In `lib/portfolio.ts`, generalize the existing parser and delegate:

```ts
export function parseFocusIdsInContent(
  content: Pick<PortfolioSnapshot, "focusDefinitions">,
  rawValue?: string | string[] | null,
): FocusId[] {
  const value = Array.isArray(rawValue) ? rawValue.join(",") : (rawValue ?? "");
  const validIds = new Set(content.focusDefinitions.map((focus) => focus.id));

  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is FocusId => validIds.has(item as FocusId));

  return Array.from(new Set(parsed)).slice(0, 3);
}

export function parseFocusIds(rawValue?: string | string[] | null): FocusId[] {
  return parseFocusIdsInContent(fallbackContent, rawValue);
}
```

Update the four call sites to pass their loaded `content` snapshot first (`resume.astro`, `projects.astro`, `api/resume/pdf.ts` already hold `content`; in `jd.ts:355` call `parseFocusIdsInContent(content, options.focusOverride ?? "")`).

- [ ] **Step 4: Run tests, expect pass**

Run: `npx vitest run tests/portfolio.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add lib/portfolio.ts lib/jd.ts src/pages/resume.astro src/pages/projects.astro src/pages/api/resume/pdf.ts tests/portfolio.test.ts
git commit -m "fix: validate focus params against live content, not bundled fallback"
```

---

### Task 3: JD alias-boundary regex fix (TDD)

**Files:**

- Modify: `lib/jd.ts:72-79`
- Test: `tests/jd.test.ts`

**Interfaces:**

- Consumes: nothing new.
- Produces: `countAliasMatches` (module-private) now matches aliases ending/starting in non-word characters (`c++`, `c#`, `.net`) while still rejecting substrings inside larger tokens.

- [ ] **Step 1: Write failing test**

Append to `tests/jd.test.ts`:

```ts
it("matches aliases with non-word boundary characters like c++ and c#", () => {
  const analysis = analyzeJobDescription(`
Required
Deep experience with C++ and C# performance work; Kafka a plus.
`);

  const scores = Object.fromEntries(
    analysis.skillScores.map((skill) => [skill.skillId, skill.score]),
  );

  // c-plus-plus and c-sharp skills exist in the taxonomy with aliases "c++"/"c#"
  expect(Object.keys(scores).length).toBeGreaterThan(0);
});
```

Note: first confirm in `content/portfolio.ts` whether skills with aliases ending in non-word chars exist. If none exist, ADD `"c++"` and `"c#"` aliases to the existing `cpp`/`csharp`-style skills OR create two minimal skills in the fallback snapshot (language category) — do whichever matches the file's conventions, then assert their `skillScores` entries are non-zero:

```ts
const cpp = analysis.skillScores.find((skill) =>
  skill.matchedAliases.includes("c++"),
);
expect(cpp).toBeDefined();
```

- [ ] **Step 2: Run test, expect failure**

Run: `npx vitest run tests/jd.test.ts`
Expected: FAIL — matchedAliases does not include "c++".

- [ ] **Step 3: Implement lookaround boundaries**

Replace `countAliasMatches` in `lib/jd.ts`:

```ts
function countAliasMatches(content: string, alias: string) {
  const normalizedAlias = escapeRegExp(alias.toLowerCase());
  // Alphanumeric-token boundaries via lookarounds so aliases with
  // trailing symbols (+, #, .) still match: "C++", "C#", ".NET".
  const regex = new RegExp(`(?<![a-z0-9])${normalizedAlias}(?![a-z0-9])`, "g");
  return content.match(regex)?.length ?? 0;
}
```

- [ ] **Step 4: Run full suite**

Run: `npm run test:run`
Expected: PASS including existing JD weighting tests (boundaries must not regress "python", "kafka", "node.js" matches).

- [ ] **Step 5: Commit**

```bash
git add lib/jd.ts content/portfolio.ts tests/jd.test.ts
git commit -m "fix(jd): symbol-suffixed tech aliases now match via lookaround boundaries"
```

---

### Task 4: Rendering cache, fetch hardening, observability

**Files:**

- Modify: `src/lib/wix.ts`, `src/pages/blog/index.astro`, `src/pages/index.astro`, `src/pages/projects.astro`, `src/pages/resume.astro`, `src/pages/api/resume/pdf.ts`, `lib/content-backup.ts:149-171`, `lib/portfolio-content.ts:501-503,106-117`, `lib/resume-store.ts`

**Interfaces:**

- Produces: `PORTFOLIO_PAGE_CACHE_CONTROL` constant exported from `src/lib/wix.ts`, reused by all SSR content pages.

- [ ] **Step 1: Harden `wix.ts`**

Remove `WixRequestInit["next"]`, `cache: "force-cache"`, and `next.revalidate` plumbing (Next-only no-ops on Astro). Add to `wixFetch`:

```ts
const response = await fetch(`${WIX_POSTS_API_URL}${path}`, {
  ...init,
  headers,
  signal: AbortSignal.timeout(WIX_FETCH_TIMEOUT_MS),
});
```

with `const WIX_FETCH_TIMEOUT_MS = 8000;`. Export:

```ts
export const PORTFOLIO_PAGE_CACHE_CONTROL =
  "public, s-maxage=600, stale-while-revalidate=86400";
```

- [ ] **Step 2: Apply cache headers to SSR content pages**

At the top frontmatter of `index.astro`, `projects.astro`, `resume.astro`, `blog/index.astro`:

```ts
Astro.response.headers.set("Cache-Control", PORTFOLIO_PAGE_CACHE_CONTROL);
```

Rationale (recorded here for the final summary): build-time `prerender` would freeze admin-published content behind manual redeploys; edge-cached SSR honors the AGENTS.md "cached server rendering" rule while keeping publishes visible within ~10 minutes.

- [ ] **Step 3: PDF route caching**

In `api/resume/pdf.ts` before returning:

```ts
headers.set(
  "Cache-Control",
  storedVariant ? "private, no-store" : "public, max-age=3600, s-maxage=86400",
);
```

- [ ] **Step 4: Timeout + logging on backup fallback**

In `lib/content-backup.ts` `loadBackupSnapshot`: add `signal: AbortSignal.timeout(8000)` to the fetch; change `catch {}` to `catch (error) { console.warn("[content-backup] fallback snapshot fetch failed:", error); }`.

In `lib/portfolio-content.ts`: log in `loadPortfolioContentFromDb` catch (`console.warn("[portfolio-content] Astro DB load failed:", error)`) and guard the module-promise cache — on rejection reset `astroDbModulePromise = null` so a transient failure isn't permanent:

```ts
try {
  astroDbModulePromise ??= import("astro:db");
  return await astroDbModulePromise;
} catch (error) {
  astroDbModulePromise = null;
  console.warn("[portfolio-content] astro:db unavailable:", error);
  return null;
}
```

Same warn treatment for both catches in `lib/resume-store.ts`.

- [ ] **Step 5: Validate + commit**

Run: `npm run lint && npm run typecheck && npm run test:run && npm run build`
Expected: green; build output unchanged except headers.

```bash
git add -A && git commit -m "perf: edge-cache public pages, timeout external fetches, surface silent failures"
```

---

### Task 5: Honesty fixes — fake filter, hardcoded copy, featured order

**Files:**

- Modify: `src/pages/blog/index.astro` (remove category buttons; simplify script), `src/components/home/HomePage.tsx:153-159`, `src/pages/index.astro:8-25`

**Interfaces:** none new.

- [ ] **Step 1: Remove fake blog category filter**

Delete the `aria-label="Blog categories"` button group from `blog/index.astro`; in the `<script>` drop `filterButtons`, `setButtonState`, `activeFilter`, and the `matchesCategory` clause. Search input + empty state remain functional.

- [ ] **Step 2: Unhardcode HomePage mobile pitch**

Replace the hardcoded mobile paragraph (`HomePage.tsx:153-159`, the "10+ years…" string) with a line-clamped recruiter pitch so mobile/desktop share one CMS source:

```tsx
<motion.p
  className="mx-auto mt-6 line-clamp-4 max-w-[21rem] text-center text-lg leading-8 text-slate-600 sm:hidden"
  variants={riseVariants}
>
  {siteProfile.recruiterPitch}
</motion.p>
```

Desktop paragraph drops its duplicate and keeps `hidden sm:block`.

- [ ] **Step 3: Derive featured order from data**

`index.astro`: delete `homeFeaturedOrder`; rely on snapshot `sortOrder` (DB loader already sorts):

```ts
const featuredProjects = getPublicProjectsFromContent(content)
  .filter((project) => project.featured)
  .slice(0, 3);
```

Check `content/portfolio.ts`: ensure the intended home trio (`governed-conversational-data-platform`, `telecom-network-datalake`, `ranger-rbac-and-policy-governance`) have ascending `sortOrder` relative to other `featured: true` projects; adjust fallback `sortOrder`s if needed to preserve today's homepage lineup.

- [ ] **Step 4: Validate + commit**

Run: `npm run test:run && npm run build`

```bash
git add -A && git commit -m "fix(ui): remove decorative filters and CMS-bypassing hardcoded copy"
```

---

### Task 6: Enterprise text-to-SQL agent case study (content)

**Files:**

- Modify: `content/portfolio.ts` (add project + wire into an experience bullet if a natural host exists; add MCP/RASL/LangGraph skill aliases if missing)

**Interfaces:**

- Consumes: existing `ProjectDefinition`/case-study schema in `lib/portfolio-types.ts` and zod mirror in `actions/index.ts` (must validate — run admin schema mentally against fields: `caseStudy.confidentiality`, `organization`, `team`, `timeframe`, `role`, `headline`, `context`, `responsibilities[]`, `architecture[]`, `decisions[{label,detail}]`, `metrics[{label,value,detail}]`, `lessons[]`).
- Produces: project id `enterprise-text-to-sql-agent`, slug `enterprise-text-to-sql-agent`, referenced in focusWeights for `ai`, `agentic-development`, `backend-engineering`, `data-platform`.

- [ ] **Step 1: Read one existing full project entry** (e.g. `governed-conversational-data-platform`) and copy its exact structural conventions.

- [ ] **Step 2: Insert project with this approved copy** (qualitative scale only; sanitized org; RASL described per arXiv:2507.23104 — "Retrieval Augmented Schema Linking"):

- title: `Enterprise Text-to-SQL Agent Platform`
- summary: conversational analytics agent that turns natural-language questions into governed SQL over an enterprise warehouse — built around the two places text-to-SQL usually dies: finding the right tables in a massive catalog, and executing safely.
- impact: production agent where schema linking, query execution, and observability are each handled by a dedicated mechanism instead of one prompt.
- detail: journey narrative — discovery (why naive prompting fails at enterprise scale), retrieval-grounded schema linking, graph orchestration, governed execution, tracing, delivery through OpenWebUI, and extension via MCP servers.
- caseStudy.headline: `Text-to-SQL that survives enterprise scale`
- context: most text-to-SQL demos assume small clean schemas; ours had hundreds of tables across domains, opaque column names, and strict access rules — the conditions under which these projects normally fail. Emphasis on what made it work: RASL-style retrieval-augmented semantic schema linking (entity-level decomposition indexed for retrieval, keyword-based multi-stage retrieval with relevance calibration, zero fine-tuning) for table selection; Trino as the single governed execution boundary (authz enforced engine-side, not prompt-side); LangGraph tool-node/subgraph orchestration with typed state between discovery, linking, SQL drafting, validation, and explanation; Langfuse tracing of every retrieval and generation step; OpenWebUI as the analyst-facing surface; purpose-scoped MCP servers exposing metadata lookup, controlled query execution, and charting as tools.
- responsibilities/architecture/decisions/lessons: derived strictly from the bullets above; decisions include "Retrieval over prompt-stuffing", "Engine-side governance", "Subgraphs per capability", "Traces as evaluation data".
- metrics: qualitative values only (e.g. label `Schema linking`, value `Retrieval-grounded`, detail explaining zero-shot linking at catalog scale). NO invented numbers.
- confidentiality: mirrors sibling entries (internal names withheld).
- publicProof.proofTypes: `["sanitized-diagram", "metric"]`; architectureShape lists the five layers (interface, orchestration, retrieval, execution, observability).

- [ ] **Step 3: Wire into ranking** — add nonzero `focusWeights` entries for the project (`ai`, `agentic-development`, `backend-engineering`, `data-platform`) consistent with sibling weights; confirm skills `langgraph`, `langfuse`, `openwebui`, `trino`, `python` exist in `skillDefinitions` (they do, per focus `relatedSkillIds`) and add `project-skill` linkage in the fallback snapshot's structures following existing patterns.

- [ ] **Step 4: Validate** — `npm run test:run && npm run build` (build seeds local DB from fallback; a broken shape fails seeding/typecheck).

- [ ] **Step 5: Commit**

```bash
git add content/portfolio.ts && git commit -m "content: add enterprise text-to-SQL agent case study"
```

---

### Task 7: SEO surfaces

**Files:**

- Create: `src/pages/rss.xml.ts`, `src/pages/404.astro`
- Modify: `src/layouts/BaseLayout.astro`, `src/pages/llms.txt.ts`, `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`, `src/pages/blog/[slug].astro`, `src/pages/projects/[slug].astro`, `vercel.json`, `public/favico.ico`→`favicon.ico`, `public/favico.png`→`favicon.png`

**Interfaces:**

- Produces: `GET /rss.xml` (Wix-fed, `s-maxage=3600`); `buildSitemapEntries(posts, projectSlugs)` returning `{ loc, lastmod? }[]` in `sitemap.xml.ts` (exported for tests, replacing `buildSitemapRoutes` — update `tests/sitemap.test.ts` accordingly); BaseLayout prop `ogType?: "website" | "article"`.

- [ ] **Step 1: Host consistency** — replace `www.vijayjangir.com` fallbacks with `https://vijayjangir.com` in `robots.txt.ts`, `llms.txt.ts`, `sitemap.xml.ts`.

- [ ] **Step 2: Favicon naming** — `git mv public/favico.ico public/favicon.ico`, same for png; update `BaseLayout.astro:94-96` links; repoint `favicon.ico.ts` redirect to `/favicon.ico`.

- [ ] **Step 3: RSS route** — `rss.xml.ts` mirrors `sitemap.xml.ts` structure: `getWixBlogs()` → channel with title/description/link from `site`, items using `getWixBlogLocalPath`, `title`, `description` (excerpt), `pubDate` (`firstPublishedDate`), escaped via shared `escapeXml` (move helper to a tiny `src/lib/xml.ts` so sitemap/rss/tests share it). Headers: `Cache-Control: public, s-maxage=3600`, `Content-Type: application/rss+xml; charset=utf-8`.

- [ ] **Step 4: Sitemap lastmod** — switch to entries carrying `lastmod` (ISO date) for blog posts from `lastPublishedDate ?? firstPublishedDate`; wrap in `<lastmod>` when present. Update `tests/sitemap.test.ts` expectations.

- [ ] **Step 5: Structured data** — BaseLayout gains `ogType` prop (default `website`; posts pass `article`). `blog/[slug].astro` adds Article JSON-LD (headline, description, datePublished, dateModified, mainEntityOfPage, author Person). Both `[slug].astro` pages add BreadcrumbList JSON-LD (Home → Section → Page).

- [ ] **Step 6: 404 page** — `404.astro` with BaseLayout, friendly nav to `/`, `/projects`, `/blog`, `/resume`; Astro SSR serves it for unmatched routes.

- [ ] **Step 7: Security headers** — extend `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "astro",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

- [ ] **Step 8: RSS autodiscovery** — BaseLayout head: `<link rel="alternate" type="application/rss+xml" title="..." href={new URL("/rss.xml", siteBase)} />`.

- [ ] **Step 8b: Meta-description pass** — verify every public page passes a unique, specific `description` to BaseLayout; tighten generic ones (`projects/[slug].astro` already derives from project summary; check `/resume`, `/blog`, homepage variants). No new pages without descriptions.

- [ ] **Step 9: Validate + commit** — full gate incl. updated sitemap tests.

```bash
git add -A && git commit -m "seo: rss, lastmod, structured data, 404, security headers, host consistency"
```

---

### Task 8: llms.txt regeneration from live positioning

**Files:**

- Modify: `src/pages/llms.txt.ts`

- [ ] **Step 1:** Rebuild body from `fallbackPortfolioSnapshot.siteProfile` (stays prerendered/static): architect framing copied from `title`/`heroLabel`; citable facts aligned with profile; same Profiles block; drop "data engineer" phrasing.

- [ ] **Step 2:** Validate + commit: `npm run build && git add -A && git commit -m "seo: align llms.txt with live positioning"`

---

### Task 9: Docs refresh

**Files:**

- Modify: `AGENTS.md`, `docs/site-review.md`, `README.md`, `docs/progress-log.md`

- [ ] **Step 1: AGENTS.md** — rewrite for Astro reality: architecture map (`src/pages`, `lib/*` engines, `db/config.ts` Astro DB tables, GitHub-backup publishing chain), current non-negotiables (Vercel Hobby, Wix source-of-truth, cached SSR, mailto contact), real known issues remaining (media-on-raw.githubusercontent, focus taxonomy mixing roles/techs, single-admin concurrency), validation commands.
- [ ] **Step 2: site-review.md** — replace stale Next.js review with the 2026-08-25 findings summary + disposition table (fixed in this branch vs deferred).
- [ ] **Step 3: README.md** — env/deps truth after Task 1; add RSS/security-header notes; correct any Resend/Turnstile mentions.
- [ ] **Step 4: progress-log.md** — append wave entry with validation results.
- [ ] **Step 5: Commit**: `git add -A && git commit -m "docs: reflect the Astro architecture and this hardening wave"`

---

### Task 10: Final verification

- [ ] Full gate: `npm run lint && npm run typecheck && npm run test:run && npm run build`
- [ ] Smoke: `npm run dev` → hit `/`, `/projects`, `/resume?focus=ai`, `/blog`, `/rss.xml`, `/sitemap.xml`, `/llms.txt`, `/robots.txt`, bogus URL → 404 page.
- [ ] Confirm no tracked secrets: `git ls-files | grep -iE "\.env$|\.env\.local"`.
- [ ] Summarize for owner: deviations (edge-cache vs prerender rationale), items flagged needing real facts (timeframe/org for the new case study, MCP-server specifics, optional future numbers).
