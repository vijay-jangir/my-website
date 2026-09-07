import { describe, expect, it } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import {
  buildResumeVariant,
  parseFocusIds,
  parseFocusIdsInContent,
  searchProjects,
} from "@/lib/portfolio";
import type { FocusDefinition } from "@/lib/portfolio-types";

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
    expect(variant.projects[0]?.id).toBe(
      "point-of-interest-proximity-streaming",
    );
    expect(variant.primarySkills.some((skill) => skill.id === "flink")).toBe(
      true,
    );
  });

  it("filters query search to lexical project matches", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "portfolio nextjs wix",
    });

    expect(projects.map((project) => project.id)).toEqual([
      "portfolio-website",
    ]);
  });

  it("returns no projects for a query with no lexical matches", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "not-a-real-project-term",
    });

    expect(projects).toEqual([]);
  });

  it("prioritizes focus alignment within query matches", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "kafka",
    });

    expect(projects[0]?.id).toBe("point-of-interest-proximity-streaming");
    expect(projects.map((project) => project.id)).toEqual([
      "point-of-interest-proximity-streaming",
      "telecom-network-datalake",
      "observability",
    ]);
  });
});

describe("content-aware focus parsing", () => {
  const extraFocus: FocusDefinition = {
    id: "custom-focus",
    label: "Custom",
    shortLabel: "Custom",
    category: "domain",
    headline: "h",
    summary: "s",
    description: "d",
    aliases: [],
    relatedSkillIds: [],
  };

  it("accepts focuses that exist in live content beyond the fallback set", () => {
    const content = {
      ...fallbackPortfolioSnapshot,
      focusDefinitions: [
        ...fallbackPortfolioSnapshot.focusDefinitions,
        extraFocus,
      ],
    };

    expect(parseFocusIdsInContent(content, "ai,custom-focus,bogus")).toEqual([
      "ai",
      "custom-focus",
    ]);
  });

  it("dedupes, trims, and caps at three like the fallback parser", () => {
    expect(
      parseFocusIdsInContent(
        fallbackPortfolioSnapshot,
        " ai, ai,flink,kafka,x ",
      ),
    ).toEqual(["ai", "flink", "kafka"]);
  });

  it("seeds resume focus presets in bundled content", () => {
    expect(fallbackPortfolioSnapshot.focusPresets).toEqual([
      {
        id: "backend-platform",
        label: "Backend platform",
        description:
          "Service ownership, data APIs, and production reliability.",
        focusIds: ["backend-engineering", "platform-engineering"],
        sortOrder: 0,
      },
      {
        id: "data-platform",
        label: "Data platform",
        description: "Pipelines, mesh foundations, streaming, and governance.",
        focusIds: ["data-platform", "kafka", "flink"],
        sortOrder: 1,
      },
      {
        id: "ai-data-products",
        label: "AI data products",
        description:
          "Governed agents, text-to-data, visualization, and Python.",
        focusIds: ["ai", "agentic-development", "python"],
        sortOrder: 2,
      },
    ]);
  });
});
