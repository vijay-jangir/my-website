export { getExperienceYears } from "@/content/portfolio";

export {
  buildQueryFocusVector,
  focusDefinitionMap,
  getFocusLabel,
  getFocusOptions,
  getFocusOptionsFromContent,
  getHighlightedFocuses,
  getHighlightedFocusesFromContent,
  getSkillLabel,
  getSkillLabelFromContent,
  normalizeScores,
  parseFocusIds,
  parseFocusIdsInContent,
  skillDefinitionMap,
} from "./focus";
export {
  buildResumeVariant,
  buildResumeVariantFromContent,
} from "./resume-variant";
export type { PortfolioContentInput } from "./scoring";
export {
  enrichProjectScore,
  getHighlightByFocus,
  getHighlightByFocusFromContent,
  getPublicProjects,
  getPublicProjectsFromContent,
  getTopRelatedSkills,
  getTopRelatedSkillsFromContent,
  rankExperience,
  rankHighlights,
  rankProjects,
  rankSkills,
} from "./scoring";
export { searchProjects, searchProjectsInContent } from "./search";
