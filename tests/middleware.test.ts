import { describe, expect, it } from "vitest";

import { isPrivateRoute } from "@/src/lib/route-guard";

// ---------------------------------------------------------------------------
// Route classification — every route under src/pages/** must be covered
// ---------------------------------------------------------------------------

describe("isPrivateRoute", () => {
  describe("public pages pass through", () => {
    it.each([
      ["/"],
      ["/projects"],
      ["/projects/some-slug"],
      ["/resume"],
      ["/work"],
      ["/blog"],
      ["/blog/some-slug"],
      ["/404"],
      ["/robots.txt"],
      ["/sitemap.xml"],
      ["/rss.xml"],
      ["/llms.txt"],
      ["/favicon.ico"],
      ["/CV.pdf"],
    ])("returns false for %s", (pathname) => {
      expect(isPrivateRoute(pathname)).toBe(false);
    });
  });

  describe("public API routes pass through", () => {
    it.each([
      ["/api/auth/github"],
      ["/api/auth/github/callback"],
      ["/api/auth/logout"],
      ["/api/resume/pdf"],
      ["/api/resume/docx"],
    ])("returns false for %s", (pathname) => {
      expect(isPrivateRoute(pathname)).toBe(false);
    });
  });

  describe("private pages require auth", () => {
    it.each([
      ["/admin"],
      ["/admin/content"],
      ["/admin/anything-else"],
      ["/assistant"],
      ["/assistant/sub-path"],
    ])("returns true for %s", (pathname) => {
      expect(isPrivateRoute(pathname)).toBe(true);
    });
  });

  describe("private API routes require auth", () => {
    it.each([
      ["/api/jd/analyze"],
      ["/api/jd/anything"],
      ["/api/studio/publish"],
      ["/api/studio/draft"],
      ["/api/intelligence/signals"],
      ["/api/resume/rephrase"],
    ])("returns true for %s", (pathname) => {
      expect(isPrivateRoute(pathname)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("does not match /administration (no trailing slash or exact match)", () => {
      expect(isPrivateRoute("/administration")).toBe(false);
    });

    it("does not match /assistants (no trailing slash or exact match)", () => {
      expect(isPrivateRoute("/assistants")).toBe(false);
    });

    it("handles trailing slashes on private routes", () => {
      expect(isPrivateRoute("/admin/")).toBe(true);
      expect(isPrivateRoute("/assistant/")).toBe(true);
    });

    it("treats unknown /api/* routes as public by default", () => {
      expect(isPrivateRoute("/api/unknown")).toBe(false);
    });
  });
});
