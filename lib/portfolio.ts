import {
  focusDefinitions,
  profileHighlights,
  projects,
  siteProfile,
  skillDefinitions,
  summaryTemplates,
  experiences,
} from "@/content/portfolio";
import type {
  ExperienceDefinition,
  FocusDefinition,
  FocusId,
  FocusWeights,
  JobDescriptionAnalysis,
  ProfileHighlight,
  ProjectDefinition,
  ResumeVariant,
  SkillDefinition,
  SkillScore,
} from "@/lib/portfolio-types";

const focusIds = new Set<FocusId>(focusDefinitions.map((focus) => focus.id));

export const focusDefinitionMap = Object.fromEntries(
  focusDefinitions.map((focus) => [focus.id, focus]),
) as Record<FocusId, (typeof focusDefinitions)[number]>;

export const skillDefinitionMap = Object.fromEntries(
  skillDefinitions.map((skill) => [skill.id, skill]),
) as Record<string, (typeof skillDefinitions)[number]>;

export function parseFocusIds(rawValue?: string | string[] | null): FocusId[] {
  const value = Array.isArray(rawValue) ? rawValue.join(",") : (rawValue ?? "");

  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is FocusId => focusIds.has(item as FocusId));

  return Array.from(new Set(parsed)).slice(0, 3);
}

export function buildQueryFocusVector(
  selectedFocusIds: readonly FocusId[],
): Record<FocusId, number> {
  const safeFocuses: readonly FocusId[] =
    selectedFocusIds.length > 0 ? selectedFocusIds : ["general"];
  const weights = { general: 0.2 } as Record<FocusId, number>;

  safeFocuses.forEach((focusId, index) => {
    const baseWeight = index === 0 ? 1 : index === 1 ? 0.78 : 0.6;
    weights[focusId] = Math.max(weights[focusId] ?? 0, baseWeight);
  });

  if (!safeFocuses.includes("general")) {
    weights.general = 0.2;
  }

  return normalizeScores(weights);
}

function normalizeScores<T extends string>(
  scores: Record<T, number>,
): Record<T, number> {
  const total = (Object.values(scores) as number[]).reduce(
    (sum, value) => sum + value,
    0,
  );

  if (total <= 0) {
    return scores;
  }

  return Object.fromEntries(
    (Object.entries(scores) as Array<[T, number]>).map(([key, value]) => [
      key,
      value / total,
    ]),
  ) as Record<T, number>;
}

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

function enrichProjectScore(
  project: ProjectDefinition,
  focusVector: Record<FocusId, number>,
) {
  const base = scoreFromWeights(project.focusWeights, focusVector);
  const featuredBonus = project.featured ? 0.08 : 0;
  return base + featuredBonus;
}

