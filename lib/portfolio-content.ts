import { asc, desc } from "drizzle-orm";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import * as schema from "@/db/drizzle/schema";
import {
  loadBackupSnapshot,
  writeSnapshotToBackup,
} from "@/lib/content-backup";
import { getDrizzleDb } from "@/lib/drizzle";
import { getContentHistoryLimit } from "@/lib/env";
import {
  mapExperiences,
  mapFocusDefinitions,
  mapFocusPresets,
  mapMediaAssets,
  mapPortfolioLinks,
  mapProfileHighlights,
  mapProjects,
  mapRevisions,
  mapSiteProfile,
  mapSkillDefinitions,
  mapSummaryTemplates,
} from "@/lib/portfolio-mappers";
import type {
  ContentRevision,
  PortfolioSnapshot,
} from "@/lib/portfolio-types";
import {
  insertExperiences,
  insertProfileHighlights,
  insertProjects,
} from "@/lib/portfolio-graph-writers";
import {
  clearAllContentTables,
  insertFocusDefinitions,
  insertFocusPresets,
  insertMediaAssets,
  insertPortfolioLinks,
  insertRevision,
  insertSiteProfile,
  insertSkills,
  insertSummaryTemplates,
} from "@/lib/portfolio-writers";

function cloneFallbackSnapshot(): PortfolioSnapshot {
  return JSON.parse(
    JSON.stringify(fallbackPortfolioSnapshot),
  ) as PortfolioSnapshot;
}


function sanitizeSnapshot(snapshot: PortfolioSnapshot): PortfolioSnapshot {
  return {
    ...snapshot,
    mediaAssets: [...snapshot.mediaAssets],
    portfolioLinks: [...snapshot.portfolioLinks],
    experiences: [...snapshot.experiences],
    focusDefinitions: [...snapshot.focusDefinitions],
    focusPresets: [...snapshot.focusPresets],
    profileHighlights: [...snapshot.profileHighlights],
    projects: [...snapshot.projects],
    revisions: undefined,
    skillDefinitions: [...snapshot.skillDefinitions],
    siteProfile: { ...snapshot.siteProfile },
    summaryTemplates: [...snapshot.summaryTemplates],
  };
}

async function loadPortfolioContentFromDb(): Promise<PortfolioSnapshot | null> {
  const db = getDrizzleDb();
  if (!db) return null;

  try {
    const [siteProfileRow] = await db
      .select()
      .from(schema.siteProfile)
      .limit(1);
    if (!siteProfileRow) return null;

    const [
      portfolioLinks, focusDefinitions, focusPresets,
      skills, skillFocusWeights,
      projects, projectLinks, projectSkillLinks, projectFocusWeights,
      experiences, experienceFocusWeights,
      experienceBullets, experienceBulletSkillLinks, experienceBulletFocusWeights,
      profileHighlights, profileHighlightFocusWeights,
      summaryTemplates, mediaAssets, revisions,
    ] = await Promise.all([
      db.select().from(schema.portfolioLink).orderBy(asc(schema.portfolioLink.sortOrder)),
      db.select().from(schema.focusDefinition).orderBy(asc(schema.focusDefinition.sortOrder)),
      db.select().from(schema.focusPreset).orderBy(asc(schema.focusPreset.sortOrder)),
      db.select().from(schema.skill).orderBy(asc(schema.skill.sortOrder)),
      db.select().from(schema.skillFocusWeight),
      db.select().from(schema.project).orderBy(asc(schema.project.sortOrder)),
      db.select().from(schema.projectLink).orderBy(asc(schema.projectLink.sortOrder)),
      db.select().from(schema.projectSkillLink).orderBy(asc(schema.projectSkillLink.sortOrder)),
      db.select().from(schema.projectFocusWeight),
      db.select().from(schema.experience).orderBy(asc(schema.experience.sortOrder)),
      db.select().from(schema.experienceFocusWeight),
      db.select().from(schema.experienceBullet).orderBy(asc(schema.experienceBullet.sortOrder)),
      db.select().from(schema.experienceBulletSkillLink).orderBy(asc(schema.experienceBulletSkillLink.sortOrder)),
      db.select().from(schema.experienceBulletFocusWeight),
      db.select().from(schema.profileHighlight).orderBy(asc(schema.profileHighlight.sortOrder)),
      db.select().from(schema.profileHighlightFocusWeight),
      db.select().from(schema.summaryTemplate).orderBy(asc(schema.summaryTemplate.sortOrder)),
      db.select().from(schema.mediaAsset).orderBy(desc(schema.mediaAsset.updatedAt)),
      db.select().from(schema.contentRevision).orderBy(desc(schema.contentRevision.publishedAt)).limit(getContentHistoryLimit()),
    ]);

    return {
      siteProfile: mapSiteProfile(siteProfileRow),
      portfolioLinks: mapPortfolioLinks(portfolioLinks),
      focusDefinitions: mapFocusDefinitions(focusDefinitions),
      focusPresets: mapFocusPresets(focusPresets),
      skillDefinitions: mapSkillDefinitions(skills, skillFocusWeights),
      projects: mapProjects(projects, {
        links: projectLinks,
        skillLinks: projectSkillLinks,
        weights: projectFocusWeights,
      }),
      experiences: mapExperiences(experiences, {
        weights: experienceFocusWeights,
        bullets: experienceBullets,
        bulletSkills: experienceBulletSkillLinks,
        bulletWeights: experienceBulletFocusWeights,
      }),
      profileHighlights: mapProfileHighlights(profileHighlights, profileHighlightFocusWeights),
      summaryTemplates: mapSummaryTemplates(summaryTemplates),
      mediaAssets: mapMediaAssets(mediaAssets),
      revisions: mapRevisions(revisions),
    };
  } catch (error) {
    console.warn("[portfolio-content] Drizzle DB load failed:", error);
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

function now() {
  return new Date();
}

async function applyPortfolioContentSnapshot(
  snapshot: PortfolioSnapshot,
  revision?: Omit<ContentRevision, "id">,
) {
  const db = getDrizzleDb();
  if (!db) {
    throw new Error("Drizzle DB is not available for content persistence.");
  }

  const sanitized = sanitizeSnapshot(snapshot);
  const timestamp = now();

  await db.transaction(async (tx) => {
    await clearAllContentTables(tx);

    // Insert in parent-first FK order
    await insertSiteProfile(tx, sanitized.siteProfile, timestamp);
    await insertPortfolioLinks(tx, sanitized.portfolioLinks, timestamp);
    await insertFocusDefinitions(tx, sanitized.focusDefinitions, timestamp);
    await insertFocusPresets(tx, sanitized.focusPresets, timestamp);
    await insertSkills(tx, sanitized.skillDefinitions, timestamp);
    await insertProjects(tx, sanitized.projects, timestamp);
    await insertExperiences(tx, sanitized.experiences, timestamp);
    await insertProfileHighlights(tx, sanitized.profileHighlights, timestamp);
    await insertSummaryTemplates(tx, sanitized.summaryTemplates, timestamp);
    await insertMediaAssets(tx, sanitized.mediaAssets);
    if (revision) {
      await insertRevision(tx, revision);
    }
  });
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
  } catch (error) {
    console.warn("[portfolio-content] DB snapshot apply failed after backup:", error);
    const publishError = new Error(
      "Backup succeeded, but applying the content snapshot to the database failed.",
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
