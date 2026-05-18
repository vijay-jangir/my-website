import type { APIRoute } from "astro";

import { isAuthConfigured } from "@/lib/env";
import { createGitHubClient, issueOAuthState } from "@/src/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request, url }) => {
  const origin = url.origin || new URL(request.url).origin;

  if (!isAuthConfigured()) {
    return Response.redirect(`${origin}/admin?error=auth_not_configured`, 302);
  }

  const client = createGitHubClient(origin);
  const state = issueOAuthState(cookies);
  const authorizationUrl = client.createAuthorizationURL(state, ["read:user"]);

  return Response.redirect(authorizationUrl.toString(), 302);
};
