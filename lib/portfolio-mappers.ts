/**
 * Per-entity mapping functions: raw Drizzle rows → typed domain objects.
 * Extracted from loadPortfolioContentFromDb to keep it an orchestrator.
 */
import type * as schema from "@/db/drizzle/schema";
import type {
  ContentRevision,
  ExperienceDefinition,
  FocusDefinition,
  FocusId,
  FocusPreset,
  FocusWeights,
  MediaAsset,
  PortfolioLink,
  ProfileHighlight,
  ProjectCaseStudy,
  ProjectDefinition,
  ProjectPublicProof,
  SiteProfile,
  SkillDefinition,
  SummaryTemplate,
} from "@/lib/portfolio-types";

// --- Row type aliases (inferred from Drizzle schema) ---

type SiteProfileRow = typeof schema.siteProfile.$inferSelect;
type PortfolioLinkRow = typeof schema.portfolioLink.$inferSelect;
type FocusDefinitionRow = typeof schema.focusDefinition.$inferSelect;
type FocusPresetRow = typeof schema.focusPreset.$inferSelect;
type SkillRow = typeof schema.skill.$inferSelect;
type ProjectRow = typeof schema.project.$inferSelect;
type ExperienceRow = typeof schema.experience.$inferSelect;
type ProfileHighlightRow = typeof schema.profileHighlight.$inferSelect;
type SummaryTemplateRow = typeof schema.summaryTemplate.$inferSelect;
type MediaAssetRow = typeof schema.mediaAsset.$inferSelect;
type ContentRevisionRow = typeof schema.contentRevision.$inferSelect;

type WeightRow = { focusId: string; weight: number };
type SkillFocusWeightRow = { focusId: string; skillId: string; weight: number };
type ProjectLinkRow = { href: string; kind: string; label: string; projectId: string; sortOrder: number };
type ProjectSkillLinkRow = { projectId: string; skillId: string; sortOrder: number };
type ProjectFocusWeightRow = WeightRow & { projectId: string };
type ExperienceFocusWeightRow = WeightRow & { experienceId: string };
type ExperienceBulletRow = { experienceId: string; id: string; sortOrder: number; text: string; visibility: string };
type ExperienceBulletSkillLinkRow = { bulletId: string; skillId: string; sortOrder: number };
type ExperienceBulletFocusWeightRow = WeightRow & { bulletId: string };
type ProfileHighlightFocusWeightRow = WeightRow & { highlightId: string };

// --- Shared helpers ---

export function toIsoString(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : value;
}

export function sortByOrder<T extends { sortOrder: number }>(
  items: readonly T[],
): T[] {
  return [...items].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function buildWeightRecord<T extends WeightRow>(
  rows: readonly T[],
): FocusWeights {
  return Object.fromEntries(
    rows.map((row) => [row.focusId as FocusId, row.weight]),
  ) as FocusWeights;
}

export function groupBy<T>(
  rows: readonly T[],
  key: (row: T) => string,
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const existing = map.get(k) ?? [];
    existing.push(row);
    map.set(k, existing);
  }
  return map;
}

// --- Per-entity mappers ---

export function mapSiteProfile(row: SiteProfileRow): SiteProfile {
  return {
    contentPromise: row.contentPromise,
    currentFocusLabels: (row.currentFocusLabels ?? []) as string[],
    email: row.email,
    githubUrl: row.githubUrl,
    heroLabel: row.heroLabel,
    lastUpdatedLabel: row.lastUpdatedLabel,
    linkedinUrl: row.linkedinUrl,
    location: row.location,
    name: row.name,
    overview: (row.overview ?? []) as string[],
    profileImageUrl: row.profileImageUrl ?? undefined,
    recruiterPitch: row.recruiterPitch,
    timezone: row.timezone,
    title: row.title,
  } satisfies SiteProfile;
}

export function mapPortfolioLinks(
  rows: readonly PortfolioLinkRow[],
): PortfolioLink[] {
  return rows.map(
    (row): PortfolioLink => ({ hash: row.hash, name: row.name }),
  );
}

export function mapFocusDefinitions(
  rows: readonly FocusDefinitionRow[],
): FocusDefinition[] {
  return rows.map(
    (row): FocusDefinition => ({
      aliases: (row.aliases ?? []) as string[],
      category: row.category as FocusDefinition["category"],
      description: row.description,
      headline: row.headline,
      id: row.id as FocusId,
      label: row.label,
      relatedSkillIds: (row.relatedSkillIds ?? []) as string[],
      shortLabel: row.shortLabel,
      summary: row.summary,
    }),
  );
}

export function mapFocusPresets(
  rows: readonly FocusPresetRow[],
): FocusPreset[] {
  return rows.map(
    (row): FocusPreset => ({
      description: row.description,
      focusIds: (row.focusIds ?? []) as FocusId[],
      id: row.id,
      label: row.label,
      sortOrder: row.sortOrder,
    }),
  );
}

export function mapSkillDefinitions(
  rows: readonly SkillRow[],
  weights: readonly SkillFocusWeightRow[],
): SkillDefinition[] {
  const weightMap = groupBy(weights, (r) => r.skillId);
  return rows.map(
    (row): SkillDefinition => ({
      aliases: (row.aliases ?? []) as string[],
      category: row.category as SkillDefinition["category"],
      focusWeights: buildWeightRecord(weightMap.get(row.id) ?? []),
      highlights: ((row.highlights as string[] | null) ?? undefined) as
        | string[]
        | undefined,
      id: row.id,
      label: row.label,
    }),
  );
}

