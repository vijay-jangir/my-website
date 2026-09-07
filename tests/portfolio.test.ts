import { describe, expect, it } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import {
  buildResumeVariant,
  getExperienceYears,
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

  it("filters projects by focus, excluding those with zero weight on selected focus", () => {
    const projects = searchProjects({ focusIds: ["ai"] });

    expect(projects.length).toBeGreaterThan(0);
    expect(projects.length).toBeLessThan(
      fallbackPortfolioSnapshot.projects.filter(
        (p) => p.visibility === "public",
      ).length,
    );
    for (const project of projects) {
      expect(project.focusWeights.ai ?? 0).toBeGreaterThan(0);
    }
  });

  it("returns all public projects when focus is general", () => {
    const projects = searchProjects({ focusIds: ["general"] });
    const publicCount = fallbackPortfolioSnapshot.projects.filter(
      (p) => p.visibility === "public",
    ).length;

    expect(projects.length).toBe(publicCount);
  });

  it("filters query search to lexical project matches", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "portfolio nextjs wix",
    });

    expect(projects).toEqual([]);
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

  it("computes experience years from the September 2014 career start", () => {
    expect(getExperienceYears(new Date("2026-09-07T00:00:00.000Z").getTime())).toBe(
      12,
    );
    expect(
      fallbackPortfolioSnapshot.profileHighlights.find(
        (highlight) => highlight.id === "experience-years",
      )?.value,
    ).toBe(`${getExperienceYears()}+ years`);
  });

  it("ships explicit AI and governance skill definitions in bundled content", () => {
    expect(
      fallbackPortfolioSnapshot.skillDefinitions
        .filter((skill) =>
          [
            "context-engineering",
            "agent-orchestration",
            "rag",
            "prompt-engineering",
            "genai",
            "opa",
          ].includes(skill.id),
        )
        .map((skill) => skill.label),
    ).toEqual([
      "Context Engineering",
      "Generative AI",
      "Agent Orchestration",
      "RAG",
      "Prompt Engineering",
      "OPA (Open Policy Agent)",
    ]);
  });

  it("keeps the homepage project list focused on client work instead of the site itself", () => {
    expect(
      fallbackPortfolioSnapshot.projects.some(
        (project) => project.id === "portfolio-website",
      ),
    ).toBe(false);
  });

  it("ships a real case study for the access governance platform project", () => {
    const accessGovernancePlatform = fallbackPortfolioSnapshot.projects.find(
      (project) => project.id === "access-governance-platform",
    );

    expect(accessGovernancePlatform?.title).toBe("Access governance platform");
    expect(accessGovernancePlatform?.caseStudy).toMatchObject({
      organization: "Large telecom enterprise",
      role: "Sole architect and lead developer",
      timeframe: "2026",
    });
    expect(accessGovernancePlatform?.caseStudy?.confidentiality).toContain(
      "internal project",
    );
    expect(accessGovernancePlatform?.publicProof).toMatchObject({
      artifacts: expect.any(Array),
      confidentialityNotes: expect.any(Array),
      constraints: expect.any(Array),
      responsibilities: expect.any(Array),
    });
  });
});
