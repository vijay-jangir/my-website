import { describe, expect, it } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import {
  analyzeJobDescription,
  analyzeJobDescriptionWithContent,
  buildResumeVariantFromJobDescription,
} from "@/lib/jd";
import type {
  FocusDefinition,
  SkillDefinition,
} from "@/lib/portfolio-types";

const generalFocus: FocusDefinition = {
  id: "general",
  label: "Overall profile",
  shortLabel: "General",
  category: "role",
  headline: "Generalist engineer",
  summary: "General engineering work.",
  description: "General engineering work.",
  aliases: ["general"],
  relatedSkillIds: [],
};

const backendFocus: FocusDefinition = {
  id: "backend-engineering",
  label: "Backend engineering",
  shortLabel: "Backend",
  category: "role",
  headline: "Backend engineer",
  summary: "Backend engineering work.",
  description: "Backend engineering work.",
  aliases: ["backend"],
  relatedSkillIds: ["python", "kafka", "rust"],
};

const pythonSkill: SkillDefinition = {
  id: "python",
  label: "Python",
  category: "language",
  aliases: ["python"],
  focusWeights: { "backend-engineering": 1, general: 0.5 },
};

const kafkaSkill: SkillDefinition = {
  id: "kafka",
  label: "Kafka",
  category: "platform",
  aliases: ["kafka"],
  focusWeights: { "backend-engineering": 1, general: 0.25 },
};

const rustSkill: SkillDefinition = {
  id: "rust",
  label: "Rust",
  category: "language",
  aliases: ["rust"],
  focusWeights: { "backend-engineering": 0.5, general: 0.1 },
};

const minimalContent = {
  focusDefinitions: [generalFocus, backendFocus],
  skillDefinitions: [pythonSkill, kafkaSkill, rustSkill],
};

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

describe("job description gap report", () => {
  it("reports absent taxonomy terms as unmatched gaps", () => {
    const analysis = analyzeJobDescriptionWithContent(
      {
        focusDefinitions: [generalFocus, backendFocus],
        skillDefinitions: [pythonSkill, kafkaSkill],
      },
      `
Title
Backend Engineer

Required
Python Kafka Rust Rust
`,
    );

    const rustGap = analysis.gaps.find((gap) => gap.term === "rust");

    expect(rustGap).toEqual(
      expect.objectContaining({
        classification: "unmatched",
        section: "required",
        term: "rust",
      }),
    );
    expect(rustGap?.count ?? 0).toBeGreaterThan(0);
  });

  it("returns no gaps when the JD is fully covered by the taxonomy", () => {
    const analysis = analyzeJobDescriptionWithContent(
      {
        focusDefinitions: [generalFocus, backendFocus],
        skillDefinitions: [pythonSkill, kafkaSkill],
      },
      `
Title
Backend

Required
Python Kafka backend
`,
    );

    expect(analysis.gaps).toEqual([]);
  });

  it("classifies low-signal matched aliases as weak gaps", () => {
    const analysis = analyzeJobDescriptionWithContent(
      minimalContent,
      `
Title
Backend Python Engineer

Required
Python Python Python Python Python Python Python Python Python Python

Preferred
Rust
`,
    );

    expect(analysis.gaps).toContainEqual(
      expect.objectContaining({
        classification: "weak",
        section: "preferred",
        term: "rust",
      }),
    );
  });

  it("returns byte-identical output for identical input", () => {
    const rawText = `
Title
Backend Python Engineer

Required
Python Kafka

Preferred
Rust
`;

    const first = analyzeJobDescriptionWithContent(minimalContent, rawText);
    const second = analyzeJobDescriptionWithContent(minimalContent, rawText);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
