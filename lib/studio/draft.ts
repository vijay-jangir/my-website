/**
 * Blog draft generation module.
 *
 * Takes the owner's topic + notes + LLM output and writes a Markdown file
 * with `draft: true` into `src/content/blog/`. Owner reviews, edits, and
 * flips draft to false manually. NOTHING auto-publishes. NOTHING reaches Wix.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

import { complete } from "@/lib/llm/index";
import {
  buildBlogDraftPrompt,
  parseDraftOutput,
  type BlogDraftInput,
} from "@/lib/llm/prompts/blog-draft";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DraftResult = {
  readonly slug: string;
  readonly filePath: string;
  readonly metaDescription: string;
  readonly tags: readonly string[];
};

export type GenerateDraftInput = {
  readonly title: string;
  readonly ownerNotes: string;
  readonly keywords?: readonly string[];
  readonly focusArea?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildFrontmatter(opts: {
  title: string;
  description: string;
  tags: readonly string[];
  publishedAt: string;
}): string {
  const tagsList = opts.tags.length > 0
    ? `[${opts.tags.map((t) => `"${t}"`).join(", ")}]`
    : "[]";

  return [
    "---",
    `title: "${opts.title.replace(/"/g, '\\"')}"`,
    `description: "${opts.description.replace(/"/g, '\\"')}"`,
    `publishedAt: ${opts.publishedAt}`,
    `tags: ${tagsList}`,
    "draft: true",
    "---",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Content directory resolution
// ---------------------------------------------------------------------------

const CONTENT_BLOG_DIR = join(
  process.cwd(),
  "src",
  "content",
  "blog",
);

/** Exposed for testing — override content directory. */
export function getContentBlogDir(): string {
  return CONTENT_BLOG_DIR;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function generateDraft(
  input: GenerateDraftInput,
): Promise<DraftResult> {
  const draftInput: BlogDraftInput = {
    title: input.title,
    ownerNotes: input.ownerNotes,
    keywords: input.keywords,
    focusArea: input.focusArea,
  };

  const { system, prompt } = buildBlogDraftPrompt(draftInput);
  const raw = await complete({ system, prompt, maxTokens: 2048 });
  const { body, metaDescription, tags } = parseDraftOutput(raw);

  const slug = slugify(input.title);
  const fileName = `${slug}.md`;
  const dir = getContentBlogDir();

  await mkdir(dir, { recursive: true });

  const frontmatter = buildFrontmatter({
    title: input.title,
    description: metaDescription || `Draft: ${input.title}`,
    tags,
    publishedAt: todayIso(),
  });

  const fileContent = `${frontmatter}\n\n${body}\n`;
  const filePath = join(dir, fileName);

  await writeFile(filePath, fileContent, "utf-8");

  return {
    slug,
    filePath,
    metaDescription: metaDescription || `Draft: ${input.title}`,
    tags,
  };
}
