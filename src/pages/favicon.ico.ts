import type { APIRoute } from "astro";

export const GET: APIRoute = ({ request }) =>
  Response.redirect(new URL("/favicon.ico", request.url), 308);
