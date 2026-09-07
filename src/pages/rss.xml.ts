import type { APIRoute } from "astro";

import type { BlogPost } from "@/lib/blog";
import { getUnifiedBlogPosts } from "@/lib/blog";
import { escapeXml } from "@/src/lib/xml";

export const prerender = false;

const FALLBACK_BASE_URL = "https://vijayjangir.com";

function buildRssChannel(
  baseUrl: URL,
  items: string[],
  mostRecentPost: Date | null,
) {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `  <channel>`,
    `    <title>Vijay Jangir — Blog</title>`,
    `    <link>${escapeXml(new URL("/blog", baseUrl).toString())}</link>`,
    `    <description>Technical posts and architecture notes on governed data platforms, enterprise AI, streaming, and platform engineering.</description>`,
    `    <language>en-us</language>`,
    `    <lastBuildDate>${(mostRecentPost ?? new Date()).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(new URL("/rss.xml", baseUrl).toString())}" rel="self" type="application/rss+xml" />`,
    ...items,
    `  </channel>`,
    `</rss>`,
    ``,
  ].join("\n");
}

export function buildRssItems(
  posts: readonly BlogPost[],
  baseUrl: URL,
): string[] {
  return posts.map((post) => {
    const localPath = `/blog/${encodeURIComponent(post.slug)}`;
    const localLink = new URL(localPath, baseUrl).toString();
    const guidLink = post.canonicalUrl ?? localLink;
    const title = escapeXml(post.title);
    const description = escapeXml(post.description);
    const pubDateTag =
      post.publishedAt && !Number.isNaN(post.publishedAt.getTime())
        ? `\n      <pubDate>${post.publishedAt.toUTCString()}</pubDate>`
        : "";

    return [
      `    <item>`,
      `      <title>${title}</title>`,
      `      <link>${escapeXml(guidLink)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(guidLink)}</guid>`,
      `      <description>${description}</description>${pubDateTag}`,
      `    </item>`,
    ].join("\n");
  });
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(FALLBACK_BASE_URL);
  const posts = await getUnifiedBlogPosts();
  const items = buildRssItems(posts, baseUrl);
  const mostRecentPost = posts
    .map((post) => post.publishedAt)
    .filter(
      (date): date is Date =>
        date instanceof Date && !Number.isNaN(date.getTime()),
    )
    .sort((left, right) => right.getTime() - left.getTime())[0];

  return new Response(buildRssChannel(baseUrl, items, mostRecentPost ?? null), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=1800",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
