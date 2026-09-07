import crypto from "node:crypto";

import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";

import {
  appendMediaAsset,
  deleteExperience,
  deleteProject,
  deleteSkill,
  publishAdvancedCollections,
  upsertExperience,
  upsertProfile,
  upsertProject,
  upsertSkill,
} from "@/lib/portfolio-admin";
import { putBackupFile } from "@/lib/content-backup";
import {
  getPortfolioContent,
  listContentRevisions,
  publishPortfolioSnapshot,
} from "@/lib/portfolio-content";
import { isDatabaseConfigured, isContentBackupConfigured } from "@/lib/env";
import type {
  FocusDefinition,
  FocusPreset,
  PortfolioSnapshot,
  ProfileHighlight,
  SummaryTemplate,
} from "@/lib/portfolio-types";
import { getSessionUser } from "@/src/lib/auth";

const focusWeightsSchema = z.record(z.string(), z.number()).default({});

const portfolioLinkSchema = z.object({
  hash: z.string().min(1),
  name: z.string().min(1),
});

const focusDefinitionSchema = z.object({
  aliases: z.array(z.string()).default([]),
  category: z.enum(["role", "technology", "domain"]),
  description: z.string().min(1),
  headline: z.string().min(1),
  id: z.string().min(1),
  label: z.string().min(1),
  relatedSkillIds: z.array(z.string()).default([]),
  shortLabel: z.string().min(1),
  summary: z.string().min(1),
});

const siteProfileSchema = z.object({
  contentPromise: z.string().min(1),
  currentFocusLabels: z.array(z.string()).default([]),
  email: z.email(),
  githubUrl: z.url(),
  heroLabel: z.string().min(1),
  lastUpdatedLabel: z.string().min(1),
  linkedinUrl: z.url(),
  location: z.string().min(1),
  name: z.string().min(1),
  overview: z.array(z.string().min(1)).min(1),
  profileImageUrl: z.string().min(1).optional(),
  recruiterPitch: z.string().min(1),
  timezone: z.string().min(1),
  title: z.string().min(1),
});

const skillSchema = z.object({
  aliases: z.array(z.string()).default([]),
  category: z.enum([
    "language",
    "framework",
    "platform",
    "data",
    "ai",
    "tooling",
  ]),
  focusWeights: focusWeightsSchema,
  highlights: z.array(z.string()).optional(),
  id: z.string().min(1),
  label: z.string().min(1),
});

const proofLinkSchema = z.object({
  href: z.url(),
  kind: z.enum(["repo", "demo", "article", "case-study"]),
  label: z.string().min(1),
});

const projectProofTypeSchema = z.enum([
  "sanitized-diagram",
  "metric",
  "open-source-reference",
  "public-repo",
  "article",
  "private-enterprise",
]);

const projectMetricSchema = z.object({
  detail: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
});

const projectDecisionSchema = z.object({
  detail: z.string().min(1),
  label: z.string().min(1),
});

const projectCaseStudySchema = z.object({
  architecture: z.array(z.string().min(1)).default([]),
  confidentiality: z.string().min(1),
  context: z.string().min(1),
  decisions: z.array(projectDecisionSchema).default([]),
  headline: z.string().min(1),
  lessons: z.array(z.string().min(1)).default([]),
  metrics: z.array(projectMetricSchema).default([]),
  organization: z.string().min(1),
  responsibilities: z.array(z.string().min(1)).default([]),
  role: z.string().min(1),
  team: z.string().min(1),
  timeframe: z.string().min(1),
});

const projectProofArtifactSchema = z.object({
  detail: z.string().min(1),
  href: z.url().optional(),
  label: z.string().min(1),
  type: projectProofTypeSchema,
});

const projectPublicProofSchema = z.object({
  architectureShape: z.array(z.string().min(1)).default([]),
  artifacts: z.array(projectProofArtifactSchema).default([]),
  confidentialityNotes: z.array(z.string().min(1)).default([]),
  constraints: z.array(z.string().min(1)).default([]),
  proofTypes: z.array(projectProofTypeSchema).default([]),
  responsibilities: z.array(z.string().min(1)).default([]),
  scaleSignals: z.array(projectMetricSchema).default([]),
});

const projectSchema = z.object({
  caseStudy: projectCaseStudySchema.optional(),
  detail: z.string().min(1),
  featured: z.boolean().default(false),
  focusWeights: focusWeightsSchema,
  id: z.string().min(1),
  impact: z.string().min(1),
  proofLinks: z.array(proofLinkSchema).default([]),
  publicProof: projectPublicProofSchema.optional(),
  skillIds: z.array(z.string()).default([]),
  slug: z.string().min(1),
  summary: z.string().min(1),
  title: z.string().min(1),
  visibility: z.enum(["public", "limited"]).default("public"),
});

const experienceBulletSchema = z.object({
  focusWeights: focusWeightsSchema,
  id: z.string().min(1),
  skillIds: z.array(z.string()).default([]),
  text: z.string().min(1),
  visibility: z.enum(["public", "limited"]).default("public"),
});

