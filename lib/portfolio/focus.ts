import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type {
  FocusDefinition,
  FocusId,
  PortfolioSnapshot,
} from "@/lib/portfolio-types";

import type { PortfolioContentInput } from "./scoring";

const fallbackContent = fallbackPortfolioSnapshot;

export const focusDefinitionMap = Object.fromEntries(
  fallbackContent.focusDefinitions.map((focus) => [focus.id, focus]),
) as Record<FocusId, (typeof fallbackContent.focusDefinitions)[number]>;

export const skillDefinitionMap = Object.fromEntries(
  fallbackContent.skillDefinitions.map((skill) => [skill.id, skill]),
) as Record<string, (typeof fallbackContent.skillDefinitions)[number]>;

export function parseFocusIdsInContent(
  content: Pick<PortfolioSnapshot, "focusDefinitions">,
  rawValue?: string | string[] | null,
): FocusId[] {
  const value = Array.isArray(rawValue) ? rawValue.join(",") : (rawValue ?? "");
  const validIds = new Set(content.focusDefinitions.map((focus) => focus.id));

  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is FocusId => validIds.has(item as FocusId));

  return Array.from(new Set(parsed)).slice(0, 3);
}

export function parseFocusIds(
  rawValue?: string | string[] | null,
): FocusId[] {
  return parseFocusIdsInContent(fallbackContent, rawValue);
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

export function normalizeScores<T extends string>(
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
