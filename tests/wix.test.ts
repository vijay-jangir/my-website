import { afterEach, describe, expect, it, vi, type MockInstance } from "vitest";

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

    const { getWixBlogPostBySlug, getWixBlogsResult } =
      await import("@/src/lib/wix");

    await expect(getWixBlogPostBySlug("astro-routing")).resolves.toEqual({
      status: "missing_credentials",
    });
    await expect(getWixBlogsResult()).resolves.toEqual({
      posts: [],
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
      RequestInit,
    ];

    expect(requestUrl).toContain(
      "https://www.wixapis.com/v3/posts/slugs/missing%20post?",
    );
    const requestParams = new URL(requestUrl).searchParams;
    expect(requestParams.getAll("fieldsets")).toEqual(["URL", "CONTENT_TEXT", "CONTENT"]);
    // Astro/Vercel functions ignore Next.js fetch cache options; caching is
    // handled by response headers instead. Requests must carry a timeout.
    expect(
      "cache" in requestInit ? requestInit.cache : undefined,
    ).toBeUndefined();
    expect(
      "next" in requestInit ? requestInit.next : undefined,
    ).toBeUndefined();
    expect(requestInit.signal).toBeInstanceOf(AbortSignal);
    expect((requestInit.headers as Headers).get("Authorization")).toBe(
      "test-key",
    );
    expect((requestInit.headers as Headers).get("wix-site-id")).toBe(
      "test-site-id",
    );
  });

  it("returns the Wix post list payload with local slugs", async () => {
    process.env.WIX_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          posts: [
            {
              id: "post-older",
              title: "Older note",
              excerpt: "Older excerpt.",
              firstPublishedDate: "2023-01-01T00:00:00.000Z",
              slug: "older-note",
              url: {
                base: "https://example.com",
                path: "/post/older-note",
              },
            },
            {
              id: "post-newer",
              title: "Newer note",
              excerpt: "Newer excerpt.",
              firstPublishedDate: "2024-01-01T00:00:00.000Z",
              slug: "newer-note",
              url: {
                base: "https://example.com",
                path: "/post/newer-note",
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { getWixBlogHref, getWixBlogsResult } = await import("@/src/lib/wix");

    const result = await getWixBlogsResult();

    expect(result.status).toBe("ok");
    expect(result.posts.map((post) => post.id)).toEqual([
      "post-newer",
      "post-older",
    ]);
    expect(getWixBlogHref(result.posts[0])).toBe("/blog/newer-note");
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

describe("renderRichContent", () => {
  it("renders code blocks, images, and links to proper HTML elements", async () => {
    const { renderRichContent } = await import("@/src/lib/wix");

    const richContent = {
      nodes: [
        {
          type: "PARAGRAPH",
          nodes: [
            {
              type: "TEXT",
              textData: {
                text: "Hello ",
                decorations: [],
              },
            },
            {
              type: "TEXT",
              textData: {
                text: "world",
                decorations: [
                  { type: "BOLD" },
                  {
                    type: "LINK",
                    linkData: { link: { url: "https://example.com" } },
                  },
                ],
              },
            },
          ],
        },
        {
          type: "HEADING",
          headingData: { level: 3 },
          nodes: [
            { type: "TEXT", textData: { text: "Code Example" } },
          ],
        },
        {
          type: "CODE_BLOCK",
          codeBlockData: { language: "typescript" },
          nodes: [
            { type: "TEXT", textData: { text: "const x = 1;" } },
          ],
        },
        {
          type: "IMAGE",
          imageData: {
            image: { src: { url: "https://static.example.com/photo.jpg" } },
            altText: "A photo",
          },
        },
        {
          type: "BULLETED_LIST",
          nodes: [
            {
              type: "LIST_ITEM",
              nodes: [
                {
                  type: "PARAGRAPH",
                  nodes: [
                    { type: "TEXT", textData: { text: "Item one" } },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "BLOCKQUOTE",
          nodes: [
            {
              type: "PARAGRAPH",
              nodes: [
                {
                  type: "TEXT",
                  textData: {
                    text: "Quoted text",
                    decorations: [{ type: "ITALIC" }],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const html = renderRichContent(richContent);

    expect(html).toContain("<p>Hello ");
    expect(html).toContain(
      '<a href="https://example.com" rel="noopener noreferrer"><strong>world</strong></a>',
    );
    expect(html).toContain("<h3>Code Example</h3>");
    expect(html).toContain(
      '<pre><code class="language-typescript">const x = 1;</code></pre>',
    );
    expect(html).toContain(
      '<img src="https://static.example.com/photo.jpg" alt="A photo" loading="lazy" />',
    );
    expect(html).toContain("<ul><li><p>Item one</p></li></ul>");
    expect(html).toContain(
      "<blockquote><p><em>Quoted text</em></p></blockquote>",
    );
  });

  it("renders unknown node types with extracted text and logs a warning", async () => {
    const { renderRichContent } = await import("@/src/lib/wix");
    const warnSpy: MockInstance = vi.spyOn(console, "warn").mockImplementation(() => {});

    const richContent = {
      nodes: [
        {
          type: "FANCY_WIDGET",
          nodes: [
            { type: "TEXT", textData: { text: "Widget fallback" } },
          ],
        },
      ],
    };

    const html = renderRichContent(richContent);

    expect(html).toContain("Widget fallback");
    expect(html).toContain("<p>");
    expect(warnSpy).toHaveBeenCalledWith(
      "[wix] Unknown rich-content node type: FANCY_WIDGET",
    );

    warnSpy.mockRestore();
  });

  it("HTML-escapes text content to prevent injection", async () => {
    const { renderRichContent } = await import("@/src/lib/wix");

    const richContent = {
      nodes: [
        {
          type: "PARAGRAPH",
          nodes: [
            {
              type: "TEXT",
              textData: { text: '<script>alert("xss")</script>' },
            },
          ],
        },
      ],
    };

    const html = renderRichContent(richContent);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;/script&gt;");
  });

  it("returns empty string when richContent is absent or invalid", async () => {
    const { renderRichContent } = await import("@/src/lib/wix");

    expect(renderRichContent(undefined)).toBe("");
    expect(renderRichContent(null)).toBe("");
    expect(renderRichContent({})).toBe("");
    expect(renderRichContent({ nodes: "not-array" })).toBe("");
  });

  it("falls back to paragraph split when richContent is unavailable", async () => {
    const { getWixBlogParagraphs, renderRichContent } = await import(
      "@/src/lib/wix"
    );

    const richHtml = renderRichContent(undefined);
    const paragraphs = getWixBlogParagraphs(
      "First paragraph.\n\nSecond paragraph.",
    );

    expect(richHtml).toBe("");
    expect(paragraphs).toEqual(["First paragraph.", "Second paragraph."]);
  });
});
