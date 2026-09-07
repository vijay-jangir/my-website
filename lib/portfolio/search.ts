import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type { FocusId, ProjectDefinition } from "@/lib/portfolio-types";

import { buildQueryFocusVector } from "./focus";
import { type PortfolioContentInput, enrichProjectScore } from "./scoring";

const fallbackContent = fallbackPortfolioSnapshot;

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
