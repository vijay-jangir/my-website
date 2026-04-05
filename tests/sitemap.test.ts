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
        "/work",
        "/blog/astro-caching-notes",
        "/blog/platform-review",
      ]),
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
