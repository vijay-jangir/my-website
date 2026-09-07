import type { APIRoute } from "astro";

import { loadMarketSignals } from "@/lib/intelligence/signals";
import { ApiAuthError, requireAuthenticatedOwner } from "@/src/lib/api-helpers";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    await requireAuthenticatedOwner(cookies);
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

  return Response.json({ ok: true, signals });
};
