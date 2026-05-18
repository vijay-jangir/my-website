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
