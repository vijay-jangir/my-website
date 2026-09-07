import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  aggregateSignals,
  type JdExtraction,
  type MarketSignals,
} from "@/lib/intelligence/signals";
import { sanitizeForPublic } from "@/lib/intelligence/publish";

function makeRow(overrides: {
  readonly id?: string;
  readonly focus_ids?: readonly string[];
  readonly extraction?: JdExtraction;
  readonly created_at?: string;
  readonly expires_at?: string;
}) {
  return {
    id: overrides.id ?? "row-1",
    focus_ids: overrides.focus_ids ?? ["backend-engineering"],
    extraction: overrides.extraction ?? {
      skillScores: [
        { id: "python", score: 8, label: "Python" },
        { id: "kafka", score: 6, label: "Kafka" },
      ],
      focusScores: [
        { id: "backend-engineering", score: 9, label: "Backend Engineering" },
      ],
      gaps: ["terraform", "pulumi"],
      extractedHighlights: ["distributed systems"],
    },
    created_at: overrides.created_at ?? "2026-06-15T10:00:00Z",
    expires_at:
      overrides.expires_at ?? "2026-12-15T10:00:00Z",
  };
}

describe("aggregateSignals", () => {
  it("returns empty signals when given no rows", () => {
    const result = aggregateSignals([]);

    expect(result.totalRequests).toBe(0);
    expect(result.dateRange).toBeNull();
    expect(result.topSkills).toEqual([]);
    expect(result.topFocusAreas).toEqual([]);
    expect(result.recurringGaps).toEqual([]);
    expect(result.monthlyTrend).toEqual([]);
    expect(result.recommendations).toHaveLength(1);
  });

  it("aggregates a single row correctly", () => {
    const row = makeRow({});
    const result = aggregateSignals([row]);

    expect(result.totalRequests).toBe(1);
    expect(result.dateRange).toEqual({
      earliest: "2026-06-15T10:00:00Z",
      latest: "2026-06-15T10:00:00Z",
    });
    expect(result.topSkills).toHaveLength(2);
    expect(result.topSkills[0]).toEqual({
      id: "python",
      label: "Python",
      count: 1,
      avgScore: 8,
    });
    expect(result.topFocusAreas).toHaveLength(1);
    expect(result.topFocusAreas[0]).toEqual({
      id: "backend-engineering",
      label: "Backend Engineering",
      count: 1,
      avgScore: 9,
    });
    expect(result.recurringGaps).toEqual([
      { term: "terraform", count: 1 },
      { term: "pulumi", count: 1 },
    ]);
    expect(result.monthlyTrend).toEqual([{ month: "2026-06", count: 1 }]);
  });

  it("accumulates counts and averages across multiple rows", () => {
    const rows = [
      makeRow({
        id: "r1",
        created_at: "2026-06-10T00:00:00Z",
        extraction: {
          skillScores: [{ id: "python", score: 8, label: "Python" }],
          focusScores: [],
          gaps: ["terraform"],
        },
      }),
      makeRow({
        id: "r2",
        created_at: "2026-06-20T00:00:00Z",
        extraction: {
          skillScores: [{ id: "python", score: 6, label: "Python" }],
          focusScores: [],
          gaps: ["terraform", "kubernetes"],
        },
      }),
      makeRow({
        id: "r3",
        created_at: "2026-07-05T00:00:00Z",
        extraction: {
          skillScores: [{ id: "kafka", score: 7, label: "Kafka" }],
          focusScores: [],
          gaps: ["kubernetes"],
        },
      }),
    ];

    const result = aggregateSignals(rows);

    expect(result.totalRequests).toBe(3);
    expect(result.dateRange).toEqual({
      earliest: "2026-06-10T00:00:00Z",
      latest: "2026-07-05T00:00:00Z",
    });

    const pythonSkill = result.topSkills.find((s) => s.id === "python");
    expect(pythonSkill).toEqual({
      id: "python",
      label: "Python",
      count: 2,
      avgScore: 7,
    });

    const kafkaSkill = result.topSkills.find((s) => s.id === "kafka");
    expect(kafkaSkill?.count).toBe(1);

    const terraformGap = result.recurringGaps.find(
      (g) => g.term === "terraform",
    );
    expect(terraformGap?.count).toBe(2);

    const k8sGap = result.recurringGaps.find(
      (g) => g.term === "kubernetes",
    );
    expect(k8sGap?.count).toBe(2);

    expect(result.monthlyTrend).toEqual([
      { month: "2026-06", count: 2 },
      { month: "2026-07", count: 1 },
    ]);
  });

  it("sorts skills by count descending, then avgScore descending", () => {
    const rows = [
      makeRow({
        id: "r1",
        extraction: {
          skillScores: [
            { id: "a", score: 5, label: "A" },
            { id: "b", score: 10, label: "B" },
          ],
        },
      }),
      makeRow({
        id: "r2",
        extraction: {
          skillScores: [
            { id: "a", score: 5, label: "A" },
            { id: "c", score: 9, label: "C" },
          ],
        },
      }),
    ];

    const result = aggregateSignals(rows);

    expect(result.topSkills[0].id).toBe("a");
    expect(result.topSkills[0].count).toBe(2);
    expect(result.topSkills[1].avgScore).toBeGreaterThanOrEqual(
      result.topSkills[2]?.avgScore ?? 0,
    );
  });

  it("normalizes gap terms to lowercase and trims whitespace", () => {
    const rows = [
      makeRow({
        id: "r1",
        extraction: { gaps: ["Terraform ", " TERRAFORM"] },
      }),
    ];

    const result = aggregateSignals(rows);

    expect(result.recurringGaps).toEqual([{ term: "terraform", count: 2 }]);
  });

  it("generates high-demand recommendation when skills appear >= 3 times", () => {
    const rows = Array.from({ length: 3 }, (_, i) =>
      makeRow({
        id: `r${i}`,
        created_at: `2026-06-${10 + i}T00:00:00Z`,
        extraction: {
          skillScores: [{ id: "python", score: 8, label: "Python" }],
        },
      }),
    );

    const result = aggregateSignals(rows);

    expect(
      result.recommendations.some((r) => r.includes("High-demand")),
    ).toBe(true);
  });

  it("generates gap recommendation when gaps appear >= 2 times", () => {
    const rows = [
      makeRow({
        id: "r1",
        extraction: { gaps: ["mlops"] },
      }),
      makeRow({
        id: "r2",
        extraction: { gaps: ["mlops"] },
      }),
    ];

    const result = aggregateSignals(rows);

    expect(
      result.recommendations.some((r) => r.includes("Recurring skill gaps")),
    ).toBe(true);
  });

  it("handles rows with missing extraction fields gracefully", () => {
    const row = makeRow({
      extraction: {} as JdExtraction,
    });

    const result = aggregateSignals([row]);

    expect(result.totalRequests).toBe(1);
    expect(result.topSkills).toEqual([]);
    expect(result.topFocusAreas).toEqual([]);
    expect(result.recurringGaps).toEqual([]);
  });

  it("uses skill id as label fallback when label is missing", () => {
    const row = makeRow({
      extraction: {
        skillScores: [{ id: "flink", score: 7 }],
      },
    });

    const result = aggregateSignals([row]);

    expect(result.topSkills[0].label).toBe("flink");
  });
});

