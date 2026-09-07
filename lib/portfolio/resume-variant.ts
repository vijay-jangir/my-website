import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type {
  FocusDefinition,
  FocusId,
  JobDescriptionAnalysis,
  ResumeVariant,
} from "@/lib/portfolio-types";

import { buildQueryFocusVector, normalizeScores } from "./focus";
import {
  type PortfolioContentInput,
  rankExperience,
  rankHighlights,
  rankProjects,
  rankSkills,
} from "./scoring";

const fallbackContent = fallbackPortfolioSnapshot;

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
