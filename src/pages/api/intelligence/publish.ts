import type { APIRoute } from "astro";

import { publishSignalSnapshot } from "@/lib/intelligence/publish";
import { loadMarketSignals } from "@/lib/intelligence/signals";
import { ApiAuthError, requireAuthenticatedOwner } from "@/src/lib/api-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  let session;

  try {
    session = await requireAuthenticatedOwner(cookies);
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return Response.json(
        { message: err.message, ok: false },
        { status: err.status },
      );
    }
    throw err;
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
