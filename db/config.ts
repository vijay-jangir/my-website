import {
  NOW,
  column,
  defineDb,
  defineTable,
} from "@astrojs/db/dist/runtime/virtual.js";

const SiteProfileTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    title: column.text(),
    location: column.text(),
    timezone: column.text(),
    lastUpdatedLabel: column.text(),
    contentPromise: column.text(),
    currentFocusLabels: column.json(),
    email: column.text(),
    githubUrl: column.text(),
    linkedinUrl: column.text(),
    profileImageUrl: column.text({ optional: true }),
    heroLabel: column.text({ multiline: true }),
    recruiterPitch: column.text({ multiline: true }),
    overview: column.json(),
    updatedAt: column.date({ default: NOW }),
  },
});

const PortfolioLinkTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    hash: column.text(),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const FocusDefinitionTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    label: column.text(),
    shortLabel: column.text(),
    category: column.text(),
    headline: column.text(),
    summary: column.text({ multiline: true }),
    description: column.text({ multiline: true }),
    aliases: column.json(),
    relatedSkillIds: column.json(),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const SkillTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    label: column.text(),
    category: column.text(),
    aliases: column.json(),
    highlights: column.json({ optional: true }),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const SkillFocusWeightTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    skillId: column.text({ references: () => SkillTable.columns.id }),
    focusId: column.text({ references: () => FocusDefinitionTable.columns.id }),
    weight: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ProjectTable = defineTable({
  columns: {
    caseStudy: column.json({ optional: true }),
    id: column.text({ primaryKey: true }),
    publicProof: column.json({ optional: true }),
    slug: column.text(),
    title: column.text(),
    summary: column.text({ multiline: true }),
    impact: column.text({ multiline: true }),
    detail: column.text({ multiline: true }),
    featured: column.boolean(),
    visibility: column.text(),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ProjectLinkTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => ProjectTable.columns.id }),
    label: column.text(),
    href: column.text(),
    kind: column.text(),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ProjectSkillLinkTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => ProjectTable.columns.id }),
    skillId: column.text({ references: () => SkillTable.columns.id }),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ProjectFocusWeightTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text({ references: () => ProjectTable.columns.id }),
    focusId: column.text({ references: () => FocusDefinitionTable.columns.id }),
    weight: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ExperienceTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    title: column.text(),
    company: column.text(),
    companyUrl: column.text(),
    type: column.text(),
    description: column.text({ multiline: true }),
    date: column.text(),
    icon: column.text(),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ExperienceFocusWeightTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    experienceId: column.text({ references: () => ExperienceTable.columns.id }),
    focusId: column.text({ references: () => FocusDefinitionTable.columns.id }),
    weight: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ExperienceBulletTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    experienceId: column.text({ references: () => ExperienceTable.columns.id }),
    text: column.text({ multiline: true }),
    visibility: column.text(),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ExperienceBulletSkillLinkTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    bulletId: column.text({
      references: () => ExperienceBulletTable.columns.id,
    }),
    skillId: column.text({ references: () => SkillTable.columns.id }),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ExperienceBulletFocusWeightTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    bulletId: column.text({
      references: () => ExperienceBulletTable.columns.id,
    }),
    focusId: column.text({ references: () => FocusDefinitionTable.columns.id }),
    weight: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ProfileHighlightTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    label: column.text(),
    value: column.text(),
    detail: column.text({ multiline: true }),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const ProfileHighlightFocusWeightTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    highlightId: column.text({
      references: () => ProfileHighlightTable.columns.id,
    }),
    focusId: column.text({ references: () => FocusDefinitionTable.columns.id }),
    weight: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const SummaryTemplateTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    focusIds: column.json(),
    headline: column.text(),
    summary: column.text({ multiline: true }),
    sortOrder: column.number(),
    updatedAt: column.date({ default: NOW }),
  },
});

const MediaAssetTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    label: column.text(),
    kind: column.text(),
    mimeType: column.text(),
    fileName: column.text(),
    url: column.text(),
    path: column.text(),
    entityType: column.text({ optional: true }),
    entityId: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

const ContentRevisionTable = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    snapshotPath: column.text(),
    currentPath: column.text(),
    commitSha: column.text({ optional: true }),
    backupRepo: column.text(),
    branch: column.text(),
    publishedBy: column.text(),
    status: column.text(),
    summary: column.text({ optional: true }),
    publishedAt: column.date({ default: NOW }),
  },
});

export default defineDb({
  tables: {
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
  },
});
