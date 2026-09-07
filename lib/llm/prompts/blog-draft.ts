/**
 * Prompt template for AI blog drafting.
 *
 * Hard-constrains the model to the owner's supplied inputs.
 * The model MUST NOT introduce facts, metrics, or claims of its own.
 */

const SYSTEM_PROMPT = `You are a blog post drafting assistant for a senior engineer's personal site.

RULES — ABSOLUTE, NO EXCEPTIONS:
1. You receive a topic, the owner's notes/bullet points/facts/links, and optional keywords.
2. Draft a well-structured blog post using ONLY the facts, points, and information the owner supplied.
3. You MUST NOT introduce ANY fact, metric, statistic, company name, date, technology, framework,
   or claim that is not present in the owner's supplied notes.
4. You MUST NOT fabricate quotes, case studies, or testimonials.
5. You MUST NOT add filler content like "In today's fast-paced world" or generic statements.
6. Structure: clear H2/H3 hierarchy, an intro stating the problem/topic, concrete sections
   with examples drawn from the owner's notes, and a brief conclusion.
7. Use Markdown formatting. Use code blocks where the owner's notes include code.
8. Write in first person where the owner's notes use first person, otherwise use third person.
9. Keep paragraphs concise — 2-4 sentences each.
10. At the end, on a separate line, output a JSON block with this exact format:
    \`\`\`json
    {"metaDescription": "...", "tags": ["...", "..."]}
    \`\`\`
    The metaDescription should be 120-155 characters summarizing the post.
    Tags should be 3-6 relevant topic tags.

If the owner's notes are too sparse for a full post, produce a shorter post covering only what
the notes support. NEVER pad with invented content.`;

export type BlogDraftInput = {
  readonly title: string;
  readonly ownerNotes: string;
  readonly keywords?: readonly string[];
  readonly focusArea?: string;
};

export function buildBlogDraftPrompt(input: BlogDraftInput): {
  system: string;
  prompt: string;
} {
  const parts = [
    `Topic: ${input.title}`,
    "",
    "Owner's notes, bullet points, facts, and links:",
    input.ownerNotes,
  ];

  if (input.keywords && input.keywords.length > 0) {
    parts.push("", `Target keywords: ${input.keywords.join(", ")}`);
  }

  if (input.focusArea) {
    parts.push("", `Focus area: ${input.focusArea}`);
  }

  parts.push(
    "",
    "Draft the blog post now. Remember: use ONLY the facts above. Do not invent anything.",
  );

  return {
    system: SYSTEM_PROMPT,
    prompt: parts.join("\n"),
  };
}

export type ParsedDraftOutput = {
  readonly body: string;
  readonly metaDescription: string;
  readonly tags: readonly string[];
};

/**
 * Parse the LLM draft output, extracting the blog body and the trailing
 * JSON metadata block. Falls back gracefully if no JSON block is found.
 */
export function parseDraftOutput(raw: string): ParsedDraftOutput {
  const jsonBlockRegex = /```json\s*\n\s*(\{[\s\S]*?\})\s*\n\s*```/;
  const match = raw.match(jsonBlockRegex);

  let metaDescription = "";
  let tags: string[] = [];
  let body = raw;

  if (match) {
    body = raw.slice(0, match.index).trimEnd();

    try {
      const parsed = JSON.parse(match[1]) as {
        metaDescription?: string;
        tags?: string[];
      };
      metaDescription = typeof parsed.metaDescription === "string"
        ? parsed.metaDescription
        : "";
      tags = Array.isArray(parsed.tags)
        ? parsed.tags.filter((t): t is string => typeof t === "string")
        : [];
    } catch (error) {
      console.warn("[blog-draft] Malformed JSON metadata block:", error);
    }
  }

  return { body, metaDescription, tags };
}
