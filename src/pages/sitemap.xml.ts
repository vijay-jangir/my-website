import type { APIRoute } from "astro";

import { escapeXml } from "@/src/lib/xml";
import {
  getWixBlogLocalPath,
  getWixBlogs,
  type WixBlogPost,
} from "@/src/lib/wix";

export const prerender = false;

const publicRoutes = ["/", "/projects", "/resume", "/blog"];

type SitemapEntry = { loc: string; lastmod?: string };

export function buildSitemapEntries(
  posts: readonly (Pick<WixBlogPost, "slug" | "url"> &
    Partial<
      Pick<WixBlogPost, "firstPublishedDate" | "lastPublishedDate">
    >)[] = [],
  projectSlugs: readonly string[] = [],
): SitemapEntry[] {
  const staticEntries: SitemapEntry[] = publicRoutes.map((route) => ({
    loc: route,
  }));

  const projectEntries: SitemapEntry[] = projectSlugs.map((slug) => ({
    loc: `/projects/${slug}`,
  }));

  const blogEntries = posts
    .map((post): SitemapEntry | null => {
      const route = getWixBlogLocalPath(post);

      if (!route) {
        return null;
      }

      const lastModified =
        post.lastPublishedDate ?? post.firstPublishedDate ?? null;

      return {
        loc: route,
        ...(lastModified
          ? { lastmod: new Date(lastModified).toISOString() }
          : {}),
      };
    })
    .filter((entry): entry is SitemapEntry => entry !== null);

  return [
    ...new Map(
      [...staticEntries, ...projectEntries, ...blogEntries].map((entry) => [
        entry.loc,
        entry,
      ]),
    ).values(),
  ];
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://vijayjangir.com");
  const { getPortfolioContent } = await import("@/lib/portfolio-content");
  const content = await getPortfolioContent();
  const posts = await getWixBlogs();
  const publicProjectSlugs = content.projects
    .filter((project) => project.visibility === "public")
    .map((project) => project.slug);
  const urlEntries = buildSitemapEntries(posts, publicProjectSlugs)
    .map((entry) => {
      const loc = escapeXml(new URL(entry.loc, baseUrl).toString());
      const lastmodTag = entry.lastmod
        ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : "";

      return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n  </url>`;
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
