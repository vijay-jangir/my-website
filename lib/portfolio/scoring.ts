import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type {
  ExperienceDefinition,
  FocusId,
  FocusWeights,
  JobDescriptionAnalysis,
  PortfolioSnapshot,
  ProfileHighlight,
  ProjectDefinition,
  SkillDefinition,
  SkillScore,
} from "@/lib/portfolio-types";

import { buildQueryFocusVector } from "./focus";

export type PortfolioContentInput = Pick<
  PortfolioSnapshot,
  | "experiences"
  | "focusDefinitions"
  | "profileHighlights"
  | "projects"
  | "siteProfile"
  | "skillDefinitions"
  | "summaryTemplates"
>;

const fallbackContent = fallbackPortfolioSnapshot;

function scoreFromWeights(
  itemWeights: FocusWeights,
  focusVector: Record<FocusId, number>,
) {
  return Object.entries(focusVector).reduce((sum, [focusId, focusScore]) => {
    return sum + (itemWeights[focusId as FocusId] ?? 0) * focusScore;
  }, 0);
}

function rankItems<T extends { focusWeights: FocusWeights }>(
  items: readonly T[],
  focusVector: Record<FocusId, number>,
) {
  return [...items]
    .map((item) => ({
      item,
      score: scoreFromWeights(item.focusWeights, focusVector),
    }))
    .sort((left, right) => right.score - left.score);
}

function buildSkillScoreMap(skillScores?: readonly SkillScore[]) {
  return new Map((skillScores ?? []).map((item) => [item.skillId, item.score]));
}

export function enrichProjectScore(
  project: ProjectDefinition,
  focusVector: Record<FocusId, number>,
) {
  const base = scoreFromWeights(project.focusWeights, focusVector);
  const featuredBonus = project.featured ? 0.08 : 0;
  return base + featuredBonus;
}

export function rankProjects(
  content: PortfolioContentInput,
  focusVector: Record<FocusId, number>,
  limit = content.projects.length,
) {
  return [...content.projects]
    .filter((project) => project.visibility === "public")
    .map((project) => ({
      item: project,
      score: enrichProjectScore(project, focusVector),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function rankHighlights(
  content: PortfolioContentInput,
  focusVector: Record<FocusId, number>,
  limit = content.profileHighlights.length,
) {
  return rankItems(content.profileHighlights, focusVector)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function rankSkills(
  content: PortfolioContentInput,
  focusVector: Record<FocusId, number>,
  analysis?: JobDescriptionAnalysis,
) {
  const jdSkillMap = buildSkillScoreMap(analysis?.skillScores);

  const scored = [...content.skillDefinitions]
    .map((skill) => {
      const focusScore = scoreFromWeights(skill.focusWeights, focusVector);
      const jdBoost = jdSkillMap.get(skill.id) ?? 0;
      const score = focusScore + jdBoost * 0.35;
      return { skill, score };
    })
    .sort((left, right) => right.score - left.score);

  return {
    primarySkills: scored.slice(0, 8).map(({ skill }) => skill),
    secondarySkills: scored.slice(8, 14).map(({ skill }) => skill),
    supportingSkills: scored.slice(14, 20).map(({ skill }) => skill),
  };
}

export function rankExperience(
  content: PortfolioContentInput,
  focusVector: Record<FocusId, number>,
): ExperienceDefinition[] {
  return rankItems(content.experiences, focusVector)
    .map(({ item }) => ({
      ...item,
      bullets: [...item.bullets]
        .filter((bullet) => bullet.visibility === "public")
        .sort(
          (left, right) =>
            scoreFromWeights(right.focusWeights, focusVector) -
            scoreFromWeights(left.focusWeights, focusVector),
        )
        .slice(0, 3),
    }))
    .slice(0, 3);
}

export function getPublicProjectsFromContent(content: PortfolioContentInput) {
  return content.projects.filter((project) => project.visibility === "public");
}

export function getPublicProjects() {
  return getPublicProjectsFromContent(fallbackContent);
}

export function getTopRelatedSkillsFromContent(
  content: PortfolioContentInput,
  focusId: FocusId,
  limit = 5,
): SkillDefinition[] {
  return [...content.skillDefinitions]
    .filter((skill) => (skill.focusWeights[focusId] ?? 0) > 0)
    .sort(
      (left, right) =>
        (right.focusWeights[focusId] ?? 0) - (left.focusWeights[focusId] ?? 0),
    )
    .slice(0, limit);
}

export function getTopRelatedSkills(
  focusId: FocusId,
  limit = 5,
): SkillDefinition[] {
  return getTopRelatedSkillsFromContent(fallbackContent, focusId, limit);
}

export function getHighlightByFocusFromContent(
  content: PortfolioContentInput,
  focusId: FocusId,
): ProfileHighlight[] {
  const vector = buildQueryFocusVector([focusId]);
  return rankHighlights(content, vector, 3);
}

export function getHighlightByFocus(focusId: FocusId): ProfileHighlight[] {
  return getHighlightByFocusFromContent(fallbackContent, focusId);
}