describe("sanitizeForPublic", () => {
  it("strips avgScore and id from skills and focus areas", () => {
    const signals: MarketSignals = {
      generatedAt: "2026-09-01T00:00:00Z",
      totalRequests: 5,
      dateRange: {
        earliest: "2026-06-01T00:00:00Z",
        latest: "2026-08-01T00:00:00Z",
      },
      topSkills: [
        { id: "python", label: "Python", count: 5, avgScore: 8.5 },
      ],
      topFocusAreas: [
        {
          id: "backend-engineering",
          label: "Backend Engineering",
          count: 3,
          avgScore: 9,
        },
      ],
      recurringGaps: [{ term: "terraform", count: 3 }],
      monthlyTrend: [{ month: "2026-06", count: 2 }],
      recommendations: ["Some recommendation"],
    };

    const snapshot = sanitizeForPublic(signals);

    expect(snapshot.topSkills).toEqual([{ label: "Python", count: 5 }]);
    expect(snapshot.topFocusAreas).toEqual([
      { label: "Backend Engineering", count: 3 },
    ]);
    expect(snapshot.recurringGaps).toEqual([{ term: "terraform", count: 3 }]);
    expect(snapshot).not.toHaveProperty("recommendations");

    const skillEntry = snapshot.topSkills[0] as Record<string, unknown>;
    expect(skillEntry).not.toHaveProperty("id");
    expect(skillEntry).not.toHaveProperty("avgScore");
  });

  it("preserves totalRequests and dateRange", () => {
    const signals: MarketSignals = {
      generatedAt: "2026-09-01T00:00:00Z",
      totalRequests: 10,
      dateRange: {
        earliest: "2026-01-01T00:00:00Z",
        latest: "2026-09-01T00:00:00Z",
      },
      topSkills: [],
      topFocusAreas: [],
      recurringGaps: [],
      monthlyTrend: [],
      recommendations: [],
    };

    const snapshot = sanitizeForPublic(signals);

    expect(snapshot.totalRequests).toBe(10);
    expect(snapshot.dateRange).toEqual(signals.dateRange);
    expect(snapshot.publishedAt).toBeTruthy();
  });
});

