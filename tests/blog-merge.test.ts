import { afterEach, describe, expect, it, vi } from "vitest";

import type { BlogPost } from "@/lib/blog";

// ---------------------------------------------------------------------------
// Mocks — astro:content is a virtual module that only exists at Astro runtime.
// vi.mock intercepts the import before module resolution, so it works in vitest
// without the actual module existing on disk.
// ---------------------------------------------------------------------------

vi.mock("astro:content", () => ({
  getCollection: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeLocalPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "local-post",
    title: "Local Post",
    description: "A local markdown post.",
    publishedAt: new Date("2026-06-15"),
    source: "local",
    ...overrides,
  };
}

function makeWixPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "wix-post",
    title: "Wix Post",
    description: "A post from Wix.",
    publishedAt: new Date("2026-07-01"),
    source: "wix",
    readTime: 5,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// mergeBlogPosts — pure function tests
// ---------------------------------------------------------------------------

describe("mergeBlogPosts", () => {
  it("merges both sources into one list sorted by publishedAt descending", async () => {
    const { mergeBlogPosts } = await import("@/lib/blog");

    const local = [makeLocalPost({ publishedAt: new Date("2026-06-15") })];
    const wix = [makeWixPost({ publishedAt: new Date("2026-07-01") })];

    const merged = mergeBlogPosts(local, wix);

    expect(merged).toHaveLength(2);
    expect(merged[0].slug).toBe("wix-post");
    expect(merged[1].slug).toBe("local-post");
  });

  it("resolves slug collisions in favour of local source", async () => {
    const { mergeBlogPosts } = await import("@/lib/blog");

    const collisionSlug = "shared-slug";
    const local = [
      makeLocalPost({
        slug: collisionSlug,
        title: "Local version",
        publishedAt: new Date("2026-06-01"),
      }),
    ];
    const wix = [
      makeWixPost({
        slug: collisionSlug,
        title: "Wix version",
        publishedAt: new Date("2026-07-01"),
      }),
    ];

    const merged = mergeBlogPosts(local, wix);

    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe("local");
    expect(merged[0].title).toBe("Local version");
  });

  it("returns empty array when both sources are empty", async () => {
    const { mergeBlogPosts } = await import("@/lib/blog");

    expect(mergeBlogPosts([], [])).toEqual([]);
  });

  it("preserves correct order with many posts from both sources", async () => {
    const { mergeBlogPosts } = await import("@/lib/blog");

    const local = [
      makeLocalPost({ slug: "l1", publishedAt: new Date("2026-01-01") }),
      makeLocalPost({ slug: "l2", publishedAt: new Date("2026-09-01") }),
    ];
    const wix = [
      makeWixPost({ slug: "w1", publishedAt: new Date("2026-05-01") }),
      makeWixPost({ slug: "w2", publishedAt: new Date("2026-12-01") }),
    ];

    const merged = mergeBlogPosts(local, wix);

    expect(merged.map((p) => p.slug)).toEqual(["w2", "l2", "w1", "l1"]);
  });
});

// ---------------------------------------------------------------------------
// getUnifiedBlogPosts — integration with mocked sources
// ---------------------------------------------------------------------------

describe("getUnifiedBlogPosts", () => {
  it("degrades to local-only when Wix throws", async () => {
    const { getCollection } = (await import("astro:content")) as {
      getCollection: ReturnType<typeof vi.fn>;
    };

    getCollection.mockResolvedValue([
      {
        id: "hello-world",
        data: {
          title: "Hello World",
          description: "First local post.",
          publishedAt: new Date("2026-09-07"),
          draft: false,
        },
      },
    ]);

    // Make the Wix fetcher throw to simulate an outage
    vi.doMock("@/src/lib/wix", () => ({
      getWixBlogsResult: vi.fn().mockRejectedValue(new Error("Wix is down")),
      getWixBlogSlug: vi.fn(),
    }));

    const { getUnifiedBlogPosts } = await import("@/lib/blog");
    const posts = await getUnifiedBlogPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("hello-world");
    expect(posts[0].source).toBe("local");
  });

  it("includes Wix posts when the API succeeds", async () => {
    const { getCollection } = (await import("astro:content")) as {
      getCollection: ReturnType<typeof vi.fn>;
    };

    getCollection.mockResolvedValue([
      {
        id: "local-only",
        data: {
          title: "Local Only",
          description: "A local post.",
          publishedAt: new Date("2026-06-01"),
          draft: false,
        },
      },
    ]);

    vi.doMock("@/src/lib/wix", () => ({
      getWixBlogsResult: vi.fn().mockResolvedValue({
        status: "ok",
        posts: [
          {
            id: "wix-1",
            title: "Wix Post",
            excerpt: "From Wix.",
            slug: "wix-post",
            firstPublishedDate: "2026-08-01T00:00:00.000Z",
            minutesToRead: 4,
            url: { base: "https://example.com", path: "/post/wix-post" },
          },
        ],
      }),
      getWixBlogSlug: vi.fn().mockReturnValue("wix-post"),
    }));

    const { getUnifiedBlogPosts } = await import("@/lib/blog");
    const posts = await getUnifiedBlogPosts();

    expect(posts).toHaveLength(2);
    expect(posts[0].slug).toBe("wix-post");
    expect(posts[0].source).toBe("wix");
    expect(posts[1].slug).toBe("local-only");
    expect(posts[1].source).toBe("local");
  });
});
