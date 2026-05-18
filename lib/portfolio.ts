import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type {
  ExperienceDefinition,
  FocusDefinition,
  FocusId,
  FocusWeights,
  JobDescriptionAnalysis,
  PortfolioSnapshot,
  ProfileHighlight,
  ProjectDefinition,
  ResumeVariant,
  SkillDefinition,
  SkillScore,
} from "@/lib/portfolio-types";

type PortfolioContentInput = Pick<
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
const fallbackFocusIds = new Set<FocusId>(
  fallbackContent.focusDefinitions.map((focus) => focus.id),
);

export const focusDefinitionMap = Object.fromEntries(
  fallbackContent.focusDefinitions.map((focus) => [focus.id, focus]),
) as Record<FocusId, (typeof fallbackContent.focusDefinitions)[number]>;

export const skillDefinitionMap = Object.fromEntries(
  fallbackContent.skillDefinitions.map((skill) => [skill.id, skill]),
) as Record<string, (typeof fallbackContent.skillDefinitions)[number]>;

export function parseFocusIds(rawValue?: string | string[] | null): FocusId[] {
  const value = Array.isArray(rawValue) ? rawValue.join(",") : (rawValue ?? "");

  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is FocusId => fallbackFocusIds.has(item as FocusId));

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

function rankHighlights(
  content: PortfolioContentInput,
  focusVector: Record<FocusId, number>,
  limit = content.profileHighlights.length,
) {
  return rankItems(content.profileHighlights, focusVector)
    .slice(0, limit)
    .map(({ item }) => item);
}

