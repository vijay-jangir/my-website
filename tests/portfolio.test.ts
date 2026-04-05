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

  it("searches projects using both focus alignment and lexical matches", () => {
    const projects = searchProjects({
      focusIds: ["backend-engineering"],
      query: "FastAPI portfolio",
    });

    expect(projects[0]?.id).toBe("portfolio-website");
  });
});
