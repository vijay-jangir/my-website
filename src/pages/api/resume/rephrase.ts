import type { APIRoute } from "astro";

import { isAuthConfigured } from "@/lib/env";
import { complete, isLlmConfigured } from "@/lib/llm/index";
import {
  buildRephrasePrompt,
  parseCandidates,
  validateCandidate,
} from "@/lib/llm/prompts/bullet-rephrase";
import { LlmError } from "@/lib/llm/types";
import { getSessionUser } from "@/src/lib/auth";

export const prerender = false;

type RephraseInput = {
  bulletText: string;
  jdAnalysis: {
    topFocusIds: string[];
    skillScores: Array<{ skillId: string; label: string; score: number }>;
  };
};

function isRephraseInput(value: unknown): value is RephraseInput {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  if (typeof obj.bulletText !== "string" || obj.bulletText.trim().length === 0) {
    return false;
  }

  if (typeof obj.jdAnalysis !== "object" || obj.jdAnalysis === null) {
    return false;
  }

  const analysis = obj.jdAnalysis as Record<string, unknown>;

  if (!Array.isArray(analysis.topFocusIds)) return false;
  if (!Array.isArray(analysis.skillScores)) return false;

  return true;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthConfigured()) {
    return new Response(
      JSON.stringify({ ok: false, message: "Auth is not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const session = await getSessionUser(cookies);

  if (!session) {
    return new Response(
      JSON.stringify({ ok: false, message: "Authentication required." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!isLlmConfigured()) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "LLM provider is not configured. Bullet rephrasing requires an LLM.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, message: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!isRephraseInput(body)) {
    return new Response(
      JSON.stringify({ ok: false, message: "Invalid input: bulletText and jdAnalysis required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { bulletText, jdAnalysis } = body;
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
};
