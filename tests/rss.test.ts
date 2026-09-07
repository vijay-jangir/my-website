import { describe, expect, it, vi } from "vitest";

import type { BlogPost } from "@/lib/blog";

vi.mock("astro:content", () => ({ getCollection: vi.fn() }));

const { buildRssItems } = await import("@/src/pages/rss.xml");

const baseUrl = new URL("https://vijayjangir.com");

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

describe("buildRssItems", () => {
  it("produces an item for each post with correct title, link, and guid", () => {
    const items = buildRssItems(
      [makePost({ slug: "hello-world", title: "Hello World" })],
      baseUrl,
    );

    expect(items).toHaveLength(1);
    const item = items[0];
    expect(item).toContain("<title>Hello World</title>");
    expect(item).toContain(
      "<link>https://vijayjangir.com/blog/hello-world</link>",
    );
    expect(item).toContain(
      '<guid isPermaLink="true">https://vijayjangir.com/blog/hello-world</guid>',
    );
  });

  it("uses canonicalUrl as the guid and link when present", () => {
    const items = buildRssItems(
      [
        makePost({
          slug: "cross-posted",
          canonicalUrl: "https://external.blog/cross-posted",
        }),
      ],
      baseUrl,
    );

    const item = items[0];
    expect(item).toContain(
      "<link>https://external.blog/cross-posted</link>",
    );
    expect(item).toContain(
      '<guid isPermaLink="true">https://external.blog/cross-posted</guid>',
    );
  });

  it("includes pubDate when publishedAt is valid", () => {
    const date = new Date("2026-08-01T12:00:00.000Z");
    const items = buildRssItems([makePost({ publishedAt: date })], baseUrl);

    expect(items[0]).toContain(`<pubDate>${date.toUTCString()}</pubDate>`);
  });

  it("includes both local and wix posts", () => {
    const posts = [
      makePost({ slug: "local-one", source: "local" }),
      makePost({ slug: "wix-one", source: "wix" }),
    ];
    const items = buildRssItems(posts, baseUrl);

    expect(items).toHaveLength(2);
    expect(items[0]).toContain("/blog/local-one");
    expect(items[1]).toContain("/blog/wix-one");
  });

  it("escapes XML special characters in title and description", () => {
    const items = buildRssItems(
      [
        makePost({
          title: "Foo & Bar <baz>",
          description: 'Quotes "here" & <there>',
        }),
      ],
      baseUrl,
    );

    const item = items[0];
    expect(item).toContain("<title>Foo &amp; Bar &lt;baz&gt;</title>");
    expect(item).toContain(
      "Quotes &quot;here&quot; &amp; &lt;there&gt;",
    );
  });

  it("returns an empty array for no posts", () => {
    expect(buildRssItems([], baseUrl)).toEqual([]);
  });

  it("encodes slugs with special characters", () => {
    const items = buildRssItems(
      [makePost({ slug: "hello world" })],
      baseUrl,
    );

    expect(items[0]).toContain("/blog/hello%20world");
  });
});
