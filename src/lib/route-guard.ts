/**
 * Route classification for the central auth middleware.
 *
 * Pure functions — no Astro runtime dependency — so they are
 * testable outside of the Astro middleware virtual module.
 */

/**
 * Route prefixes that require an authenticated session.
 * Any pathname starting with one of these is private.
 */
const PRIVATE_PREFIXES = [
  "/admin",
  "/assistant",
  "/api/jd",
  "/api/studio",
  "/api/intelligence",
] as const;

/**
 * Exact private API routes that don't fall under a prefix above.
 */
const PRIVATE_API_EXACT = ["/api/resume/rephrase"] as const;

/**
 * API prefixes/paths that are explicitly public even though they live
 * under an otherwise-private parent (e.g. /api/auth/* under /api/*).
 */
const PUBLIC_API_ALLOWLIST = [
  "/api/auth",
  "/api/resume/pdf",
  "/api/resume/docx",
] as const;

/**
 * Returns `true` when the given pathname requires authentication.
 */
export function isPrivateRoute(pathname: string): boolean {
  // Explicit public API allowlist takes priority over private prefixes.
  for (const allowed of PUBLIC_API_ALLOWLIST) {
    if (pathname === allowed || pathname.startsWith(`${allowed}/`)) {
      return false;
    }
  }

  for (const prefix of PRIVATE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  for (const exact of PRIVATE_API_EXACT) {
    if (pathname === exact) {
      return true;
    }
  }

  return false;
}

/**
 * Returns `true` when the pathname is an API endpoint (starts with `/api/`).
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}
