import { describe, expect, it } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import {
  analyzeJobDescription,
  analyzeJobDescriptionWithContent,
  buildResumeVariantFromJobDescription,
} from "@/lib/jd";
import type { SkillDefinition } from "@/lib/portfolio-types";

describe("job description parser", () => {
  it("weights required sections above preferred sections", () => {
    const analysis = analyzeJobDescription(`
Title
Senior Backend Engineer

Required
Strong Python, FastAPI, and Kafka experience.
Must have backend engineering experience with APIs and production systems.

Preferred
Exposure to Flink is a plus.
`);

    const backendFocus = analysis.focusScores.find(
      (focus) => focus.focusId === "backend-engineering",
    );
    const flinkFocus = analysis.focusScores.find(
      (focus) => focus.focusId === "flink",
    );
    const pythonSkill = analysis.skillScores.find(
      (skill) => skill.skillId === "python",
    );
    const flinkSkill = analysis.skillScores.find(
      (skill) => skill.skillId === "flink",
    );

    expect(backendFocus?.score ?? 0).toBeGreaterThan(flinkFocus?.score ?? 0);
    expect(pythonSkill?.score ?? 0).toBeGreaterThan(flinkSkill?.score ?? 0);
  });

  it("merges focus overrides with extracted focus areas when building a resume variant", () => {
    const result = buildResumeVariantFromJobDescription({
      rawText: `
Title
AI Platform Engineer

Required
Python, FastAPI, agents, vector search, and backend engineering.
`,
      focusOverride: "flink",
    });

    expect(result.variant.focusIds).toContain("flink");
    expect(result.variant.focusIds).toContain("ai");
    expect(result.variant.primarySkills.length).toBeGreaterThan(0);
  });
});

describe("alias boundary matching", () => {
  const symbolSkill: SkillDefinition = {
    id: "test-cpp",
    label: "C++",
    category: "language",
    aliases: ["c++", "cpp"],
    focusWeights: { general: 0.5 },
  };

  it("matches aliases with non-word characters like c++", () => {
    const content = {
      ...fallbackPortfolioSnapshot,
      skillDefinitions: [symbolSkill],
      focusDefinitions: fallbackPortfolioSnapshot.focusDefinitions.filter(
        (focus) => focus.id === "general",
      ),
    };

    const analysis = analyzeJobDescriptionWithContent(
      content,
      `
Required
Deep experience with C++ performance work.
`,
    );

    expect(analysis.skillScores[0]?.matchedAliases).toContain("c++");
  });

  it("does not match aliases embedded inside larger tokens", () => {
    const analysis = analyzeJobDescriptionWithContent(
      { ...fallbackPortfolioSnapshot, skillDefinitions: [symbolSkill] },
      "Required\nExperience with abc++ tooling is required.",
    );

    expect(analysis.skillScores).toEqual([]);
  });
});