type ProjectRelations = {
  readonly links: readonly ProjectLinkRow[];
  readonly skillLinks: readonly ProjectSkillLinkRow[];
  readonly weights: readonly ProjectFocusWeightRow[];
};

export function mapProjects(
  rows: readonly ProjectRow[],
  relations: ProjectRelations,
): ProjectDefinition[] {
  const linkMap = groupBy(relations.links, (r) => r.projectId);
  const skillMap = groupBy(relations.skillLinks, (r) => r.projectId);
  const weightMap = groupBy(relations.weights, (r) => r.projectId);

  return rows.map(
    (row): ProjectDefinition => ({
      caseStudy: ((row.caseStudy as ProjectCaseStudy | null) ?? undefined) as
        | ProjectCaseStudy
        | undefined,
      detail: row.detail,
      featured: row.featured,
      focusWeights: buildWeightRecord(weightMap.get(row.id) ?? []),
      id: row.id,
      impact: row.impact,
      proofLinks: sortByOrder(linkMap.get(row.id) ?? []).map((link) => ({
        href: link.href,
        kind: link.kind as ProjectDefinition["proofLinks"][number]["kind"],
        label: link.label,
      })),
      publicProof: ((row.publicProof as ProjectPublicProof | null) ??
        undefined) as ProjectPublicProof | undefined,
      skillIds: sortByOrder(skillMap.get(row.id) ?? []).map((l) => l.skillId),
      slug: row.slug,
      summary: row.summary,
      title: row.title,
      visibility: row.visibility as ProjectDefinition["visibility"],
    }),
  );
}

type ExperienceRelations = {
  readonly weights: readonly ExperienceFocusWeightRow[];
  readonly bullets: readonly ExperienceBulletRow[];
  readonly bulletSkills: readonly ExperienceBulletSkillLinkRow[];
  readonly bulletWeights: readonly ExperienceBulletFocusWeightRow[];
};

export function mapExperiences(
  rows: readonly ExperienceRow[],
  relations: ExperienceRelations,
): ExperienceDefinition[] {
  const weightMap = groupBy(relations.weights, (r) => r.experienceId);
  const bulletMap = groupBy(relations.bullets, (r) => r.experienceId);
  const bulletSkillMap = groupBy(relations.bulletSkills, (r) => r.bulletId);
  const bulletWeightMap = groupBy(relations.bulletWeights, (r) => r.bulletId);

  return rows.map(
    (row): ExperienceDefinition => ({
      bullets: sortByOrder(bulletMap.get(row.id) ?? []).map((bullet) => ({
        focusWeights: buildWeightRecord(bulletWeightMap.get(bullet.id) ?? []),
        id: bullet.id,
        skillIds: sortByOrder(bulletSkillMap.get(bullet.id) ?? []).map(
          (sl) => sl.skillId,
        ),
        text: bullet.text,
        visibility:
          bullet.visibility as ExperienceDefinition["bullets"][number]["visibility"],
      })),
      company: row.company,
      companyUrl: row.companyUrl,
      date: row.date,
      description: row.description,
      focusWeights: buildWeightRecord(weightMap.get(row.id) ?? []),
      icon: row.icon,
      id: row.id,
      title: row.title,
      type: row.type as ExperienceDefinition["type"],
    }),
  );
}

export function mapProfileHighlights(
  rows: readonly ProfileHighlightRow[],
  weights: readonly ProfileHighlightFocusWeightRow[],
): ProfileHighlight[] {
  const weightMap = groupBy(weights, (r) => r.highlightId);
  return rows.map(
    (row): ProfileHighlight => ({
      detail: row.detail,
      focusWeights: buildWeightRecord(weightMap.get(row.id) ?? []),
      id: row.id,
      label: row.label,
      value: row.value,
    }),
  );
}

export function mapSummaryTemplates(
  rows: readonly SummaryTemplateRow[],
): SummaryTemplate[] {
  return rows.map(
    (row): SummaryTemplate => ({
      focusIds: (row.focusIds ?? []) as FocusId[],
      headline: row.headline,
      id: row.id,
      summary: row.summary,
    }),
  );
}

export function mapMediaAssets(
  rows: readonly MediaAssetRow[],
): MediaAsset[] {
  return rows.map(
    (row): MediaAsset => ({
      createdAt: toIsoString(row.createdAt),
      entityId: row.entityId ?? undefined,
      entityType: row.entityType as MediaAsset["entityType"],
      fileName: row.fileName,
      id: row.id,
      kind: row.kind as MediaAsset["kind"],
      label: row.label,
      mimeType: row.mimeType,
      path: row.path,
      updatedAt: toIsoString(row.updatedAt),
      url: row.url,
    }),
  );
}

export function mapRevisions(
  rows: readonly ContentRevisionRow[],
): ContentRevision[] {
  return rows.map(
    (row): ContentRevision => ({
      backupRepo: row.backupRepo,
      branch: row.branch,
      commitSha: row.commitSha ?? undefined,
      currentPath: row.currentPath,
      id: row.id,
      publishedAt: toIsoString(row.publishedAt),
      publishedBy: row.publishedBy,
      snapshotPath: row.snapshotPath,
      status: row.status as ContentRevision["status"],
      summary: row.summary ?? undefined,
    }),
  );
}
