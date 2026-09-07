import type {
  FocusScore,
  JdGap,
  JdSection,
  SkillScore,
} from "@/lib/portfolio-types";

import { getSectionRank } from "./parse";
import type { TaxonomyContent } from "./score";

const GAP_STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "can",
  "could",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "or",
  "and",
  "but",
  "not",
  "no",
  "if",
  "then",
  "than",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "we",
  "our",
  "you",
  "your",
  "they",
  "their",
  "etc",
  "about",
  "across",
  "all",
  "also",
  "bonus",
  "build",
  "building",
  "company",
  "deep",
  "engineer",
  "engineering",
  "environment",
  "experience",
  "familiarity",
  "have",
  "including",
  "knowledge",
  "looking",
  "minimum",
  "must",
  "need",
  "plus",
  "position",
  "preferred",
  "qualification",
  "qualifications",
  "required",
  "requirements",
  "role",
  "senior",
  "skill",
  "skills",
  "solid",
  "strong",
  "team",
  "teams",
  "using",
  "what",
  "who",
  "work",
  "working",
  "years",
  "year",
]);

const WEAK_GAP_THRESHOLD = 0.1;
const MIN_GAP_WEIGHT = 1.5;
const SIGNIFICANT_TERM_PATTERN = /\.[a-z0-9]+|[a-z0-9]+(?:[+#][a-z0-9+#]*)*/g;

export function tokenizeSignificantTerms(content: string) {
  return (content.toLowerCase().match(SIGNIFICANT_TERM_PATTERN) ?? []).filter(
    (term) =>
      term.length >= 2 && /[a-z]/.test(term) && !GAP_STOPWORDS.has(term),
  );
}

function buildAliasTermSet(content: TaxonomyContent) {
  const aliasTerms = new Set<string>();

  for (const alias of content.focusDefinitions.flatMap(
    (focus) => focus.aliases,
  )) {
    for (const term of tokenizeSignificantTerms(alias)) {
      aliasTerms.add(term);
    }
  }

  for (const alias of content.skillDefinitions.flatMap(
    (skill) => skill.aliases,
  )) {
    for (const term of tokenizeSignificantTerms(alias)) {
      aliasTerms.add(term);
    }
  }

  return aliasTerms;
}

function buildMatchedTermScores(
  focusScores: readonly FocusScore[],
  skillScores: readonly SkillScore[],
) {
  const matchedTermScores = new Map<string, number>();

  const register = (alias: string, score: number) => {
    for (const term of tokenizeSignificantTerms(alias)) {
      const currentScore = matchedTermScores.get(term) ?? 0;
      if (score > currentScore) {
        matchedTermScores.set(term, score);
      }
    }
  };

  for (const focusScore of focusScores) {
    for (const alias of focusScore.matchedAliases) {
      register(alias, focusScore.score);
    }
  }

  for (const skillScore of skillScores) {
    for (const alias of skillScore.matchedAliases) {
      register(alias, skillScore.score);
    }
  }

  return matchedTermScores;
}

export function extractGaps(options: {
  content: TaxonomyContent;
  sections: readonly JdSection[];
  focusScores: readonly FocusScore[];
  skillScores: readonly SkillScore[];
}): JdGap[] {
  const aliasTerms = buildAliasTermSet(options.content);
  const matchedTermScores = buildMatchedTermScores(
    options.focusScores,
    options.skillScores,
  );
  const termStats = new Map<
    string,
    {
      dominantSection: string;
      sectionWeights: Map<string, number>;
      totalWeight: number;
    }
  >();

  for (const section of options.sections) {
    for (const term of tokenizeSignificantTerms(section.content)) {
      const current = termStats.get(term) ?? {
        dominantSection: section.id,
        sectionWeights: new Map<string, number>(),
        totalWeight: 0,
      };
      const nextWeight =
        (current.sectionWeights.get(section.id) ?? 0) + section.weight;
      current.sectionWeights.set(section.id, nextWeight);
      current.totalWeight += section.weight;

      const dominantWeight =
        current.sectionWeights.get(current.dominantSection) ?? 0;
      if (
        nextWeight > dominantWeight ||
        (nextWeight === dominantWeight &&
          getSectionRank(section.id) < getSectionRank(current.dominantSection))
      ) {
        current.dominantSection = section.id;
      }

      termStats.set(term, current);
    }
  }

  return Array.from(termStats.entries())
    .filter(([, stats]) => stats.totalWeight >= MIN_GAP_WEIGHT)
    .flatMap(([term, stats]): JdGap[] => {
      if (!aliasTerms.has(term)) {
        return [
          {
            term,
            section: stats.dominantSection,
            classification: "unmatched" as const,
            count: stats.totalWeight,
          },
        ];
      }

      const score = matchedTermScores.get(term) ?? 0;
      if (score < WEAK_GAP_THRESHOLD) {
        return [
          {
            term,
            section: stats.dominantSection,
            classification: "weak" as const,
            count: stats.totalWeight,
          },
        ];
      }

      return [];
    })
    .sort((left: JdGap, right: JdGap) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      const sectionDelta =
        getSectionRank(left.section) - getSectionRank(right.section);
      if (sectionDelta !== 0) {
        return sectionDelta;
      }

      const termDelta = left.term.localeCompare(right.term);
      if (termDelta !== 0) {
        return termDelta;
      }

      return left.classification.localeCompare(right.classification);
    });
}
