import { describe, expect, it } from "vitest";

import { resolveReducedMotionPreference } from "@/src/lib/motion";

describe("resolveReducedMotionPreference", () => {
  it("defaults nullish values to false", () => {
    expect(resolveReducedMotionPreference(null)).toBe(false);
    expect(resolveReducedMotionPreference(undefined)).toBe(false);
  });

  it("preserves explicit browser preferences", () => {
    expect(resolveReducedMotionPreference(true)).toBe(true);
    expect(resolveReducedMotionPreference(false)).toBe(false);
  });
});
