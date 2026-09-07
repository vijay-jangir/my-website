import { env } from "@/lib/env";

const WIX_POSTS_API_URL = "https://www.wixapis.com/v3/posts";
const WIX_FETCH_TIMEOUT_MS = 8000;

export type WixRichContentNode = {
  readonly type: string;
  readonly nodes?: readonly WixRichContentNode[];
  readonly headingData?: { readonly level: number };
  readonly codeBlockData?: { readonly language?: string };
  readonly imageData?: {
    readonly image?: { readonly src?: { readonly url?: string } };
    readonly altText?: string;
  };
  readonly textData?: { readonly text?: string; readonly decorations?: readonly WixTextDecoration[] };
  readonly linkData?: { readonly link?: { readonly url?: string } };
  readonly bulletListData?: Record<string, unknown>;
  readonly orderedListData?: Record<string, unknown>;
  readonly blockquoteData?: Record<string, unknown>;
};

export type WixTextDecoration = {
  readonly type: string;
  readonly linkData?: { readonly link?: { readonly url?: string } };
};

export type WixRichContent = {
  readonly nodes: readonly WixRichContentNode[];
};

export type WixBlogPost = {
  id: string;
  title: string;
  excerpt: string;
  slug?: string;
  contentText?: string;
  richContent?: WixRichContent;
  firstPublishedDate?: string;
  lastPublishedDate?: string;
  minutesToRead?: number;
  url: {
    base: string;
    path: string;
  };
};

type WixPostsResponse = {
  posts?: WixBlogPost[];
};

type WixPostResponse = {
  post?: WixBlogPost;
};

type WixFetchResult<T> =
  | {
      status: "ok";
      data: T;
    }
  | {
      status: "missing_credentials" | "not_found" | "error";
    };

export type WixBlogListResult =
  | {
      status: "ok";
      posts: WixBlogPost[];
    }
  | {
      status: "missing_credentials" | "error";
      posts: [];
    };

export type WixBlogPostLookupResult =
  | {
      status: "ok";
      post: WixBlogPost;
    }
  | {
      status: "missing_credentials" | "not_found" | "error";
    };

export const WIX_BLOG_DETAIL_CACHE_CONTROL =
  "public, s-maxage=1800, stale-while-revalidate=86400";
export const PORTFOLIO_PAGE_CACHE_CONTROL =
  "public, s-maxage=600, stale-while-revalidate=86400";
const WIX_BLOG_DETAIL_FIELDSETS = new URLSearchParams([
  ["fieldsets", "URL"],
  ["fieldsets", "CONTENT_TEXT"],
  ["fieldsets", "CONTENT"],
]);

function hasWixBlogCredentials() {
  return Boolean(env.wixApiKey);
}

function buildWixRequestInit(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);

  headers.set("Authorization", env.wixApiKey ?? "");
  headers.set("wix-site-id", env.wixSiteId);
  headers.set("Content-Type", "application/json");

  return {
    ...init,
    headers,
    signal: AbortSignal.timeout(WIX_FETCH_TIMEOUT_MS),
  };
}

async function wixFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<WixFetchResult<T>> {
  if (!hasWixBlogCredentials()) {
    return { status: "missing_credentials" };
  }

  try {
    const response = await fetch(
      `${WIX_POSTS_API_URL}${path}`,
      buildWixRequestInit(init),
    );

    if (response.status === 404) {
      return { status: "not_found" };
    }

    if (!response.ok) {
      return { status: "error" };
    }

    return {
      status: "ok",
      data: (await response.json()) as T,
    };
  } catch (error) {
    console.warn("[wix] Fetch failed:", error);
    return { status: "error" };
  }
}

export async function getWixBlogsResult(): Promise<WixBlogListResult> {
  const result = await wixFetch<WixPostsResponse>("/query", {
    method: "POST",
    body: JSON.stringify({
      fieldsets: ["URL"],
      query: {
        paging: {
          limit: 20,
        },
        sort: [
          {
            fieldName: "firstPublishedDate",
            order: "DESC",
          },
        ],
      },
    }),
  });

  if (result.status !== "ok") {
    return {
      status: result.status === "missing_credentials" ? result.status : "error",
      posts: [],
    };
  }

  return {
    status: "ok",
    posts: [...(result.data.posts ?? [])].sort((left, right) => {
      const rightDate = new Date(right.firstPublishedDate ?? 0).getTime();
      const leftDate = new Date(left.firstPublishedDate ?? 0).getTime();
      return rightDate - leftDate;
    }),
  };
}

export async function getWixBlogs() {
  return (await getWixBlogsResult()).posts;
}

export async function getWixBlogPostBySlug(
  slug: string,
): Promise<WixBlogPostLookupResult> {
  const result = await wixFetch<WixPostResponse>(
    `/slugs/${encodeURIComponent(slug)}?${WIX_BLOG_DETAIL_FIELDSETS.toString()}`,
  );

  if (result.status !== "ok") {
    return result;
  }

  if (!result.data.post) {
    return { status: "not_found" };
  }

  return {
    status: "ok",
    post: result.data.post,
  };
}

