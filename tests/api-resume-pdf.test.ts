import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import React from "react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";
import type {
  FocusId,
  ResumeVariant,
  StoredResumeVariant,
} from "@/lib/portfolio-types";

vi.mock("@/lib/portfolio", () => ({
  buildResumeVariantFromContent: vi.fn(),
  parseFocusIdsInContent: vi.fn(),
}));

vi.mock("@/lib/portfolio-content", () => ({
  getPortfolioContent: vi.fn(),
}));

vi.mock("@/lib/resume-store", () => ({
  getResumeVariantByToken: vi.fn(),
}));

vi.mock("@react-pdf/renderer", async () => {
  const actual = await vi.importActual<typeof import("@react-pdf/renderer")>(
    "@react-pdf/renderer",
  );

  return {
    ...actual,
    renderToBuffer: vi.fn(),
  };
});

import { renderToBuffer } from "@react-pdf/renderer";
import {
  buildResumeVariantFromContent,
  parseFocusIdsInContent,
} from "@/lib/portfolio";
import { getPortfolioContent } from "@/lib/portfolio-content";
import { getResumeVariantByToken } from "@/lib/resume-store";
import { GET } from "@/src/pages/api/resume/pdf";

const renderToBufferMock = vi.mocked(renderToBuffer);
const buildResumeVariantFromContentMock = vi.mocked(
  buildResumeVariantFromContent,
);
const parseFocusIdsInContentMock = vi.mocked(parseFocusIdsInContent);
const getPortfolioContentMock = vi.mocked(getPortfolioContent);
const getResumeVariantByTokenMock = vi.mocked(getResumeVariantByToken);

const pdfBytes = Buffer.from("%PDF-1.4\nmock\n%%EOF");
const builtFocusIds: readonly FocusId[] = ["ai"];
const parsedFocusIds: readonly FocusId[] = ["backend-engineering"];

function createVariant(options: {
  readonly id: string;
  readonly source: ResumeVariant["source"];
  readonly focusIds: readonly FocusId[];
  readonly headline: string;
  readonly summary: string;
}): ResumeVariant {
  return {
    id: options.id,
    source: options.source,
    focusIds: options.focusIds,
    headline: options.headline,
    summary: options.summary,
    recruiterPitch: fallbackPortfolioSnapshot.siteProfile.recruiterPitch,
    highlights: fallbackPortfolioSnapshot.profileHighlights.slice(0, 1),
    primarySkills: fallbackPortfolioSnapshot.skillDefinitions.slice(0, 2),
    secondarySkills: fallbackPortfolioSnapshot.skillDefinitions.slice(2, 4),
    supportingSkills: fallbackPortfolioSnapshot.skillDefinitions.slice(4, 6),
    projects: fallbackPortfolioSnapshot.projects.slice(0, 1),
    experiences: fallbackPortfolioSnapshot.experiences.slice(0, 1),
  };
}

const builtVariant = createVariant({
  id: "focus-ai",
  source: "focus",
  focusIds: builtFocusIds,
  headline: "Built headline",
  summary: "Built summary",
});

const storedVariantValue = createVariant({
  id: "stored-backend",
  source: "jd",
  focusIds: parsedFocusIds,
  headline: "Stored headline",
  summary: "Stored summary",
});

const storedVariant: StoredResumeVariant = {
  token: "0123456789abcdef01234567",
  focusIds: parsedFocusIds,
  variant: storedVariantValue,
  createdAt: "2026-09-07T00:00:00.000Z",
};

function createApiContext(urlText: string): Parameters<typeof GET>[0] {
  const url = new URL(urlText);

  return {
    site: undefined,
    generator: "Astro v6.1.3",
    clientAddress: "127.0.0.1",
    cookies: {},
    session: undefined,
    cache: {
      set: () => undefined,
      invalidate: async () => undefined,
      get tags() {
        return [];
      },
    },
    request: new Request(url),
    url,
    originPathname: url.pathname,
    getActionResult: () => undefined,
    callAction: async () => {
      throw new Error("callAction should not be used in the PDF route test");
    },
    params: {},
    props: {},
    redirect: (path: string, status = 302) =>
      Response.redirect(new URL(path, url), status),
    rewrite: async () => new Response("rewrite not implemented"),
    locals: {},
    preferredLocale: undefined,
    preferredLocaleList: undefined,
    currentLocale: undefined,
    isPrerendered: false,
    response: new Response(),
  } as Parameters<typeof GET>[0];
}

