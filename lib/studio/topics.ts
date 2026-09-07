/**
 * Deterministic blog topic recommendation engine.
 *
 * Ranks topic suggestions from THREE inputs:
 * 1. The owner's focus/skill taxonomy (portfolio content)
 * 2. Existing published blog posts (content collection)
 * 3. Optionally, aggregated JD demand signals (Phase 7 data)
 *
 * Ranking is fully deterministic — no randomness. LLM optionally enriches
 * phrasing but the ranking order never depends on LLM output.
 * The feature works with no LLM configured.
 */

import type {
  FocusDefinition,
  SkillDefinition,
} from "@/lib/portfolio-types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type TopicSignalSource =
  | "focus-gap"
  | "skill-depth"
  | "jd-demand"
  | "cross-focus";

export type TopicSuggestion = {
  readonly id: string;
  readonly workingTitle: string;
  readonly targetKeywords: readonly string[];
  readonly rationale: string;
  readonly suggestedAngle: string;
  readonly score: number;
  readonly signal: TopicSignalSource;
};

export type PublishedPost = {
  readonly slug: string;
  readonly title: string;
  readonly tags: readonly string[];
};

export type JdDemandSignal = {
  readonly skillId: string;
  readonly label: string;
  readonly demandCount: number;
};

export type TopicEngineInput = {
  readonly focuses: readonly FocusDefinition[];
  readonly skills: readonly SkillDefinition[];
  readonly publishedPosts: readonly PublishedPost[];
  readonly jdDemandSignals?: readonly JdDemandSignal[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function postCoversTopic(
  posts: readonly PublishedPost[],
  keywords: readonly string[],
): boolean {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  return posts.some((post) => {
    const titleLower = post.title.toLowerCase();
    const tagLower = post.tags.map((t) => t.toLowerCase());
    const combined = `${titleLower} ${tagLower.join(" ")}`;

    return lowerKeywords.some((kw) => combined.includes(kw));
  });
}

// ---------------------------------------------------------------------------
// Signal generators (each produces candidate suggestions)
// ---------------------------------------------------------------------------

function focusGapSuggestions(
  input: TopicEngineInput,
): readonly TopicSuggestion[] {
  const results: TopicSuggestion[] = [];

  for (const focus of input.focuses) {
    if (focus.id === "general") continue;

    const keywords = [focus.label, ...focus.aliases];

    if (postCoversTopic(input.publishedPosts, keywords)) continue;

    results.push({
      id: `focus-gap-${focus.id}`,
      workingTitle: `${focus.headline}: A Practitioner's Perspective`,
      targetKeywords: [focus.label, ...focus.aliases.slice(0, 3)],
      rationale: `No published post covers the "${focus.label}" focus area. Writing about it fills a content gap and strengthens SEO for this specialty.`,
      suggestedAngle: `Share hands-on experience with ${focus.label.toLowerCase()}: what problems it solves, architecture decisions, and lessons learned.`,
      score: 80 + (focus.relatedSkillIds.length * 2),
      signal: "focus-gap",
    });
  }

  return results;
}

function skillDepthSuggestions(
  input: TopicEngineInput,
): readonly TopicSuggestion[] {
  const results: TopicSuggestion[] = [];

  // Skills with highlights are strong candidates for deep-dive posts
  const richSkills = input.skills
    .filter((s) => s.highlights && s.highlights.length > 0)
    .sort((a, b) => {
      const aWeight = Object.values(a.focusWeights).reduce((sum, w) => sum + (w ?? 0), 0);
      const bWeight = Object.values(b.focusWeights).reduce((sum, w) => sum + (w ?? 0), 0);
      return bWeight - aWeight;
    });

  for (const skill of richSkills.slice(0, 10)) {
    const keywords = [skill.label, ...skill.aliases];

    if (postCoversTopic(input.publishedPosts, keywords)) continue;

    results.push({
      id: `skill-depth-${skill.id}`,
      workingTitle: `Deep Dive: ${skill.label} in Production`,
      targetKeywords: [skill.label, ...skill.aliases.slice(0, 3)],
      rationale: `"${skill.label}" has ${skill.highlights?.length ?? 0} portfolio highlights but no dedicated blog post. A technical deep-dive would demonstrate depth.`,
      suggestedAngle: `Cover real production usage of ${skill.label}: setup, tradeoffs, and patterns that worked.`,
      score: 60 + (skill.highlights?.length ?? 0) * 5,
      signal: "skill-depth",
    });
  }

  return results;
}

function jdDemandSuggestions(
  input: TopicEngineInput,
): readonly TopicSuggestion[] {
  if (!input.jdDemandSignals || input.jdDemandSignals.length === 0) {
    return [];
  }

  const results: TopicSuggestion[] = [];

  const sorted = [...input.jdDemandSignals].sort(
    (a, b) => b.demandCount - a.demandCount,
  );

  for (const signal of sorted.slice(0, 8)) {
    const skill = input.skills.find((s) => s.id === signal.skillId);
    const keywords = skill
      ? [skill.label, ...skill.aliases]
      : [signal.label];

    if (postCoversTopic(input.publishedPosts, keywords)) continue;

    results.push({
      id: `jd-demand-${signal.skillId}`,
      workingTitle: `Why ${signal.label} Matters: Lessons from Real Projects`,
      targetKeywords: keywords.slice(0, 4),
      rationale: `"${signal.label}" appeared in ${signal.demandCount} job descriptions. Writing about it aligns content with active market demand.`,
      suggestedAngle: `Connect ${signal.label.toLowerCase()} to concrete project outcomes — what hiring managers care about.`,
      score: 70 + Math.min(signal.demandCount * 3, 30),
      signal: "jd-demand",
    });
  }

  return results;
}

function crossFocusSuggestions(
  input: TopicEngineInput,
): readonly TopicSuggestion[] {
  const results: TopicSuggestion[] = [];
  const focuses = input.focuses.filter((f) => f.id !== "general");

  // Find focus pairs that share skills
  for (let i = 0; i < focuses.length; i++) {
    for (let j = i + 1; j < focuses.length; j++) {
      const a = focuses[i];
      const b = focuses[j];

      const aSkillIds = new Set(a.relatedSkillIds);
      const sharedCount = b.relatedSkillIds.filter((id) =>
        aSkillIds.has(id),
      ).length;

      if (sharedCount < 2) continue;

      const keywords = [a.label, b.label];

      if (postCoversTopic(input.publishedPosts, keywords)) continue;

      const id = `cross-focus-${slugify(a.id)}-${slugify(b.id)}`;

      results.push({
        id,
        workingTitle: `Where ${a.shortLabel} Meets ${b.shortLabel}`,
        targetKeywords: [a.label, b.label, ...a.aliases.slice(0, 1), ...b.aliases.slice(0, 1)],
        rationale: `${a.label} and ${b.label} share ${sharedCount} skills in the taxonomy. A post bridging them shows breadth.`,
        suggestedAngle: `Explore the intersection: how experience in ${a.label.toLowerCase()} transfers to ${b.label.toLowerCase()} and vice versa.`,
        score: 50 + sharedCount * 8,
        signal: "cross-focus",
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

export function recommendTopics(input: TopicEngineInput): readonly TopicSuggestion[] {
  const all: TopicSuggestion[] = [
    ...focusGapSuggestions(input),
    ...skillDepthSuggestions(input),
    ...jdDemandSuggestions(input),
    ...crossFocusSuggestions(input),
  ];

  // Deterministic sort: by score descending, then by id ascending for stability
  all.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  // Deduplicate: keep the highest-scored suggestion per unique id
  const seen = new Set<string>();
  const deduped: TopicSuggestion[] = [];

  for (const suggestion of all) {
    if (!seen.has(suggestion.id)) {
      seen.add(suggestion.id);
      deduped.push(suggestion);
    }
  }

  return deduped;
}