const {
  dbQueryMock,
  getSessionUserMock,
  isAuthConfiguredMock,
} = vi.hoisted(() => ({
  dbQueryMock: vi.fn(),
  getSessionUserMock: vi.fn(),
  isAuthConfiguredMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  isAuthConfigured: isAuthConfiguredMock,
}));

vi.mock("@/src/lib/auth", () => ({
  getSessionUser: getSessionUserMock,
}));

vi.mock("@/lib/drizzle", () => ({
  dbQuery: dbQueryMock,
}));

import { GET } from "@/src/pages/api/intelligence/signals";

function createGetRequest() {
  return new Request("http://localhost/api/intelligence/signals");
}

function createCookiesMock() {
  return {
    delete: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
  };
}

describe("GET /api/intelligence/signals", () => {
  beforeEach(() => {
    isAuthConfiguredMock.mockReturnValue(true);
    getSessionUserMock.mockResolvedValue({ login: "owner", role: "owner" });
    dbQueryMock.mockResolvedValue({ rows: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when auth is not configured", async () => {
    isAuthConfiguredMock.mockReturnValue(false);

    const response = await GET({
      cookies: createCookiesMock(),
      request: createGetRequest(),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(503);
  });

  it("returns 401 when no session exists", async () => {
    getSessionUserMock.mockResolvedValue(null);

    const response = await GET({
      cookies: createCookiesMock(),
      request: createGetRequest(),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(401);
  });

  it("returns 503 when database is not configured", async () => {
    dbQueryMock.mockResolvedValue(null);

    const response = await GET({
      cookies: createCookiesMock(),
      request: createGetRequest(),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: "Database is not configured.",
    });
  });

  it("returns aggregated signals on success", async () => {
    dbQueryMock.mockResolvedValue({
      rows: [
        makeRow({ id: "r1" }),
        makeRow({ id: "r2", created_at: "2026-07-01T00:00:00Z" }),
      ],
    });

    const response = await GET({
      cookies: createCookiesMock(),
      request: createGetRequest(),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.signals.totalRequests).toBe(2);
    expect(data.signals.topSkills.length).toBeGreaterThan(0);
  });
});
