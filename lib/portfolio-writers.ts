/**
 * Per-entity insert functions for simple (single/dual-table) entities.
 * Complex entity graphs (projects, experiences, highlights) live in
 * portfolio-graph-writers.ts to keep both files under the LOC ceiling.
 */
import crypto from "node:crypto";

import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/db/drizzle/schema";
import type {
  ContentRevision,
  FocusDefinition,
  FocusPreset,
  MediaAsset,
  PortfolioLink,
  SiteProfile,
  SkillDefinition,
  SummaryTemplate,
} from "@/lib/portfolio-types";

/** Transaction type from NeonHttpDatabase.transaction callback. */
export type ContentTx = Parameters<
  Parameters<NeonHttpDatabase["transaction"]>[0]
>[0];

export async function insertRows<T extends Record<string, unknown>>(
  tx: ContentTx,
  table: unknown,
  rows: T[],
): Promise<void> {
  if (rows.length > 0) {
    await tx.insert(table as never).values(rows as never);
  }
}

/** Delete all content tables in FK dependency order (children first). */
export async function clearAllContentTables(tx: ContentTx): Promise<void> {
  await tx.delete(schema.experienceBulletFocusWeight);
  await tx.delete(schema.experienceBulletSkillLink);
  await tx.delete(schema.experienceBullet);
  await tx.delete(schema.experienceFocusWeight);
  await tx.delete(schema.profileHighlightFocusWeight);
  await tx.delete(schema.projectFocusWeight);
  await tx.delete(schema.projectSkillLink);
  await tx.delete(schema.projectLink);
  await tx.delete(schema.skillFocusWeight);
  await tx.delete(schema.experience);
  await tx.delete(schema.project);
  await tx.delete(schema.skill);
  await tx.delete(schema.profileHighlight);
  await tx.delete(schema.summaryTemplate);
  await tx.delete(schema.mediaAsset);
  await tx.delete(schema.contentRevision);
  await tx.delete(schema.portfolioLink);
  await tx.delete(schema.focusPreset);
  await tx.delete(schema.focusDefinition);
  await tx.delete(schema.siteProfile);
}

export async function insertSiteProfile(
  tx: ContentTx,
  profile: SiteProfile,
  timestamp: Date,
): Promise<void> {
  await insertRows(tx, schema.siteProfile, [
    {
      contentPromise: profile.contentPromise,
      currentFocusLabels: [...profile.currentFocusLabels],
      email: profile.email,
      githubUrl: profile.githubUrl,
      heroLabel: profile.heroLabel,
      id: "site-profile",
      lastUpdatedLabel: profile.lastUpdatedLabel,
      linkedinUrl: profile.linkedinUrl,
      location: profile.location,
      name: profile.name,
      overview: [...profile.overview],
      profileImageUrl: profile.profileImageUrl,
      recruiterPitch: profile.recruiterPitch,
      timezone: profile.timezone,
      title: profile.title,
      updatedAt: timestamp,
    },
  ]);
}

export async function insertPortfolioLinks(
  tx: ContentTx,
  links: readonly PortfolioLink[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.portfolioLink,
    links.map((link, index) => ({
      hash: link.hash,
      id: `portfolio-link:${index}`,
      name: link.name,
      sortOrder: index,
      updatedAt: timestamp,
    })),
  );
}

export async function insertFocusDefinitions(
  tx: ContentTx,
  definitions: readonly FocusDefinition[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.focusDefinition,
    definitions.map((focus, index) => ({
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
}

export async function insertFocusPresets(
  tx: ContentTx,
  presets: readonly FocusPreset[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.focusPreset,
    presets.map((preset, index) => ({
      description: preset.description,
      focusIds: [...preset.focusIds],
      id: preset.id,
      label: preset.label,
      sortOrder: index,
      updatedAt: timestamp,
    })),
  );
}

export async function insertSkills(
  tx: ContentTx,
  skills: readonly SkillDefinition[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.skill,
    skills.map((skill, index) => ({
      aliases: [...skill.aliases],
      category: skill.category,
      highlights: skill.highlights ? [...skill.highlights] : null,
      id: skill.id,
      label: skill.label,
      sortOrder: index,
      updatedAt: timestamp,
    })),
  );
  await insertRows(
    tx,
    schema.skillFocusWeight,
    skills.flatMap((skill) =>
      Object.entries(skill.focusWeights).map(([focusId, weight]) => ({
        focusId,
        id: `skill-weight:${skill.id}:${focusId}`,
        skillId: skill.id,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );
}

export async function insertSummaryTemplates(
  tx: ContentTx,
  templates: readonly SummaryTemplate[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.summaryTemplate,
    templates.map((t, index) => ({
      focusIds: [...t.focusIds],
      headline: t.headline,
      id: t.id,
      sortOrder: index,
      summary: t.summary,
      updatedAt: timestamp,
    })),
  );
}

export async function insertMediaAssets(
  tx: ContentTx,
  assets: readonly MediaAsset[],
): Promise<void> {
  await insertRows(
    tx,
    schema.mediaAsset,
    assets.map((asset) => ({
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
}

export async function insertRevision(
  tx: ContentTx,
  revision: Omit<ContentRevision, "id">,
): Promise<void> {
  await insertRows(tx, schema.contentRevision, [
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
