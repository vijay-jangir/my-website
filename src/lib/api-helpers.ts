import type { APIRoute } from "astro";
import type { AstroCookies } from "astro";
import type { ZodType } from "zod";

import { isAuthConfigured } from "@/lib/env";
import { isLlmConfigured } from "@/lib/llm/index";
import { getSessionUser, type SessionUser } from "@/src/lib/auth";

// ---------------------------------------------------------------------------
// Typed auth error — thrown by requireAuthenticatedOwner, caught by callers
// ---------------------------------------------------------------------------

export class ApiAuthError extends Error {
  constructor(
    readonly status: 401 | 503,
    message: string,
  ) {
    super(message);
    this.name = "ApiAuthError";
  }
}

// ---------------------------------------------------------------------------
// Auth guard — replaces the 8-12 line copy-paste in every protected route
// ---------------------------------------------------------------------------

export async function requireAuthenticatedOwner(
  cookies: AstroCookies,
): Promise<SessionUser> {
  if (!isAuthConfigured()) {
    throw new ApiAuthError(503, "Auth is not configured.");
  }

  const session = await getSessionUser(cookies);

  if (!session) {
    throw new ApiAuthError(401, "Authentication required.");
  }

  return session;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function jsonError(body: { readonly ok: false; readonly message: string }, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Protected LLM route factory — auth + LLM check + JSON parse + Zod validate
// ---------------------------------------------------------------------------

export function createProtectedLlmRoute<T>(
  schema: ZodType<T>,
  config: {
    readonly llmRequiredMessage: string;
    readonly validationMessage: string;
  },
  handler: (data: T, session: SessionUser) => Promise<Response>,
): APIRoute {
  return async ({ cookies, request }) => {
    let session: SessionUser;

    try {
      session = await requireAuthenticatedOwner(cookies);
    } catch (err) {
      if (err instanceof ApiAuthError) {
        return jsonError({ ok: false, message: err.message }, err.status);
      }
      throw err;
    }

    if (!isLlmConfigured()) {
      return jsonError({ ok: false, message: config.llmRequiredMessage }, 503);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch (error) {
      console.warn("[api] Invalid JSON body:", error);
      return jsonError({ ok: false, message: "Invalid JSON body." }, 400);
    }

    const result = schema.safeParse(body);

    if (!result.success) {
      return jsonError({ ok: false, message: config.validationMessage }, 400);
    }

    return handler(result.data, session);
  };
}
