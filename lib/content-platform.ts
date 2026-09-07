import {
  env,
  isAuthConfigured,
  isContentBackupConfigured,
  isDatabaseConfigured,
} from "@/lib/env";

export function getContentPlatformStatus() {
  return {
    authConfigured: isAuthConfigured(),
    backupConfigured: isContentBackupConfigured(),
    backupRepo: env.contentBackupRepo ?? null,
    contentDbLabel: isDatabaseConfigured()
      ? "Neon Postgres (Drizzle)"
      : "Not configured",
    contentDbMode: isDatabaseConfigured() ? "remote" : "none",
  } as const;
}
