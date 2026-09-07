import { getCollection } from "astro:content";

import { getWixBlogsResult, getWixBlogSlug } from "@/src/lib/wix";

export type BlogPost = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly publishedAt: Date;
  readonly updatedAt?: Date;
  readonly source: "wix" | "local";
  readonly contentText?: string;
  readonly readTime?: number;
  readonly canonicalUrl?: string;
};

export async function getLocalBlogPosts(): Promise<readonly BlogPost[]> {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return entries.map((entry) => ({
    slug: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
    source: "local" as const,
    canonicalUrl: entry.data.canonicalUrl,
  }));
}

export async function getWixBlogPostsAsUnified(): Promise<
  readonly BlogPost[]
> {
  const result = await getWixBlogsResult();
  if (result.status !== "ok") return [];

  return result.posts.flatMap((post) => {
    const slug = getWixBlogSlug(post);
    if (!slug) return [];
    return [
      {
        slug,
        title: post.title,
        description: post.excerpt,
        publishedAt: new Date(post.firstPublishedDate ?? 0),
        source: "wix" as const,
        contentText: post.contentText,
        readTime: post.minutesToRead,
      },
    ];
  });
}

/** Pure merge: local wins on slug collision, sorted by publishedAt descending. */
export function mergeBlogPosts(
  local: readonly BlogPost[],
  wix: readonly BlogPost[],
): BlogPost[] {
  const localSlugs = new Set(local.map((p) => p.slug));
  const deduped = [...local, ...wix.filter((p) => !localSlugs.has(p.slug))];
  return deduped.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
}

/** Fetches from both sources, merges, and degrades to local-only on Wix failure. */
export async function getUnifiedBlogPosts(): Promise<BlogPost[]> {
  const local = await getLocalBlogPosts();

  let wix: readonly BlogPost[] = [];
  try {
    wix = await getWixBlogPostsAsUnified();
  } catch (error) {
    console.warn("[blog] Wix fetch failed, degrading to local-only:", error);
  }

  return mergeBlogPosts(local, wix);
}

export type PaginatedBlogPosts = {
  readonly posts: readonly BlogPost[];
  readonly page: number;
  readonly totalPages: number;
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
};

const DEFAULT_PER_PAGE = 12;

/** Pure pagination over a pre-sorted post list. Page is 1-indexed. */
export function paginateBlogPosts(
  allPosts: readonly BlogPost[],
  page: number,
  perPage: number = DEFAULT_PER_PAGE,
): PaginatedBlogPosts {
  const safePage = Math.max(1, Math.floor(page));
  const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage));
  const clampedPage = Math.min(safePage, totalPages);
  const start = (clampedPage - 1) * perPage;
  const posts = allPosts.slice(start, start + perPage);

  return {
    posts,
    page: clampedPage,
    totalPages,
    hasPrev: clampedPage > 1,
    hasNext: clampedPage < totalPages,
  };
}
