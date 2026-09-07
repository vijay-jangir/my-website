import { afterEach, describe, expect, it, vi } from "vitest";

const ENV_KEYS = [
  "DATABASE_URL",
  "WIX_API_KEY",
  "WIX_SITE_ID",
  "SESSION_SECRET",
  "NEXTAUTH_SECRET",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "ADMIN_GITHUB_LOGINS",
  "CONTENT_BACKUP_REPO",
  "CONTENT_BACKUP_BRANCH",
  "CONTENT_BACKUP_PAT",
  "CONTENT_HISTORY_LIMIT",
  "LLM_PROVIDER",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "LLM_DAILY_LIMIT",
  "LLM_MAX_TOKENS",
] as const;

type EnvKey = (typeof ENV_KEYS)[number];
type EnvOverrides = Partial<Record<EnvKey, string | undefined>>;

const originalEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<EnvKey, string | undefined>;

function restoreTrackedEnv() {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function setTrackedEnv(overrides: EnvOverrides) {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

async function importEnvModule() {
  vi.resetModules();
  return import("@/lib/env");
}

afterEach(() => {
  restoreTrackedEnv();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("lib/env", () => {
  it("reads every configured env key and normalizes login lists", async () => {
    setTrackedEnv({
      ADMIN_GITHUB_LOGINS: " Vijay , Admin.User ",
      CONTENT_BACKUP_BRANCH: "preview-backups",
      CONTENT_BACKUP_PAT: "backup-pat",
      CONTENT_BACKUP_REPO: "owner/repo",
      CONTENT_HISTORY_LIMIT: "25",
      DATABASE_URL: "postgres://user:pass@example.com:5432/app",
      GITHUB_ID: "github-client-id",
      GITHUB_SECRET: "github-client-secret",
      NEXTAUTH_SECRET: "nextauth-secret",
      SESSION_SECRET: "session-secret",
      WIX_API_KEY: "wix-key",
      WIX_SITE_ID: "custom-site-id",
    });

    const { env, isContentBackupConfigured, isDatabaseConfigured } =
      await importEnvModule();

    expect(env).toEqual({
      adminGithubLogins: ["vijay", "admin.user"],
      contentBackupBranch: "preview-backups",
      contentBackupPat: "backup-pat",
      contentBackupRepo: "owner/repo",
      contentHistoryLimit: 25,
      databaseUrl: "postgres://user:pass@example.com:5432/app",
      geminiApiKey: undefined,
      githubId: "github-client-id",
      githubSecret: "github-client-secret",
      groqApiKey: undefined,
      llmDailyLimit: 50,
      llmMaxTokens: 1024,
      llmProvider: "gemini",
      nextAuthSecret: "nextauth-secret",
      sessionSecret: "session-secret",
      wixApiKey: "wix-key",
      wixSiteId: "custom-site-id",
    });
    expect(isDatabaseConfigured()).toBe(true);
    expect(isContentBackupConfigured()).toBe(true);
  });

  it("falls back to NEXTAUTH_SECRET and applies env defaults when values are absent", async () => {
    setTrackedEnv({
      NEXTAUTH_SECRET: "fallback-secret",
    });

    const {
      env,
      getContentHistoryLimit,
      isContentBackupConfigured,
      isDatabaseConfigured,
    } = await importEnvModule();

    expect(env.sessionSecret).toBe("fallback-secret");
    expect(env.nextAuthSecret).toBe("fallback-secret");
    expect(env.wixSiteId).toBe("e02544df-019e-47c2-9a69-ebffa6a06dbb");
    expect(env.contentBackupBranch).toBe("content-backup");
    expect(env.contentHistoryLimit).toBe(10);
    expect(getContentHistoryLimit()).toBe(10);
    expect(env.adminGithubLogins).toEqual([]);
    expect(isDatabaseConfigured()).toBe(false);
    expect(isContentBackupConfigured()).toBe(false);
  });

  it.each([
    { label: "an invalid number", value: "not-a-number" },
    { label: "zero", value: "0" },
    { label: "a negative number", value: "-5" },
  ])(
    "coerces CONTENT_HISTORY_LIMIT from $label to the default limit of 10",
    async ({ value }) => {
      setTrackedEnv({
        CONTENT_HISTORY_LIMIT: value,
      });

      const { env, getContentHistoryLimit } = await importEnvModule();

      expect(getContentHistoryLimit()).toBe(10);

      if (value === "not-a-number") {
        expect(Number.isNaN(env.contentHistoryLimit)).toBe(true);
      } else {
        expect(env.contentHistoryLimit).toBe(Number.parseInt(value, 10));
      }
    },
  );

  it("reports auth configured only when a secret, GitHub OAuth keys, and an admin login exist", async () => {
    setTrackedEnv({
      ADMIN_GITHUB_LOGINS: " Owner.Login ",
      GITHUB_ID: "github-client-id",
      GITHUB_SECRET: "github-client-secret",
      NEXTAUTH_SECRET: "fallback-secret",
    });

    const { isAuthConfigured } = await importEnvModule();

    expect(isAuthConfigured()).toBe(true);
  });

  it.each([
    {
      label: "the session secret is missing",
      overrides: {
        ADMIN_GITHUB_LOGINS: "owner",
        GITHUB_ID: "github-client-id",
        GITHUB_SECRET: "github-client-secret",
      },
    },
    {
      label: "the GitHub client id is missing",
      overrides: {
        ADMIN_GITHUB_LOGINS: "owner",
        GITHUB_SECRET: "github-client-secret",
        SESSION_SECRET: "session-secret",
      },
    },
    {
      label: "the GitHub client secret is missing",
      overrides: {
        ADMIN_GITHUB_LOGINS: "owner",
        GITHUB_ID: "github-client-id",
        SESSION_SECRET: "session-secret",
      },
    },
    {
      label: "no admin login is configured",
      overrides: {
        GITHUB_ID: "github-client-id",
        GITHUB_SECRET: "github-client-secret",
        SESSION_SECRET: "session-secret",
      },
    },
  ])("returns false when $label", async ({ overrides }) => {
    setTrackedEnv(overrides);

    const { isAuthConfigured } = await importEnvModule();

    expect(isAuthConfigured()).toBe(false);
  });
});
