import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import {
  buildResumeVariantFromContent,
  parseFocusIdsInContent,
} from "@/lib/portfolio";
import type {
  FocusScore,
  JobDescriptionAnalysis,
  JdSection,
  PortfolioSnapshot,
  ResumeVariant,
  SkillScore,
} from "@/lib/portfolio-types";

const SECTION_DEFINITIONS = [
  {
    id: "title",
    label: "Title",
    weight: 6,
    patterns: [/^title\b/i, /^role\b/i, /^position\b/i],
  },
  {
    id: "required",
    label: "Required",
    weight: 5,
    patterns: [
      /^required\b/i,
      /^requirements\b/i,
      /^must have\b/i,
      /^minimum qualifications\b/i,
    ],
  },
  {
    id: "responsibilities",
    label: "Responsibilities",
    weight: 3,
    patterns: [
      /^responsibilities\b/i,
      /^what you(?:'|’)ll do\b/i,
      /^what you will do\b/i,
      /^role overview\b/i,
    ],
  },
  {
    id: "preferred",
    label: "Preferred",
    weight: 1.5,
    patterns: [
      /^preferred\b/i,
      /^nice to have\b/i,
      /^bonus\b/i,
      /^preferred qualifications\b/i,
    ],
  },
  {
    id: "company",
    label: "Company",
    weight: 0.5,
    patterns: [/^about (the )?company\b/i, /^about us\b/i, /^who we are\b/i],
  },
] as const;

const DEFAULT_SECTION: JdSection = {
  id: "overview",
  label: "Overview",
  weight: 1,
  content: "",
};

type TaxonomyContent = Pick<
  PortfolioSnapshot,
  "focusDefinitions" | "skillDefinitions"
>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countAliasMatches(content: string, alias: string) {
  const normalizedAlias = escapeRegExp(alias.toLowerCase());
  // Alphanumeric-token boundaries via lookarounds so aliases with
  // trailing symbols (+, #, .) still match: "C++", "C#", ".NET".
  const regex = new RegExp(`(?<![a-z0-9])${normalizedAlias}(?![a-z0-9])`, "g");
  return content.match(regex)?.length ?? 0;
}

function parseSections(rawText: string): JdSection[] {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return [];
  }

  const lines = trimmed.split(/\n+/).map((line) => line.trim());
  const sections: JdSection[] = [];
  let currentSection = { ...DEFAULT_SECTION };

  for (const line of lines) {
    const matchingDefinition = SECTION_DEFINITIONS.find((section) =>
      section.patterns.some((pattern) => pattern.test(line)),
    );

    if (matchingDefinition) {
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      currentSection = {
        id: matchingDefinition.id,
        label: matchingDefinition.label,
        weight: matchingDefinition.weight,
        content: "",
      };
      continue;
    }

    currentSection.content = `${currentSection.content}\n${line}`.trim();
  }

  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    return [
      {
        ...DEFAULT_SECTION,
        content: trimmed,
      },
    ];
  }

  return sections;
}

function collectEvidence(content: string, alias: string, limit = 2) {
  const lowerContent = content.toLowerCase();
  const lowerAlias = alias.toLowerCase();
  const snippets: string[] = [];
  let startIndex = 0;

  while (snippets.length < limit) {
    const index = lowerContent.indexOf(lowerAlias, startIndex);

    if (index === -1) {
      break;
    }

    const start = Math.max(index - 40, 0);
    const end = Math.min(index + lowerAlias.length + 60, content.length);
    snippets.push(content.slice(start, end).trim());
    startIndex = index + lowerAlias.length;
  }

  return snippets;
}

function buildDirectFocusScores(
  content: TaxonomyContent,
  sections: JdSection[],
): FocusScore[] {
  return content.focusDefinitions.map((focus) => {
    let score = 0;
    const matchedAliases: string[] = [];
    const evidence: string[] = [];

    for (const section of sections) {
      const content = section.content.toLowerCase();

      for (const alias of focus.aliases) {
        const matches = countAliasMatches(content, alias);

        if (matches === 0) {
          continue;
        }

        const repetitionBoost =
          1 + Math.min(Math.log1p(matches - 1) * 0.2, 0.6);
        const sectionBoost =
          section.id === "title" ? 1.8 : section.id === "required" ? 1.1 : 1;
        score +=
          section.weight * 1.25 * sectionBoost * matches * repetitionBoost;
        matchedAliases.push(alias);
        evidence.push(...collectEvidence(section.content, alias));
      }
    }

    return {
      focusId: focus.id,
      label: focus.label,
      score,
      matchedAliases: Array.from(new Set(matchedAliases)),
      evidence: evidence.slice(0, 3),
    };
  });
}

