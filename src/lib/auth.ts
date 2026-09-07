import { GitHub, generateState } from "arctic";
import { SignJWT, jwtVerify } from "jose";
import type { AstroCookies } from "astro";

import { env } from "@/lib/env";

const SESSION_COOKIE = "vj_session";
const STATE_COOKIE = "vj_oauth_state";
const COOKIE_SECURE = process.env.NODE_ENV === "production";

export type SessionRole = "owner";

export type SessionUser = {
  login: string;
  name?: string;
  avatarUrl?: string;
  role: SessionRole;
};

function getSecret() {
  if (!env.sessionSecret) {
    throw new Error("SESSION_SECRET or NEXTAUTH_SECRET must be configured.");
  }

  return new TextEncoder().encode(env.sessionSecret);
}

function getRoleForLogin(login: string): SessionRole | null {
  const normalized = login.trim().toLowerCase();

  if (env.adminGithubLogins.includes(normalized)) {
    return "owner";
  }

  return null;
}

export function isAllowedGitHubLogin(login: string) {
  return getRoleForLogin(login) !== null;
}

export function createGitHubClient(origin: string) {
  if (!env.githubId || !env.githubSecret) {
    throw new Error("GitHub OAuth is not configured.");
  }

  const redirectUri = new URL("/api/auth/github/callback", origin).toString();
  return new GitHub(env.githubId, env.githubSecret, redirectUri);
}

export function issueOAuthState(cookies: AstroCookies) {
  const state = generateState();

  cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax",
    secure: COOKIE_SECURE,
  });

  return state;
}

export function verifyOAuthState(cookies: AstroCookies, value: string | null) {
  const stored = cookies.get(STATE_COOKIE)?.value ?? null;

  cookies.delete(STATE_COOKIE, {
    path: "/",
  });

  return Boolean(stored && value && stored === value);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function persistSession(cookies: AstroCookies, user: SessionUser) {
  const token = await createSessionToken(user);

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: COOKIE_SECURE,
  });
}

export async function getSessionUser(
  cookies: AstroCookies,
): Promise<SessionUser | null> {
  const token = cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecret());
    const payload = verified.payload as Partial<SessionUser>;

    if (!payload.login) {
      return null;
    }

    const role = getRoleForLogin(payload.login);

    if (!role) {
      return null;
    }

    return {
      avatarUrl: payload.avatarUrl,
      login: payload.login,
      name: payload.name,
      role,
    };
  } catch {
    return null;
  }
}

export function clearSession(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, {
    path: "/",
  });
}

export async function getGitHubProfile(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "vijayjangir.com",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    avatar_url?: string;
    login?: string;
    name?: string;
  };

  if (!payload.login) {
    return null;
  }

  const role = getRoleForLogin(payload.login);

  if (!role) {
    return null;
  }

  return {
    avatarUrl: payload.avatar_url,
    login: payload.login,
    name: payload.name,
    role,
  } satisfies SessionUser;
}
