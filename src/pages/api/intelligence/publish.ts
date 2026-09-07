import type { APIRoute } from "astro";

import { isAuthConfigured } from "@/lib/env";
import { publishSignalSnapshot } from "@/lib/intelligence/publish";
import { loadMarketSignals } from "@/lib/intelligence/signals";
import { getSessionUser } from "@/src/lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
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

  if (signals.totalRequests === 0) {
    return Response.json(
      { message: "No JD data available to publish.", ok: false },
      { status: 422 },
    );
  }

  const snapshot = await publishSignalSnapshot(signals, session.login);

  if (!snapshot) {
    return Response.json(
      { message: "Failed to persist signal snapshot.", ok: false },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, snapshot });
};
