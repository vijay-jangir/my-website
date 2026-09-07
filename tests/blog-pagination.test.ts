import { describe, expect, it, vi } from "vitest";

import type { BlogPost } from "@/lib/blog";

vi.mock("astro:content", () => ({ getCollection: vi.fn() }));

const { paginateBlogPosts } = await import("@/lib/blog");

function makePosts(count: number): BlogPost[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `post-${i + 1}`,
    title: `Post ${i + 1}`,
    description: `Description for post ${i + 1}.`,
    publishedAt: new Date(`2026-01-${String(count - i).padStart(2, "0")}`),
    source: "local" as const,
  }));
}

describe("paginateBlogPosts", () => {
  it("returns all posts on page 1 when total <= perPage", () => {
    const posts = makePosts(5);
    const result = paginateBlogPosts(posts, 1);

    expect(result.posts).toHaveLength(5);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("paginates 25 posts into 3 pages at 12 per page", () => {
    const posts = makePosts(25);

    const page1 = paginateBlogPosts(posts, 1);
    expect(page1.posts).toHaveLength(12);
    expect(page1.page).toBe(1);
    expect(page1.totalPages).toBe(3);
    expect(page1.hasPrev).toBe(false);
    expect(page1.hasNext).toBe(true);
    expect(page1.posts[0].slug).toBe("post-1");
    expect(page1.posts[11].slug).toBe("post-12");

    const page2 = paginateBlogPosts(posts, 2);
    expect(page2.posts).toHaveLength(12);
    expect(page2.page).toBe(2);
    expect(page2.hasPrev).toBe(true);
    expect(page2.hasNext).toBe(true);
    expect(page2.posts[0].slug).toBe("post-13");

    const page3 = paginateBlogPosts(posts, 3);
    expect(page3.posts).toHaveLength(1);
    expect(page3.page).toBe(3);
    expect(page3.hasPrev).toBe(true);
    expect(page3.hasNext).toBe(false);
    expect(page3.posts[0].slug).toBe("post-25");
  });

  it("clamps page number above totalPages to last page", () => {
    const posts = makePosts(5);
    const result = paginateBlogPosts(posts, 999);

    expect(result.page).toBe(1);
    expect(result.posts).toHaveLength(5);
  });

  it("clamps page number below 1 to page 1", () => {
    const posts = makePosts(25);
    const result = paginateBlogPosts(posts, 0);

    expect(result.page).toBe(1);
    expect(result.posts).toHaveLength(12);
  });

  it("handles empty posts list", () => {
    const result = paginateBlogPosts([], 1);

    expect(result.posts).toHaveLength(0);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("respects custom perPage", () => {
    const posts = makePosts(10);
    const result = paginateBlogPosts(posts, 1, 3);

    expect(result.posts).toHaveLength(3);
    expect(result.totalPages).toBe(4);
    expect(result.hasNext).toBe(true);
  });

  it("exactly 12 posts produce 1 page with no pagination controls needed", () => {
    const posts = makePosts(12);
    const result = paginateBlogPosts(posts, 1);

    expect(result.posts).toHaveLength(12);
    expect(result.totalPages).toBe(1);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("13 posts produce 2 pages", () => {
    const posts = makePosts(13);

    const page1 = paginateBlogPosts(posts, 1);
    expect(page1.posts).toHaveLength(12);
    expect(page1.totalPages).toBe(2);
    expect(page1.hasNext).toBe(true);

    const page2 = paginateBlogPosts(posts, 2);
    expect(page2.posts).toHaveLength(1);
    expect(page2.hasNext).toBe(false);
  });
});
