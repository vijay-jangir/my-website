#!/usr/bin/env node
// allow: SIZE_OK — self-contained one-time migration script; splitting by
// concern would scatter a linear data-transformation pipeline across files.
//
// One-time migration: Astro DB / GitHub backup → Neon Postgres via Drizzle.
//
// Usage:
//   node scripts/migrate-to-neon.mjs [--dry-run] [--force] [--help]
//
// Sources (tried in order):
//   1. GitHub backup  state/current.json  (CONTENT_BACKUP_REPO env)
//   2. Bundled fallback  content/portfolio.ts
//
// Target:
//   Neon Postgres via DATABASE_URL  (19 content tables; skips resume_variants
//   and jd_requests which are already in Neon).

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { count } from "drizzle-orm";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const help = args.includes("--help") || args.includes("-h");

if (help) {
  console.log(`
  migrate-to-neon — one-time Astro DB → Neon Postgres migration

  Usage
    node scripts/migrate-to-neon.mjs [options]

  Options
    --dry-run   Print per-table row counts without writing anything
    --force     Delete existing content rows before inserting (required if
                target tables are non-empty)
    --help      Show this message

  Environment
    DATABASE_URL            Neon Postgres connection string (required for
                            real runs; optional for --dry-run)
    CONTENT_BACKUP_REPO     owner/repo of the GitHub backup (optional)
    CONTENT_BACKUP_BRANCH   branch name (default: content-backup)
  `);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Drizzle schema (dynamic import — Node 24 strips the TS syntax)
// ---------------------------------------------------------------------------
let schema;
try {
  schema = await import("../db/drizzle/schema.ts");
} catch (err) {
  console.error(
    "Failed to import Drizzle schema (db/drizzle/schema.ts).\n" +
      "Ensure you are running Node 24+ which supports .ts type-stripping.\n" +
      "Detail:",
    err.message,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// DB connection (optional for --dry-run)
// ---------------------------------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL;
let db = null;

if (DATABASE_URL) {
  const sql = neon(DATABASE_URL);
  db = drizzle({ client: sql });
} else if (!dryRun) {
  console.error(
    "Error: DATABASE_URL is required for a real migration run.\n" +
      "Set it in the environment, or use --dry-run to preview source counts.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Table registry — insertion order satisfies FK constraints
// ---------------------------------------------------------------------------
const TABLE_DEFS = [
  { key: "siteProfile", name: "site_profile", table: schema.siteProfile },
  { key: "portfolioLink", name: "portfolio_link", table: schema.portfolioLink },
  {
    key: "focusDefinition",
    name: "focus_definition",
    table: schema.focusDefinition,
  },
  { key: "skill", name: "skill", table: schema.skill },
  {
    key: "skillFocusWeight",
    name: "skill_focus_weight",
    table: schema.skillFocusWeight,
  },
  { key: "project", name: "project", table: schema.project },
  { key: "projectLink", name: "project_link", table: schema.projectLink },
  {
    key: "projectSkillLink",
    name: "project_skill_link",
    table: schema.projectSkillLink,
  },
  {
    key: "projectFocusWeight",
    name: "project_focus_weight",
    table: schema.projectFocusWeight,
  },
  { key: "experience", name: "experience", table: schema.experience },
  {
    key: "experienceFocusWeight",
    name: "experience_focus_weight",
    table: schema.experienceFocusWeight,
  },
  {
    key: "experienceBullet",
    name: "experience_bullet",
    table: schema.experienceBullet,
  },
  {
    key: "experienceBulletSkillLink",
    name: "experience_bullet_skill_link",
    table: schema.experienceBulletSkillLink,
  },
  {
    key: "experienceBulletFocusWeight",
    name: "experience_bullet_focus_weight",
    table: schema.experienceBulletFocusWeight,
  },
  {
    key: "profileHighlight",
    name: "profile_highlight",
    table: schema.profileHighlight,
  },
  {
    key: "profileHighlightFocusWeight",
    name: "profile_highlight_focus_weight",
    table: schema.profileHighlightFocusWeight,
  },
  {
    key: "summaryTemplate",
    name: "summary_template",
    table: schema.summaryTemplate,
  },
  { key: "mediaAsset", name: "media_asset", table: schema.mediaAsset },
  {
    key: "contentRevision",
    name: "content_revision",
    table: schema.contentRevision,
  },
];

// ---------------------------------------------------------------------------
// Snapshot loading
// ---------------------------------------------------------------------------
async function loadSnapshot() {
  const repo = process.env.CONTENT_BACKUP_REPO;
  const branch = process.env.CONTENT_BACKUP_BRANCH ?? "content-backup";

  if (repo) {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/state/current.json`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) {
        console.log(`[source] Loaded snapshot from GitHub backup: ${url}`);
        return await res.json();
      }
      console.warn(`[source] GitHub backup returned ${res.status}, trying bundled fallback…`);
    } catch (err) {
      console.warn(`[source] GitHub backup fetch failed: ${err.message}`);
    }
  }

  try {
    const mod = await import("../content/portfolio.ts");
    console.log("[source] Loaded snapshot from bundled fallback (content/portfolio.ts)");
    return JSON.parse(JSON.stringify(mod.fallbackPortfolioSnapshot));
  } catch (err) {
    console.error(
      "Failed to load bundled fallback (content/portfolio.ts).\n" +
        "Detail:",
      err.message,
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Snapshot → per-table row sets  (mirrors applyPortfolioContentSnapshot)
// ---------------------------------------------------------------------------
function focusWeightRows(prefix, fkField, fkId, weights, ts) {
  return Object.entries(weights).map(([focusId, weight]) => ({
    id: `${prefix}:${fkId}:${focusId}`,
    [fkField]: fkId,
    focusId,
    weight,
    updatedAt: ts,
  }));
}

function decomposeSnapshot(snapshot) {
  const ts = new Date();

  return {
    siteProfile: [
      {
        id: "site-profile",
        name: snapshot.siteProfile.name,
        title: snapshot.siteProfile.title,
        location: snapshot.siteProfile.location,
        timezone: snapshot.siteProfile.timezone,
        lastUpdatedLabel: snapshot.siteProfile.lastUpdatedLabel,
        contentPromise: snapshot.siteProfile.contentPromise,
        currentFocusLabels: [...snapshot.siteProfile.currentFocusLabels],
        email: snapshot.siteProfile.email,
        githubUrl: snapshot.siteProfile.githubUrl,
        linkedinUrl: snapshot.siteProfile.linkedinUrl,
        profileImageUrl: snapshot.siteProfile.profileImageUrl ?? null,
        heroLabel: snapshot.siteProfile.heroLabel,
        recruiterPitch: snapshot.siteProfile.recruiterPitch,
        overview: [...snapshot.siteProfile.overview],
        updatedAt: ts,
      },
    ],
    portfolioLink: snapshot.portfolioLinks.map((link, i) => ({
      id: `portfolio-link:${i}`,
      name: link.name,
      hash: link.hash,
      sortOrder: i,
      updatedAt: ts,
    })),
    focusDefinition: snapshot.focusDefinitions.map((f, i) => ({
      id: f.id,
      label: f.label,
      shortLabel: f.shortLabel,
      category: f.category,
      headline: f.headline,
      summary: f.summary,
      description: f.description,
      aliases: [...f.aliases],
      relatedSkillIds: [...f.relatedSkillIds],
      sortOrder: i,
      updatedAt: ts,
    })),
    skill: snapshot.skillDefinitions.map((s, i) => ({
      id: s.id,
      label: s.label,
      category: s.category,
      aliases: [...s.aliases],
      highlights: s.highlights ? [...s.highlights] : null,
      sortOrder: i,
      updatedAt: ts,
    })),
    skillFocusWeight: snapshot.skillDefinitions.flatMap((s) =>
      focusWeightRows("skill-weight", "skillId", s.id, s.focusWeights, ts),
    ),
    project: snapshot.projects.map((p, i) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      impact: p.impact,
      detail: p.detail,
      featured: p.featured,
      visibility: p.visibility,
      caseStudy: p.caseStudy ?? null,
      publicProof: p.publicProof ?? null,
      sortOrder: i,
      updatedAt: ts,
    })),
    projectLink: snapshot.projects.flatMap((p) =>
      (p.proofLinks ?? []).map((link, i) => ({
        id: `project-link:${p.id}:${i}`,
        projectId: p.id,
        label: link.label,
        href: link.href,
        kind: link.kind,
        sortOrder: i,
        updatedAt: ts,
      })),
    ),
    projectSkillLink: snapshot.projects.flatMap((p) =>
      (p.skillIds ?? []).map((skillId, i) => ({
        id: `project-skill:${p.id}:${skillId}`,
        projectId: p.id,
        skillId,
        sortOrder: i,
        updatedAt: ts,
      })),
    ),
    projectFocusWeight: snapshot.projects.flatMap((p) =>
      focusWeightRows("project-weight", "projectId", p.id, p.focusWeights, ts),
    ),
    experience: snapshot.experiences.map((e, i) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      companyUrl: e.companyUrl,
      type: e.type,
      description: e.description,
      date: e.date,
      icon: e.icon,
      sortOrder: i,
      updatedAt: ts,
    })),
    experienceFocusWeight: snapshot.experiences.flatMap((e) =>
      focusWeightRows("experience-weight", "experienceId", e.id, e.focusWeights, ts),
    ),
    experienceBullet: snapshot.experiences.flatMap((e) =>
      e.bullets.map((b, i) => ({
        id: b.id,
        experienceId: e.id,
        text: b.text,
        visibility: b.visibility,
        sortOrder: i,
        updatedAt: ts,
      })),
    ),
    experienceBulletSkillLink: snapshot.experiences.flatMap((e) =>
      e.bullets.flatMap((b) =>
        (b.skillIds ?? []).map((skillId, i) => ({
          id: `bullet-skill:${b.id}:${skillId}`,
          bulletId: b.id,
          skillId,
          sortOrder: i,
          updatedAt: ts,
        })),
      ),
    ),
    experienceBulletFocusWeight: snapshot.experiences.flatMap((e) =>
      e.bullets.flatMap((b) =>
        focusWeightRows("bullet-weight", "bulletId", b.id, b.focusWeights, ts),
      ),
    ),
    profileHighlight: (snapshot.profileHighlights ?? []).map((h, i) => ({
      id: h.id,
      label: h.label,
      value: h.value,
      detail: h.detail,
      sortOrder: i,
      updatedAt: ts,
    })),
    profileHighlightFocusWeight: (snapshot.profileHighlights ?? []).flatMap(
      (h) =>
        focusWeightRows("highlight-weight", "highlightId", h.id, h.focusWeights, ts),
    ),
    summaryTemplate: (snapshot.summaryTemplates ?? []).map((t, i) => ({
      id: t.id,
      focusIds: [...t.focusIds],
      headline: t.headline,
      summary: t.summary,
      sortOrder: i,
      updatedAt: ts,
    })),
    mediaAsset: (snapshot.mediaAssets ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      kind: a.kind,
      mimeType: a.mimeType,
      fileName: a.fileName,
      url: a.url,
      path: a.path,
      entityType: a.entityType ?? null,
      entityId: a.entityId ?? null,
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
    })),
    contentRevision: (snapshot.revisions ?? []).map((r) => ({
      id: r.id,
      snapshotPath: r.snapshotPath,
      currentPath: r.currentPath,
      commitSha: r.commitSha ?? null,
      backupRepo: r.backupRepo,
      branch: r.branch,
      publishedBy: r.publishedBy,
      status: r.status,
      summary: r.summary ?? null,
      publishedAt: new Date(r.publishedAt),
    })),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function countTargetRows() {
  const results = [];
  for (const def of TABLE_DEFS) {
    const [row] = await db.select({ value: count() }).from(def.table);
    results.push({ name: def.name, count: Number(row.value) });
  }
  return results;
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function rpad(str, len) {
  return String(str).padStart(len);
}

function printTable(header, rows) {
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length)),
  );
  const sep = widths.map((w) => "─".repeat(w)).join("──");
  const fmtRow = (r) =>
    r.map((c, i) => (typeof c === "number" ? rpad(c, widths[i]) : pad(c, widths[i]))).join("  ");

  console.log(fmtRow(header));
  console.log(sep);
  for (const r of rows) console.log(fmtRow(r));
  console.log(sep);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const snapshot = await loadSnapshot();
  const rows = decomposeSnapshot(snapshot);

  const sourceCounts = TABLE_DEFS.map((def) => ({
    name: def.name,
    count: rows[def.key].length,
  }));
  const sourceTotal = sourceCounts.reduce((sum, r) => sum + r.count, 0);

  // ── dry-run ──────────────────────────────────────────────────────────────
  if (dryRun) {
    console.log(`\nMode: dry-run (no writes)\n`);

    if (db) {
      const targetCounts = await countTargetRows();
      printTable(
        ["Table", "Source", "Target"],
        [
          ...sourceCounts.map((s) => {
            const t = targetCounts.find((tc) => tc.name === s.name);
            return [s.name, s.count, t?.count ?? "?"];
          }),
          ["TOTAL", sourceTotal, targetCounts.reduce((sum, r) => sum + r.count, 0)],
        ],
      );
    } else {
      console.log("(DATABASE_URL not set — showing source counts only)\n");
      printTable(
        ["Table", "Source Rows"],
        [...sourceCounts.map((s) => [s.name, s.count]), ["TOTAL", sourceTotal]],
      );
    }

    console.log("\nresume_variants     (skipped — already in Neon)");
    console.log("jd_requests         (skipped — already in Neon)\n");
    process.exit(0);
  }

  // ── pre-flight: check target tables ──────────────────────────────────────
  const targetCounts = await countTargetRows();
  const nonEmpty = targetCounts.filter((t) => t.count > 0);

  if (nonEmpty.length > 0 && !force) {
    console.error("Error: target tables are non-empty. Use --force to delete and re-insert.\n");
    for (const { name, count: c } of nonEmpty) {
      console.error(`  ${name}: ${c} rows`);
    }
    process.exit(1);
  }

  // ── migrate inside a single transaction ──────────────────────────────────
  console.log(`\nMigrating ${sourceTotal} rows across ${TABLE_DEFS.length} tables…\n`);

  await db.transaction(async (tx) => {
    if (force && nonEmpty.length > 0) {
      console.log("Deleting existing content rows (--force)…");
      for (const def of [...TABLE_DEFS].reverse()) {
        await tx.delete(def.table);
      }
    }

    for (const def of TABLE_DEFS) {
      const tableRows = rows[def.key];
      if (tableRows.length > 0) {
        await tx.insert(def.table).values(tableRows);
      }
    }
  });

  console.log("Transaction committed.\n");

  // ── reconciliation ───────────────────────────────────────────────────────
  const finalCounts = await countTargetRows();
  const finalTotal = finalCounts.reduce((sum, r) => sum + r.count, 0);
  const allMatch = sourceCounts.every((s) => {
    const f = finalCounts.find((fc) => fc.name === s.name);
    return f && f.count === s.count;
  });

  printTable(
    ["Table", "Source", "Target", "Match"],
    [
      ...sourceCounts.map((s) => {
        const f = finalCounts.find((fc) => fc.name === s.name);
        const match = f && f.count === s.count ? "✓" : "✗";
        return [s.name, s.count, f?.count ?? "?", match];
      }),
      ["TOTAL", sourceTotal, finalTotal, allMatch ? "✓" : "✗"],
    ],
  );

  console.log("\nresume_variants     (skipped — already in Neon)");
  console.log("jd_requests         (skipped — already in Neon)");

  if (!allMatch) {
    console.error("\n✗ Row count mismatch detected. Investigate before proceeding.");
    process.exit(1);
  }

  console.log("\n✓ Migration complete. All row counts match.\n");
}

main().catch((err) => {
  console.error("Migration failed:", err.message ?? err);
  process.exit(1);
});
