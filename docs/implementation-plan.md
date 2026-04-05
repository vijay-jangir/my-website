# Implementation Plan

## Goal
Turn the current portfolio into a sharper personal site while keeping:
- free hosting on Vercel
- Wix as the blog authoring backend
- Resend for contact delivery

## Current Status
Phase 1 has started.

Already completed in this cleanup pass:
- fixed the `mailto:` mismatch
- removed stale imports and some unused component code
- switched the Wix listing fetch to cached `fetch`
- removed the visible Wix ribbon from blog cards
- added better root and blog metadata
- added a clearer intro section to `/blog`

## Working Decisions
- Do not replace Wix right now.
- Do not add a database or any paid infrastructure.
- Use built-in Next.js capabilities before adding new packages.
- Improve credibility and content quality before doing a large visual redesign.

## Phase 1: Stabilize The Current Repo
- Remove dead imports and stale code paths.
- Clean up invalid or noisy class names.
- Remove unused code from the blog and project components.
- Move hardcoded contact routing into config if the next pass touches email delivery.
- Replace obvious grammar issues and duplicated skills in `lib/data.ts`.
- Validate the updated code in a real Node environment.

### Phase 1 Acceptance
- No placeholder contact data remains.
- No unused missing-file imports remain.
- Wix listing still works.
- Dependency state is internally consistent.

## Phase 2: Improve The Core Portfolio
- Rewrite the hero into a narrower positioning statement.
- Trim the skill list to a smaller, more defensible set.
- Convert the projects section from a list of summaries into selected case studies.
- Add stronger proof points: scale, business impact, ownership, and links where possible.
- Rework section spacing, hierarchy, and typography so the site no longer feels template-derived.

### Phase 2 Acceptance
- The landing section communicates a clear professional identity in one scan.
- Projects feel like proof, not filler.
- Copy quality is strong enough to support outreach and hiring conversations.

## Phase 3: Harden The Wix Blog Integration
- Replace `axios` with `fetch`.
- Centralize Wix fetching in a typed helper.
- Add caching or `revalidate` so `/blog` is not needlessly dynamic.
- Improve empty and error states so missing `WIX_API_KEY` does not break the page experience.
- Remove the visible `"wix"` ribbon from production cards.
- Decide on the target blog experience:

Recommended target:
1. Keep Wix as the content source.
2. Add `app/blog/[slug]/page.tsx`.
3. Fetch the selected post by slug from Wix.
4. Render the post on `vijayjangir.com` with local metadata and canonical handling.

Fallback target if time is limited:
1. Keep the current `/blog` listing.
2. Keep external post links.
3. Make the external nature explicit with cleaner UI copy such as `Read on blog`.

### Phase 3 Acceptance
- `/blog` feels intentional and stable.
- Blog failures degrade gracefully.
- The final direction is either fully local post rendering or clearly-labeled outbound reading.

## Phase 4: SEO, Sharing, And Deployment Readiness
- Upgrade root metadata with a stronger title and description.
- Add Open Graph and Twitter metadata.
- Add canonical URL handling.
- Ensure favicon and preview assets are clean.
- Verify environment variable names and Vercel settings.

### Phase 4 Acceptance
- The site has usable social previews.
- Metadata reflects Vijay's actual positioning.
- Deployment requires only Vercel plus the documented environment variables.

## Out Of Scope For Now
- Custom analytics pipelines
- Paid headless CMS changes
- Authentication
- Comments
- Search
- Background jobs

## Validation Checklist
- Run `npm install`
- Run `npm run lint`
- Run `npm run build`
- Manually verify `/`
- Manually verify `/blog`
- Submit the contact form in preview or production
- Confirm Wix failure behavior by testing with and without `WIX_API_KEY`
