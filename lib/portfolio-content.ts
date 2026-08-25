import crypto from "node:crypto";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import { getContentHistoryLimit, isAstroContentDbConfigured } from "@/lib/env";
import {
  loadBackupSnapshot,
  writeSnapshotToBackup,
} from "@/lib/content-backup";
import type {
  ContentRevision,
  ExperienceDefinition,
  FocusDefinition,
  FocusId,
  FocusWeights,
  MediaAsset,
  PortfolioLink,
  PortfolioSnapshot,
  ProfileHighlight,
  ProjectCaseStudy,
  ProjectDefinition,
  ProjectPublicProof,
  SiteProfile,
  SkillDefinition,
  SummaryTemplate,
} from "@/lib/portfolio-types";

type AstroDbModule = typeof import("astro:db");

const CONTENT_TABLE_KEYS = [
  "ExperienceBulletFocusWeightTable",
  "ExperienceBulletSkillLinkTable",
  "ExperienceBulletTable",
  "ExperienceFocusWeightTable",
  "ExperienceTable",
  "MediaAssetTable",
  "ProfileHighlightFocusWeightTable",
  "ProfileHighlightTable",
  "ProjectFocusWeightTable",
  "ProjectSkillLinkTable",
  "ProjectLinkTable",
  "ProjectTable",
  "SkillFocusWeightTable",
  "SkillTable",
  "SummaryTemplateTable",
  "FocusDefinitionTable",
  "PortfolioLinkTable",
  "SiteProfileTable",
] as const;

type SkillFocusWeightRow = { focusId: string; skillId: string; weight: number };
type ProjectLinkRow = {
  href: string;
  kind: string;
  label: string;
  projectId: string;
  sortOrder: number;
};
type ProjectSkillLinkRow = {
  projectId: string;
  skillId: string;
  sortOrder: number;
};
type ProjectFocusWeightRow = {
  focusId: string;
  projectId: string;
  weight: number;
};
type ExperienceFocusWeightRow = {
  experienceId: string;
  focusId: string;
  weight: number;
};
type ExperienceBulletRow = {
  experienceId: string;
  id: string;
  sortOrder: number;
  text: string;
  visibility: string;
};
type ExperienceBulletSkillLinkRow = {
  bulletId: string;
  skillId: string;
  sortOrder: number;
};
type ExperienceBulletFocusWeightRow = {
  bulletId: string;
  focusId: string;
  weight: number;
};
type ProfileHighlightFocusWeightRow = {
  focusId: string;
  highlightId: string;
  weight: number;
};

let astroDbModulePromise: Promise<AstroDbModule> | null = null;

function shouldLoadAstroDb() {
  return (
    process.env.NODE_ENV !== "production" ||
    Boolean(process.env.ASTRO_DATABASE_FILE) ||
    isAstroContentDbConfigured()
  );
}

async function loadAstroDbModule() {
  if (!shouldLoadAstroDb()) {
    return null;
  }

  try {
    astroDbModulePromise ??= import("astro:db");
    return await astroDbModulePromise;
  } catch (error) {
    // Reset so a transient import failure is retried on the next call
    // instead of poisoning the cached promise for the lifetime of the isolate.
    astroDbModulePromise = null;
    console.warn("[portfolio-content] astro:db unavailable:", error);
    return null;
  }
}

async function requireAstroDbModule() {
  const astroDb = await loadAstroDbModule();

  if (!astroDb) {
    throw new Error("Astro DB is not available for content persistence.");
  }

  return astroDb;
}

function cloneFallbackSnapshot(): PortfolioSnapshot {
  return JSON.parse(
    JSON.stringify(fallbackPortfolioSnapshot),
  ) as PortfolioSnapshot;
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  return value instanceof Date ? value.toISOString() : value;
}

function sortByOrder<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((left, right) => left.sortOrder - right.sortOrder);
}

function buildWeightRecord<T extends { focusId: string; weight: number }>(
  rows: readonly T[],
): FocusWeights {
  return Object.fromEntries(
    rows.map((row) => [row.focusId as FocusId, row.weight]),
  ) as FocusWeights;
}

