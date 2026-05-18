import type { APIRoute } from "astro";

import { isAuthConfigured } from "@/lib/env";
import {
  clearSession,
  createGitHubClient,
  getGitHubProfile,
  persistSession,
  verifyOAuthState,
} from "@/src/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request, url }) => {
  const origin = new URL(request.url).origin;

  if (!isAuthConfigured()) {
    clearSession(cookies);
    return Response.redirect(`${origin}/admin?error=auth_not_configured`, 302);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !verifyOAuthState(cookies, state)) {
    clearSession(cookies);
    return Response.redirect(`${origin}/admin?error=oauth_state`, 302);
  }

  try {
    const client = createGitHubClient(url.origin || origin);
    const tokens = await client.validateAuthorizationCode(code);
    const profile = await getGitHubProfile(tokens.accessToken());

    if (!profile) {
      clearSession(cookies);
      return Response.redirect(`${origin}/admin?error=forbidden`, 302);
    }

    await persistSession(cookies, profile);
    return Response.redirect(`${origin}/admin`, 302);
  } catch {
    clearSession(cookies);
    return Response.redirect(`${origin}/admin?error=oauth_failed`, 302);
  }
};
