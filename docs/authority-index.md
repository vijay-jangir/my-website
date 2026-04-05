# Authority Index

## Internal Authorities

- [`content/portfolio.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/content/portfolio.ts)
  Canonical public profile facts, focus definitions, skills, projects, highlights, and experience entries.
- [`lib/portfolio-types.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/lib/portfolio-types.ts)
  Canonical domain types for focus-driven resume and project ranking.
- [`lib/portfolio.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/lib/portfolio.ts)
  Deterministic ranking and search behavior.
- [`lib/jd.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/lib/jd.ts)
  Deterministic JD parsing, section weighting, and focus/skill extraction.
- [`db/schema.sql`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/db/schema.sql)
  Database schema authority for saved resume variants, JD records, and future hybrid retrieval.
- [`docs/implementation-plan.md`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/docs/implementation-plan.md)
  Migration phases, waves, and exit criteria.
- [`docs/progress-log.md`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/docs/progress-log.md)
  Execution log and deployment-check history.
- [`src/lib/auth.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/src/lib/auth.ts)
  Authority for private-session behavior and GitHub allowlist auth.
- [`src/pages/api/jd/analyze.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/src/pages/api/jd/analyze.ts)
  Authority for private JD-analysis API behavior.
- [`src/pages/api/resume/pdf.ts`](/Users/b0228188/projects/github_repos/vijayjangir/my-website/src/pages/api/resume/pdf.ts)
  Authority for ATS-safe PDF generation.

## External Platform Authorities

- Astro endpoints:
  https://docs.astro.build/en/guides/endpoints/
- Astro authentication guidance:
  https://docs.astro.build/en/guides/authentication/
- Astro Vercel adapter:
  https://docs.astro.build/en/guides/integrations-guide/vercel/
- Astro on Vercel:
  https://vercel.com/docs/frameworks/frontend/astro
- FastAPI on Vercel:
  https://vercel.com/docs/frameworks/backend/fastapi
- Vercel Python runtime:
  https://vercel.com/docs/functions/runtimes/python
- Vercel WebSocket limitation:
  https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections
- Vercel domains:
  https://vercel.com/docs/domains/working-with-domains
- OpenClaw gateway protocol:
  https://docs.openclaw.ai/gateway/protocol
- OpenClaw dashboard:
  https://docs.openclaw.ai/dashboard
- OpenClaw VPS guidance:
  https://docs.openclaw.ai/vps

## Decision Notes

- Public site foundation should not depend on any hosted AI provider.
- OpenClaw must not be treated as a Vercel-hosted workload.
- Subdomains are the authority for future homelab service exposure, not path-prefix reverse proxies.
- Legacy Next.js code is retained only as a quarantine reference under `legacy-next/`, not as an active runtime path.