const experienceSchema = z.object({
  bullets: z.array(experienceBulletSchema).default([]),
  company: z.string().min(1),
  companyUrl: z.url(),
  date: z.string().min(1),
  description: z.string().min(1),
  focusWeights: focusWeightsSchema,
  icon: z.string().min(1),
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.literal("employment"),
});

const profileHighlightSchema = z.object({
  detail: z.string().min(1),
  focusWeights: focusWeightsSchema,
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
});

const summaryTemplateSchema = z.object({
  focusIds: z.array(z.string()).default([]),
  headline: z.string().min(1),
  id: z.string().min(1),
  summary: z.string().min(1),
});

const focusPresetSchema = z.object({
  description: z.string().min(1),
  focusIds: z.array(z.string()).default([]),
  id: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().int().min(0),
});

const portfolioSnapshotSchema = z.object({
  experiences: z.array(experienceSchema),
  focusDefinitions: z.array(focusDefinitionSchema),
  focusPresets: z.array(focusPresetSchema),
  mediaAssets: z
    .array(
      z.object({
        createdAt: z.string(),
        entityId: z.string().optional(),
        entityType: z
          .enum(["site-profile", "project", "experience", "general"])
          .optional(),
        fileName: z.string().min(1),
        id: z.string().min(1),
        kind: z.enum(["image", "pdf", "document", "other"]),
        label: z.string().min(1),
        mimeType: z.string().min(1),
        path: z.string().min(1),
        updatedAt: z.string(),
        url: z.url(),
      }),
    )
    .default([]),
  portfolioLinks: z.array(portfolioLinkSchema),
  profileHighlights: z.array(profileHighlightSchema),
  projects: z.array(projectSchema),
  siteProfile: siteProfileSchema,
  skillDefinitions: z.array(skillSchema),
  summaryTemplates: z.array(summaryTemplateSchema),
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireOwner(cookies: Parameters<typeof getSessionUser>[0]) {
  const session = await getSessionUser(cookies);

  if (!session || session.role !== "owner") {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Owner authentication is required.",
    });
  }

  if (!isContentBackupConfigured()) {
    throw new ActionError({
      code: "PRECONDITION_FAILED",
      message:
        "CONTENT_BACKUP_REPO and CONTENT_BACKUP_PAT must be configured before content publishing is enabled.",
    });
  }

  if (process.env.NODE_ENV === "production" && !isDatabaseConfigured()) {
    throw new ActionError({
      code: "PRECONDITION_FAILED",
      message:
        "DATABASE_URL must be configured before production content publishing is enabled.",
    });
  }

  return session;
}

async function finalizeSnapshot(options: {
  actor: string;
  snapshot: PortfolioSnapshot;
  summary: string;
}) {
  const snapshot = await publishPortfolioSnapshot({
    actor: options.actor,
    snapshot: options.snapshot,
    summary: options.summary,
  });

  return {
    revisions: snapshot.revisions ?? [],
    snapshot,
  };
}

function toPortfolioSnapshot(
  snapshot: z.infer<typeof portfolioSnapshotSchema>,
): PortfolioSnapshot {
  return snapshot as unknown as PortfolioSnapshot;
}

function toFocusDefinitions(
  focusDefinitions?: z.infer<typeof focusDefinitionSchema>[],
): readonly FocusDefinition[] | undefined {
  return focusDefinitions as unknown as readonly FocusDefinition[] | undefined;
}

function toProfileHighlights(
  profileHighlights?: z.infer<typeof profileHighlightSchema>[],
): readonly ProfileHighlight[] | undefined {
  return profileHighlights as unknown as
    | readonly ProfileHighlight[]
    | undefined;
}

function toSummaryTemplates(
  summaryTemplates?: z.infer<typeof summaryTemplateSchema>[],
): readonly SummaryTemplate[] | undefined {
  return summaryTemplates as unknown as readonly SummaryTemplate[] | undefined;
}

function toFocusPresets(
  focusPresets?: z.infer<typeof focusPresetSchema>[],
): readonly FocusPreset[] | undefined {
  return focusPresets as unknown as readonly FocusPreset[] | undefined;
}

function inferFileExtension(fileName: string, mimeType: string) {
  const existing = fileName.split(".").pop();

  if (existing && existing !== fileName) {
    return existing.toLowerCase();
  }

  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  return "bin";
}

function defineCrudActions<T extends z.ZodType>(config: {
  readonly deleteFn: (
    snapshot: PortfolioSnapshot,
    id: string,
  ) => PortfolioSnapshot;
  readonly entityName: string;
  readonly getLabel: (input: z.infer<T>) => string;
  readonly schema: T;
  readonly upsertFn: (
    snapshot: PortfolioSnapshot,
    data: z.infer<T>,
  ) => PortfolioSnapshot;
}) {
  const { deleteFn, entityName, getLabel, schema, upsertFn } = config;

  function upsertAction(verb: string) {
    return defineAction({
      input: schema,
      handler: async (input, context) => {
        const session = await requireOwner(context.cookies);
        const snapshot = await getPortfolioContent();
        return finalizeSnapshot({
          actor: session.login,
          snapshot: upsertFn(snapshot, input),
          summary: `${verb} ${entityName} ${getLabel(input)}`,
        });
      },
    });
  }

  return {
    create: upsertAction("Saved"),
    delete: defineAction({
      input: z.object({ id: z.string().min(1) }),
      handler: async (input, context) => {
        const session = await requireOwner(context.cookies);
        const snapshot = await getPortfolioContent();
        return finalizeSnapshot({
          actor: session.login,
          snapshot: deleteFn(snapshot, input.id),
          summary: `Deleted ${entityName} ${input.id}`,
        });
      },
    }),
    update: upsertAction("Updated"),
  } as const;
}

