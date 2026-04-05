# Site Review

## Snapshot

- Branch reviewed: `main`
- App type: Next.js 13 App Router portfolio
- Hosting target: free Vercel deployment
- Blog source: Wix API
- Contact delivery: Resend server action

## What Is Already Working

- The site has a simple and understandable structure.
- The profile photo is now local instead of depending on an expiring LinkedIn URL.
- `/blog` is active on `main` and the current Wix-powered listing approach keeps infra lightweight.
- The overall stack is appropriate for a free Vercel deployment.
- The first cleanup pass is already in place: stale imports were removed, the contact `mailto:` mismatch was fixed, root metadata was improved, and the Wix fetcher now uses cached `fetch`.

## What Should Be Better

### 1. Tighten Credibility And Content

- `lib/data.ts:72` to `lib/data.ts:109` uses generic project summaries with no links, screenshots, outcomes, or proof points.
- `lib/data.ts:106` still uses the typo `Cannabalization` in a project title.
- `lib/data.ts:111` to `lib/data.ts:125` is cleaner now, but it is still a broad skill list rather than a curated capability narrative.
- `components/intro.tsx:51` to `components/intro.tsx:57` tries to cover too many roles at once. It dilutes positioning instead of sharpening it.
- `lib/data.ts:47` still contains the typo `emmployment`.

### 2. Fix Small Issues That Hurt Trust

- `actions/sendEmail.ts:29` to `actions/sendEmail.ts:30` still uses the default Resend sender and a hardcoded Gmail destination, which is acceptable for a prototype but not polished.
- `components/blogs/blog.tsx:45` to `components/blogs/blog.tsx:49` still send readers away from the site to the Wix subdomain, so the blog experience still feels split.

### 3. Clean Up Technical Debt

- `components/blogs/blog.tsx:11` still keeps `blog_id` in the type even though the production card no longer renders a source ribbon.
- `components/blogs/providers/wix.tsx:3` to `components/blogs/providers/wix.tsx:36` are much better now, but the integration still needs typed normalization if local post pages are added next.
- `actions/sendEmail.ts:8` to `actions/sendEmail.ts:31` still rely on hardcoded mail routing values instead of config.

### 4. Make The Wix Integration More Intentional

- The current index page is now in better shape, with cached fetches and cleaner cards.
- The remaining gap is product-level: readers still leave the site for the actual post content.
- If Wix remains the CMS, the best next step is local post routes on `vijayjangir.com`, not more polish on outbound cards.

### 5. Improve Design Direction

- The current visual language still feels close to a starter portfolio: soft blobs, rounded cards, standard chips, and generic section sequencing.
- Projects are text-heavy and visually flat.
- The blog page works functionally, but it does not feel like a first-class part of the site.
- The site needs stronger hierarchy: fewer claims, better spacing, better type scale, and more emphasis on work impact.

## What Should Be Removed Or Replaced

- Replace hardcoded email routing in `actions/sendEmail.ts` with config.
- Replace broad skill dumping with a smaller set of high-signal capabilities.
- Replace generic project descriptions with selected case studies and measurable outcomes.
- Replace outbound Wix post navigation with local blog post routes when the Wix integration moves to phase 2.

## Wix-Specific Recommendation

Wix is a reasonable choice here if the goal is simple authoring plus free Vercel hosting. The current integration should be treated as phase 1, not the final form.

Recommended direction:

1. Keep Wix as the CMS.
2. Keep `/blog` on the Next.js site.
3. Replace `axios` with built-in `fetch` and add caching.
4. In the next step, render local post detail pages under `/blog/[slug]` using Wix data instead of linking readers out to `wixsite.com`.

That keeps writing in Wix while making the site feel like one product instead of two stitched together products.

## Free-Hosting Fit

- Vercel Hobby remains the right deployment target for this site.
- Resend's free tier is enough for a low-volume contact form.
- No database is needed for the current portfolio and Wix-backed blog plan.
- The implementation should stay static-first and API-light so Hobby limits are not stressed.

## Validation Gap

Build and lint were not executed in this review session because the current shell environment does not have `node`, `npm`, `pnpm`, or `yarn` available on `PATH`.
