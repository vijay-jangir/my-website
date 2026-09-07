import { SignJWT } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AstroCookies } from "../node_modules/astro/dist/core/cookies/index.js";

type AuthModule = typeof import("@/src/lib/auth");
type EnvModule = typeof import("@/lib/env");

const defaultAuthEnv = {
  ADMIN_GITHUB_LOGINS: "admin-user",
  EDITOR_GITHUB_LOGINS: "editor-user",
  GITHUB_ID: "github-client-id",
  GITHUB_SECRET: "github-client-secret",
  NEXTAUTH_SECRET: "",
  NODE_ENV: "test",
  SESSION_SECRET: "super-secret-session-key",
} as const;

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function createCookies() {
  return new AstroCookies(new Request("https://vijayjangir.com/admin"));
}

function createJsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });
}

function getSetCookieHeader(cookies: AstroCookies, cookieName: string) {
  const headers = Array.from(cookies.headers());

  for (let index = headers.length - 1; index >= 0; index -= 1) {
    const header = headers[index];

    if (header?.startsWith(`${cookieName}=`)) {
      return header;
    }
  }

  throw new Error(`Missing Set-Cookie header for ${cookieName}.`);
}

function getSecretBytes(secret: string) {
  return new TextEncoder().encode(secret);
}

function tamperToken(token: string) {
  const lastCharacter = token.at(-1);

  if (lastCharacter === undefined) {
    throw new Error("Expected a non-empty token.");
  }

  return `${token.slice(0, -1)}${lastCharacter === "a" ? "b" : "a"}`;
}

async function loadAuthModule(
  overrides: Partial<Record<keyof typeof defaultAuthEnv, string>> = {},
): Promise<{
  auth: AuthModule;
  envModule: EnvModule;
}> {
  vi.resetModules();

  const envEntries = Object.entries({
    ...defaultAuthEnv,
    ...overrides,
  }) as ReadonlyArray<readonly [keyof typeof defaultAuthEnv, string]>;

  for (const [key, value] of envEntries) {
    vi.stubEnv(key, value);
  }

  const auth = await import("@/src/lib/auth");
  const envModule = await import("@/lib/env");

  return { auth, envModule };
}