function rankProjects(
  focusVector: Record<FocusId, number>,
  limit = projects.length,
) {
  return [...projects]
    .filter((project) => project.visibility === "public")
    .map((project) => ({
      item: project,
      score: enrichProjectScore(project, focusVector),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

function rankHighlights(
  focusVector: Record<FocusId, number>,
  limit = profileHighlights.length,
) {
  return rankItems(profileHighlights, focusVector)
    .slice(0, limit)
    .map(({ item }) => item);
}

function rankSkills(
  focusVector: Record<FocusId, number>,
  analysis?: JobDescriptionAnalysis,
) {
  const jdSkillMap = buildSkillScoreMap(analysis?.skillScores);

  const scored = [...skillDefinitions]
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

function rankExperience(
  focusVector: Record<FocusId, number>,
): ExperienceDefinition[] {
  return rankItems(experiences, focusVector)
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

function pickSummary(
  focusSelection: readonly FocusId[],
  analysis?: JobDescriptionAnalysis,
) {
  const normalizedSelection: readonly FocusId[] =
    focusSelection.length > 0 ? focusSelection : ["general"];
  const exactTemplate = summaryTemplates.find(
    (template) =>
      template.focusIds.length === normalizedSelection.length &&
      template.focusIds.every((focusId) =>
        normalizedSelection.includes(focusId),
      ),
  );

  if (exactTemplate) {
    return exactTemplate;
  }

  const primaryFocus = normalizedSelection[0];
  const primaryDefinition = focusDefinitionMap[primaryFocus];

  if (analysis && normalizedSelection.length > 1) {
    const focusLabels = normalizedSelection
      .map((focusId) => focusDefinitionMap[focusId].shortLabel)
      .join(" + ");

    return {
      id: "generated",
      focusIds: normalizedSelection,
      headline: `${focusLabels} Engineer`,
      summary: `This resume highlights my strongest fit across ${focusLabels.toLowerCase()} work using only validated project, skill, and experience data from the portfolio.`,
    };
  }

  return {
    id: primaryDefinition.id,
    focusIds: [primaryDefinition.id],
    headline: primaryDefinition.headline,
    summary: primaryDefinition.summary,
  };
}

export function getFocusLabel(focusId: FocusId) {
  return focusDefinitionMap[focusId].label;
}

export function getSkillLabel(skillId: string) {
  return skillDefinitionMap[skillId]?.label ?? skillId;
}

export function buildResumeVariant(options: {
  source?: ResumeVariant["source"];
  focusIds?: readonly FocusId[];
  analysis?: JobDescriptionAnalysis;
}): ResumeVariant {
  const focusIdsFromAnalysis = options.analysis?.topFocusIds ?? [];
  const selectedFocusIds: readonly FocusId[] =
    options.focusIds && options.focusIds.length > 0
      ? options.focusIds
      : focusIdsFromAnalysis.length > 0
        ? focusIdsFromAnalysis
        : ["general"];
  const focusVector =
    options.analysis && options.analysis.focusScores.length > 0
      ? normalizeScores(
          Object.fromEntries(
            options.analysis.focusScores.map((focus) => [
              focus.focusId,
              focus.score,
            ]),
          ) as Record<FocusId, number>,
        )
      : buildQueryFocusVector(selectedFocusIds);
  const summary = pickSummary(selectedFocusIds, options.analysis);
  const rankedProjects = rankProjects(focusVector, 4);
  const rankedExperience = rankExperience(focusVector);
  const rankedHighlights = rankHighlights(focusVector, 3);
  const rankedSkills = rankSkills(focusVector, options.analysis);

  return {
    id: selectedFocusIds.join("-"),
    source: options.source ?? (options.analysis ? "jd" : "focus"),
    focusIds: selectedFocusIds,
    headline: summary.headline,
    summary: summary.summary,
    recruiterPitch: siteProfile.recruiterPitch,
    highlights: rankedHighlights,
    primarySkills: rankedSkills.primarySkills,
    secondarySkills: rankedSkills.secondarySkills,
    supportingSkills: rankedSkills.supportingSkills,
    projects: rankedProjects,
    experiences: rankedExperience,
    analysis: options.analysis,
  };
}

export function searchProjects(options: {
  query?: string;
  focusIds?: FocusId[];
}) {
  const focusVector = buildQueryFocusVector(options.focusIds ?? ["general"]);
  const query = options.query?.trim().toLowerCase() ?? "";

  return [...projects]
    .filter((project) => project.visibility === "public")
    .map((project) => {
      const baseScore = enrichProjectScore(project, focusVector);
      if (!query) {
        return { item: project, score: baseScore };
      }

      const haystack = [
        project.title,
        project.summary,
        project.detail,
        project.impact,
        ...project.skillIds.map(getSkillLabel),
      ]
        .join(" ")
        .toLowerCase();

      const queryTerms = query.split(/\s+/).filter(Boolean);
      const queryScore = queryTerms.reduce((sum, term) => {
        if (haystack.includes(term)) {
          return sum + 0.18;
        }

        return sum;
      }, 0);

      return {
        item: project,
        score: baseScore + queryScore,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item);
}

export function getPublicProjects() {
  return projects.filter((project) => project.visibility === "public");
}

export function getFocusOptions() {
  return focusDefinitions;
}

export function getHighlightedFocuses(): FocusDefinition[] {
  return focusDefinitions.filter((focus) => focus.id !== "general");
}

export function getTopRelatedSkills(
  focusId: FocusId,
  limit = 5,
): SkillDefinition[] {
  return [...skillDefinitions]
    .filter((skill) => (skill.focusWeights[focusId] ?? 0) > 0)
    .sort(
      (left, right) =>
        (right.focusWeights[focusId] ?? 0) - (left.focusWeights[focusId] ?? 0),
    )
    .slice(0, limit);
}

export function getHighlightByFocus(focusId: FocusId): ProfileHighlight[] {
  const vector = buildQueryFocusVector([focusId]);
  return rankHighlights(vector, 3);
}
