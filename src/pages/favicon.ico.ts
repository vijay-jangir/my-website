import type { APIRoute } from "astro";

export const GET: APIRoute = ({ request }) =>
  Response.redirect(new URL("/favico.ico", request.url), 308);
