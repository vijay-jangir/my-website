import { describe, expect, it, vi } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type { SiteProfile } from "@/lib/portfolio-types";

vi.mock("astro:content", () => ({ getCollection: vi.fn() }));

const { buildLlmsTxt, clampSummary } = await import("@/src/pages/llms.txt");

const baseUrl = new URL("https://vijayjangir.com");

const profile = {
  name: "Test Person",
  title: "Platform Architect",
  location: "India",
  timezone: "Asia/Kolkata",
  lastUpdatedLabel: "May 2026",
  contentPromise: "Case studies describe ownership.",
  currentFocusLabels: ["Data platforms"],
  email: "contact@example.com",
  githubUrl: "https://github.com/example",
  linkedinUrl: "https://linkedin.com/in/example",
  profileImageUrl: "/profile-pic.jpeg",
  heroLabel: "I build governed data platforms.",
  recruiterPitch: "Architect and hands-on developer.",
} as SiteProfile;

const projects = [
  {
    summary: "Short summary stays intact.",
    slug: "short-project",
    title: "Short project",
    visibility: "public",
  },
  {
    summary: "Draft work that must not be listed.",
    slug: "draft-project",
    title: "Draft project",
    visibility: "draft",
  },
  {
    summary: "No-slug entry that must not be listed.",
    title: "No-slug project",
    visibility: "public",
  },
];

const blogPosts = [
  {
    slug: "hello-world",
    title: "Hello World",
    description: "My first blog post.",
  },
  {
    slug: "architecture-notes",
    title: "Architecture Notes",
    description: "Notes on platform architecture.",
  },
];

describe("buildLlmsTxt", () => {
  const body = buildLlmsTxt({ baseUrl, profile, projects });

  it("keeps the canonical anchor lines", () => {
    for (const line of [
      "Canonical: https://vijayjangir.com/",
      "Projects: https://vijayjangir.com/projects",
      "Resume: https://vijayjangir.com/resume",
      "Blog: https://vijayjangir.com/blog",
      "RSS: https://vijayjangir.com/rss.xml",
    ]) {
      expect(body).toContain(line);
    }
  });

  it("adds the last-updated freshness line from the profile", () => {
    expect(body).toContain("Last updated: May 2026.");
  });

  it("lists public slugged case studies exactly once and omits others", () => {
    expect(body.match(/\/projects\/short-project/g)).toHaveLength(1);
    expect(body).toContain("- Short project: Short summary stays intact.");
    expect(body).not.toContain("draft-project");
    expect(body).not.toContain("No-slug project");
  });

  it("omits blog posts section when none are provided", () => {
    expect(body).not.toContain("Blog posts:");
  });
});

describe("buildLlmsTxt with blog posts", () => {
  const body = buildLlmsTxt({ baseUrl, profile, projects, blogPosts });

  it("includes a blog posts section with each post", () => {
    expect(body).toContain("Blog posts:");
    expect(body).toContain("- Hello World: My first blog post.");
    expect(body).toContain("https://vijayjangir.com/blog/hello-world");
    expect(body).toContain("- Architecture Notes: Notes on platform architecture.");
    expect(body).toContain(
      "https://vijayjangir.com/blog/architecture-notes",
    );
  });

  it("does not duplicate blog posts in case studies section", () => {
    expect(body).not.toContain("/projects/hello-world");
  });
});

describe("clampSummary", () => {
  it("returns short summaries untouched", () => {
    expect(clampSummary("Already short.")).toBe("Already short.");
  });

  it("clamps long summaries to 160 chars plus an ellipsis without partial words", () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const clamped = clampSummary(words);

    expect(clamped.length).toBeLessThanOrEqual(161);
    expect(clamped.endsWith("…")).toBe(true);
    expect(clamped.endsWith("word…")).toBe(false);
    expect(words.startsWith(clamped.slice(0, -1))).toBe(true);
  });
});

describe("live fallback snapshot integration", () => {
  it("emits a case-study line for every public slugged snapshot project", () => {
    const body = buildLlmsTxt({
      baseUrl,
      profile: fallbackPortfolioSnapshot.siteProfile,
      projects: fallbackPortfolioSnapshot.projects,
    });
    const expected = fallbackPortfolioSnapshot.projects.filter(
      (project) => project.visibility === "public" && project.slug,
    );

    for (const project of expected) {
      expect(body).toContain(`/projects/${project.slug}`);
    }
    expect(body).toContain(
      `Last updated: ${fallbackPortfolioSnapshot.siteProfile.lastUpdatedLabel}.`,
    );
  });
});