function sanitizeSnapshot(snapshot: PortfolioSnapshot): PortfolioSnapshot {
  return {
    ...snapshot,
    mediaAssets: [...snapshot.mediaAssets],
    portfolioLinks: [...snapshot.portfolioLinks],
    experiences: [...snapshot.experiences],
    focusDefinitions: [...snapshot.focusDefinitions],
    profileHighlights: [...snapshot.profileHighlights],
    projects: [...snapshot.projects],
    revisions: undefined,
    skillDefinitions: [...snapshot.skillDefinitions],
    siteProfile: { ...snapshot.siteProfile },
    summaryTemplates: [...snapshot.summaryTemplates],
  };
}

async function loadPortfolioContentFromDb(): Promise<PortfolioSnapshot | null> {
  const astroDb = await loadAstroDbModule();

  if (!astroDb) {
    return null;
  }

  const {
    ContentRevisionTable,
    ExperienceBulletFocusWeightTable,
    ExperienceBulletSkillLinkTable,
    ExperienceBulletTable,
    ExperienceFocusWeightTable,
    ExperienceTable,
    FocusDefinitionTable,
    MediaAssetTable,
    PortfolioLinkTable,
    ProfileHighlightFocusWeightTable,
    ProfileHighlightTable,
    ProjectFocusWeightTable,
    ProjectLinkTable,
    ProjectSkillLinkTable,
    ProjectTable,
    SiteProfileTable,
    SkillFocusWeightTable,
    SkillTable,
    SummaryTemplateTable,
    asc,
    db,
    desc,
  } = astroDb;

  try {
    const [siteProfileRow] = await db.select().from(SiteProfileTable).limit(1);

    if (!siteProfileRow) {
      return null;
    }

    const [
      portfolioLinks,
      focusDefinitions,
      skills,
      skillFocusWeights,
      projects,
      projectLinks,
      projectSkillLinks,
      projectFocusWeights,
      experiences,
      experienceFocusWeights,
      experienceBullets,
      experienceBulletSkillLinks,
      experienceBulletFocusWeights,
      profileHighlights,
      profileHighlightFocusWeights,
      summaryTemplates,
      mediaAssets,
      revisions,
    ] = await Promise.all([
      db
        .select()
        .from(PortfolioLinkTable)
        .orderBy(asc(PortfolioLinkTable.sortOrder)),
      db
        .select()
        .from(FocusDefinitionTable)
        .orderBy(asc(FocusDefinitionTable.sortOrder)),
      db.select().from(SkillTable).orderBy(asc(SkillTable.sortOrder)),
      db.select().from(SkillFocusWeightTable),
      db.select().from(ProjectTable).orderBy(asc(ProjectTable.sortOrder)),
      db
        .select()
        .from(ProjectLinkTable)
        .orderBy(asc(ProjectLinkTable.sortOrder)),
      db
        .select()
        .from(ProjectSkillLinkTable)
        .orderBy(asc(ProjectSkillLinkTable.sortOrder)),
      db.select().from(ProjectFocusWeightTable),
      db.select().from(ExperienceTable).orderBy(asc(ExperienceTable.sortOrder)),
      db.select().from(ExperienceFocusWeightTable),
      db
        .select()
        .from(ExperienceBulletTable)
        .orderBy(asc(ExperienceBulletTable.sortOrder)),
      db
        .select()
        .from(ExperienceBulletSkillLinkTable)
        .orderBy(asc(ExperienceBulletSkillLinkTable.sortOrder)),
      db.select().from(ExperienceBulletFocusWeightTable),
      db
        .select()
        .from(ProfileHighlightTable)
        .orderBy(asc(ProfileHighlightTable.sortOrder)),
      db.select().from(ProfileHighlightFocusWeightTable),
      db
        .select()
        .from(SummaryTemplateTable)
        .orderBy(asc(SummaryTemplateTable.sortOrder)),
      db
        .select()
        .from(MediaAssetTable)
        .orderBy(desc(MediaAssetTable.updatedAt)),
      db
        .select()
        .from(ContentRevisionTable)
        .orderBy(desc(ContentRevisionTable.publishedAt))
        .limit(getContentHistoryLimit()),
    ]);

    const skillWeightMap = new Map<string, SkillFocusWeightRow[]>();
    for (const row of skillFocusWeights) {
      const existing = skillWeightMap.get(row.skillId) ?? [];
      existing.push(row);
      skillWeightMap.set(row.skillId, existing);
    }

    const projectLinkMap = new Map<string, ProjectLinkRow[]>();
    for (const row of projectLinks) {
      const existing = projectLinkMap.get(row.projectId) ?? [];
      existing.push(row);
      projectLinkMap.set(row.projectId, existing);
    }

    const projectSkillMap = new Map<string, ProjectSkillLinkRow[]>();
    for (const row of projectSkillLinks) {
      const existing = projectSkillMap.get(row.projectId) ?? [];
      existing.push(row);
      projectSkillMap.set(row.projectId, existing);
    }

    const projectWeightMap = new Map<string, ProjectFocusWeightRow[]>();
    for (const row of projectFocusWeights) {
      const existing = projectWeightMap.get(row.projectId) ?? [];
      existing.push(row);
      projectWeightMap.set(row.projectId, existing);
    }

    const experienceWeightMap = new Map<string, ExperienceFocusWeightRow[]>();
    for (const row of experienceFocusWeights) {
      const existing = experienceWeightMap.get(row.experienceId) ?? [];
      existing.push(row);
      experienceWeightMap.set(row.experienceId, existing);
    }

    const bulletByExperienceMap = new Map<string, ExperienceBulletRow[]>();
    for (const row of experienceBullets) {
      const existing = bulletByExperienceMap.get(row.experienceId) ?? [];
      existing.push(row);
      bulletByExperienceMap.set(row.experienceId, existing);
    }

    const bulletSkillMap = new Map<string, ExperienceBulletSkillLinkRow[]>();
    for (const row of experienceBulletSkillLinks) {
      const existing = bulletSkillMap.get(row.bulletId) ?? [];
      existing.push(row);
      bulletSkillMap.set(row.bulletId, existing);
    }

    const bulletWeightMap = new Map<string, ExperienceBulletFocusWeightRow[]>();
    for (const row of experienceBulletFocusWeights) {
      const existing = bulletWeightMap.get(row.bulletId) ?? [];
      existing.push(row);
      bulletWeightMap.set(row.bulletId, existing);
    }

    const highlightWeightMap = new Map<
      string,
      ProfileHighlightFocusWeightRow[]
    >();
    for (const row of profileHighlightFocusWeights) {
      const existing = highlightWeightMap.get(row.highlightId) ?? [];
      existing.push(row);
      highlightWeightMap.set(row.highlightId, existing);
    }

    const snapshot: PortfolioSnapshot = {
      siteProfile: {
        contentPromise: siteProfileRow.contentPromise,
        currentFocusLabels: (siteProfileRow.currentFocusLabels ??
          []) as string[],
        email: siteProfileRow.email,
        githubUrl: siteProfileRow.githubUrl,
        heroLabel: siteProfileRow.heroLabel,
        lastUpdatedLabel: siteProfileRow.lastUpdatedLabel,
        linkedinUrl: siteProfileRow.linkedinUrl,
        location: siteProfileRow.location,
        name: siteProfileRow.name,
        overview: (siteProfileRow.overview ?? []) as string[],
        profileImageUrl: siteProfileRow.profileImageUrl ?? undefined,
        recruiterPitch: siteProfileRow.recruiterPitch,
        timezone: siteProfileRow.timezone,
        title: siteProfileRow.title,
      } satisfies SiteProfile,
      portfolioLinks: portfolioLinks.map(
        (row): PortfolioLink => ({
          hash: row.hash,
          name: row.name,
        }),
      ),
      focusDefinitions: focusDefinitions.map(
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
      ),
      skillDefinitions: skills.map(
        (row): SkillDefinition => ({
          aliases: (row.aliases ?? []) as string[],
          category: row.category as SkillDefinition["category"],
          focusWeights: buildWeightRecord(skillWeightMap.get(row.id) ?? []),
          highlights: ((row.highlights as string[] | null) ?? undefined) as
            | string[]
            | undefined,
          id: row.id,
          label: row.label,
        }),
      ),
      projects: projects.map(
        (row): ProjectDefinition => ({
          caseStudy: ((row.caseStudy as ProjectCaseStudy | null) ??
            undefined) as ProjectCaseStudy | undefined,
          detail: row.detail,
          featured: row.featured,
          focusWeights: buildWeightRecord(projectWeightMap.get(row.id) ?? []),
          id: row.id,
          impact: row.impact,
          proofLinks: sortByOrder(projectLinkMap.get(row.id) ?? []).map(
            (link) => ({
              href: link.href,
              kind: link.kind as ProjectDefinition["proofLinks"][number]["kind"],
              label: link.label,
            }),
          ),
          publicProof: ((row.publicProof as ProjectPublicProof | null) ??
            undefined) as ProjectPublicProof | undefined,
          skillIds: sortByOrder(projectSkillMap.get(row.id) ?? []).map(
            (link) => link.skillId,
          ),
          slug: row.slug,
          summary: row.summary,
          title: row.title,
          visibility: row.visibility as ProjectDefinition["visibility"],
        }),
      ),
      experiences: experiences.map(
        (row): ExperienceDefinition => ({
          bullets: sortByOrder(bulletByExperienceMap.get(row.id) ?? []).map(
            (bullet) => ({
              focusWeights: buildWeightRecord(
                bulletWeightMap.get(bullet.id) ?? [],
              ),
              id: bullet.id,
              skillIds: sortByOrder(bulletSkillMap.get(bullet.id) ?? []).map(
                (skillLink) => skillLink.skillId,
              ),
              text: bullet.text,
              visibility:
                bullet.visibility as ExperienceDefinition["bullets"][number]["visibility"],
            }),
          ),
          company: row.company,
          companyUrl: row.companyUrl,
          date: row.date,
          description: row.description,
          focusWeights: buildWeightRecord(
            experienceWeightMap.get(row.id) ?? [],
          ),
          icon: row.icon,
          id: row.id,
          title: row.title,
          type: row.type as ExperienceDefinition["type"],
        }),
      ),
      profileHighlights: profileHighlights.map(
        (row): ProfileHighlight => ({
          detail: row.detail,
          focusWeights: buildWeightRecord(highlightWeightMap.get(row.id) ?? []),
          id: row.id,
          label: row.label,
          value: row.value,
        }),
      ),
      summaryTemplates: summaryTemplates.map(
        (row): SummaryTemplate => ({
          focusIds: (row.focusIds ?? []) as FocusId[],
          headline: row.headline,
          id: row.id,
          summary: row.summary,
        }),
      ),
      mediaAssets: mediaAssets.map(
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
      ),
      revisions: revisions.map(
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
      ),
    };

    return snapshot;
  } catch (error) {
    console.warn("[portfolio-content] Astro DB load failed:", error);
    return null;
  }
}

