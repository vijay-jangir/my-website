import type { APIRoute } from "astro";

export const GET: APIRoute = ({ request }) =>
  Response.redirect(new URL("/api/resume/pdf?focus=general", request.url), 308);
