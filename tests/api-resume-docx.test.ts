import { readFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
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

import {
  buildResumeVariantFromContent,
  parseFocusIdsInContent,
} from "@/lib/portfolio";
import { getPortfolioContent } from "@/lib/portfolio-content";
import { getResumeVariantByToken } from "@/lib/resume-store";
import { GET } from "@/src/pages/api/resume/docx";

const buildResumeVariantFromContentMock = vi.mocked(
  buildResumeVariantFromContent,
);
const parseFocusIdsInContentMock = vi.mocked(parseFocusIdsInContent);
const getPortfolioContentMock = vi.mocked(getPortfolioContent);
const getResumeVariantByTokenMock = vi.mocked(getResumeVariantByToken);

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
      throw new Error("callAction should not be used in the DOCX route test");
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

function extractZipEntry(buffer: Buffer, entryPath: string) {
  const entryPathBuffer = Buffer.from(entryPath, "utf8");
  let offset = 0;

  while (offset <= buffer.length - 30) {
    const signature = buffer.readUInt32LE(offset);

    if (signature !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const compressionMethod = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraFieldLength = buffer.readUInt16LE(offset + 28);
    const fileNameStart = offset + 30;
    const fileNameEnd = fileNameStart + fileNameLength;
    const fileName = buffer.subarray(fileNameStart, fileNameEnd);
    const dataStart = fileNameEnd + extraFieldLength;
    const dataEnd = dataStart + compressedSize;

    if (fileName.equals(entryPathBuffer)) {
      const compressedData = buffer.subarray(dataStart, dataEnd);

      if (compressionMethod === 0) {
        return compressedData.toString("utf8");
      }

      if (compressionMethod === 8) {
        return inflateRawSync(compressedData).toString("utf8");
      }

      throw new Error(`Unsupported ZIP compression method: ${compressionMethod}`);
    }

    offset = dataEnd;
  }

  throw new Error(`ZIP entry not found: ${entryPath}`);
}

function assertSectionOrder(documentXml: string) {
  const sectionHeadings = [
    "Summary",
    "Highlights",
    "Skills",
    "Projects",
    "Experience",
  ];

  let lastIndex = -1;
  for (const heading of sectionHeadings) {
    const currentIndex = documentXml.indexOf(`>${heading}</w:t>`, lastIndex + 1);

    expect(currentIndex).toBeGreaterThan(lastIndex);
    lastIndex = currentIndex;
  }
}

describe("GET /api/resume/docx", () => {
  beforeEach(() => {
    buildResumeVariantFromContentMock.mockReset();
    parseFocusIdsInContentMock.mockReset();
    getPortfolioContentMock.mockReset();
    getResumeVariantByTokenMock.mockReset();

    getPortfolioContentMock.mockResolvedValue(fallbackPortfolioSnapshot);
    parseFocusIdsInContentMock.mockReturnValue(parsedFocusIds.slice());
    buildResumeVariantFromContentMock.mockReturnValue(builtVariant);
  });

  it("uses a stored variant token before focus filters and returns a private DOCX attachment", async () => {
    getResumeVariantByTokenMock.mockResolvedValue(storedVariant);

    const response = await GET(
      createApiContext(
        "https://vijayjangir.com/api/resume/docx?variant=0123456789abcdef01234567&focus=ai,backend-engineering",
      ),
    );
    const body = await readResponseBody(response);
    const documentXml = extractZipEntry(body, "word/document.xml");

    expect(getResumeVariantByTokenMock).toHaveBeenCalledWith(
      "0123456789abcdef01234567",
    );
    expect(buildResumeVariantFromContentMock).not.toHaveBeenCalled();
    expect(parseFocusIdsInContentMock).toHaveBeenCalledWith(
      fallbackPortfolioSnapshot,
      "ai,backend-engineering",
    );

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Vijay_Jangir_Resume.docx"',
    );
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(documentXml).toContain("Stored headline");
    assertSectionOrder(documentXml);
    expect(documentXml).not.toContain("<w:tbl");
  });

  it("falls back to a focus-built variant when the stored token is invalid and returns public cache headers", async () => {
    getResumeVariantByTokenMock.mockResolvedValue(null);

    const response = await GET(
      createApiContext(
        "https://vijayjangir.com/api/resume/docx?variant=bad-token&focus=backend-engineering",
      ),
    );
    const body = await readResponseBody(response);
    const documentXml = extractZipEntry(body, "word/document.xml");

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

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=86400",
    );
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Vijay_Jangir_Resume.docx"',
    );
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(documentXml).toContain("Built headline");
    assertSectionOrder(documentXml);
    expect(documentXml).not.toContain("<w:tbl");
  });
});

describe("DOCX export package constraints", () => {
  it("keeps headless browser dependencies out of package.json", async () => {
    const packageJsonPath = new URL("../package.json", import.meta.url);
    const packageJson = await readFile(packageJsonPath, "utf8");

    expect(packageJson).toContain('"docx"');
    expect(packageJson).not.toMatch(/puppeteer|playwright/);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});
