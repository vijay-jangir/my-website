// allow: SIZE_OK — 21 pgTable definitions are a single pure-data-table registry;
// splitting by entity would scatter the FK reference graph across files for no
// readability gain.

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// 1. SiteProfile
// ---------------------------------------------------------------------------
export const siteProfile = pgTable("site_profile", {
  id: text().primaryKey(),
  name: text().notNull(),
  title: text().notNull(),
  location: text().notNull(),
  timezone: text().notNull(),
  lastUpdatedLabel: text("last_updated_label").notNull(),
  contentPromise: text("content_promise").notNull(),
  currentFocusLabels: jsonb("current_focus_labels").notNull(),
  email: text().notNull(),
  githubUrl: text("github_url").notNull(),
  linkedinUrl: text("linkedin_url").notNull(),
  profileImageUrl: text("profile_image_url"),
  heroLabel: text("hero_label").notNull(),
  recruiterPitch: text("recruiter_pitch").notNull(),
  overview: jsonb().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 2. PortfolioLink
// ---------------------------------------------------------------------------
export const portfolioLink = pgTable("portfolio_link", {
  id: text().primaryKey(),
  name: text().notNull(),
  hash: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 3. FocusDefinition
// ---------------------------------------------------------------------------
export const focusDefinition = pgTable("focus_definition", {
  id: text().primaryKey(),
  label: text().notNull(),
  shortLabel: text("short_label").notNull(),
  category: text().notNull(),
  headline: text().notNull(),
  summary: text().notNull(),
  description: text().notNull(),
  aliases: jsonb().notNull(),
  relatedSkillIds: jsonb("related_skill_ids").notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 4. Skill
// ---------------------------------------------------------------------------
export const skill = pgTable("skill", {
  id: text().primaryKey(),
  label: text().notNull(),
  category: text().notNull(),
  aliases: jsonb().notNull(),
  highlights: jsonb(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 5. SkillFocusWeight
// ---------------------------------------------------------------------------
export const skillFocusWeight = pgTable("skill_focus_weight", {
  id: text().primaryKey(),
  skillId: text("skill_id")
    .notNull()
    .references(() => skill.id),
  focusId: text("focus_id")
    .notNull()
    .references(() => focusDefinition.id),
  weight: real().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 6. Project
// ---------------------------------------------------------------------------
export const project = pgTable("project", {
  id: text().primaryKey(),
  slug: text().notNull(),
  title: text().notNull(),
  summary: text().notNull(),
  impact: text().notNull(),
  detail: text().notNull(),
  featured: boolean().notNull(),
  visibility: text().notNull(),
  caseStudy: jsonb("case_study"),
  publicProof: jsonb("public_proof"),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 7. ProjectLink
// ---------------------------------------------------------------------------
export const projectLink = pgTable("project_link", {
  id: text().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  label: text().notNull(),
  href: text().notNull(),
  kind: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 8. ProjectSkillLink
// ---------------------------------------------------------------------------
export const projectSkillLink = pgTable("project_skill_link", {
  id: text().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  skillId: text("skill_id")
    .notNull()
    .references(() => skill.id),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 9. ProjectFocusWeight
// ---------------------------------------------------------------------------
export const projectFocusWeight = pgTable("project_focus_weight", {
  id: text().primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  focusId: text("focus_id")
    .notNull()
    .references(() => focusDefinition.id),
  weight: real().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 10. Experience
// ---------------------------------------------------------------------------
export const experience = pgTable("experience", {
  id: text().primaryKey(),
  title: text().notNull(),
  company: text().notNull(),
  companyUrl: text("company_url").notNull(),
  type: text().notNull(),
  description: text().notNull(),
  date: text().notNull(),
  icon: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 11. ExperienceFocusWeight
// ---------------------------------------------------------------------------
export const experienceFocusWeight = pgTable("experience_focus_weight", {
  id: text().primaryKey(),
  experienceId: text("experience_id")
    .notNull()
    .references(() => experience.id),
  focusId: text("focus_id")
    .notNull()
    .references(() => focusDefinition.id),
  weight: real().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 12. ExperienceBullet
// ---------------------------------------------------------------------------
export const experienceBullet = pgTable("experience_bullet", {
  id: text().primaryKey(),
  experienceId: text("experience_id")
    .notNull()
    .references(() => experience.id),
  text: text().notNull(),
  visibility: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 13. ExperienceBulletSkillLink
// ---------------------------------------------------------------------------
export const experienceBulletSkillLink = pgTable(
  "experience_bullet_skill_link",
  {
    id: text().primaryKey(),
    bulletId: text("bullet_id")
      .notNull()
      .references(() => experienceBullet.id),
    skillId: text("skill_id")
      .notNull()
      .references(() => skill.id),
    sortOrder: integer("sort_order").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

// ---------------------------------------------------------------------------
// 14. ExperienceBulletFocusWeight
// ---------------------------------------------------------------------------
export const experienceBulletFocusWeight = pgTable(
  "experience_bullet_focus_weight",
  {
    id: text().primaryKey(),
    bulletId: text("bullet_id")
      .notNull()
      .references(() => experienceBullet.id),
    focusId: text("focus_id")
      .notNull()
      .references(() => focusDefinition.id),
    weight: real().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

// ---------------------------------------------------------------------------
// 15. ProfileHighlight
// ---------------------------------------------------------------------------
export const profileHighlight = pgTable("profile_highlight", {
  id: text().primaryKey(),
  label: text().notNull(),
  value: text().notNull(),
  detail: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 16. ProfileHighlightFocusWeight
// ---------------------------------------------------------------------------
export const profileHighlightFocusWeight = pgTable(
  "profile_highlight_focus_weight",
  {
    id: text().primaryKey(),
    highlightId: text("highlight_id")
      .notNull()
      .references(() => profileHighlight.id),
    focusId: text("focus_id")
      .notNull()
      .references(() => focusDefinition.id),
    weight: real().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

// ---------------------------------------------------------------------------
// 17. SummaryTemplate
// ---------------------------------------------------------------------------
export const summaryTemplate = pgTable("summary_template", {
  id: text().primaryKey(),
  focusIds: jsonb("focus_ids").notNull(),
  headline: text().notNull(),
  summary: text().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 18. MediaAsset
// ---------------------------------------------------------------------------
export const mediaAsset = pgTable("media_asset", {
  id: text().primaryKey(),
  label: text().notNull(),
  kind: text().notNull(),
  mimeType: text("mime_type").notNull(),
  fileName: text("file_name").notNull(),
  url: text().notNull(),
  path: text().notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 19. ContentRevision
// ---------------------------------------------------------------------------
export const contentRevision = pgTable("content_revision", {
  id: text().primaryKey(),
  snapshotPath: text("snapshot_path").notNull(),
  currentPath: text("current_path").notNull(),
  commitSha: text("commit_sha"),
  backupRepo: text("backup_repo").notNull(),
  branch: text().notNull(),
  publishedBy: text("published_by").notNull(),
  status: text().notNull(),
  summary: text(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// 20. ResumeVariant (from db/schema.sql)
// ---------------------------------------------------------------------------
export const resumeVariant = pgTable(
  "resume_variants",
  {
    id: uuid().primaryKey().defaultRandom(),
    token: text().notNull().unique(),
    focusIds: text("focus_ids").array().notNull().default([]),
    variant: jsonb().notNull(),
    analysis: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
  },
  (t) => [index("resume_variants_focus_ids_idx").using("gin", t.focusIds)],
);

// ---------------------------------------------------------------------------
// 21. JdRequest (from db/schema.sql)
// ---------------------------------------------------------------------------
export const jdRequest = pgTable(
  "jd_requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    focusIds: text("focus_ids").array().notNull().default([]),
    rawText: text("raw_text"),
    extraction: jsonb().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)),
  },
  (t) => [index("jd_requests_focus_ids_idx").using("gin", t.focusIds)],
);
