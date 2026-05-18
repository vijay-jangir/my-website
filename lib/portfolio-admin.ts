import type {
  ExperienceDefinition,
  FocusDefinition,
  MediaAsset,
  PortfolioSnapshot,
  ProfileHighlight,
  ProjectDefinition,
  SiteProfile,
  SkillDefinition,
  SummaryTemplate,
} from "@/lib/portfolio-types";

function replaceOrAppendById<T extends { id: string }>(
  items: readonly T[],
  nextItem: T,
) {
  const existingIndex = items.findIndex((item) => item.id === nextItem.id);

  if (existingIndex === -1) {
    return [...items, nextItem];
  }

  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}

function removeById<T extends { id: string }>(items: readonly T[], id: string) {
  return items.filter((item) => item.id !== id);
}

function formatMonthYear(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function withUpdatedTimestamp(snapshot: PortfolioSnapshot) {
  return {
    ...snapshot,
    siteProfile: {
      ...snapshot.siteProfile,
      lastUpdatedLabel: formatMonthYear(),
    },
  } satisfies PortfolioSnapshot;
}

export function upsertProfile(
  snapshot: PortfolioSnapshot,
  profile: SiteProfile,
): PortfolioSnapshot {
  return withUpdatedTimestamp({
    ...snapshot,
    siteProfile: profile,
  });
}

export function upsertSkill(
  snapshot: PortfolioSnapshot,
  skill: SkillDefinition,
): PortfolioSnapshot {
  return withUpdatedTimestamp({
    ...snapshot,
    skillDefinitions: replaceOrAppendById(snapshot.skillDefinitions, skill),
  });
}

export function deleteSkill(snapshot: PortfolioSnapshot, skillId: string) {
  const referencedByProject = snapshot.projects.find((project) =>
    project.skillIds.includes(skillId),
  );
  const referencedByExperience = snapshot.experiences.find((experience) =>
    experience.bullets.some((bullet) => bullet.skillIds.includes(skillId)),
  );
  const referencedByFocus = snapshot.focusDefinitions.find((focus) =>
    focus.relatedSkillIds.includes(skillId),
  );

  if (referencedByProject || referencedByExperience || referencedByFocus) {
    throw new Error(
      "Remove or replace all references to this skill before deleting it.",
    );
  }

  return withUpdatedTimestamp({
    ...snapshot,
    skillDefinitions: removeById(snapshot.skillDefinitions, skillId),
  });
}

export function upsertProject(
  snapshot: PortfolioSnapshot,
  project: ProjectDefinition,
): PortfolioSnapshot {
  return withUpdatedTimestamp({
    ...snapshot,
    projects: replaceOrAppendById(snapshot.projects, project),
  });
}

export function deleteProject(snapshot: PortfolioSnapshot, projectId: string) {
  return withUpdatedTimestamp({
    ...snapshot,
    projects: removeById(snapshot.projects, projectId),
  });
}

export function upsertExperience(
  snapshot: PortfolioSnapshot,
  experience: ExperienceDefinition,
): PortfolioSnapshot {
  return withUpdatedTimestamp({
    ...snapshot,
    experiences: replaceOrAppendById(snapshot.experiences, experience),
  });
}

export function deleteExperience(
  snapshot: PortfolioSnapshot,
  experienceId: string,
) {
  return withUpdatedTimestamp({
    ...snapshot,
    experiences: removeById(snapshot.experiences, experienceId),
  });
}

export function appendMediaAsset(
  snapshot: PortfolioSnapshot,
  asset: MediaAsset,
): PortfolioSnapshot {
  return withUpdatedTimestamp({
    ...snapshot,
    mediaAssets: [
      asset,
      ...snapshot.mediaAssets.filter((item) => item.id !== asset.id),
    ],
  });
}

export function publishAdvancedCollections(
  snapshot: PortfolioSnapshot,
  updates: Partial<{
    focusDefinitions: readonly FocusDefinition[];
    profileHighlights: readonly ProfileHighlight[];
    summaryTemplates: readonly SummaryTemplate[];
  }>,
): PortfolioSnapshot {
  return withUpdatedTimestamp({
    ...snapshot,
    ...(updates.focusDefinitions
      ? { focusDefinitions: [...updates.focusDefinitions] }
      : {}),
    ...(updates.profileHighlights
      ? { profileHighlights: [...updates.profileHighlights] }
      : {}),
    ...(updates.summaryTemplates
      ? { summaryTemplates: [...updates.summaryTemplates] }
      : {}),
  });
}