function rankSkills(
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

function rankExperience(
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

function pickSummary(
  content: PortfolioContentInput,
  focusSelection: readonly FocusId[],
  analysis?: JobDescriptionAnalysis,
) {
  const normalizedSelection: readonly FocusId[] =
    focusSelection.length > 0 ? focusSelection : ["general"];
  const exactTemplate = content.summaryTemplates.find(
    (template) =>
      template.focusIds.length === normalizedSelection.length &&
      template.focusIds.every((focusId) =>
        normalizedSelection.includes(focusId),
      ),
  );

  if (exactTemplate) {
    return exactTemplate;
  }

  const contentFocusMap = Object.fromEntries(
    content.focusDefinitions.map((focus) => [focus.id, focus]),
  ) as Record<FocusId, FocusDefinition>;
  const primaryFocus = normalizedSelection[0];
  const primaryDefinition = contentFocusMap[primaryFocus];

  if (analysis && normalizedSelection.length > 1) {
    const focusLabels = normalizedSelection
      .map((focusId) => contentFocusMap[focusId].shortLabel)
      .join(" + ");

    return {
      id: "generated",
      focusIds: normalizedSelection,
      headline: `${focusLabels} Engineer`,
      summary: `This resume highlights my strongest fit across ${focusLabels.toLowerCase()} work using the same project, skill, and experience data shown on this site.`,
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

export function getSkillLabelFromContent(
  content: Pick<PortfolioSnapshot, "skillDefinitions">,
  skillId: string,
) {
  return (
    content.skillDefinitions.find((skill) => skill.id === skillId)?.label ??
    skillId
  );
}

export function buildResumeVariantFromContent(
  content: PortfolioContentInput,
  options: {
    source?: ResumeVariant["source"];
    focusIds?: readonly FocusId[];
    analysis?: JobDescriptionAnalysis;
  },
): ResumeVariant {
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
  const summary = pickSummary(content, selectedFocusIds, options.analysis);
  const rankedProjects = rankProjects(content, focusVector, 4);
  const rankedExperience = rankExperience(content, focusVector);
  const rankedHighlights = rankHighlights(content, focusVector, 3);
  const rankedSkills = rankSkills(content, focusVector, options.analysis);

  return {
    id: selectedFocusIds.join("-"),
    source: options.source ?? (options.analysis ? "jd" : "focus"),
    focusIds: selectedFocusIds,
    headline: summary.headline,
    summary: summary.summary,
    recruiterPitch: content.siteProfile.recruiterPitch,
    highlights: rankedHighlights,
    primarySkills: rankedSkills.primarySkills,
    secondarySkills: rankedSkills.secondarySkills,
    supportingSkills: rankedSkills.supportingSkills,
    projects: rankedProjects,
    experiences: rankedExperience,
    analysis: options.analysis,
  };
}

export function buildResumeVariant(options: {
  source?: ResumeVariant["source"];
  focusIds?: readonly FocusId[];
  analysis?: JobDescriptionAnalysis;
}): ResumeVariant {
  return buildResumeVariantFromContent(fallbackContent, options);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildSearchTerms(query: string) {
  const normalizedQuery = normalizeSearchText(query);

  return Array.from(new Set(normalizedQuery.split(/\s+/).filter(Boolean)));
}

function buildProjectSearchIndex(
  project: ProjectDefinition,
  skillSearchFragments: Record<string, readonly string[]>,
) {
  const fragments = [
    project.id,
    project.slug,
    project.title,
    project.summary,
    project.detail,
    project.impact,
    ...project.skillIds.flatMap(
      (skillId) => skillSearchFragments[skillId] ?? [skillId],
    ),
  ];
  const normalizedFragments = fragments.flatMap((fragment) => {
    const normalized = normalizeSearchText(fragment);

    if (!normalized) {
      return [];
    }

    const compact = normalized.replace(/\s+/g, "");

    return compact && compact !== normalized
      ? [normalized, compact]
      : [normalized];
  });

  return {
    text: ` ${normalizedFragments.join(" ")} `,
    tokens: new Set(
      normalizedFragments.flatMap((fragment) =>
        fragment.split(/\s+/).filter(Boolean),
      ),
    ),
  };
}

function matchesSearchTerm(
  searchIndex: ReturnType<typeof buildProjectSearchIndex>,
  term: string,
) {
  return (
    searchIndex.tokens.has(term) ||
    (term.length > 2 && searchIndex.text.includes(term))
  );
}

export function searchProjectsInContent(
  content: PortfolioContentInput,
  options: {
    query?: string;
    focusIds?: FocusId[];
  },
) {
  const focusVector = buildQueryFocusVector(options.focusIds ?? ["general"]);
  const query = options.query?.trim() ?? "";
  const queryTerms = buildSearchTerms(query);
  const skillSearchFragments = Object.fromEntries(
    content.skillDefinitions.map((skill) => [
      skill.id,
      [skill.id, skill.label, ...skill.aliases],
    ]),
  ) as Record<string, readonly string[]>;

  return [...content.projects]
    .filter((project) => project.visibility === "public")
    .map((project) => {
      const baseScore = enrichProjectScore(project, focusVector);
      if (queryTerms.length === 0) {
        return { item: project, score: baseScore };
      }

      const searchIndex = buildProjectSearchIndex(
        project,
        skillSearchFragments,
      );

      if (!queryTerms.every((term) => matchesSearchTerm(searchIndex, term))) {
        return null;
      }

      const normalizedQuery = normalizeSearchText(query);
      const phraseBonus = searchIndex.text.includes(normalizedQuery) ? 0.24 : 0;
      const queryScore = queryTerms.length * 0.18 + phraseBonus;

      return {
        item: project,
        score: baseScore + queryScore,
      };
    })
    .filter((project): project is { item: ProjectDefinition; score: number } =>
      Boolean(project),
    )
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item);
}

export function searchProjects(options: {
  query?: string;
  focusIds?: FocusId[];
}) {
  return searchProjectsInContent(fallbackContent, options);
}

export function getPublicProjectsFromContent(content: PortfolioContentInput) {
  return content.projects.filter((project) => project.visibility === "public");
}

export function getPublicProjects() {
  return getPublicProjectsFromContent(fallbackContent);
}

export function getFocusOptionsFromContent(content: PortfolioContentInput) {
  return content.focusDefinitions;
}

export function getFocusOptions() {
  return getFocusOptionsFromContent(fallbackContent);
}

export function getHighlightedFocusesFromContent(
  content: PortfolioContentInput,
): FocusDefinition[] {
  return content.focusDefinitions.filter((focus) => focus.id !== "general");
}

export function getHighlightedFocuses(): FocusDefinition[] {
  return getHighlightedFocusesFromContent(fallbackContent);
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
