import type { APIRoute } from "astro";

import { isAuthConfigured } from "@/lib/env";
import { loadMarketSignals } from "@/lib/intelligence/signals";
import { getSessionUser } from "@/src/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthConfigured()) {
    return Response.json(
      { message: "Auth is not configured.", ok: false },
      { status: 503 },
    );
  }

  const session = await getSessionUser(cookies);

  if (!session) {
    return Response.json(
      { message: "Authentication required.", ok: false },
      { status: 401 },
    );
  }

  const signals = await loadMarketSignals();

  if (!signals) {
    return Response.json(
      { message: "Database is not configured.", ok: false },
      { status: 503 },
    );
  }

  return Response.json({ ok: true, signals });
};
