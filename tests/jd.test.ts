import { describe, expect, it } from "vitest";

import {
  analyzeJobDescription,
  buildResumeVariantFromJobDescription,
} from "@/lib/jd";

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