export function getWixBlogParagraphs(contentText?: string) {
  return (contentText ?? "")
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .replace(/\s*\n\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

export function getWixBlogDescription(
  post?: Pick<WixBlogPost, "excerpt" | "contentText"> | null,
) {
  const excerpt = post?.excerpt?.trim();

  if (excerpt) {
    return excerpt;
  }

  return (
    getWixBlogParagraphs(post?.contentText)[0] ??
    "Read this post on Vijay Jangir's main site."
  );
}

export function getWixBlogSlug(post: Pick<WixBlogPost, "slug" | "url">) {
  const explicitSlug = post.slug?.trim();

  if (explicitSlug) {
    return explicitSlug;
  }

  const rawPath = post.url.path.split(/[?#]/, 1)[0]?.replace(/\/+$/, "");

  if (!rawPath) {
    return null;
  }

  const segments = rawPath.split("/").filter(Boolean);
  const fallbackSlug = segments.at(-1);

  if (!fallbackSlug || fallbackSlug === "blog" || fallbackSlug === "post") {
    return null;
  }

  return decodeURIComponent(fallbackSlug);
}

export function getWixBlogLocalPath(post: Pick<WixBlogPost, "slug" | "url">) {
  const slug = getWixBlogSlug(post);

  if (!slug) {
    return null;
  }

  return `/blog/${encodeURIComponent(slug)}`;
}

export function getWixBlogSourceUrl(post: Pick<WixBlogPost, "url">) {
  return `${post.url.base}${post.url.path}`;
}

export function getWixBlogHref(post: Pick<WixBlogPost, "slug" | "url">) {
  return getWixBlogLocalPath(post) ?? getWixBlogSourceUrl(post);
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

function renderTextNode(node: WixRichContentNode): string {
  const raw = node.textData?.text ?? "";
  let html = escapeHtml(raw);

  for (const decoration of node.textData?.decorations ?? []) {
    switch (decoration.type) {
      case "BOLD":
        html = `<strong>${html}</strong>`;
        break;
      case "ITALIC":
        html = `<em>${html}</em>`;
        break;
      case "CODE":
        html = `<code>${html}</code>`;
        break;
      case "LINK": {
        const href = decoration.linkData?.link?.url ?? "";
        html = `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${html}</a>`;
        break;
      }
      default:
        break;
    }
  }

  return html;
}

function renderChildren(nodes: readonly WixRichContentNode[]): string {
  return nodes.map((child) => renderNode(child)).join("");
}

function headingTag(level: number): string {
  if (level >= 1 && level <= 6) {
    return `h${level}`;
  }
  return "h2";
}

function renderNode(node: WixRichContentNode): string {
  switch (node.type) {
    case "PARAGRAPH":
      return `<p>${renderChildren(node.nodes ?? [])}</p>`;

    case "HEADING": {
      const tag = headingTag(node.headingData?.level ?? 2);
      return `<${tag}>${renderChildren(node.nodes ?? [])}</${tag}>`;
    }

    case "CODE_BLOCK": {
      const lang = node.codeBlockData?.language;
      const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      return `<pre><code${langAttr}>${renderChildren(node.nodes ?? [])}</code></pre>`;
    }

    case "BULLETED_LIST":
      return `<ul>${renderChildren(node.nodes ?? [])}</ul>`;

    case "ORDERED_LIST":
      return `<ol>${renderChildren(node.nodes ?? [])}</ol>`;

    case "LIST_ITEM":
      return `<li>${renderChildren(node.nodes ?? [])}</li>`;

    case "BLOCKQUOTE":
      return `<blockquote>${renderChildren(node.nodes ?? [])}</blockquote>`;

    case "IMAGE": {
      const src = node.imageData?.image?.src?.url ?? "";
      const alt = node.imageData?.altText ?? "";
      const srcAttr = src.startsWith("wix:image:")
        ? `https://static.wixstatic.com/media/${escapeHtml(src.replace("wix:image://v1/", "").split("/")[0] ?? "")}`
        : escapeHtml(src);
      return `<figure><img src="${srcAttr}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`;
    }

    case "DIVIDER":
      return "<hr />";

    case "TEXT":
      return renderTextNode(node);

    default: {
      console.warn(`[wix] Unknown rich-content node type: ${node.type}`);
      const fallbackText = extractTextFromNodes(node.nodes ?? []);
      return fallbackText ? `<p>${escapeHtml(fallbackText)}</p>` : "";
    }
  }
}

function extractTextFromNodes(nodes: readonly WixRichContentNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === "TEXT") {
        return n.textData?.text ?? "";
      }
      return extractTextFromNodes(n.nodes ?? []);
    })
    .join("");
}

/**
 * Convert Wix rich-content nodes to sanitized HTML.
 * Returns an empty string when richContent is absent or has no nodes.
 */
export function renderRichContent(richContent: unknown): string {
  if (
    !richContent ||
    typeof richContent !== "object" ||
    !("nodes" in richContent) ||
    !Array.isArray((richContent as WixRichContent).nodes)
  ) {
    return "";
  }

  const { nodes } = richContent as WixRichContent;
  return nodes.map((n) => renderNode(n)).join("\n");
}
