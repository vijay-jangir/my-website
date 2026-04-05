import type { APIRoute } from "astro";

export const prerender = true;

const disallowedPaths = ["/admin", "/assistant", "/api"];

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://www.vijayjangir.com");
  const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
  const body = [
    "User-agent: *",
    "Allow: /",
    ...disallowedPaths.map((path) => `Disallow: ${path}`),
    `Sitemap: ${sitemapUrl}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
