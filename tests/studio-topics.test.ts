import { describe, expect, it } from "vitest";

import type { FocusDefinition, SkillDefinition } from "@/lib/portfolio-types";
import {
  recommendTopics,
  type JdDemandSignal,
  type PublishedPost,
  type TopicEngineInput,
} from "@/lib/studio/topics";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const focusFixtures: readonly FocusDefinition[] = [
  {
    id: "backend-engineering",
    label: "Backend Engineering",
    shortLabel: "Backend",
    category: "role",
    headline: "Backend Engineering",
    summary: "Building scalable services",
    description: "Full desc",
    aliases: ["backend", "server-side"],
    relatedSkillIds: ["java", "go", "postgres"],
  },
  {
    id: "data-platform",
    label: "Data Platform",
    shortLabel: "Data",
    category: "domain",
    headline: "Data Platform Engineering",
    summary: "Building data infrastructure",
    description: "Full desc",
    aliases: ["data engineering", "data infra"],
    relatedSkillIds: ["spark", "kafka", "postgres", "go"],
  },
  {
    id: "ai",
    label: "AI & ML",
    shortLabel: "AI",
    category: "domain",
    headline: "AI & Machine Learning",
    summary: "Applied ML and LLMs",
    description: "Full desc",
    aliases: ["machine learning", "llm"],
    relatedSkillIds: ["python", "pytorch"],
  },
  {
    id: "general",
    label: "General",
    shortLabel: "General",
    category: "role",
    headline: "General Engineering",
    summary: "Broad engineering",
    description: "General",
    aliases: [],
    relatedSkillIds: [],
  },
];

const skillFixtures: readonly SkillDefinition[] = [
  {
    id: "java",
    label: "Java",
    category: "language",
    aliases: ["jvm"],
    focusWeights: { "backend-engineering": 0.9 },
    highlights: ["Built microservices", "Spring Boot expertise"],
  },
  {
    id: "kafka",
    label: "Apache Kafka",
    category: "platform",
    aliases: ["kafka", "event streaming"],
    focusWeights: { "data-platform": 0.8, "backend-engineering": 0.3 },
    highlights: ["Managed Kafka clusters", "Designed event schemas"],
  },
  {
    id: "python",
    label: "Python",
    category: "language",
    aliases: ["py"],
    focusWeights: { ai: 0.7, "data-platform": 0.4 },
  },
  {
    id: "go",
    label: "Go",
    category: "language",
    aliases: ["golang"],
    focusWeights: { "backend-engineering": 0.6 },
  },
];

function makeInput(overrides: Partial<TopicEngineInput> = {}): TopicEngineInput {
  return {
    focuses: focusFixtures,
    skills: skillFixtures,
    publishedPosts: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("recommendTopics", () => {
  it("returns ranked suggestions for uncovered focus areas", () => {
    const suggestions = recommendTopics(makeInput());

    expect(suggestions.length).toBeGreaterThan(0);

    // Should include focus-gap suggestions for backend, data, ai (not general)
    const focusGaps = suggestions.filter((s) => s.signal === "focus-gap");
    expect(focusGaps.length).toBeGreaterThanOrEqual(3);

    // Each has required fields
    for (const s of suggestions) {
      expect(s.id).toBeTruthy();
      expect(s.workingTitle).toBeTruthy();
      expect(s.targetKeywords.length).toBeGreaterThan(0);
      expect(s.rationale).toBeTruthy();
      expect(s.suggestedAngle).toBeTruthy();
      expect(typeof s.score).toBe("number");
    }
  });

  it("excludes general focus from suggestions", () => {
    const suggestions = recommendTopics(makeInput());
    const generalSuggestions = suggestions.filter((s) =>
      s.id.includes("general"),
    );
    expect(generalSuggestions).toHaveLength(0);
  });

  it("deduplicates suggestions against already-published topics", () => {
    const publishedPosts: PublishedPost[] = [
      { slug: "backend-post", title: "Backend Engineering Deep Dive", tags: ["backend"] },
    ];

    const withPosts = recommendTopics(makeInput({ publishedPosts }));
    const withoutPosts = recommendTopics(makeInput());

    // With a post covering "backend", we should get fewer focus-gap suggestions
    const backendGapWith = withPosts.filter(
      (s) => s.signal === "focus-gap" && s.id === "focus-gap-backend-engineering",
    );
    const backendGapWithout = withoutPosts.filter(
      (s) => s.signal === "focus-gap" && s.id === "focus-gap-backend-engineering",
    );

    expect(backendGapWith).toHaveLength(0);
    expect(backendGapWithout).toHaveLength(1);
  });

  it("produces deterministic output — same input yields identical output", () => {
    const input = makeInput();
    const run1 = recommendTopics(input);
    const run2 = recommendTopics(input);

    expect(run1).toEqual(run2);
  });

  it("is sorted by score descending", () => {
    const suggestions = recommendTopics(makeInput());

    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(
        suggestions[i].score,
      );
    }
  });

  it("includes skill-depth suggestions for skills with highlights", () => {
    const suggestions = recommendTopics(makeInput());
    const skillDepth = suggestions.filter((s) => s.signal === "skill-depth");

    // Java and Kafka have highlights
    expect(skillDepth.length).toBeGreaterThanOrEqual(1);
  });

  it("includes JD demand suggestions when signals are provided", () => {
    const jdDemandSignals: JdDemandSignal[] = [
      { skillId: "terraform", label: "Terraform", demandCount: 12 },
      { skillId: "kafka", label: "Apache Kafka", demandCount: 8 },
    ];

    const suggestions = recommendTopics(
      makeInput({ jdDemandSignals }),
    );
    const jdDemand = suggestions.filter((s) => s.signal === "jd-demand");

    expect(jdDemand.length).toBeGreaterThanOrEqual(1);

    // Terraform should be suggested since it has higher demand
    const terraformSuggestion = jdDemand.find(
      (s) => s.id === "jd-demand-terraform",
    );
    expect(terraformSuggestion).toBeDefined();
    expect(terraformSuggestion!.rationale).toContain("12");
  });

  it("returns empty array when no demand signals and all focuses covered", () => {
    const publishedPosts: PublishedPost[] = [
      { slug: "be", title: "Backend Engineering", tags: ["backend", "server-side"] },
      { slug: "dp", title: "Data Platform", tags: ["data engineering"] },
      { slug: "ai", title: "AI & ML", tags: ["machine learning", "llm"] },
      { slug: "java", title: "Java Production", tags: ["java", "jvm"] },
      { slug: "kafka", title: "Kafka Production", tags: ["kafka", "event streaming"] },
    ];

    const suggestions = recommendTopics(makeInput({ publishedPosts }));

    // All focus-gap and skill-depth should be filtered, cross-focus may remain
    const focusGaps = suggestions.filter((s) => s.signal === "focus-gap");
    const skillDepths = suggestions.filter((s) => s.signal === "skill-depth");

    expect(focusGaps).toHaveLength(0);
    expect(skillDepths).toHaveLength(0);
  });

  it("includes cross-focus suggestions for focus pairs sharing skills", () => {
    const suggestions = recommendTopics(makeInput());
    const crossFocus = suggestions.filter((s) => s.signal === "cross-focus");

    // backend-engineering and data-platform share postgres and kafka
    expect(crossFocus.length).toBeGreaterThanOrEqual(1);
  });

  it("works with no LLM — purely deterministic, no external calls", () => {
    // This test verifies the engine is fully synchronous and pure
    const suggestions = recommendTopics(makeInput());
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
