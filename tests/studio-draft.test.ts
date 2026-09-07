import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildBlogDraftPrompt,
  parseDraftOutput,
} from "@/lib/llm/prompts/blog-draft";

// ---------------------------------------------------------------------------
// Prompt builder tests
// ---------------------------------------------------------------------------

describe("buildBlogDraftPrompt", () => {
  it("includes the title and owner notes in the prompt", () => {
    const result = buildBlogDraftPrompt({
      title: "Why Kafka Matters",
      ownerNotes: "- Handles 1M events/sec\n- Schema registry is essential",
    });

    expect(result.system).toContain("MUST NOT introduce ANY fact");
    expect(result.prompt).toContain("Why Kafka Matters");
    expect(result.prompt).toContain("1M events/sec");
    expect(result.prompt).toContain("Schema registry");
  });

  it("includes keywords when provided", () => {
    const result = buildBlogDraftPrompt({
      title: "Test",
      ownerNotes: "Notes",
      keywords: ["kafka", "streaming"],
    });

    expect(result.prompt).toContain("kafka, streaming");
  });

  it("includes focus area when provided", () => {
    const result = buildBlogDraftPrompt({
      title: "Test",
      ownerNotes: "Notes",
      focusArea: "data-platform",
    });

    expect(result.prompt).toContain("data-platform");
  });

  it("omits keywords section when not provided", () => {
    const result = buildBlogDraftPrompt({
      title: "Test",
      ownerNotes: "Notes",
    });

    expect(result.prompt).not.toContain("Target keywords:");
  });
});

