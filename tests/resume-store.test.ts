import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  dbQuery: vi.fn(),
}));

import { analyzeJobDescription } from "@/lib/jd";
import { buildResumeVariant } from "@/lib/portfolio";
import { dbQuery } from "@/lib/db";
import { getResumeVariantByToken, saveResumeVariant } from "@/lib/resume-store";

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
    expect(values).toHaveLength(4);
    expect(values?.[0]).toMatch(/^[0-9a-f]{24}$/);
    expect(values?.[1]).toEqual(focusIds);
    expect(values?.[2]).toBe(JSON.stringify(variant));
    expect(values?.[3]).toBe(JSON.stringify(analysis));
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
});
