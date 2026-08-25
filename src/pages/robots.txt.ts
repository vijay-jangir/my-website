import type { APIRoute } from "astro";

export const prerender = true;

const disallowedPaths = ["/admin", "/assistant", "/api"];

const aiCrawlerUserAgents = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
] as const;

const policyComments = [
  "# vijayjangir.com crawl policy",
  "# Search and answer engines may crawl all public paths.",
  "# Private app surfaces are disallowed below.",
];

export function buildRobotsTxt(baseUrl: URL): string {
  const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();

  return [
    ...policyComments,
    "",
    "User-agent: *",
    "Allow: /",
    ...disallowedPaths.map((path) => `Disallow: ${path}`),
    "",
    ...aiCrawlerUserAgents.flatMap((userAgent) => [
      `User-agent: ${userAgent}`,
      "Allow: /",
      "",
    ]),
    `Sitemap: ${sitemapUrl}`,
  ].join("\n");
}

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL("https://vijayjangir.com");

  return new Response(buildRobotsTxt(baseUrl), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
