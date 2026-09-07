import crypto from "node:crypto";

import { dbQuery } from "@/lib/drizzle";
import type {
  JobDescriptionAnalysis,
  ResumeVariant,
  StoredResumeVariant,
} from "@/lib/portfolio-types";

type StoredVariantRow = {
  token: string;
  focus_ids: string[];
  variant: ResumeVariant;
  analysis: JobDescriptionAnalysis | null;
  created_at: string;
};

export async function saveResumeVariant(options: {
  focusIds: readonly string[];
  variant: ResumeVariant;
  analysis?: JobDescriptionAnalysis;
}) {
  try {
    const token = crypto.randomBytes(12).toString("hex");
    const result = await dbQuery<StoredVariantRow>(
      `
        insert into resume_variants (
          token,
          focus_ids,
          variant,
          analysis
        )
        values ($1, $2::text[], $3::jsonb, $4::jsonb)
        returning token, focus_ids, variant, analysis, created_at
      `,
      [
        token,
        options.focusIds,
        JSON.stringify(options.variant),
        JSON.stringify(options.analysis ?? null),
      ],
    );

    return result?.rows[0] ?? null;
  } catch (error) {
    console.warn("[resume-store] failed to save resume variant:", error);
    return null;
  }
}

export async function getResumeVariantByToken(
  token: string,
): Promise<StoredResumeVariant | null> {
  try {
    const result = await dbQuery<StoredVariantRow>(
      `
        select token, focus_ids, variant, analysis, created_at
        from resume_variants
        where token = $1
        limit 1
      `,
      [token],
    );

    const row = result?.rows[0];

    if (!row) {
      return null;
    }

    return {
      token: row.token,
      focusIds: row.focus_ids as StoredResumeVariant["focusIds"],
      variant: row.variant,
      analysis: row.analysis ?? undefined,
      createdAt: row.created_at,
    };
  } catch (error) {
    console.warn("[resume-store] failed to load resume variant:", error);
    return null;
  }
}
