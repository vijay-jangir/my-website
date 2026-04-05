import type { APIRoute } from "astro";

import { clearSession } from "@/src/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request }) => {
  clearSession(cookies);
  return Response.redirect(`${new URL(request.url).origin}/admin`, 302);
};
