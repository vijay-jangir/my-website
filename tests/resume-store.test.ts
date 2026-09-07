import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/drizzle", () => ({
  dbQuery: vi.fn(),
}));

import { analyzeJobDescription } from "@/lib/jd";
import { buildResumeVariant } from "@/lib/portfolio";
import { dbQuery } from "@/lib/drizzle";
import { getResumeVariantByToken, saveResumeVariant } from "@/lib/resume-store";
import {
  purgeExpiredJdRequests,
  purgeExpiredVariants,
} from "@/lib/resume-purge";

const mockDbQuery = vi.mocked(dbQuery);
const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

describe("resume store", () => {
  beforeEach(() => {
    mockDbQuery.mockReset();
    warnSpy.mockClear();
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  it("saves a resume variant with a generated token and returns the stored row", async () => {
    const focusIds = ["ai", "backend-engineering"];
    const variant = buildResumeVariant({ focusIds });
    const analysis = analyzeJobDescription(`
Title
Senior AI Platform Engineer

Required
Build agentic backend systems with Python and Kafka.
`);
    const createdAt = "2026-09-01T12:34:56.000Z";

    mockDbQuery.mockImplementationOnce(async (_query, values = []) => {
      const token = values[0];

      if (typeof token !== "string") {
        throw new TypeError("expected generated token");
      }

      return {
        rows: [
          {
            token,
            focus_ids: focusIds,
            variant,
            analysis,
            created_at: createdAt,
          },
        ],
      };
    });

    const stored = await saveResumeVariant({ focusIds, variant, analysis });

    expect(stored).toEqual({
      token: expect.stringMatching(/^[0-9a-f]{24}$/),
      focus_ids: focusIds,
      variant,
      analysis,
      created_at: createdAt,
    });

    const [query, values] = mockDbQuery.mock.calls[0] ?? [];

    expect(query).toContain("insert into resume_variants");
    expect(values).toHaveLength(5);
    expect(values?.[0]).toMatch(/^[0-9a-f]{24}$/);
    expect(values?.[1]).toEqual(focusIds);
    expect(values?.[2]).toBe(JSON.stringify(variant));
    expect(values?.[3]).toBe(JSON.stringify(analysis));
    expect(values?.[4]).toBeDefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns null and logs a warning when saving throws", async () => {
    const variant = buildResumeVariant({ focusIds: ["ai"] });
    const analysis = analyzeJobDescription(
      "Required\nPython and backend systems.",
    );
    const error = new Error("db unavailable");

    mockDbQuery.mockRejectedValueOnce(error);

    await expect(
      saveResumeVariant({
        focusIds: ["ai"],
        variant,
        analysis,
      }),
    ).resolves.toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(
      "[resume-store] failed to save resume variant:",
      error,
    );
  });

  it("loads a stored resume variant and maps database fields to the public shape", async () => {
    const token = "0123456789abcdef01234567";
    const variant = buildResumeVariant({ focusIds: ["backend-engineering"] });
    const createdAt = "2026-09-01T00:00:00.000Z";

    mockDbQuery.mockResolvedValueOnce({
      rows: [
        {
          token,
          focus_ids: ["backend-engineering", "ai"],
          variant,
          analysis: null,
          created_at: createdAt,
        },
      ],
    });

    const stored = await getResumeVariantByToken(token);

    expect(stored).toEqual({
      token,
      focusIds: ["backend-engineering", "ai"],
      variant,
      analysis: undefined,
      createdAt,
    });

    const [query, values] = mockDbQuery.mock.calls[0] ?? [];

    expect(query).toContain("from resume_variants");
    expect(query).toContain("where token = $1");
    expect(values).toEqual([token]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns null when a resume token is unknown", async () => {
    mockDbQuery.mockResolvedValueOnce({ rows: [] });

    await expect(
      getResumeVariantByToken("0123456789abcdef01234567"),
    ).resolves.toBeNull();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("returns null and logs a warning when loading throws", async () => {
    const error = new Error("read failed");

    mockDbQuery.mockRejectedValueOnce(error);

    await expect(
      getResumeVariantByToken("0123456789abcdef01234567"),
    ).resolves.toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(
      "[resume-store] failed to load resume variant:",
      error,
    );
  });

  it("includes expires_at in the insert query when saving", async () => {
    const focusIds = ["ai"];
    const variant = buildResumeVariant({ focusIds });

    mockDbQuery.mockImplementationOnce(async (_query, values = []) => ({
      rows: [
        {
          token: values[0],
          focus_ids: focusIds,
          variant,
          analysis: null,
          created_at: "2026-09-01T00:00:00.000Z",
        },
      ],
    }));

    await saveResumeVariant({ focusIds, variant });

    const [query, values] = mockDbQuery.mock.calls[0] ?? [];

    expect(query).toContain("expires_at");
    expect(values).toHaveLength(5);

    const expiresAtValue = values?.[4] as string;

    expect(expiresAtValue).toBeDefined();

    const expiresAt = new Date(expiresAtValue);
    const ninetyDaysFromNow = Date.now() + 90 * 24 * 60 * 60 * 1000;

    expect(expiresAt.getTime()).toBeGreaterThan(ninetyDaysFromNow - 10_000);
    expect(expiresAt.getTime()).toBeLessThan(ninetyDaysFromNow + 10_000);
  });

  it("filters by expires_at in the select query so expired tokens return null", async () => {
    mockDbQuery.mockResolvedValueOnce({ rows: [] });

    const result = await getResumeVariantByToken("expired-token-abc");

    expect(result).toBeNull();

    const [query] = mockDbQuery.mock.calls[0] ?? [];

    expect(query).toContain("expires_at > now()");
  });

  it("returns the variant when the token is not expired", async () => {
    const token = "valid-token-abc123def456";
    const variant = buildResumeVariant({ focusIds: ["ai"] });

    mockDbQuery.mockResolvedValueOnce({
      rows: [
        {
          token,
          focus_ids: ["ai"],
          variant,
          analysis: null,
          created_at: "2026-09-01T00:00:00.000Z",
        },
      ],
    });

    const stored = await getResumeVariantByToken(token);

    expect(stored).toEqual({
      token,
      focusIds: ["ai"],
      variant,
      analysis: undefined,
      createdAt: "2026-09-01T00:00:00.000Z",
    });
  });
});

describe("resume purge", () => {
  const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

  beforeEach(() => {
    mockDbQuery.mockReset();
    infoSpy.mockClear();
  });

  afterAll(() => {
    infoSpy.mockRestore();
  });

  it("purgeExpiredVariants deletes expired rows and returns the count", async () => {
    mockDbQuery.mockResolvedValueOnce({ rows: [{ count: "3" }] });

    const result = await purgeExpiredVariants();

    expect(result).toEqual({ deletedCount: 3 });

    const [query] = mockDbQuery.mock.calls[0] ?? [];

    expect(query).toContain("delete from resume_variants");
    expect(query).toContain("expires_at < now()");
    expect(infoSpy).toHaveBeenCalledWith(
      "[resume-purge] purged 3 expired resume variants",
    );
  });

  it("purgeExpiredVariants returns zero when nothing is expired", async () => {
    mockDbQuery.mockResolvedValueOnce({ rows: [{ count: "0" }] });

    const result = await purgeExpiredVariants();

    expect(result).toEqual({ deletedCount: 0 });
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("purgeExpiredJdRequests deletes expired rows and returns the count", async () => {
    mockDbQuery.mockResolvedValueOnce({ rows: [{ count: "5" }] });

    const result = await purgeExpiredJdRequests();

    expect(result).toEqual({ deletedCount: 5 });

    const [query] = mockDbQuery.mock.calls[0] ?? [];

    expect(query).toContain("delete from jd_requests");
    expect(query).toContain("expires_at < now()");
    expect(infoSpy).toHaveBeenCalledWith(
      "[resume-purge] purged 5 expired JD requests",
    );
  });

  it("purgeExpiredJdRequests returns zero when nothing is expired", async () => {
    mockDbQuery.mockResolvedValueOnce({ rows: [{ count: "0" }] });

    const result = await purgeExpiredJdRequests();

    expect(result).toEqual({ deletedCount: 0 });
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
