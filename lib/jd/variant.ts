import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import {
  buildResumeVariantFromContent,
  parseFocusIdsInContent,
} from "@/lib/portfolio";
import type {
  JobDescriptionAnalysis,
  PortfolioSnapshot,
  ResumeVariant,
} from "@/lib/portfolio-types";

import { analyzeJobDescriptionWithContent } from "./analyze";

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
