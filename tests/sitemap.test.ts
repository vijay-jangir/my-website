import { describe, expect, it } from "vitest";

import { buildSitemapEntries } from "@/src/pages/sitemap.xml";

describe("buildSitemapEntries", () => {
  it("includes local blog detail routes when Wix slugs are available", () => {
    const entries = buildSitemapEntries([
      {
        slug: "astro-caching-notes",
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      },
      {
        url: {
          base: "https://example.com",
          path: "/blog/post/platform-review",
        },
      },
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
      buildSitemapEntries([], ["portfolio-website"]).map((entry) => entry.loc),
    ).toEqual(expect.arrayContaining(["/projects/portfolio-website"]));
  });

  it("deduplicates repeated routes", () => {
    const entries = buildSitemapEntries([
      {
        slug: "astro-caching-notes",
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      },
      {
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      },
    ]);

    expect(
      entries.filter((entry) => entry.loc === "/blog/astro-caching-notes"),
    ).toHaveLength(1);
  });

  it("attaches lastmod from the most recent publish date", () => {
    const entries = buildSitemapEntries([
      {
        slug: "astro-caching-notes",
        firstPublishedDate: "2024-01-01T00:00:00.000Z",
        lastPublishedDate: "2025-03-15T10:30:00.000Z",
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      },
    ]);

    const blogEntry = entries.find(
      (entry) => entry.loc === "/blog/astro-caching-notes",
    );

    expect(blogEntry?.lastmod).toBe(
      new Date("2025-03-15T10:30:00.000Z").toISOString(),
    );
  });

  it("omits lastmod when no publish dates exist", () => {
    const entries = buildSitemapEntries([
      {
        url: {
          base: "https://example.com",
          path: "/blog/post/platform-review",
        },
      },
    ]);

    const blogEntry = entries.find(
      (entry) => entry.loc === "/blog/platform-review",
    );

    expect(blogEntry?.lastmod).toBeUndefined();
  });
});