export async function getPortfolioContent(): Promise<PortfolioSnapshot> {
  const fromDb = await loadPortfolioContentFromDb();

  if (fromDb) {
    return fromDb;
  }

  const fromBackup = await loadBackupSnapshot();

  if (fromBackup) {
    return fromBackup;
  }

  return cloneFallbackSnapshot();
}

export async function listContentRevisions() {
  const snapshot = await getPortfolioContent();
  return [...(snapshot.revisions ?? [])];
}

async function clearContentTables(astroDb: AstroDbModule) {
  for (const tableKey of CONTENT_TABLE_KEYS) {
    await astroDb.db.delete(astroDb[tableKey] as never);
  }
}

function now() {
  return new Date();
}

async function insertMany<T extends Record<string, unknown>>(
  db: AstroDbModule["db"],
  table: unknown,
  rows: T[],
) {
  if (rows.length === 0) {
    return;
  }

  await db.insert(table as never).values(rows as never);
}

async function applyPortfolioContentSnapshot(
  snapshot: PortfolioSnapshot,
  revision?: Omit<ContentRevision, "id">,
) {
  const astroDb = await requireAstroDbModule();
  const {
    ContentRevisionTable,
    ExperienceBulletFocusWeightTable,
    ExperienceBulletSkillLinkTable,
    ExperienceBulletTable,
    ExperienceFocusWeightTable,
    ExperienceTable,
    FocusDefinitionTable,
    MediaAssetTable,
    PortfolioLinkTable,
    ProfileHighlightFocusWeightTable,
    ProfileHighlightTable,
    ProjectFocusWeightTable,
    ProjectLinkTable,
    ProjectSkillLinkTable,
    ProjectTable,
    SiteProfileTable,
    SkillFocusWeightTable,
    SkillTable,
    SummaryTemplateTable,
    db,
  } = astroDb;
  const sanitized = sanitizeSnapshot(snapshot);
  const timestamp = now();

  await clearContentTables(astroDb);

  await insertMany(db, SiteProfileTable, [
    {
      contentPromise: sanitized.siteProfile.contentPromise,
      currentFocusLabels: [...sanitized.siteProfile.currentFocusLabels],
      email: sanitized.siteProfile.email,
      githubUrl: sanitized.siteProfile.githubUrl,
      heroLabel: sanitized.siteProfile.heroLabel,
      id: "site-profile",
      lastUpdatedLabel: sanitized.siteProfile.lastUpdatedLabel,
      linkedinUrl: sanitized.siteProfile.linkedinUrl,
      location: sanitized.siteProfile.location,
      name: sanitized.siteProfile.name,
      overview: [...sanitized.siteProfile.overview],
      profileImageUrl: sanitized.siteProfile.profileImageUrl,
      recruiterPitch: sanitized.siteProfile.recruiterPitch,
      timezone: sanitized.siteProfile.timezone,
      title: sanitized.siteProfile.title,
      updatedAt: timestamp,
    },
  ]);

  await insertMany(
    db,
    PortfolioLinkTable,
    sanitized.portfolioLinks.map((link, index) => ({
      hash: link.hash,
      id: `portfolio-link:${index}`,
      name: link.name,
      sortOrder: index,
      updatedAt: timestamp,
    })),
  );

  await insertMany(
    db,
    FocusDefinitionTable,
    sanitized.focusDefinitions.map((focus, index) => ({
      aliases: [...focus.aliases],
      category: focus.category,
      description: focus.description,
      headline: focus.headline,
      id: focus.id,
      label: focus.label,
      relatedSkillIds: [...focus.relatedSkillIds],
      shortLabel: focus.shortLabel,
      sortOrder: index,
      summary: focus.summary,
      updatedAt: timestamp,
    })),
  );

  await insertMany(
    db,
    SkillTable,
    sanitized.skillDefinitions.map((skill, index) => ({
      aliases: [...skill.aliases],
      category: skill.category,
      highlights: skill.highlights ? [...skill.highlights] : null,
      id: skill.id,
      label: skill.label,
      sortOrder: index,
      updatedAt: timestamp,
    })),
  );
  await insertMany(
    db,
    SkillFocusWeightTable,
    sanitized.skillDefinitions.flatMap((skill) =>
      Object.entries(skill.focusWeights).map(([focusId, weight]) => ({
        focusId,
        id: `skill-weight:${skill.id}:${focusId}`,
        skillId: skill.id,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );

  await insertMany(
    db,
    ProjectTable,
    sanitized.projects.map((project, index) => ({
      caseStudy: project.caseStudy ?? null,
      detail: project.detail,
      featured: project.featured,
      id: project.id,
      impact: project.impact,
      publicProof: project.publicProof ?? null,
      slug: project.slug,
      sortOrder: index,
      summary: project.summary,
      title: project.title,
      updatedAt: timestamp,
      visibility: project.visibility,
    })),
  );
  await insertMany(
    db,
    ProjectLinkTable,
    sanitized.projects.flatMap((project) =>
      project.proofLinks.map((link, index) => ({
        href: link.href,
        id: `project-link:${project.id}:${index}`,
        kind: link.kind,
        label: link.label,
        projectId: project.id,
        sortOrder: index,
        updatedAt: timestamp,
      })),
    ),
  );
  await insertMany(
    db,
    ProjectSkillLinkTable,
    sanitized.projects.flatMap((project) =>
      project.skillIds.map((skillId, index) => ({
        id: `project-skill:${project.id}:${skillId}`,
        projectId: project.id,
        skillId,
        sortOrder: index,
        updatedAt: timestamp,
      })),
    ),
  );
  await insertMany(
    db,
    ProjectFocusWeightTable,
    sanitized.projects.flatMap((project) =>
      Object.entries(project.focusWeights).map(([focusId, weight]) => ({
        focusId,
        id: `project-weight:${project.id}:${focusId}`,
        projectId: project.id,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );

  await insertMany(
    db,
    ExperienceTable,
    sanitized.experiences.map((experience, index) => ({
      company: experience.company,
      companyUrl: experience.companyUrl,
      date: experience.date,
      description: experience.description,
      icon: experience.icon,
      id: experience.id,
      sortOrder: index,
      title: experience.title,
      type: experience.type,
      updatedAt: timestamp,
    })),
  );
  await insertMany(
    db,
    ExperienceFocusWeightTable,
    sanitized.experiences.flatMap((experience) =>
      Object.entries(experience.focusWeights).map(([focusId, weight]) => ({
        experienceId: experience.id,
        focusId,
        id: `experience-weight:${experience.id}:${focusId}`,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );
  await insertMany(
    db,
    ExperienceBulletTable,
    sanitized.experiences.flatMap((experience) =>
      experience.bullets.map((bullet, index) => ({
        experienceId: experience.id,
        id: bullet.id,
        sortOrder: index,
        text: bullet.text,
        updatedAt: timestamp,
        visibility: bullet.visibility,
      })),
    ),
  );
  await insertMany(
    db,
    ExperienceBulletSkillLinkTable,
    sanitized.experiences.flatMap((experience) =>
      experience.bullets.flatMap((bullet) =>
        bullet.skillIds.map((skillId, index) => ({
          bulletId: bullet.id,
          id: `bullet-skill:${bullet.id}:${skillId}`,
          skillId,
          sortOrder: index,
          updatedAt: timestamp,
        })),
      ),
    ),
  );
  await insertMany(
    db,
    ExperienceBulletFocusWeightTable,
    sanitized.experiences.flatMap((experience) =>
      experience.bullets.flatMap((bullet) =>
        Object.entries(bullet.focusWeights).map(([focusId, weight]) => ({
          bulletId: bullet.id,
          focusId,
          id: `bullet-weight:${bullet.id}:${focusId}`,
          updatedAt: timestamp,
          weight,
        })),
      ),
    ),
  );

  await insertMany(
    db,
    ProfileHighlightTable,
    sanitized.profileHighlights.map((highlight, index) => ({
      detail: highlight.detail,
      id: highlight.id,
      label: highlight.label,
      sortOrder: index,
      updatedAt: timestamp,
      value: highlight.value,
    })),
  );
  await insertMany(
    db,
    ProfileHighlightFocusWeightTable,
    sanitized.profileHighlights.flatMap((highlight) =>
      Object.entries(highlight.focusWeights).map(([focusId, weight]) => ({
        focusId,
        highlightId: highlight.id,
        id: `highlight-weight:${highlight.id}:${focusId}`,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );

  await insertMany(
    db,
    SummaryTemplateTable,
    sanitized.summaryTemplates.map((template, index) => ({
      focusIds: [...template.focusIds],
      headline: template.headline,
      id: template.id,
      sortOrder: index,
      summary: template.summary,
      updatedAt: timestamp,
    })),
  );

  await insertMany(
    db,
    MediaAssetTable,
    sanitized.mediaAssets.map((asset) => ({
      createdAt: new Date(asset.createdAt),
      entityId: asset.entityId,
      entityType: asset.entityType,
      fileName: asset.fileName,
      id: asset.id,
      kind: asset.kind,
      label: asset.label,
      mimeType: asset.mimeType,
      path: asset.path,
      updatedAt: new Date(asset.updatedAt),
      url: asset.url,
    })),
  );

  if (revision) {
    await insertMany(db, ContentRevisionTable, [
      {
        backupRepo: revision.backupRepo,
        branch: revision.branch,
        commitSha: revision.commitSha,
        currentPath: revision.currentPath,
        id: crypto.randomUUID(),
        publishedAt: new Date(revision.publishedAt),
        publishedBy: revision.publishedBy,
        snapshotPath: revision.snapshotPath,
        status: revision.status,
        summary: revision.summary,
      },
    ]);
  }
}

export async function publishPortfolioSnapshot(options: {
  actor: string;
  snapshot: PortfolioSnapshot;
  summary?: string;
}) {
  const sanitized = sanitizeSnapshot(options.snapshot);
  const backup = await writeSnapshotToBackup({
    actor: options.actor,
    snapshot: sanitized,
    summary: options.summary,
  });

  const revision: Omit<ContentRevision, "id"> = {
    backupRepo: backup.backupRepo,
    branch: backup.branch,
    commitSha: backup.commitSha,
    currentPath: backup.currentPath,
    publishedAt: new Date().toISOString(),
    publishedBy: options.actor,
    snapshotPath: backup.snapshotPath,
    status: "published",
    summary: options.summary,
  };

  try {
    await applyPortfolioContentSnapshot(sanitized, revision);
  } catch {
    const publishError = new Error(
      "Backup succeeded, but applying the content snapshot to Astro DB failed.",
    ) as Error & {
      backup: typeof backup;
      reason: string;
    };
    publishError.backup = backup;
    publishError.reason = "db-apply-failed";
    throw publishError;
  }

  return getPortfolioContent();
}

export async function seedPortfolioContent() {
  const existing = await loadPortfolioContentFromDb();

  if (existing) {
    return existing;
  }

  await applyPortfolioContentSnapshot(cloneFallbackSnapshot());
  return getPortfolioContent();
}
