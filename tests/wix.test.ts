import { afterEach, describe, expect, it, vi } from "vitest";

const originalWixApiKey = process.env.WIX_API_KEY;
const originalWixSiteId = process.env.WIX_SITE_ID;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();

  if (originalWixApiKey === undefined) {
    delete process.env.WIX_API_KEY;
  } else {
    process.env.WIX_API_KEY = originalWixApiKey;
  }

  if (originalWixSiteId === undefined) {
    delete process.env.WIX_SITE_ID;
  } else {
    process.env.WIX_SITE_ID = originalWixSiteId;
  }
});

describe("wix blog helpers", () => {
  it("skips the network when Wix credentials are missing", async () => {
    delete process.env.WIX_API_KEY;
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);

    const { getWixBlogPostBySlug } = await import("@/src/lib/wix");

    await expect(getWixBlogPostBySlug("astro-routing")).resolves.toEqual({
      status: "missing_credentials",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a not-found state for unknown slugs", async () => {
    process.env.WIX_API_KEY = "test-key";
    process.env.WIX_SITE_ID = "test-site-id";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 404 }));

    vi.stubGlobal("fetch", fetchMock);

    const { getWixBlogPostBySlug } = await import("@/src/lib/wix");

    await expect(getWixBlogPostBySlug("missing post")).resolves.toEqual({
      status: "not_found",
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit & {
        next?: {
          revalidate?: number;
        };
      },
    ];

    expect(requestUrl).toBe(
      "https://www.wixapis.com/v3/posts/slugs/missing%20post",
    );
    expect(requestInit.cache).toBe("force-cache");
    expect(requestInit.next?.revalidate).toBe(1800);
    expect((requestInit.headers as Headers).get("Authorization")).toBe(
      "test-key",
    );
    expect((requestInit.headers as Headers).get("wix-site-id")).toBe(
      "test-site-id",
    );
  });

  it("returns the Wix post payload when the slug exists", async () => {
    process.env.WIX_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          post: {
            id: "post-1",
            title: "Astro caching notes",
            excerpt: "Cached fetches in Astro on Vercel.",
            slug: "astro-caching-notes",
            contentText: "First paragraph.\n\nSecond paragraph.",
            url: {
              base: "https://example.com",
              path: "/blog/post/astro-caching-notes",
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { getWixBlogPostBySlug } = await import("@/src/lib/wix");

    await expect(getWixBlogPostBySlug("astro-caching-notes")).resolves.toEqual(
      expect.objectContaining({
        status: "ok",
        post: expect.objectContaining({
          id: "post-1",
          title: "Astro caching notes",
          slug: "astro-caching-notes",
        }),
      }),
    );
  });

  it("normalizes Wix body text into readable paragraphs", async () => {
    const {
      getWixBlogDescription,
      getWixBlogHref,
      getWixBlogLocalPath,
      getWixBlogParagraphs,
      getWixBlogSlug,
      getWixBlogSourceUrl,
    } = await import("@/src/lib/wix");

    expect(
      getWixBlogParagraphs("First line\nstill first line\n\nSecond paragraph"),
    ).toEqual(["First line still first line", "Second paragraph"]);
    expect(
      getWixBlogDescription({
        excerpt: "",
        contentText: "First paragraph.\n\nSecond paragraph.",
      }),
    ).toBe("First paragraph.");
    expect(
      getWixBlogSourceUrl({
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      }),
    ).toBe("https://example.com/blog/post/astro-caching-notes");
    expect(
      getWixBlogSlug({
        slug: "astro-caching-notes",
        url: {
          base: "https://example.com",
          path: "/blog/post/ignored",
        },
      }),
    ).toBe("astro-caching-notes");
    expect(
      getWixBlogLocalPath({
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      }),
    ).toBe("/blog/astro-caching-notes");
    expect(
      getWixBlogHref({
        url: {
          base: "https://example.com",
          path: "/blog/post/astro-caching-notes",
        },
      }),
    ).toBe("/blog/astro-caching-notes");
    expect(
      getWixBlogHref({
        url: {
          base: "https://example.com",
          path: "/blog",
        },
      }),
    ).toBe("https://example.com/blog");
  });
});
