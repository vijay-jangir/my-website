/**
 * Backward-compatible re-export barrel.
 *
 * The actual data now lives in content/portfolio/ (per-entity files).
 * Every existing `import { … } from "@/content/portfolio"` keeps working.
 */
export {
  fallbackPortfolioSnapshot,
  getExperienceYears,
  siteProfile,
  portfolioLinks,
  focusDefinitions,
  focusPresets,
  skillDefinitions,
  projects,
  experiences,
  profileHighlights,
  summaryTemplates,
} from "./portfolio/index";
