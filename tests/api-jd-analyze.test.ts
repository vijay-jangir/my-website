import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import { buildResumeVariantFromJobDescriptionWithContent } from "@/lib/jd";

const {
  dbQueryMock,
  getPortfolioContentMock,
  getSessionUserMock,
  isAuthConfiguredMock,
  saveResumeVariantMock,
} = vi.hoisted(() => ({
  dbQueryMock: vi.fn(),
  getPortfolioContentMock: vi.fn(),
  getSessionUserMock: vi.fn(),
  isAuthConfiguredMock: vi.fn(),
  saveResumeVariantMock: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  isAuthConfigured: isAuthConfiguredMock,
}));

vi.mock("@/src/lib/auth", () => ({
  getSessionUser: getSessionUserMock,
}));

vi.mock("@/lib/portfolio-content", () => ({
  getPortfolioContent: getPortfolioContentMock,
}));

vi.mock("@/lib/resume-store", () => ({
  saveResumeVariant: saveResumeVariantMock,
}));

vi.mock("@/lib/db", () => ({
  dbQuery: dbQueryMock,
}));

import { POST } from "@/src/pages/api/jd/analyze";

function createLongJobDescription() {
  const focusTerms = [
    "AI",
    "agentic development",
    "backend engineering",
    "platform engineering",
    "data platform",
    "flink",
    "kafka",
    "python",
  ];

  const skillTerms = [
    "spark",
    "flink",
    "kubernetes",
    "spark operator",
    "python",
    "java",
    "scala",
    "javascript",
    "mongodb",
    "aws",
    "kafka",
    "elastic stack",
    "nifi",
    "datahub",
    "dbt",
    "airflow",
    "hive",
    "iceberg",
    "hudi",
    "influxdb",
    "grafana",
    "trino",
    "alluxio",
  ];

  return [
    "Senior platform engineering lead",
    "Required",
    `Hands-on experience across ${focusTerms.join(", ")} in production systems.`,
    `Deep expertise with ${skillTerms.join(", ")} for delivery at scale.`,
    "You will lead backend systems, data platforms, AI-enabled tooling, and reliable software delivery.",
  ].join("\n\n");
}

function createRequest(jobDescription: string, focusOverride = "") {
  const formData = new FormData();
  formData.set("jobDescription", jobDescription);
  formData.set("focusOverride", focusOverride);

  return new Request("http://localhost/api/jd/analyze", {
    body: formData,
    method: "POST",
  });
}

function normalizeSubmittedText(value: string) {
  return value.replaceAll("\n", "\r\n");
}

async function callPost(options?: {
  readonly focusOverride?: string;
  readonly jobDescription?: string;
}) {
  const cookies = {
    delete: vi.fn(),
    get: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
  };

  return POST({
    cookies,
    request: createRequest(
      options?.jobDescription ?? createLongJobDescription(),
      options?.focusOverride,
    ),
  } as Parameters<typeof POST>[0]);
}

describe("POST /api/jd/analyze", () => {
  beforeEach(() => {
    isAuthConfiguredMock.mockReturnValue(true);
    getSessionUserMock.mockResolvedValue({ login: "owner", role: "admin" });
    getPortfolioContentMock.mockResolvedValue(fallbackPortfolioSnapshot);
    saveResumeVariantMock.mockResolvedValue({ token: "saved-variant-token" });
    dbQueryMock.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when auth is not configured", async () => {
    isAuthConfiguredMock.mockReturnValue(false);

    const response = await callPost();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: "Admin auth is not configured yet.",
      ok: false,
    });
    expect(getSessionUserMock).not.toHaveBeenCalled();
  });

  it("returns 401 when no session exists", async () => {
    getSessionUserMock.mockResolvedValue(null);

    const response = await callPost();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Authentication required.",
      ok: false,
    });
    expect(getPortfolioContentMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      jobDescription: "x".repeat(79),
      label: "job descriptions shorter than 80 characters",
    },
    {
      jobDescription: "x".repeat(10001),
      label: "job descriptions longer than 10000 characters",
    },
  ])("returns 400 for $label", async ({ jobDescription }) => {
    const response = await callPost({ jobDescription });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Provide a valid job description before generating a variant.",
      ok: false,
    });
    expect(getPortfolioContentMock).not.toHaveBeenCalled();
  });

  it("returns trimmed analysis, saved URLs, and the public variant subset on success", async () => {
    const jobDescription = createLongJobDescription();
    const focusOverride = "python";
    const expected = buildResumeVariantFromJobDescriptionWithContent(
      fallbackPortfolioSnapshot,
      {
        focusOverride,
        rawText: normalizeSubmittedText(jobDescription),
      },
    );

    expect(expected.analysis.focusScores.length).toBeGreaterThan(6);
    expect(expected.analysis.skillScores.length).toBeGreaterThan(10);

    const response = await callPost({ focusOverride, jobDescription });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      analysis: {
        extractedHighlights: expected.analysis.extractedHighlights,
        focusScores: expected.analysis.focusScores.slice(0, 6),
        skillScores: expected.analysis.skillScores.slice(0, 10),
      },
      ok: true,
      pdfUrl: "/api/resume/pdf?variant=saved-variant-token",
      resumeUrl: "/resume?variant=saved-variant-token",
      saved: true,
      variant: {
        focusIds: expected.variant.focusIds,
        headline: expected.variant.headline,
        primarySkills: expected.variant.primarySkills.map((skill) => ({
          id: skill.id,
          label: skill.label,
        })),
        projects: expected.variant.projects.map((project) => ({
          id: project.id,
          summary: project.summary,
          title: project.title,
        })),
        summary: expected.variant.summary,
      },
    });
    expect(saveResumeVariantMock).toHaveBeenCalledWith({
      analysis: expected.analysis,
      focusIds: expected.variant.focusIds,
      variant: expected.variant,
    });
    expect(dbQueryMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to focus-based URLs when persistence returns null", async () => {
    const jobDescription = createLongJobDescription();
    const focusOverride = "backend-engineering";
    const expected = buildResumeVariantFromJobDescriptionWithContent(
      fallbackPortfolioSnapshot,
      {
        focusOverride,
        rawText: normalizeSubmittedText(jobDescription),
      },
    );

    saveResumeVariantMock.mockResolvedValue(null);

    const response = await callPost({ focusOverride, jobDescription });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      pdfUrl: `/api/resume/pdf?focus=${expected.variant.focusIds.join(",")}`,
      resumeUrl: `/resume?focus=${expected.variant.focusIds.join(",")}`,
      saved: false,
    });
  });

  it("does not fail the request when the jd_requests insert throws", async () => {
    const jobDescription = createLongJobDescription();

    dbQueryMock.mockRejectedValueOnce(new Error("insert failed"));

    const response = await callPost({ jobDescription });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      pdfUrl: "/api/resume/pdf?variant=saved-variant-token",
      resumeUrl: "/resume?variant=saved-variant-token",
      saved: true,
    });
    expect(saveResumeVariantMock).toHaveBeenCalledTimes(1);
  });
});
