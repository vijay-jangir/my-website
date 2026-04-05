import type { APIRoute } from "astro";

import {
  clearSession,
  createGitHubClient,
  getGitHubProfile,
  persistSession,
  verifyOAuthState,
} from "@/src/lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request, url }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !verifyOAuthState(cookies, state)) {
    clearSession(cookies);
    return Response.redirect(
      `${new URL(request.url).origin}/admin?error=oauth_state`,
      302,
    );
  }

  try {
    const client = createGitHubClient(
      url.origin || new URL(request.url).origin,
    );
    const tokens = await client.validateAuthorizationCode(code);
    const profile = await getGitHubProfile(tokens.accessToken());

    if (!profile) {
      clearSession(cookies);
      return Response.redirect(
        `${new URL(request.url).origin}/admin?error=forbidden`,
        302,
      );
    }

    await persistSession(cookies, profile);
    return Response.redirect(`${new URL(request.url).origin}/admin`, 302);
  } catch {
    clearSession(cookies);
    return Response.redirect(
      `${new URL(request.url).origin}/admin?error=oauth_failed`,
      302,
    );
  }
};
