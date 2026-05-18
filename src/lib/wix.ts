import { env } from "@/lib/env";

const WIX_POSTS_API_URL = "https://www.wixapis.com/v3/posts";
const WIX_BLOG_REVALIDATE_SECONDS = 60 * 30;

export type WixBlogPost = {
  id: string;
  title: string;
  excerpt: string;
  slug?: string;
  contentText?: string;
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

type WixRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
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
const WIX_BLOG_DETAIL_FIELDSETS = new URLSearchParams([
  ["fieldsets", "URL"],
  ["fieldsets", "CONTENT_TEXT"],
]);

function hasWixBlogCredentials() {
  return Boolean(env.wixApiKey);
}

function buildWixRequestInit(init: WixRequestInit = {}): WixRequestInit {
  const headers = new Headers(init.headers);

  headers.set("Authorization", env.wixApiKey ?? "");
  headers.set("wix-site-id", env.wixSiteId);
  headers.set("Content-Type", "application/json");

  return {
    cache: "force-cache",
    ...init,
    headers,
    next: {
      revalidate: WIX_BLOG_REVALIDATE_SECONDS,
      ...init.next,
    },
  };
}

async function wixFetch<T>(
  path: string,
  init?: WixRequestInit,
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
  } catch {
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
