const metaEnv = import.meta.env as Record<string, string | undefined>;
const shouldReadMetaEnv = !process.env.VITEST;

function readEnv(key: string) {
  return process.env[key] ?? (shouldReadMetaEnv ? metaEnv[key] : undefined);
}

export const env = {
  databaseUrl: readEnv("DATABASE_URL"),
  wixApiKey: readEnv("WIX_API_KEY"),
  wixSiteId: readEnv("WIX_SITE_ID") ?? "e02544df-019e-47c2-9a69-ebffa6a06dbb",
  sessionSecret: readEnv("SESSION_SECRET") ?? readEnv("NEXTAUTH_SECRET"),
  nextAuthSecret: readEnv("NEXTAUTH_SECRET"),
  githubId: readEnv("GITHUB_ID"),
  githubSecret: readEnv("GITHUB_SECRET"),
  adminGithubLogins: (readEnv("ADMIN_GITHUB_LOGINS") ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  editorGithubLogins: (readEnv("EDITOR_GITHUB_LOGINS") ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  contentBackupRepo: readEnv("CONTENT_BACKUP_REPO"),
  contentBackupBranch: readEnv("CONTENT_BACKUP_BRANCH") ?? "content-backup",
  contentBackupPat: readEnv("CONTENT_BACKUP_PAT"),
  contentHistoryLimit: Number.parseInt(
    readEnv("CONTENT_HISTORY_LIMIT") ?? "10",
    10,
  ),
};

export function isDatabaseConfigured() {
  return Boolean(env.databaseUrl);
}

export function isContentBackupConfigured() {
  return Boolean(env.contentBackupRepo && env.contentBackupPat);
}

export function getContentHistoryLimit() {
  return Number.isFinite(env.contentHistoryLimit) && env.contentHistoryLimit > 0
    ? env.contentHistoryLimit
    : 10;
}

export function isAuthConfigured() {
  return Boolean(
    env.sessionSecret &&
    env.githubId &&
    env.githubSecret &&
    env.adminGithubLogins.length > 0,
  );
}
