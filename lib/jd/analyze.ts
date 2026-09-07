import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type { JobDescriptionAnalysis } from "@/lib/portfolio-types";

import { extractGaps } from "./gaps";
import { parseSections } from "./parse";
import type { TaxonomyContent } from "./score";
import {
  buildDirectFocusScores,
  buildExtractedHighlights,
  buildSkillScores,
  normalizeFocusScores,
} from "./score";

export function analyzeJobDescription(
  rawText: string,
): JobDescriptionAnalysis {
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
  const gaps = extractGaps({ content, sections, focusScores, skillScores });

  return {
    rawText,
    focusScores,
    skillScores,
    sections,
    topFocusIds: focusScores.slice(0, 3).map((focus) => focus.focusId),
    extractedHighlights: buildExtractedHighlights(focusScores, skillScores),
    gaps,
  };
}
