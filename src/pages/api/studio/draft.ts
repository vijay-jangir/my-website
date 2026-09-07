import type { APIRoute } from "astro";

import { isAuthConfigured } from "@/lib/env";
import { isLlmConfigured } from "@/lib/llm/index";
import { LlmError } from "@/lib/llm/types";
import { getSessionUser } from "@/src/lib/auth";
import { generateDraft } from "@/lib/studio/draft";

export const prerender = false;

type DraftInput = {
  title: string;
  ownerNotes: string;
  keywords?: string[];
  focusArea?: string;
};

function isDraftInput(value: unknown): value is DraftInput {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  if (typeof obj.title !== "string" || obj.title.trim().length === 0) {
    return false;
  }

  if (typeof obj.ownerNotes !== "string" || obj.ownerNotes.trim().length === 0) {
    return false;
  }

  if (obj.keywords !== undefined && !Array.isArray(obj.keywords)) {
    return false;
  }

  if (obj.focusArea !== undefined && typeof obj.focusArea !== "string") {
    return false;
  }

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
        message: "LLM provider is not configured. Blog drafting requires an LLM.",
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

  if (!isDraftInput(body)) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Invalid input: title and ownerNotes are required.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const result = await generateDraft({
      title: body.title,
      ownerNotes: body.ownerNotes,
      keywords: body.keywords,
      focusArea: body.focusArea,
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
};