const skillActions = defineCrudActions({
  deleteFn: deleteSkill,
  entityName: "skill",
  getLabel: (input) => input.label,
  schema: skillSchema,
  upsertFn: upsertSkill,
});

const projectActions = defineCrudActions({
  deleteFn: deleteProject,
  entityName: "project",
  getLabel: (input) => input.title,
  schema: projectSchema,
  upsertFn: upsertProject,
});

const experienceActions = defineCrudActions({
  deleteFn: deleteExperience,
  entityName: "experience",
  getLabel: (input) => input.company,
  schema: experienceSchema,
  upsertFn: upsertExperience,
});

export const server = {
  upsertProfile: defineAction({
    input: siteProfileSchema,
    handler: async (input, context) => {
      const session = await requireOwner(context.cookies);
      const snapshot = await getPortfolioContent();
      return finalizeSnapshot({
        actor: session.login,
        snapshot: upsertProfile(snapshot, input),
        summary: "Updated site profile",
      });
    },
  }),
  createSkill: skillActions.create,
  updateSkill: skillActions.update,
  deleteSkill: skillActions.delete,
  createProject: projectActions.create,
  updateProject: projectActions.update,
  deleteProject: projectActions.delete,
  createExperience: experienceActions.create,
  updateExperience: experienceActions.update,
  deleteExperience: experienceActions.delete,
  publishContentSnapshot: defineAction({
    input: z.object({
      focusDefinitions: z.array(focusDefinitionSchema).optional(),
      focusPresets: z.array(focusPresetSchema).optional(),
      profileHighlights: z.array(profileHighlightSchema).optional(),
      snapshot: portfolioSnapshotSchema.optional(),
      summary: z.string().max(200).optional(),
      summaryTemplates: z.array(summaryTemplateSchema).optional(),
    }),
    handler: async (input, context) => {
      const session = await requireOwner(context.cookies);
      const current = await getPortfolioContent();
      const nextSnapshot = input.snapshot
        ? toPortfolioSnapshot(input.snapshot)
        : publishAdvancedCollections(current, {
            focusDefinitions: toFocusDefinitions(input.focusDefinitions),
            focusPresets: toFocusPresets(input.focusPresets),
            profileHighlights: toProfileHighlights(input.profileHighlights),
            summaryTemplates: toSummaryTemplates(input.summaryTemplates),
          });

      return finalizeSnapshot({
        actor: session.login,
        snapshot: nextSnapshot,
        summary: input.summary ?? "Published content snapshot",
      });
    },
  }),
  uploadMedia: defineAction({
    accept: "form",
    input: z.object({
      entityId: z.string().optional(),
      entityType: z
        .enum(["site-profile", "project", "experience", "general"])
        .optional(),
      file: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Choose a file to upload.")
        .refine(
          (file) => file.size <= 8 * 1024 * 1024,
          "File must be 8 MB or smaller.",
        ),
      kind: z.enum(["image", "pdf", "document", "other"]),
      label: z.string().min(1),
    }),
    handler: async (input, context) => {
      const session = await requireOwner(context.cookies);
      const snapshot = await getPortfolioContent();
      const ext = inferFileExtension(input.file.name, input.file.type);
      const timestamp = new Date().toISOString().replaceAll(":", "-");
      const entitySegment = input.entityId
        ? `${slugify(input.entityId)}`
        : "general";
      const path = `media/${new Date().getUTCFullYear()}/${input.entityType ?? "general"}/${entitySegment}-${timestamp}.${ext}`;
      const upload = await putBackupFile({
        content: new Uint8Array(await input.file.arrayBuffer()),
        message: `Upload media by ${session.login}: ${input.label}`,
        path,
      });

      if (!upload.url) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Media upload succeeded, but the public URL could not be determined.",
        });
      }

      const asset = {
        createdAt: new Date().toISOString(),
        entityId: input.entityId,
        entityType: input.entityType,
        fileName: input.file.name,
        id: crypto.randomUUID(),
        kind: input.kind,
        label: input.label,
        mimeType: input.file.type || "application/octet-stream",
        path,
        updatedAt: new Date().toISOString(),
        url: upload.url,
      };

      return finalizeSnapshot({
        actor: session.login,
        snapshot: appendMediaAsset(snapshot, asset),
        summary: `Uploaded media ${input.label}`,
      });
    },
  }),
  listRevisions: defineAction({
    handler: async (_input, context) => {
      await requireOwner(context.cookies);
      const revisions = await listContentRevisions();
      return { revisions };
    },
  }),
};
