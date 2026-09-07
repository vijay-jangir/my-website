import { z } from "zod";

import { complete } from "@/lib/llm/index";
import {
  buildRephrasePrompt,
  parseCandidates,
  validateCandidate,
} from "@/lib/llm/prompts/bullet-rephrase";
import { LlmError } from "@/lib/llm/types";
import { createProtectedLlmRoute } from "@/src/lib/api-helpers";

export const prerender = false;

const RephraseInputSchema = z.object({
  bulletText: z.string().refine((s) => s.trim().length > 0),
  jdAnalysis: z.object({
    topFocusIds: z.array(z.string()),
    skillScores: z.array(
      z.object({
        skillId: z.string(),
        label: z.string(),
        score: z.number(),
      }),
    ),
  }),
});

export const POST = createProtectedLlmRoute(
  RephraseInputSchema,
  {
    llmRequiredMessage: "LLM provider is not configured. Bullet rephrasing requires an LLM.",
    validationMessage: "Invalid input: bulletText and jdAnalysis required.",
  },
  async (data) => {
    const { bulletText, jdAnalysis } = data;
    const skillLabels = jdAnalysis.skillScores.map((s) => s.label);
    const jdKeywords = [
      ...jdAnalysis.topFocusIds,
      ...skillLabels,
    ];

    const { system, prompt } = buildRephrasePrompt(bulletText, jdKeywords);

    let raw: string;

    try {
      raw = await complete({ system, prompt, maxTokens: 512 });
    } catch (error: unknown) {
      if (error instanceof LlmError) {
        return new Response(
          JSON.stringify({ ok: false, message: error.message }),
          { status: 502, headers: { "Content-Type": "application/json" } },
        );
      }
      throw error;
    }

    const candidates = parseCandidates(raw);

    const proposals: string[] = [];

    for (const candidate of candidates) {
      const result = validateCandidate(candidate, bulletText, skillLabels);

      if (result.valid) {
        proposals.push(candidate);
      }
    }

    return new Response(
      JSON.stringify({ ok: true, proposals }),
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Type": "application/json",
        },
      },
    );
  },
);
