import type { APIRoute } from "astro";

import { createGitHubClient, issueOAuthState } from "@/src/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request, url }) => {
  const client = createGitHubClient(url.origin || new URL(request.url).origin);
  const state = issueOAuthState(cookies);
  const authorizationUrl = client.createAuthorizationURL(state, ["read:user"]);

  return Response.redirect(authorizationUrl.toString(), 302);
};