describe("parseDraftOutput", () => {
  it("extracts body and metadata from well-formed output", () => {
    const raw = `## Introduction

This is the body.

## Conclusion

End of post.

\`\`\`json
{"metaDescription": "A post about Kafka", "tags": ["kafka", "streaming"]}
\`\`\``;

    const result = parseDraftOutput(raw);

    expect(result.body).toContain("This is the body.");
    expect(result.body).toContain("End of post.");
    expect(result.body).not.toContain("metaDescription");
    expect(result.metaDescription).toBe("A post about Kafka");
    expect(result.tags).toEqual(["kafka", "streaming"]);
  });

  it("returns full body when no JSON block is present", () => {
    const raw = "## Just a post\n\nNo metadata here.";
    const result = parseDraftOutput(raw);

    expect(result.body).toBe(raw);
    expect(result.metaDescription).toBe("");
    expect(result.tags).toEqual([]);
  });

  it("handles malformed JSON gracefully", () => {
    const raw = `Body text\n\n\`\`\`json\n{broken json}\n\`\`\``;
    const result = parseDraftOutput(raw);

    expect(result.body).toBe("Body text");
    expect(result.metaDescription).toBe("");
    expect(result.tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Draft generation tests (mocked LLM)
// ---------------------------------------------------------------------------

const LLM_ENV_KEYS = [
  "LLM_PROVIDER",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "LLM_DAILY_LIMIT",
  "LLM_MAX_TOKENS",
] as const;

const originalEnv = Object.fromEntries(
  LLM_ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<string, string | undefined>;

function clearLlmEnv() {
  for (const key of LLM_ENV_KEYS) {
    delete process.env[key];
  }
}

function restoreLlmEnv() {
  for (const key of LLM_ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("generateDraft (integration with mocked LLM)", () => {
  let tempDir: string;
  const completeMock = vi.fn<(opts: { system: string; prompt: string; maxTokens?: number }) => Promise<string>>();

  beforeEach(async () => {
    clearLlmEnv();
    process.env.GEMINI_API_KEY = "test-key";
    tempDir = await mkdtemp(join(tmpdir(), "studio-draft-"));
  });

  afterEach(async () => {
    restoreLlmEnv();
    vi.restoreAllMocks();
    vi.resetModules();
    await rm(tempDir, { recursive: true, force: true });
  });

  async function importDraftModule() {
    vi.resetModules();

    vi.doMock("@/lib/llm/index", () => ({
      complete: completeMock,
      isLlmConfigured: () => true,
    }));

    // Override the content blog dir to use temp dir
    const draftModule = await import("@/lib/studio/draft");

    // We'll need to mock the content dir
    vi.spyOn(draftModule, "getContentBlogDir").mockReturnValue(tempDir);

    return draftModule;
  }

  it("creates a markdown file with draft: true frontmatter", async () => {
    completeMock.mockResolvedValue(
      `## Introduction\n\nKafka handles events.\n\n## Conclusion\n\nEnd.\n\n\`\`\`json\n{"metaDescription": "About Kafka", "tags": ["kafka"]}\n\`\`\``,
    );

    const { generateDraft } = await importDraftModule();

    const result = await generateDraft({
      title: "Why Kafka Matters",
      ownerNotes: "- Handles events at scale",
    });

    expect(result.slug).toBe("why-kafka-matters");
    expect(result.metaDescription).toBe("About Kafka");
    expect(result.tags).toEqual(["kafka"]);

    const content = await readFile(result.filePath, "utf-8");

    // Frontmatter assertions
    expect(content).toContain("draft: true");
    expect(content).toContain('title: "Why Kafka Matters"');
    expect(content).toContain('description: "About Kafka"');
    expect(content).toContain("tags:");
    expect(content).toContain("publishedAt:");

    // Body assertions
    expect(content).toContain("## Introduction");
    expect(content).toContain("Kafka handles events.");
  });

  it("never sets draft: false — always draft: true", async () => {
    completeMock.mockResolvedValue("## Post body\n\nSome content.");

    const { generateDraft } = await importDraftModule();

    const result = await generateDraft({
      title: "Test Post",
      ownerNotes: "Some notes",
    });

    const content = await readFile(result.filePath, "utf-8");

    expect(content).toContain("draft: true");
    expect(content).not.toMatch(/draft:\s*false/);
  });

  it("produces valid frontmatter matching the blog collection schema", async () => {
    completeMock.mockResolvedValue(
      `Content here.\n\n\`\`\`json\n{"metaDescription": "Test desc", "tags": ["test", "meta"]}\n\`\`\``,
    );

    const { generateDraft } = await importDraftModule();

    const result = await generateDraft({
      title: "Schema Test Post",
      ownerNotes: "Notes here",
      keywords: ["keyword1"],
    });

    const content = await readFile(result.filePath, "utf-8");

    // Extract frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    expect(fmMatch).toBeTruthy();

    const frontmatter = fmMatch![1];

    // Required fields per content.config.ts schema
    expect(frontmatter).toContain("title:");
    expect(frontmatter).toContain("description:");
    expect(frontmatter).toContain("publishedAt:");
    expect(frontmatter).toContain("tags:");
    expect(frontmatter).toContain("draft: true");
  });

  it("falls back to default description when LLM produces none", async () => {
    completeMock.mockResolvedValue("## Just body\n\nNo JSON block here.");

    const { generateDraft } = await importDraftModule();

    const result = await generateDraft({
      title: "Fallback Test",
      ownerNotes: "Some notes",
    });

    expect(result.metaDescription).toBe("Draft: Fallback Test");

    const content = await readFile(result.filePath, "utf-8");
    expect(content).toContain('description: "Draft: Fallback Test"');
  });
});

// ---------------------------------------------------------------------------
// Safety assertions
// ---------------------------------------------------------------------------

describe("studio draft safety", () => {
  it("no code path sets draft: false automatically", async () => {
    // Read the draft module source to verify no auto-publish path exists
    const { readFile: rf } = await import("node:fs/promises");
    const draftSrc = await rf(
      join(process.cwd(), "lib", "studio", "draft.ts"),
      "utf-8",
    );

    // The string "draft: false" or "draft:false" should never appear
    expect(draftSrc).not.toMatch(/draft:\s*false/);
    // The string 'draft": false' should never appear (JSON form)
    expect(draftSrc).not.toMatch(/draft":\s*false/);
  });

  it("no Wix write call exists in the studio path", async () => {
    const { readFile: rf } = await import("node:fs/promises");

    const draftSrc = await rf(
      join(process.cwd(), "lib", "studio", "draft.ts"),
      "utf-8",
    );
    const topicsSrc = await rf(
      join(process.cwd(), "lib", "studio", "topics.ts"),
      "utf-8",
    );
    const apiDraftSrc = await rf(
      join(process.cwd(), "src", "pages", "api", "studio", "draft.ts"),
      "utf-8",
    );
    const apiTopicsSrc = await rf(
      join(process.cwd(), "src", "pages", "api", "studio", "topics.ts"),
      "utf-8",
    );

    const allSrc = [draftSrc, topicsSrc, apiDraftSrc, apiTopicsSrc].join("\n");

    // No Wix imports or API calls
    expect(allSrc).not.toContain("wixapis.com");
    expect(allSrc).not.toContain("from \"@/src/lib/wix\"");
    expect(allSrc).not.toContain('from "@/src/lib/wix"');
  });
});
