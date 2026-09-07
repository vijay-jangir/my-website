import { dbQuery } from "@/lib/drizzle";

export type JdExtraction = {
  readonly focusScores?: ReadonlyArray<{
    readonly id: string;
    readonly score: number;
    readonly label?: string;
  }>;
  readonly skillScores?: ReadonlyArray<{
    readonly id: string;
    readonly score: number;
    readonly label?: string;
  }>;
  readonly extractedHighlights?: readonly string[];
  readonly gaps?: readonly string[];
};

type JdRequestRow = {
  readonly id: string;
  readonly focus_ids: readonly string[];
  readonly extraction: JdExtraction;
  readonly created_at: string;
  readonly expires_at: string;
};

export type SkillSignal = {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly avgScore: number;
};

export type FocusSignal = {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly avgScore: number;
};

export type GapSignal = {
  readonly term: string;
  readonly count: number;
};

export type MonthlyTrend = {
  readonly month: string;
  readonly count: number;
};

export type MarketSignals = {
  readonly generatedAt: string;
  readonly totalRequests: number;
  readonly dateRange: { readonly earliest: string; readonly latest: string } | null;
  readonly topSkills: readonly SkillSignal[];
  readonly topFocusAreas: readonly FocusSignal[];
  readonly recurringGaps: readonly GapSignal[];
  readonly monthlyTrend: readonly MonthlyTrend[];
  readonly recommendations: readonly string[];
};

function toYearMonth(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildRecommendations(
  topSkills: readonly SkillSignal[],
  gaps: readonly GapSignal[],
): string[] {
  const recommendations: string[] = [];

  const highDemandSkills = topSkills.filter((s) => s.count >= 3);
  if (highDemandSkills.length > 0) {
    const labels = highDemandSkills
      .slice(0, 5)
      .map((s) => s.label)
      .join(", ");
    recommendations.push(
      `High-demand skills across JDs: ${labels}. Ensure these are prominently featured in portfolio projects.`,
    );
  }

  const frequentGaps = gaps.filter((g) => g.count >= 2);
  if (frequentGaps.length > 0) {
    const terms = frequentGaps
      .slice(0, 5)
      .map((g) => g.term)
      .join(", ");
    recommendations.push(
      `Recurring skill gaps: ${terms}. Consider adding portfolio evidence or projects demonstrating these capabilities.`,
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Not enough data to generate specific recommendations. Continue analyzing job descriptions to build signal strength.",
    );
  }

  return recommendations;
}

export function aggregateSignals(
  rows: readonly JdRequestRow[],
): MarketSignals {
  if (rows.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      totalRequests: 0,
      dateRange: null,
      topSkills: [],
      topFocusAreas: [],
      recurringGaps: [],
      monthlyTrend: [],
      recommendations: [
        "No job descriptions analyzed yet. Use the JD analyzer to start building market signals.",
      ],
    };
  }

  const skillAccumulator = new Map<
    string,
    { label: string; totalScore: number; count: number }
  >();
  const focusAccumulator = new Map<
    string,
    { label: string; totalScore: number; count: number }
  >();
  const gapCounter = new Map<string, number>();
  const monthCounter = new Map<string, number>();

  let earliest = rows[0].created_at;
  let latest = rows[0].created_at;

  for (const row of rows) {
    if (row.created_at < earliest) earliest = row.created_at;
    if (row.created_at > latest) latest = row.created_at;

    const month = toYearMonth(row.created_at);
    monthCounter.set(month, (monthCounter.get(month) ?? 0) + 1);

    const extraction = row.extraction;

    if (extraction.skillScores) {
      for (const skill of extraction.skillScores) {
        const existing = skillAccumulator.get(skill.id);
        if (existing) {
          existing.totalScore += skill.score;
          existing.count += 1;
        } else {
          skillAccumulator.set(skill.id, {
            label: skill.label ?? skill.id,
            totalScore: skill.score,
            count: 1,
          });
        }
      }
    }

    if (extraction.focusScores) {
      for (const focus of extraction.focusScores) {
        const existing = focusAccumulator.get(focus.id);
        if (existing) {
          existing.totalScore += focus.score;
          existing.count += 1;
        } else {
          focusAccumulator.set(focus.id, {
            label: focus.label ?? focus.id,
            totalScore: focus.score,
            count: 1,
          });
        }
      }
    }

    if (extraction.gaps) {
      for (const gap of extraction.gaps) {
        const normalized = gap.trim().toLowerCase();
        if (normalized) {
          gapCounter.set(normalized, (gapCounter.get(normalized) ?? 0) + 1);
        }
      }
    }
  }

  const topSkills: SkillSignal[] = [...skillAccumulator.entries()]
    .map(([id, data]) => ({
      id,
      label: data.label,
      count: data.count,
      avgScore: Math.round((data.totalScore / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore)
    .slice(0, 20);

  const topFocusAreas: FocusSignal[] = [...focusAccumulator.entries()]
    .map(([id, data]) => ({
      id,
      label: data.label,
      count: data.count,
      avgScore: Math.round((data.totalScore / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore)
    .slice(0, 10);

  const recurringGaps: GapSignal[] = [...gapCounter.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const monthlyTrend: MonthlyTrend[] = [...monthCounter.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    generatedAt: new Date().toISOString(),
    totalRequests: rows.length,
    dateRange: { earliest, latest },
    topSkills,
    topFocusAreas,
    recurringGaps,
    monthlyTrend,
    recommendations: buildRecommendations(topSkills, recurringGaps),
  };
}

export async function loadMarketSignals(): Promise<MarketSignals | null> {
  const result = await dbQuery<JdRequestRow>(
    `SELECT id, focus_ids, extraction, created_at::text, expires_at::text
     FROM jd_requests
     WHERE expires_at > NOW()
     ORDER BY created_at DESC`,
  );

  if (!result) return null;

  return aggregateSignals(result.rows);
}
