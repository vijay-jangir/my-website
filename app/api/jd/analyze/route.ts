import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { buildResumeVariantFromJobDescription } from "@/lib/jd";
import { isAuthConfigured } from "@/lib/env";
import { saveResumeVariant } from "@/lib/resume-store";
import { verifyTurnstileToken } from "@/lib/turnstile";

const requestSchema = z.object({
  jobDescription: z.string().min(80).max(10000),
  focusOverride: z.string().max(200).optional().default(""),
  turnstileToken: z.string().optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Admin auth is not configured yet.",
      },
      { status: 503 },
    );
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "Authentication required.",
      },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const parsed = requestSchema.safeParse({
    jobDescription: formData.get("jobDescription"),
    focusOverride: formData.get("focusOverride"),
    turnstileToken: formData.get("cf-turnstile-response"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Provide a valid job description before generating a variant.",
      },
      { status: 400 },
    );
  }

  const turnstileOk = await verifyTurnstileToken(parsed.data.turnstileToken ?? null);

  if (!turnstileOk) {
    return NextResponse.json(
      {
        ok: false,
        message: "Turnstile verification failed. Please retry.",
      },
      { status: 403 },
    );
  }

  const { analysis, variant } = buildResumeVariantFromJobDescription({
    rawText: parsed.data.jobDescription,
    focusOverride: parsed.data.focusOverride,
  });

  try {
    await dbQuery(
      `
        insert into jd_requests (focus_ids, raw_text, extraction)
        values ($1::text[], $2, $3::jsonb)
      `,
      [
        variant.focusIds,
        parsed.data.jobDescription,
        JSON.stringify({
          focusScores: analysis.focusScores,
          skillScores: analysis.skillScores,
          extractedHighlights: analysis.extractedHighlights,
        }),
      ],
    );
  } catch {
    // Keep the admin flow usable even if the DB schema is not applied yet.
  }

  const savedVariant = await saveResumeVariant({
    focusIds: variant.focusIds,
    variant,
    analysis,
  });
  const resumeUrl = savedVariant
    ? `/resume?variant=${savedVariant.token}`
    : `/resume?focus=${variant.focusIds.join(",")}`;
  const pdfUrl = savedVariant
    ? `/api/resume/pdf?variant=${savedVariant.token}`
    : `/api/resume/pdf?focus=${variant.focusIds.join(",")}`;

  return NextResponse.json({
    ok: true,
    saved: Boolean(savedVariant),
    resumeUrl,
    pdfUrl,
    analysis: {
      focusScores: analysis.focusScores.slice(0, 6),
      skillScores: analysis.skillScores.slice(0, 10),
      extractedHighlights: analysis.extractedHighlights,
    },
    variant: {
      headline: variant.headline,
      summary: variant.summary,
      focusIds: variant.focusIds,
      primarySkills: variant.primarySkills.map((skill) => ({
        id: skill.id,
        label: skill.label,
      })),
      projects: variant.projects.map((project) => ({
        id: project.id,
        title: project.title,
        summary: project.summary,
      })),
    },
  });
}
