import { describe, expect, it } from "vitest";

import {
  buildResumeVariant,
  parseFocusIds,
  searchProjects,
} from "@/lib/portfolio";

describe("portfolio focus utilities", () => {
  it("parses focus ids, deduplicates them, and caps the selection", () => {
    expect(parseFocusIds("ai,flink,ai,backend-engineering,kafka")).toEqual([
      "ai",
      "flink",
      "backend-engineering",
    ]);
  });

  it("builds a focused resume variant that prioritizes matching projects", () => {
    const variant = buildResumeVariant({
      focusIds: ["flink"],
    });

    expect(variant.focusIds).toEqual(["flink"]);
    expect(variant.projects[0]?.id).toBe("context-aware-rule-engine");
    expect(variant.primarySkills.some((skill) => skill.id === "flink")).toBe(
      true,
    );
  });

  it("prefers the portfolio project for portfolio-specific search terms", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "portfolio nextjs wix",
    });

    expect(projects[0]?.id).toBe("portfolio-website");
  });

  it("searches projects using both focus alignment and lexical matches", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "portfolio website",
    });

    expect(projects[0]?.id).toBe("portfolio-website");
  });
});