function buildSkillScores(
  content: TaxonomyContent,
  sections: JdSection[],
): SkillScore[] {
  const scoredSkills = content.skillDefinitions.map((skill) => {
    let score = 0;
    const matchedAliases: string[] = [];
    const evidence: string[] = [];

    for (const section of sections) {
      const content = section.content.toLowerCase();

      for (const alias of skill.aliases) {
        const matches = countAliasMatches(content, alias);

        if (matches === 0) {
          continue;
        }

        const repetitionBoost =
          1 + Math.min(Math.log1p(matches - 1) * 0.2, 0.6);
        score += section.weight * matches * repetitionBoost;
        matchedAliases.push(alias);
        evidence.push(...collectEvidence(section.content, alias));
      }
    }

    return {
      skillId: skill.id,
      label: skill.label,
      score,
      matchedAliases: Array.from(new Set(matchedAliases)),
      evidence: evidence.slice(0, 3),
    };
  });
  return normalizeSkillScores(scoredSkills);
}

function normalizeFocusScores(
  content: TaxonomyContent,
  directFocusScores: FocusScore[],
  skillScores: SkillScore[],
): FocusScore[] {
  const propagatedScores = directFocusScores.map((focus) => {
    const skillContribution = skillScores.reduce((sum, skillScore) => {
      const skill = content.skillDefinitions.find(
        (item) => item.id === skillScore.skillId,
      );
      return sum + skillScore.score * (skill?.focusWeights[focus.focusId] ?? 0);
    }, 0);

    return {
      ...focus,
      score: focus.score * 0.6 + skillContribution * 0.4,
    };
  });

  const total = propagatedScores.reduce((sum, focus) => sum + focus.score, 0);

  if (total === 0) {
    return [
      {
        focusId: "general",
        label: "Overall profile",
        score: 1,
        matchedAliases: [],
        evidence: [],
      },
    ];
  }

  return propagatedScores
    .map((focus) => ({
      ...focus,
      score: focus.score / total,
    }))
    .sort((left, right) => right.score - left.score);
}

function normalizeSkillScores(scores: SkillScore[]): SkillScore[] {
  const maxScore = Math.max(...scores.map((score) => score.score), 0);

  return scores
    .filter((score) => score.score > 0)
    .map((score) => ({
      ...score,
      score: maxScore > 0 ? score.score / maxScore : score.score,
    }))
    .sort((left, right) => right.score - left.score);
}

function buildExtractedHighlights(
  focusScores: FocusScore[],
  skillScores: SkillScore[],
) {
  const topFocuses = focusScores
    .slice(0, 3)
    .map((focus) => focus.label)
    .join(", ");
  const topSkills = skillScores
    .slice(0, 5)
    .map((skill) => skill.label)
    .join(", ");

  return [
    topFocuses ? `Top focus areas: ${topFocuses}` : "",
    topSkills ? `Top skills: ${topSkills}` : "",
  ].filter(Boolean);
}

export function analyzeJobDescription(rawText: string): JobDescriptionAnalysis {
  return analyzeJobDescriptionWithContent(fallbackPortfolioSnapshot, rawText);
}

export function analyzeJobDescriptionWithContent(
  content: TaxonomyContent,
  rawText: string,
): JobDescriptionAnalysis {
  const sections = parseSections(rawText);
  const skillScores = buildSkillScores(content, sections);
  const focusScores = normalizeFocusScores(
    content,
    buildDirectFocusScores(content, sections),
    skillScores,
  );

  return {
    rawText,
    focusScores,
    skillScores,
    sections,
    topFocusIds: focusScores.slice(0, 3).map((focus) => focus.focusId),
    extractedHighlights: buildExtractedHighlights(focusScores, skillScores),
  };
}

export function buildResumeVariantFromJobDescription(options: {
  rawText: string;
  focusOverride?: string;
}): { analysis: JobDescriptionAnalysis; variant: ResumeVariant } {
  return buildResumeVariantFromJobDescriptionWithContent(
    fallbackPortfolioSnapshot,
    options,
  );
}

export function buildResumeVariantFromJobDescriptionWithContent(
  content: Pick<
    PortfolioSnapshot,
    | "experiences"
    | "focusDefinitions"
    | "profileHighlights"
    | "projects"
    | "siteProfile"
    | "skillDefinitions"
    | "summaryTemplates"
  >,
  options: {
    rawText: string;
    focusOverride?: string;
  },
): { analysis: JobDescriptionAnalysis; variant: ResumeVariant } {
  const analysis = analyzeJobDescriptionWithContent(content, options.rawText);
  const overrideFocusIds = parseFocusIdsInContent(
    content,
    options.focusOverride ?? "",
  );

  const mergedFocusIds =
    overrideFocusIds.length > 0
      ? Array.from(
          new Set([...overrideFocusIds, ...analysis.topFocusIds]),
        ).slice(0, 3)
      : analysis.topFocusIds;

  return {
    analysis,
    variant: buildResumeVariantFromContent(content, {
      source: "jd",
      focusIds: mergedFocusIds.length > 0 ? mergedFocusIds : ["general"],
      analysis,
    }),
  };
}