async function readResponseBody(response: Response) {
  return Buffer.from(await response.arrayBuffer());
}

function assertRenderedVariant(expectedVariant: ResumeVariant) {
  const [element] = renderToBufferMock.mock.calls[0] ?? [];

  expect(React.isValidElement(element)).toBe(true);

  if (!React.isValidElement(element)) {
    throw new Error("Expected renderToBuffer to receive a React element");
  }

  expect(element.props.variant).toBe(expectedVariant);
  expect(element.props.siteProfile).toBe(fallbackPortfolioSnapshot.siteProfile);
}

describe("GET /api/resume/pdf", () => {
  beforeEach(() => {
    renderToBufferMock.mockReset();
    buildResumeVariantFromContentMock.mockReset();
    parseFocusIdsInContentMock.mockReset();
    getPortfolioContentMock.mockReset();
    getResumeVariantByTokenMock.mockReset();

    renderToBufferMock.mockResolvedValue(pdfBytes);
    getPortfolioContentMock.mockResolvedValue(fallbackPortfolioSnapshot);
    parseFocusIdsInContentMock.mockReturnValue(parsedFocusIds.slice());
    buildResumeVariantFromContentMock.mockReturnValue(builtVariant);
  });

  it("uses a stored variant token before focus filters and returns private PDF headers", async () => {
    getResumeVariantByTokenMock.mockResolvedValue(storedVariant);

    const response = await GET(
      createApiContext(
        "https://vijayjangir.com/api/resume/pdf?variant=0123456789abcdef01234567&focus=ai,backend-engineering",
      ),
    );

    expect(getResumeVariantByTokenMock).toHaveBeenCalledWith(
      "0123456789abcdef01234567",
    );
    expect(buildResumeVariantFromContentMock).not.toHaveBeenCalled();
    expect(parseFocusIdsInContentMock).toHaveBeenCalledWith(
      fallbackPortfolioSnapshot,
      "ai,backend-engineering",
    );
    expect(renderToBufferMock).toHaveBeenCalledTimes(1);
    assertRenderedVariant(storedVariantValue);

    expect(await readResponseBody(response)).toEqual(pdfBytes);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Vijay_Jangir_Resume.pdf"',
    );
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("falls back to a focus-built variant when the stored token is invalid and uses public caching", async () => {
    getResumeVariantByTokenMock.mockResolvedValue(null);

    const response = await GET(
      createApiContext(
        "https://vijayjangir.com/api/resume/pdf?variant=bad-token&focus=backend-engineering",
      ),
    );

    expect(getResumeVariantByTokenMock).toHaveBeenCalledWith("bad-token");
    expect(parseFocusIdsInContentMock).toHaveBeenCalledWith(
      fallbackPortfolioSnapshot,
      "backend-engineering",
    );
    expect(buildResumeVariantFromContentMock).toHaveBeenCalledWith(
      fallbackPortfolioSnapshot,
      {
        focusIds: parsedFocusIds,
      },
    );
    expect(renderToBufferMock).toHaveBeenCalledTimes(1);
    assertRenderedVariant(builtVariant);

    expect(await readResponseBody(response)).toEqual(pdfBytes);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=86400",
    );
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Vijay_Jangir_Resume.pdf"',
    );
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
  });
});

describe("AtsResumeDocument ATS-safety invariants", () => {
  const documentPath = fileURLToPath(
    new URL("../src/components/resume/AtsResumeDocument.tsx", import.meta.url),
  );

  it("pins Helvetica-only styling and bans images, table constructs, and row-based layout", async () => {
    const source = await readFile(documentPath, "utf8");
    const fontFamilies = [...source.matchAll(/fontFamily:\s*"([^"]+)"/g)].map(
      ([, fontFamily]) => fontFamily,
    );

    expect(fontFamilies).not.toHaveLength(0);
    expect(fontFamilies).toEqual(["Helvetica"]);
    expect(source).not.toMatch(/import\s*{[^}]*\bImage\b/);
    expect(source).not.toMatch(/<Image\b/);
    expect(source).not.toMatch(/\bTable(Row|Cell|Header)?\b/);
    expect(source).not.toMatch(/<table\b/i);
    expect(source).not.toMatch(/flexDirection:\s*"row"/);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});
