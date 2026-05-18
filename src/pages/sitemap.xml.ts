import type { APIRoute } from "astro";

import {
  getWixBlogLocalPath,
  getWixBlogs,
  type WixBlogPost,
} from "@/src/lib/wix";

export const prerender = false;

const publicRoutes = ["/", "/projects", "/resume", "/blog"];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export function buildSitemapRoutes(
  posts: readonly Pick<WixBlogPost, "slug" | "url">[] = [],
  projectSlugs: readonly string[] = [],
) {
  const blogRoutes = posts
    .map((post) => getWixBlogLocalPath(post))
    .filter((route): route is string => Boolean(route));
  const projectRoutes = projectSlugs.map((slug) => `/projects/${slug}`);

  return [...new Set([...publicRoutes, ...projectRoutes, ...blogRoutes])];
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://www.vijayjangir.com");
  const { getPortfolioContent } = await import("@/lib/portfolio-content");
  const content = await getPortfolioContent();
  const posts = await getWixBlogs();
  const publicProjectSlugs = content.projects
    .filter((project) => project.visibility === "public")
    .map((project) => project.slug);
  const urlEntries = buildSitemapRoutes(posts, publicProjectSlugs)
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
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
