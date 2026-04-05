export const env = {
  databaseUrl: process.env.DATABASE_URL,
  wixApiKey: process.env.WIX_API_KEY,
  wixSiteId: process.env.WIX_SITE_ID ?? "e02544df-019e-47c2-9a69-ebffa6a06dbb",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFrom:
    process.env.RESEND_FROM ??
    "My Website Contact Form <onboarding@resend.dev>",
  contactToEmail: process.env.CONTACT_TO_EMAIL ?? "contact@vijayjangir.com",
  sessionSecret: process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  githubId: process.env.GITHUB_ID,
  githubSecret: process.env.GITHUB_SECRET,
  adminGithubLogins: (process.env.ADMIN_GITHUB_LOGINS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  editorGithubLogins: (process.env.EDITOR_GITHUB_LOGINS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  cronSecret: process.env.CRON_SECRET,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openClawBaseUrl: process.env.OPENCLAW_BASE_URL,
  openClawToken: process.env.OPENCLAW_TOKEN,
};

export function isDatabaseConfigured() {
  return Boolean(env.databaseUrl);
}

export function isTurnstileConfigured() {
  return Boolean(env.turnstileSiteKey && env.turnstileSecretKey);
}

export function isAuthConfigured() {
  return Boolean(
    env.sessionSecret &&
    env.githubId &&
    env.githubSecret &&
    env.adminGithubLogins.length > 0,
  );
}

export function isEmailConfigured() {
  return Boolean(env.resendApiKey && env.contactToEmail);
}
