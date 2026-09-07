import { z } from "zod";

import { LlmError } from "@/lib/llm/types";
import { createProtectedLlmRoute } from "@/src/lib/api-helpers";
import { generateDraft } from "@/lib/studio/draft";

export const prerender = false;

const DraftInputSchema = z.object({
  title: z.string().refine((s) => s.trim().length > 0),
  ownerNotes: z.string().refine((s) => s.trim().length > 0),
  keywords: z.array(z.string()).optional(),
  focusArea: z.string().optional(),
});

export const POST = createProtectedLlmRoute(
  DraftInputSchema,
  {
    llmRequiredMessage: "LLM provider is not configured. Blog drafting requires an LLM.",
    validationMessage: "Invalid input: title and ownerNotes are required.",
  },
  async (data) => {
    try {
      const result = await generateDraft({
        title: data.title,
        ownerNotes: data.ownerNotes,
        keywords: data.keywords,
        focusArea: data.focusArea,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          slug: result.slug,
          filePath: result.filePath,
          metaDescription: result.metaDescription,
          tags: result.tags,
        }),
        {
          status: 200,
          headers: {
            "Cache-Control": "private, no-store",
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error: unknown) {
      if (error instanceof LlmError) {
        return new Response(
          JSON.stringify({ ok: false, message: error.message }),
          { status: 502, headers: { "Content-Type": "application/json" } },
        );
      }
      throw error;
    }
  },
);
