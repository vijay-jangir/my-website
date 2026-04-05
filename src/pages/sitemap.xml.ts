import type { APIRoute } from "astro";

import {
  getWixBlogLocalPath,
  getWixBlogs,
  type WixBlogPost,
} from "@/src/lib/wix";

export const prerender = true;

const publicRoutes = ["/", "/projects", "/resume", "/blog", "/work"];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export function buildSitemapRoutes(
  posts: readonly Pick<WixBlogPost, "slug" | "url">[] = [],
) {
  const blogRoutes = posts
    .map((post) => getWixBlogLocalPath(post))
    .filter((route): route is string => Boolean(route));

  return [...new Set([...publicRoutes, ...blogRoutes])];
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://www.vijayjangir.com");
  const posts = await getWixBlogs();
  const urlEntries = buildSitemapRoutes(posts)
    .map((route) => {
      const loc = escapeXml(new URL(route, baseUrl).toString());

      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlEntries}\n` +
    `</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
