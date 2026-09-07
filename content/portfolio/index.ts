export { getExperienceYears, siteProfile, portfolioLinks } from "./profile";
export { focusDefinitions, focusPresets } from "./focus";
export { skillDefinitions } from "./skills";
export { projects } from "./projects";
export { experiences } from "./experiences";
export { profileHighlights } from "./highlights";
export { summaryTemplates } from "./summaries";

import { siteProfile, portfolioLinks } from "./profile";
import { focusDefinitions, focusPresets } from "./focus";
import { skillDefinitions } from "./skills";
import { projects } from "./projects";
import { experiences } from "./experiences";
import { profileHighlights } from "./highlights";
import { summaryTemplates } from "./summaries";

export const fallbackPortfolioSnapshot = {
  siteProfile,
  portfolioLinks,
  focusDefinitions,
  focusPresets,
  skillDefinitions,
  projects,
  experiences,
  profileHighlights,
  summaryTemplates,
  mediaAssets: [],
  revisions: [],
} as const;
