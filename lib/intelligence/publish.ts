import { dbQuery } from "@/lib/drizzle";
import type { MarketSignals } from "@/lib/intelligence/signals";

export type PublicSkillSignal = {
  readonly label: string;
  readonly count: number;
};

export type PublicFocusSignal = {
  readonly label: string;
  readonly count: number;
};

export type PublicGapSignal = {
  readonly term: string;
  readonly count: number;
};

export type PublicMonthlyTrend = {
  readonly month: string;
  readonly count: number;
};

export type MarketSignalSnapshot = {
  readonly generatedAt: string;
  readonly publishedAt: string;
  readonly totalRequests: number;
  readonly dateRange: {
    readonly earliest: string;
    readonly latest: string;
  } | null;
  readonly topSkills: readonly PublicSkillSignal[];
  readonly topFocusAreas: readonly PublicFocusSignal[];
  readonly recurringGaps: readonly PublicGapSignal[];
  readonly monthlyTrend: readonly PublicMonthlyTrend[];
};

export function sanitizeForPublic(signals: MarketSignals): MarketSignalSnapshot {
  return {
    generatedAt: signals.generatedAt,
    publishedAt: new Date().toISOString(),
    totalRequests: signals.totalRequests,
    dateRange: signals.dateRange,
    topSkills: signals.topSkills.map(({ label, count }) => ({ label, count })),
    topFocusAreas: signals.topFocusAreas.map(({ label, count }) => ({
      label,
      count,
    })),
    recurringGaps: signals.recurringGaps.map(({ term, count }) => ({
      term,
      count,
    })),
    monthlyTrend: signals.monthlyTrend.map(({ month, count }) => ({
      month,
      count,
    })),
  };
}

type SnapshotRow = {
  readonly id: string;
  readonly snapshot: MarketSignalSnapshot;
  readonly published_at: string;
  readonly published_by: string;
};

export async function publishSignalSnapshot(
  signals: MarketSignals,
  publishedBy: string,
): Promise<MarketSignalSnapshot | null> {
  const snapshot = sanitizeForPublic(signals);

  const result = await dbQuery(
    `INSERT INTO market_signal_snapshots (snapshot, published_by)
     VALUES ($1::jsonb, $2)
     RETURNING id`,
    [JSON.stringify(snapshot), publishedBy],
  );

  if (!result || result.rows.length === 0) return null;

  return snapshot;
}

export async function loadPublishedSnapshot(): Promise<MarketSignalSnapshot | null> {
  try {
    const result = await dbQuery<SnapshotRow>(
      `SELECT snapshot
       FROM market_signal_snapshots
       ORDER BY published_at DESC
       LIMIT 1`,
    );

    if (!result || result.rows.length === 0) return null;

    return result.rows[0].snapshot;
  } catch {
    return null;
  }
}
