import type { APIRoute } from "astro";

import { escapeXml } from "@/src/lib/xml";
import {
  getWixBlogLocalPath,
  getWixBlogs,
  type WixBlogPost,
} from "@/src/lib/wix";

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
  posts: readonly Pick<
    WixBlogPost,
    "slug" | "url" | "title" | "excerpt" | "firstPublishedDate"
  >[],
  baseUrl: URL,
) {
  return posts
    .map((post) => {
      const path = getWixBlogLocalPath(post);

      if (!path) {
        return null;
      }

      const link = escapeXml(new URL(path, baseUrl).toString());
      const title = escapeXml(post.title);
      const description = escapeXml(post.excerpt ?? "");
      const publishedAt = post.firstPublishedDate
        ? new Date(post.firstPublishedDate)
        : null;
      const pubDateTag =
        publishedAt && !Number.isNaN(publishedAt.getTime())
          ? `\n      <pubDate>${publishedAt.toUTCString()}</pubDate>`
          : "";

      return [
        `    <item>`,
        `      <title>${title}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <description>${description}</description>${pubDateTag}`,
        `    </item>`,
      ].join("\n");
    })
    .filter((item): item is string => item !== null);
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(FALLBACK_BASE_URL);
  const posts = await getWixBlogs();
  const items = buildRssItems(posts, baseUrl);
  const mostRecentPost = posts
    .map((post) =>
      post.firstPublishedDate ? new Date(post.firstPublishedDate) : null,
    )
    .filter((date): date is Date => date !== null)
    .sort((left, right) => right.getTime() - left.getTime())[0];

  return new Response(buildRssChannel(baseUrl, items, mostRecentPost ?? null), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=1800",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
