import type { APIRoute } from "astro";
import { z } from "zod";

import { dbQuery } from "@/lib/drizzle";
import { buildResumeVariantFromJobDescriptionWithContent } from "@/lib/jd";
import { getPortfolioContent } from "@/lib/portfolio-content";
import { isAuthConfigured } from "@/lib/env";
import { saveResumeVariant } from "@/lib/resume-store";
import { getSessionUser } from "@/src/lib/auth";

const requestSchema = z.object({
  jobDescription: z.string().min(80).max(10000),
  focusOverride: z.string().max(200).optional().default(""),
});

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  if (!isAuthConfigured()) {
    return Response.json(
      {
        message: "Admin auth is not configured yet.",
        ok: false,
      },
      { status: 503 },
    );
  }

  const session = await getSessionUser(cookies);

  if (!session) {
    return Response.json(
      {
        message: "Authentication required.",
        ok: false,
      },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const parsed = requestSchema.safeParse({
    focusOverride: formData.get("focusOverride"),
    jobDescription: formData.get("jobDescription"),
  });

  if (!parsed.success) {
    return Response.json(
      {
        message: "Provide a valid job description before generating a variant.",
        ok: false,
      },
      { status: 400 },
    );
  }

  const content = await getPortfolioContent();
  const { analysis, variant } = buildResumeVariantFromJobDescriptionWithContent(
    content,
    {
      focusOverride: parsed.data.focusOverride,
      rawText: parsed.data.jobDescription,
    },
  );

  try {
    const jdExpiresAt = new Date(
      Date.now() + 180 * 24 * 60 * 60 * 1000,
    ).toISOString();
    await dbQuery(
      `
        insert into jd_requests (focus_ids, raw_text, extraction, expires_at)
        values ($1::text[], $2, $3::jsonb, $4)
      `,
      [
        variant.focusIds,
        parsed.data.jobDescription,
        JSON.stringify({
          extractedHighlights: analysis.extractedHighlights,
          focusScores: analysis.focusScores,
          skillScores: analysis.skillScores,
        }),
        jdExpiresAt,
      ],
    );
  } catch (error) {
    console.warn("[jd-analyze] jd_requests insert failed:", error);
  }

  const savedVariant = await saveResumeVariant({
    analysis,
    focusIds: variant.focusIds,
    variant,
  });
  const resumeUrl = savedVariant
    ? `/resume?variant=${savedVariant.token}`
    : `/resume?focus=${variant.focusIds.join(",")}`;
  const pdfUrl = savedVariant
    ? `/api/resume/pdf?variant=${savedVariant.token}`
    : `/api/resume/pdf?focus=${variant.focusIds.join(",")}`;

  return Response.json({
    analysis: {
      extractedHighlights: analysis.extractedHighlights,
      focusScores: analysis.focusScores.slice(0, 6),
      skillScores: analysis.skillScores.slice(0, 10),
    },
    ok: true,
    pdfUrl,
    resumeUrl,
    saved: Boolean(savedVariant),
    variant: {
      focusIds: variant.focusIds,
      headline: variant.headline,
      primarySkills: variant.primarySkills.map((skill) => ({
        id: skill.id,
        label: skill.label,
      })),
      projects: variant.projects.map((project) => ({
        id: project.id,
        summary: project.summary,
        title: project.title,
      })),
      summary: variant.summary,
    },
  });
};
