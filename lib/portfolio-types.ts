export type FocusId =
  | "general"
  | "ai"
  | "agentic-development"
  | "backend-engineering"
  | "platform-engineering"
  | "data-platform"
  | "flink"
  | "kafka"
  | "python";

export type FocusWeights = Partial<Record<FocusId, number>>;

export type FocusDefinition = {
  id: FocusId;
  label: string;
  shortLabel: string;
  category: "role" | "technology" | "domain";
  headline: string;
  summary: string;
  description: string;
  aliases: readonly string[];
  relatedSkillIds: readonly string[];
};

export type PortfolioLink = {
  name: string;
  hash: string;
};

export type SkillDefinition = {
  id: string;
  label: string;
  category: "language" | "framework" | "platform" | "data" | "ai" | "tooling";
  aliases: readonly string[];
  focusWeights: FocusWeights;
  highlights?: readonly string[];
};

export type ProofLink = {
  label: string;
  href: string;
  kind: "repo" | "demo" | "article" | "case-study";
};

export type ProjectDefinition = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  impact: string;
  detail: string;
  skillIds: readonly string[];
  focusWeights: FocusWeights;
  featured: boolean;
  visibility: "public" | "limited";
  proofLinks: readonly ProofLink[];
};

export type ExperienceBullet = {
  id: string;
  text: string;
  skillIds: readonly string[];
  focusWeights: FocusWeights;
  visibility: "public" | "limited";
};

export type ExperienceDefinition = {
  id: string;
  title: string;
  company: string;
  companyUrl: string;
  type: "employment";
  description: string;
  date: string;
  icon: string;
  focusWeights: FocusWeights;
  bullets: readonly ExperienceBullet[];
};

export type ProfileHighlight = {
  id: string;
  label: string;
  value: string;
  detail: string;
  focusWeights: FocusWeights;
};

export type SummaryTemplate = {
  id: string;
  focusIds: readonly FocusId[];
  headline: string;
  summary: string;
};

export type SiteProfile = {
  name: string;
  title: string;
  location: string;
  timezone: string;
  lastUpdatedLabel: string;
  contentPromise: string;
  currentFocusLabels: readonly string[];
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  heroLabel: string;
  recruiterPitch: string;
  overview: string[];
};

export type RankedItem<T> = {
  item: T;
  score: number;
};

export type SkillScore = {
  skillId: string;
  label: string;
  score: number;
  matchedAliases: string[];
  evidence: string[];
};

export type FocusScore = {
  focusId: FocusId;
  label: string;
  score: number;
  matchedAliases: string[];
  evidence: string[];
};

export type JdSection = {
  id: string;
  label: string;
  weight: number;
  content: string;
};

export type JobDescriptionAnalysis = {
  rawText: string;
  focusScores: readonly FocusScore[];
  skillScores: readonly SkillScore[];
  sections: readonly JdSection[];
  topFocusIds: readonly FocusId[];
  extractedHighlights: readonly string[];
};

export type ResumeVariant = {
  id: string;
  source: "focus" | "jd";
  focusIds: readonly FocusId[];
  headline: string;
  summary: string;
  recruiterPitch: string;
  highlights: readonly ProfileHighlight[];
  primarySkills: readonly SkillDefinition[];
  secondarySkills: readonly SkillDefinition[];
  supportingSkills: readonly SkillDefinition[];
  projects: readonly ProjectDefinition[];
  experiences: readonly ExperienceDefinition[];
  analysis?: JobDescriptionAnalysis;
};

export type StoredResumeVariant = {
  token: string;
  focusIds: readonly FocusId[];
  variant: ResumeVariant;
  analysis?: JobDescriptionAnalysis;
  createdAt: string;
};
