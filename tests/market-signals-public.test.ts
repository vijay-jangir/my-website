import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import {
  loadPublishedSnapshot,
  sanitizeForPublic,
  type MarketSignalSnapshot,
} from "@/lib/intelligence/publish";
import type { MarketSignals } from "@/lib/intelligence/signals";

describe("public market-signals isolation", () => {
  it("market-signals.astro does NOT import from lib/llm/", () => {
    const pagePath = path.resolve("src/pages/market-signals.astro");
    const source = fs.readFileSync(pagePath, "utf-8");

    expect(source).not.toMatch(/from\s+['"].*lib\/llm/);
    expect(source).not.toMatch(/import\s+.*['"].*lib\/llm/);
  });

  it("publish.ts does NOT import from lib/llm/", () => {
    const publishPath = path.resolve("lib/intelligence/publish.ts");
    const source = fs.readFileSync(publishPath, "utf-8");

    expect(source).not.toMatch(/from\s+['"].*lib\/llm/);
    expect(source).not.toMatch(/import\s+.*['"].*lib\/llm/);
  });
});

describe("sanitizeForPublic snapshot shape", () => {
  const signals: MarketSignals = {
    generatedAt: "2026-09-01T00:00:00Z",
    totalRequests: 12,
    dateRange: {
      earliest: "2026-03-01T00:00:00Z",
      latest: "2026-09-01T00:00:00Z",
    },
    topSkills: [
      { id: "python", label: "Python", count: 10, avgScore: 8.5 },
      { id: "kafka", label: "Kafka", count: 7, avgScore: 7.2 },
    ],
    topFocusAreas: [
      {
        id: "data-platform",
        label: "Data Platform",
        count: 8,
        avgScore: 9.1,
      },
    ],
    recurringGaps: [
      { term: "terraform", count: 5 },
      { term: "mlops", count: 3 },
    ],
    monthlyTrend: [
      { month: "2026-03", count: 2 },
      { month: "2026-06", count: 5 },
      { month: "2026-09", count: 5 },
    ],
    recommendations: [
      "High-demand skills: Python, Kafka.",
      "Recurring gaps: terraform, mlops.",
    ],
  };

  it("excludes internal ids from skill entries", () => {
    const snapshot = sanitizeForPublic(signals);

    for (const skill of snapshot.topSkills) {
      const entry = skill as Record<string, unknown>;
      expect(entry).not.toHaveProperty("id");
      expect(entry).not.toHaveProperty("avgScore");
      expect(entry).toHaveProperty("label");
      expect(entry).toHaveProperty("count");
    }
  });

  it("excludes internal ids from focus area entries", () => {
    const snapshot = sanitizeForPublic(signals);

    for (const focus of snapshot.topFocusAreas) {
      const entry = focus as Record<string, unknown>;
      expect(entry).not.toHaveProperty("id");
      expect(entry).not.toHaveProperty("avgScore");
    }
  });

  it("excludes recommendations from the public snapshot", () => {
    const snapshot = sanitizeForPublic(signals) as Record<string, unknown>;

    expect(snapshot).not.toHaveProperty("recommendations");
  });

  it("includes a publishedAt timestamp", () => {
    const snapshot = sanitizeForPublic(signals);

    expect(snapshot.publishedAt).toBeTruthy();
    expect(() => new Date(snapshot.publishedAt)).not.toThrow();
  });

  it("preserves monthly trend data", () => {
    const snapshot = sanitizeForPublic(signals);

    expect(snapshot.monthlyTrend).toEqual(signals.monthlyTrend);
  });
});

const { dbQueryMock } = vi.hoisted(() => ({
  dbQueryMock: vi.fn(),
}));

vi.mock("@/lib/drizzle", () => ({
  dbQuery: dbQueryMock,
}));

describe("loadPublishedSnapshot", () => {
  it("returns null when database is not configured", async () => {
    dbQueryMock.mockResolvedValue(null);

    const result = await loadPublishedSnapshot();

    expect(result).toBeNull();
  });

  it("returns null when no snapshots exist", async () => {
    dbQueryMock.mockResolvedValue({ rows: [] });

    const result = await loadPublishedSnapshot();

    expect(result).toBeNull();
  });

  it("returns the latest snapshot when available", async () => {
    const mockSnapshot: MarketSignalSnapshot = {
      generatedAt: "2026-09-01T00:00:00Z",
      publishedAt: "2026-09-01T12:00:00Z",
      totalRequests: 10,
      dateRange: {
        earliest: "2026-03-01T00:00:00Z",
        latest: "2026-09-01T00:00:00Z",
      },
      topSkills: [{ label: "Python", count: 8 }],
      topFocusAreas: [{ label: "Backend", count: 5 }],
      recurringGaps: [{ term: "terraform", count: 3 }],
      monthlyTrend: [{ month: "2026-09", count: 10 }],
    };

    dbQueryMock.mockResolvedValue({
      rows: [{ snapshot: mockSnapshot }],
    });

    const result = await loadPublishedSnapshot();

    expect(result).toEqual(mockSnapshot);
  });

  it("returns null when the query throws", async () => {
    dbQueryMock.mockRejectedValue(new Error("table does not exist"));

    const result = await loadPublishedSnapshot();

    expect(result).toBeNull();
  });
});
