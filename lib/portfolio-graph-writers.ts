/**
 * Writers for entities with child-table graphs: projects, experiences, highlights.
 * Each sub-function handles a single DB table to stay under the 50-line ceiling.
 */
import * as schema from "@/db/drizzle/schema";
import type {
  ExperienceDefinition,
  PortfolioSnapshot,
  ProfileHighlight,
} from "@/lib/portfolio-types";
import type { ContentTx } from "@/lib/portfolio-writers";

async function insertRows<T extends Record<string, unknown>>(
  tx: ContentTx,
  table: unknown,
  rows: T[],
): Promise<void> {
  if (rows.length > 0) {
    await tx.insert(table as never).values(rows as never);
  }
}

async function insertProjectRows(
  tx: ContentTx,
  projects: readonly PortfolioSnapshot["projects"],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.project,
    projects.map((p, index) => ({
      caseStudy: p.caseStudy ?? null,
      detail: p.detail,
      featured: p.featured,
      id: p.id,
      impact: p.impact,
      publicProof: p.publicProof ?? null,
      slug: p.slug,
      sortOrder: index,
      summary: p.summary,
      title: p.title,
      updatedAt: timestamp,
      visibility: p.visibility,
    })),
  );
}

async function insertProjectChildTables(
  tx: ContentTx,
  projects: readonly PortfolioSnapshot["projects"],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.projectLink,
    projects.flatMap((p) =>
      p.proofLinks.map((link, index) => ({
        href: link.href,
        id: `project-link:${p.id}:${index}`,
        kind: link.kind,
        label: link.label,
        projectId: p.id,
        sortOrder: index,
        updatedAt: timestamp,
      })),
    ),
  );
  await insertRows(
    tx,
    schema.projectSkillLink,
    projects.flatMap((p) =>
      p.skillIds.map((skillId, index) => ({
        id: `project-skill:${p.id}:${skillId}`,
        projectId: p.id,
        skillId,
        sortOrder: index,
        updatedAt: timestamp,
      })),
    ),
  );
  await insertRows(
    tx,
    schema.projectFocusWeight,
    projects.flatMap((p) =>
      Object.entries(p.focusWeights).map(([focusId, weight]) => ({
        focusId,
        id: `project-weight:${p.id}:${focusId}`,
        projectId: p.id,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );
}

export async function insertProjects(
  tx: ContentTx,
  projects: readonly PortfolioSnapshot["projects"],
  timestamp: Date,
): Promise<void> {
  await insertProjectRows(tx, projects, timestamp);
  await insertProjectChildTables(tx, projects, timestamp);
}

async function insertExperienceRows(
  tx: ContentTx,
  experiences: readonly ExperienceDefinition[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.experience,
    experiences.map((exp, index) => ({
      company: exp.company,
      companyUrl: exp.companyUrl,
      date: exp.date,
      description: exp.description,
      icon: exp.icon,
      id: exp.id,
      sortOrder: index,
      title: exp.title,
      type: exp.type,
      updatedAt: timestamp,
    })),
  );
  await insertRows(
    tx,
    schema.experienceFocusWeight,
    experiences.flatMap((exp) =>
      Object.entries(exp.focusWeights).map(([focusId, weight]) => ({
        experienceId: exp.id,
        focusId,
        id: `experience-weight:${exp.id}:${focusId}`,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );
}

async function insertExperienceBulletTables(
  tx: ContentTx,
  experiences: readonly ExperienceDefinition[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.experienceBullet,
    experiences.flatMap((exp) =>
      exp.bullets.map((bullet, index) => ({
        experienceId: exp.id,
        id: bullet.id,
        sortOrder: index,
        text: bullet.text,
        updatedAt: timestamp,
        visibility: bullet.visibility,
      })),
    ),
  );
  await insertRows(
    tx,
    schema.experienceBulletSkillLink,
    experiences.flatMap((exp) =>
      exp.bullets.flatMap((bullet) =>
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
  await insertRows(
    tx,
    schema.experienceBulletFocusWeight,
    experiences.flatMap((exp) =>
      exp.bullets.flatMap((bullet) =>
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
}

export async function insertExperiences(
  tx: ContentTx,
  experiences: readonly ExperienceDefinition[],
  timestamp: Date,
): Promise<void> {
  await insertExperienceRows(tx, experiences, timestamp);
  await insertExperienceBulletTables(tx, experiences, timestamp);
}

export async function insertProfileHighlights(
  tx: ContentTx,
  highlights: readonly ProfileHighlight[],
  timestamp: Date,
): Promise<void> {
  await insertRows(
    tx,
    schema.profileHighlight,
    highlights.map((h, index) => ({
      detail: h.detail,
      id: h.id,
      label: h.label,
      sortOrder: index,
      updatedAt: timestamp,
      value: h.value,
    })),
  );
  await insertRows(
    tx,
    schema.profileHighlightFocusWeight,
    highlights.flatMap((h) =>
      Object.entries(h.focusWeights).map(([focusId, weight]) => ({
        focusId,
        highlightId: h.id,
        id: `highlight-weight:${h.id}:${focusId}`,
        updatedAt: timestamp,
        weight,
      })),
    ),
  );
}
