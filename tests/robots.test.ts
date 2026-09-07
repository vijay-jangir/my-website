import { describe, expect, it } from "vitest";

import { buildRobotsTxt } from "@/src/pages/robots.txt";

describe("buildRobotsTxt", () => {
  const baseUrl = new URL("https://vijayjangir.com");
  const body = buildRobotsTxt(baseUrl);
  const lines = body.split("\n");
  const userAgentBlocks = body
    .split("\n\n")
    .map((block) => block.split("\n"))
    .filter((block) => block[0]?.startsWith("User-agent: "));
  const privatePathDisallows = [
    "Disallow: /admin",
    "Disallow: /assistant",
    "Disallow: /api",
  ] as const;

  it("starts with the crawl policy comments", () => {
    expect(lines[0]).toBe("# vijayjangir.com crawl policy");
    expect(lines[1]).toBe(
      "# Search and answer engines may crawl all public paths.",
    );
    expect(lines[2]).toBe("# Private app surfaces are disallowed below.");
  });

  it("keeps the wildcard block semantics", () => {
    const wildcardIndex = lines.indexOf("User-agent: *");

    expect(wildcardIndex).toBeGreaterThan(0);
    expect(lines[wildcardIndex + 1]).toBe("Allow: /");
    expect(lines.slice(wildcardIndex + 2, wildcardIndex + 5)).toEqual(
      privatePathDisallows,
    );
  });

  it("disallows private paths in every emitted user-agent group", () => {
    expect(userAgentBlocks.length).toBeGreaterThan(0);

    for (const block of userAgentBlocks) {
      const [userAgentLine, allowLine, ...disallowLines] = block;

      expect(userAgentLine).toMatch(/^User-agent: /);
      expect(allowLine, userAgentLine).toBe("Allow: /");
      expect(disallowLines, userAgentLine).toEqual(privatePathDisallows);
    }
  });

  it("ends with the sitemap reference on the canonical host", () => {
    expect(lines[lines.length - 1]).toBe(
      "Sitemap: https://vijayjangir.com/sitemap.xml",
    );
  });
});
