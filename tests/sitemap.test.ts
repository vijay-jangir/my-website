import { describe, expect, it } from "vitest";

import { buildSitemapRoutes } from "@/src/pages/sitemap.xml";

describe("buildSitemapRoutes", () => {
  it("includes local blog detail routes when Wix slugs are available", () => {
    expect(
      buildSitemapRoutes([
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
      ]),
    ).toEqual(
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
    expect(buildSitemapRoutes()).not.toContain("/work");
  });

  it("includes public project detail routes", () => {
    expect(buildSitemapRoutes([], ["portfolio-website"])).toEqual(
      expect.arrayContaining(["/projects/portfolio-website"]),
    );
  });

  it("deduplicates repeated routes", () => {
    const routes = buildSitemapRoutes([
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
      routes.filter((route) => route === "/blog/astro-caching-notes"),
    ).toHaveLength(1);
  });
});
