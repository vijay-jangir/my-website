import {
  env,
  isAstroContentDbConfigured,
  isAuthConfigured,
  isContentBackupConfigured,
} from "@/lib/env";

export function getContentPlatformStatus() {
  return {
    authConfigured: isAuthConfigured(),
    backupConfigured: isContentBackupConfigured(),
    backupRepo: env.contentBackupRepo ?? null,
    contentDbLabel: isAstroContentDbConfigured()
      ? "Remote Astro DB (libSQL)"
      : "Local Astro DB",
    contentDbMode: isAstroContentDbConfigured() ? "remote" : "local",
  } as const;
}
