import { describe, expect, it, vi } from "vitest";

import type { BlogPost } from "@/lib/blog";

vi.mock("astro:content", () => ({ getCollection: vi.fn() }));

const { buildSitemapEntries } = await import("@/src/pages/sitemap.xml");

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "test-post",
    title: "Test Post",
    description: "A test blog post.",
    publishedAt: new Date("2026-06-15T00:00:00.000Z"),
    source: "local",
    ...overrides,
  };
}

describe("buildSitemapEntries", () => {
  it("includes blog detail routes from unified posts", () => {
    const entries = buildSitemapEntries([
      makePost({ slug: "astro-caching-notes" }),
      makePost({ slug: "platform-review", source: "wix" }),
    ]);

    expect(entries.map((entry) => entry.loc)).toEqual(
      expect.arrayContaining([
        "/",
        "/projects",
        "/resume",
        "/blog",
        "/blog/astro-caching-notes",
        "/blog/platform-review",
      ]),
    );
  });

  it("excludes redirected public routes", () => {
    expect(buildSitemapEntries().map((entry) => entry.loc)).not.toContain(
      "/work",
    );
  });

  it("includes public project detail routes", () => {
    expect(
      buildSitemapEntries([], ["access-governance-platform"]).map(
        (entry) => entry.loc,
      ),
    ).toEqual(
      expect.arrayContaining(["/projects/access-governance-platform"]),
    );
  });

  it("deduplicates repeated routes", () => {
    const entries = buildSitemapEntries([
      makePost({ slug: "astro-caching-notes" }),
      makePost({ slug: "astro-caching-notes", source: "wix" }),
    ]);

    expect(
      entries.filter((entry) => entry.loc === "/blog/astro-caching-notes"),
    ).toHaveLength(1);
  });

  it("uses updatedAt for lastmod when available", () => {
    const entries = buildSitemapEntries([
      makePost({
        slug: "astro-caching-notes",
        publishedAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-03-15T10:30:00.000Z"),
      }),
    ]);

    const blogEntry = entries.find(
      (entry) => entry.loc === "/blog/astro-caching-notes",
    );

    expect(blogEntry?.lastmod).toBe(
      new Date("2025-03-15T10:30:00.000Z").toISOString(),
    );
  });

  it("falls back to publishedAt for lastmod when updatedAt is absent", () => {
    const entries = buildSitemapEntries([
      makePost({
        slug: "basic-post",
        publishedAt: new Date("2026-02-10T00:00:00.000Z"),
      }),
    ]);

    const blogEntry = entries.find(
      (entry) => entry.loc === "/blog/basic-post",
    );

    expect(blogEntry?.lastmod).toBe(
      new Date("2026-02-10T00:00:00.000Z").toISOString(),
    );
  });

  it("includes both local and wix posts", () => {
    const entries = buildSitemapEntries([
      makePost({ slug: "local-one", source: "local" }),
      makePost({ slug: "wix-one", source: "wix" }),
    ]);

    const locs = entries.map((entry) => entry.loc);
    expect(locs).toContain("/blog/local-one");
    expect(locs).toContain("/blog/wix-one");
  });
});