describe("GitHub auth allowlist helpers", () => {
  it("normalizes trimmed logins and rejects unlisted values", async () => {
    const { auth } = await loadAuthModule({
      ADMIN_GITHUB_LOGINS: " Admin-User ",
      EDITOR_GITHUB_LOGINS: " editor-user ",
    });

    expect(auth.isAllowedGitHubLogin("  ADMIN-user  ")).toBe(true);
    expect(auth.isAllowedGitHubLogin(" editor-USER ")).toBe(true);
    expect(auth.isAllowedGitHubLogin("outsider")).toBe(false);
  });

  it("prefers the admin role when the same login appears in both allowlists", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        avatar_url: "https://avatars.example/shared-user.png",
        login: "shared-user",
        name: "Shared User",
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { auth } = await loadAuthModule({
      ADMIN_GITHUB_LOGINS: "shared-user",
      EDITOR_GITHUB_LOGINS: "shared-user",
    });

    await expect(auth.getGitHubProfile("github-access-token")).resolves.toEqual({
      avatarUrl: "https://avatars.example/shared-user.png",
      login: "shared-user",
      name: "Shared User",
      role: "admin",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer github-access-token",
        "User-Agent": "vijayjangir.com",
      },
    });
  });

  it("rejects unlisted GitHub profiles without making a real network call", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        avatar_url: "https://avatars.example/outsider.png",
        login: "outsider",
        name: "Outside User",
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { auth } = await loadAuthModule();

    await expect(auth.getGitHubProfile("github-access-token")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("session JWT helpers", () => {
  it("round-trips a signed session JWT through jose verification", async () => {
    const { auth } = await loadAuthModule();
    const cookies = createCookies();

    await auth.persistSession(cookies, {
      avatarUrl: "https://avatars.example/editor-user.png",
      login: "editor-user",
      name: "Editor User",
      role: "editor",
    });

    await expect(auth.getSessionUser(cookies)).resolves.toEqual({
      avatarUrl: "https://avatars.example/editor-user.png",
      login: "editor-user",
      name: "Editor User",
      role: "editor",
    });
  });

  it("returns null when the session token is expired", async () => {
    const { auth } = await loadAuthModule();
    const cookies = createCookies();
    const expiredToken = await new SignJWT({
      login: "admin-user",
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(getSecretBytes(defaultAuthEnv.SESSION_SECRET));

    cookies.set("vj_session", expiredToken, { path: "/" });

    await expect(auth.getSessionUser(cookies)).resolves.toBeNull();
  });

  it("returns null when the session token signature is tampered", async () => {
    const { auth } = await loadAuthModule();
    const cookies = createCookies();
    const validToken = await auth.createSessionToken({
      login: "admin-user",
      role: "admin",
    });

    cookies.set("vj_session", tamperToken(validToken), { path: "/" });

    await expect(auth.getSessionUser(cookies)).resolves.toBeNull();
  });

  it("returns null when the verified payload is missing login", async () => {
    const { auth } = await loadAuthModule();
    const cookies = createCookies();
    const invalidToken = await new SignJWT({
      name: "Missing Login",
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getSecretBytes(defaultAuthEnv.SESSION_SECRET));

    cookies.set("vj_session", invalidToken, { path: "/" });

    await expect(auth.getSessionUser(cookies)).resolves.toBeNull();
  });

  it("re-resolves the role from the live allowlist so removed logins become invalid", async () => {
    const { auth, envModule } = await loadAuthModule({
      ADMIN_GITHUB_LOGINS: "live-admin",
      EDITOR_GITHUB_LOGINS: "",
    });
    const cookies = createCookies();

    await auth.persistSession(cookies, {
      login: "live-admin",
      role: "admin",
    });
    expect(await auth.getSessionUser(cookies)).toEqual({
      login: "live-admin",
      role: "admin",
    });

    envModule.env.adminGithubLogins.splice(0, envModule.env.adminGithubLogins.length);

    await expect(auth.getSessionUser(cookies)).resolves.toBeNull();
  });
});

describe("session and oauth cookies", () => {
  it("writes the session cookie with the expected non-production flags", async () => {
    const { auth } = await loadAuthModule({ NODE_ENV: "test" });
    const cookies = createCookies();

    await auth.persistSession(cookies, {
      login: "admin-user",
      role: "admin",
    });

    const header = getSetCookieHeader(cookies, "vj_session");

    expect(header).toContain("vj_session=");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Max-Age=604800");
    expect(header).toContain("Path=/");
    expect(header).toContain("SameSite=Lax");
    expect(header).not.toContain("Secure");
  });

  it("writes the session cookie as Secure in production", async () => {
    const { auth } = await loadAuthModule({ NODE_ENV: "production" });
    const cookies = createCookies();

    await auth.persistSession(cookies, {
      login: "admin-user",
      role: "admin",
    });

    expect(getSetCookieHeader(cookies, "vj_session")).toContain("Secure");
  });

  it("writes an oauth state cookie with a 600 second ttl", async () => {
    const { auth } = await loadAuthModule({ NODE_ENV: "test" });
    const cookies = createCookies();
    const state = auth.issueOAuthState(cookies);
    const header = getSetCookieHeader(cookies, "vj_oauth_state");

    expect(state).toBe(cookies.get("vj_oauth_state")?.value);
    expect(header).toContain("vj_oauth_state=");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Max-Age=600");
    expect(header).toContain("Path=/");
    expect(header).toContain("SameSite=Lax");
    expect(header).not.toContain("Secure");
  });

  it("validates oauth state only on exact matches", async () => {
    const { auth } = await loadAuthModule();
    const matchingCookies = createCookies();
    const expectedState = auth.issueOAuthState(matchingCookies);
    const mismatchedCookies = createCookies();
    const actualState = auth.issueOAuthState(mismatchedCookies);

    expect(auth.verifyOAuthState(matchingCookies, expectedState)).toBe(true);
    expect(auth.verifyOAuthState(mismatchedCookies, `${actualState}-wrong`)).toBe(false);
  });
});
