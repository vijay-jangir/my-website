import type {
  FocusScore,
  JdSection,
  PortfolioSnapshot,
  SkillScore,
} from "@/lib/portfolio-types";

export type TaxonomyContent = Pick<
  PortfolioSnapshot,
  "focusDefinitions" | "skillDefinitions"
>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function countAliasMatches(content: string, alias: string) {
  const normalizedAlias = escapeRegExp(alias.toLowerCase());
  // Alphanumeric-token boundaries via lookarounds so aliases with
  // trailing symbols (+, #, .) still match: "C++", "C#", ".NET".
  const regex = new RegExp(
    `(?<![a-z0-9])${normalizedAlias}(?![a-z0-9])`,
    "g",
  );
  return content.match(regex)?.length ?? 0;
}

export function collectEvidence(
  content: string,
  alias: string,
  limit = 2,
) {
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

export function buildDirectFocusScores(
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

export function buildSkillScores(
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

export function normalizeFocusScores(
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

export function buildExtractedHighlights(
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
