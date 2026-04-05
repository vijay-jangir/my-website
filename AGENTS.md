# AGENTS.md

## Mission
Improve Vijay Jangir's personal website without introducing paid infrastructure.

This repo is a Next.js portfolio deployed on Vercel, with blog content currently sourced from Wix and contact handled through Resend. Future work should keep the site compatible with free Vercel hosting and avoid adding infrastructure that requires a paid database, queue, worker, or always-on backend.

## Read First
1. `docs/site-review.md`
2. `docs/implementation-plan.md`
3. `README.md`

## Current Architecture
- `/` is a single-page portfolio with hero, about, projects, skills, experience, and contact sections.
- `/blog` fetches a Wix post list and renders summary cards that currently link out to the Wix-hosted post URLs.
- Contact form submission uses a Next.js server action and Resend.
- Most portfolio content is hardcoded in `lib/data.ts`.

## Non-Negotiables
- Keep deployment compatible with Vercel Hobby.
- Treat Wix as the current blog source of truth unless the user explicitly wants to replace it.
- Prefer static or cached server rendering over highly dynamic per-request work.
- Do not add paid SaaS dependencies when a free option or built-in Next.js capability is sufficient.
- Preserve the current simple editing flow: portfolio content in-repo, blog authoring in Wix.

## Immediate Priorities
1. Fix credibility and content quality issues in the main portfolio.
2. Harden the existing Wix integration instead of removing it.
3. Improve metadata, SEO, and share previews.
4. Refresh the visual system so the site feels more intentional and less template-like.
5. Validate deployability after cleanup.

## Known Issues
- `components/blogs/blog.tsx` still sends readers to the Wix subdomain instead of keeping them on `vijayjangir.com`.
- `actions/sendEmail.ts` still uses a hardcoded sender and destination address.
- `components/intro.tsx` still positions Vijay too broadly across multiple roles at once.
- `lib/data.ts` is cleaner now, but the projects and skills sections still need sharper curation.
- Build and lint still need to be verified in a real Node environment.

## Implementation Rules
- Prefer Next.js `fetch` with caching or `revalidate` over extra HTTP client dependencies for Wix calls.
- If improving blog integration, first keep the current index page stable, then add local post routes such as `app/blog/[slug]/page.tsx`.
- Any Wix failure state should degrade cleanly: empty list or clear fallback, not a broken page.
- Content quality matters as much as code quality on this repo; remove filler, repetition, and weak claims.
