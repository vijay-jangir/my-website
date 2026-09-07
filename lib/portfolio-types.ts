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

export type ProjectProofType =
  | "sanitized-diagram"
  | "metric"
  | "open-source-reference"
  | "public-repo"
  | "article"
  | "private-enterprise";

export type ProjectMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProjectDecision = {
  label: string;
  detail: string;
};

export type ProjectCaseStudy = {
  headline: string;
  context: string;
  role: string;
  timeframe: string;
  organization: string;
  team: string;
  confidentiality: string;
  metrics: readonly ProjectMetric[];
  architecture: readonly string[];
  responsibilities: readonly string[];
  decisions: readonly ProjectDecision[];
  lessons: readonly string[];
};

export type ProjectProofArtifact = {
  label: string;
  type: ProjectProofType;
  detail: string;
  href?: string;
};

export type ProjectPublicProof = {
  proofTypes: readonly ProjectProofType[];
  architectureShape: readonly string[];
  scaleSignals: readonly ProjectMetric[];
  responsibilities: readonly string[];
  constraints: readonly string[];
  artifacts: readonly ProjectProofArtifact[];
  confidentialityNotes: readonly string[];
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
  caseStudy?: ProjectCaseStudy;
  publicProof?: ProjectPublicProof;
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

export type FocusPreset = {
  id: string;
  label: string;
  description: string;
  focusIds: FocusId[];
  sortOrder: number;
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
  profileImageUrl?: string;
  heroLabel: string;
  heroTitleLines?: readonly string[];
  heroSubtitle?: string;
  recruiterPitch: string;
  overview: string[];
};

export type MediaAsset = {
  id: string;
  label: string;
  kind: "image" | "pdf" | "document" | "other";
  mimeType: string;
  fileName: string;
  url: string;
  path: string;
  entityType?: "site-profile" | "project" | "experience" | "general";
  entityId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentRevision = {
  id: string;
  snapshotPath: string;
  currentPath: string;
  commitSha?: string;
  backupRepo: string;
  branch: string;
  publishedBy: string;
  status: "published" | "db-apply-failed";
  summary?: string;
  publishedAt: string;
};

export type PortfolioSnapshot = {
  siteProfile: SiteProfile;
  portfolioLinks: readonly PortfolioLink[];
  focusDefinitions: readonly FocusDefinition[];
  focusPresets: readonly FocusPreset[];
  skillDefinitions: readonly SkillDefinition[];
  projects: readonly ProjectDefinition[];
  experiences: readonly ExperienceDefinition[];
  profileHighlights: readonly ProfileHighlight[];
  summaryTemplates: readonly SummaryTemplate[];
  mediaAssets: readonly MediaAsset[];
  revisions?: readonly ContentRevision[];
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

export type JdGap = {
  term: string;
  section: string;
  classification: "unmatched" | "weak";
  count: number;
};

export type JobDescriptionAnalysis = {
  rawText: string;
  focusScores: readonly FocusScore[];
  skillScores: readonly SkillScore[];
  sections: readonly JdSection[];
  topFocusIds: readonly FocusId[];
  extractedHighlights: readonly string[];
  gaps: readonly JdGap[];
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
