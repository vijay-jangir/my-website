import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionUser } from "@/src/lib/auth";

// --- Mock state ---

const LLM_ENV_KEYS = [
  "LLM_PROVIDER",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "LLM_DAILY_LIMIT",
  "LLM_MAX_TOKENS",
  "SESSION_SECRET",
  "GITHUB_ID",
  "GITHUB_SECRET",
  "ADMIN_GITHUB_LOGINS",
] as const;

const originalEnv = Object.fromEntries(
  LLM_ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<string, string | undefined>;

const mockSession: { current: SessionUser | null } = { current: null };
const completeMock = vi.fn<(opts: { system: string; prompt: string; maxTokens?: number }) => Promise<string>>();
const isLlmConfiguredMock = vi.fn<() => boolean>();
const getSessionUserMock = vi.fn(async () => mockSession.current);

function setAuthEnv() {
  process.env.SESSION_SECRET = "test-secret-that-is-long-enough";
  process.env.GITHUB_ID = "test-github-id";
  process.env.GITHUB_SECRET = "test-github-secret";
  process.env.ADMIN_GITHUB_LOGINS = "testowner";
}

function setLlmEnv() {
  process.env.GEMINI_API_KEY = "test-gemini-key";
}

function clearAllEnv() {
  for (const key of LLM_ENV_KEYS) {
    delete process.env[key];
  }
}

function restoreEnv() {
  for (const key of LLM_ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

async function importRouteModule() {
  vi.resetModules();

  vi.doMock("@/src/lib/auth", () => ({
    getSessionUser: getSessionUserMock,
  }));

  vi.doMock("@/lib/llm/index", () => ({
    complete: completeMock,
    isLlmConfigured: isLlmConfiguredMock,
  }));

  return import("@/src/pages/api/resume/rephrase");
}

function createApiContext(body: unknown): {
  cookies: Record<string, never>;
  request: Request;
} {
  return {
    cookies: {} as Record<string, never>,
    request: new Request("https://vijayjangir.com/api/resume/rephrase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  };
}

function createEmptyPostContext(): {
  cookies: Record<string, never>;
  request: Request;
} {
  return {
    cookies: {} as Record<string, never>,
    request: new Request("https://vijayjangir.com/api/resume/rephrase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }),
  };
}

const validInput = {
  bulletText: "Led migration of 3 microservices to Kubernetes, reducing deployment time by 60%",
  jdAnalysis: {
    topFocusIds: ["backend-engineering", "devops"],
    skillScores: [
      { skillId: "kubernetes", label: "Kubernetes", score: 0.9 },
      { skillId: "docker", label: "Docker", score: 0.7 },
    ],
  },
};

// --- Lifecycle ---

beforeEach(() => {
  clearAllEnv();
  mockSession.current = null;
  completeMock.mockReset();
  isLlmConfiguredMock.mockReset();
  getSessionUserMock.mockClear();
});

afterEach(() => {
  restoreEnv();
  vi.restoreAllMocks();
  vi.resetModules();
});

// --- Tests ---

describe("POST /api/resume/rephrase", () => {
  it("returns 503 when auth is not configured", async () => {
    // No auth env vars set
    isLlmConfiguredMock.mockReturnValue(true);

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(503);
    const body = (await response.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(false);
    expect(body.message).toContain("Auth");
    expect(getSessionUserMock).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    setAuthEnv();
    isLlmConfiguredMock.mockReturnValue(true);
    mockSession.current = null;

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(401);
    const body = (await response.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(false);
    expect(body.message).toContain("Authentication");
    expect(getSessionUserMock).toHaveBeenCalledOnce();
  });

  it("returns 503 when LLM is not configured", async () => {
    setAuthEnv();
    mockSession.current = { login: "testowner", role: "owner" };
    isLlmConfiguredMock.mockReturnValue(false);

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(503);
    const body = (await response.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(false);
    expect(body.message).toContain("LLM");
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid input", async () => {
    setAuthEnv();
    mockSession.current = { login: "testowner", role: "owner" };
    isLlmConfiguredMock.mockReturnValue(true);

    const { POST } = await importRouteModule();
    const ctx = createEmptyPostContext();
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(400);
    const body = (await response.json()) as { ok: boolean; message: string };
    expect(body.ok).toBe(false);
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("surfaces clean rephrasings as proposals without persisting anything", async () => {
    setAuthEnv();
    setLlmEnv();
    mockSession.current = { login: "testowner", role: "owner" };
    isLlmConfiguredMock.mockReturnValue(true);

    // LLM returns clean rephrasings that preserve original facts
    completeMock.mockResolvedValue(
      "Spearheaded migration of 3 microservices to Kubernetes, cutting deployment time by 60%\n" +
      "Orchestrated migration of 3 microservices to Kubernetes, achieving 60% reduction in deployment time\n" +
      "Drove Kubernetes migration of 3 microservices, reducing deployment time by 60%",
    );

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; proposals: string[] };
    expect(body.ok).toBe(true);
    expect(body.proposals).toHaveLength(3);
    expect(body.proposals[0]).toContain("3 microservices");
    expect(body.proposals[0]).toContain("60%");
    expect(completeMock).toHaveBeenCalledOnce();
  });

  it("rejects candidates with invented metrics not in source bullet", async () => {
    setAuthEnv();
    setLlmEnv();
    mockSession.current = { login: "testowner", role: "owner" };
    isLlmConfiguredMock.mockReturnValue(true);

    // LLM hallucinates "reduced cost by 40%" — source has no such number
    completeMock.mockResolvedValue(
      "Led migration of 3 microservices to Kubernetes, reducing deployment time by 60% and cost by 40%\n" +
      "Orchestrated migration of 3 microservices to Kubernetes, achieving 60% faster deployments\n" +
      "Spearheaded Kubernetes migration of 3 microservices saving $500000 annually",
    );

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; proposals: string[] };
    expect(body.ok).toBe(true);
    // Only the second candidate passes — it has 3 and 60% from the source
    // First has 40% (invented), third has $500000 (invented)
    expect(body.proposals).toHaveLength(1);
    expect(body.proposals[0]).toContain("60%");
    expect(body.proposals[0]).not.toContain("40%");
  });

  it("rejects candidates mentioning a skill not present in the source bullet", async () => {
    setAuthEnv();
    setLlmEnv();
    mockSession.current = { login: "testowner", role: "owner" };
    isLlmConfiguredMock.mockReturnValue(true);

    // Source bullet mentions "Kubernetes" but NOT "Docker"
    // The JD analysis has Docker as a skill label, so it's a known alias
    // Candidate introducing "Docker" that wasn't in the source should be rejected
    completeMock.mockResolvedValue(
      "Led migration of 3 microservices using Docker and Kubernetes, reducing deployment time by 60%\n" +
      "Drove migration of 3 microservices to Kubernetes, cutting deployment time by 60%\n" +
      "Orchestrated Kubernetes migration of 3 Docker containers reducing deployment time by 60%",
    );

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; proposals: string[] };
    expect(body.ok).toBe(true);
    // Only the second candidate passes — it doesn't introduce "Docker"
    expect(body.proposals).toHaveLength(1);
    expect(body.proposals[0]).not.toContain("Docker");
    expect(body.proposals[0]).toContain("Kubernetes");
  });

  it("returns empty proposals array when all candidates fail validation", async () => {
    setAuthEnv();
    setLlmEnv();
    mockSession.current = { login: "testowner", role: "owner" };
    isLlmConfiguredMock.mockReturnValue(true);

    // ALL candidates introduce invented numbers
    completeMock.mockResolvedValue(
      "Led migration of 5 microservices to Kubernetes, reducing deployment time by 80%\n" +
      "Migrated 10 services to Kubernetes, cutting deployment time by 90%\n" +
      "Orchestrated migration of 3 microservices saving $2M and reducing time by 95%",
    );

    const { POST } = await importRouteModule();
    const ctx = createApiContext(validInput);
    const response = await POST(ctx as Parameters<typeof POST>[0]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; proposals: string[] };
    expect(body.ok).toBe(true);
    expect(body.proposals).toHaveLength(0);
  });
});

// --- Unit tests for the validation utilities ---

describe("bullet-rephrase validation utilities", () => {
  it("extractNumbers finds integers, decimals, percentages, and dollar amounts", async () => {
    const { extractNumbers } = await import(
      "@/lib/llm/prompts/bullet-rephrase"
    );

    const numbers = extractNumbers(
      "Reduced latency by 60% across 3 services saving $1,200 monthly",
    );
    expect(numbers).toContain("60%");
    expect(numbers).toContain("3");
    expect(numbers).toContain("$1200");
  });

  it("extractSkillAliases matches known aliases case-insensitively", async () => {
    const { extractSkillAliases } = await import(
      "@/lib/llm/prompts/bullet-rephrase"
    );

    const aliases = extractSkillAliases(
      "Built a kubernetes-based platform",
      ["Kubernetes", "Docker", "Terraform"],
    );
    expect(aliases.has("kubernetes")).toBe(true);
    expect(aliases.has("docker")).toBe(false);
    expect(aliases.has("terraform")).toBe(false);
  });

  it("validateCandidate rejects invented numbers", async () => {
    const { validateCandidate } = await import(
      "@/lib/llm/prompts/bullet-rephrase"
    );

    const result = validateCandidate(
      "Reduced cost by 40% across 3 services",
      "Managed 3 services efficiently",
      [],
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("40%");
    }
  });

  it("validateCandidate rejects introduced skills", async () => {
    const { validateCandidate } = await import(
      "@/lib/llm/prompts/bullet-rephrase"
    );

    const result = validateCandidate(
      "Built platform using Terraform and Kubernetes",
      "Built platform using Kubernetes",
      ["Terraform", "Kubernetes"],
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain("terraform");
    }
  });

  it("validateCandidate accepts clean rephrasings", async () => {
    const { validateCandidate } = await import(
      "@/lib/llm/prompts/bullet-rephrase"
    );

    const result = validateCandidate(
      "Orchestrated Kubernetes migration of 3 microservices, cutting deployment time by 60%",
      "Led migration of 3 microservices to Kubernetes, reducing deployment time by 60%",
      ["Kubernetes", "Docker"],
    );
    expect(result.valid).toBe(true);
  });

  it("parseCandidates strips numbering and blank lines", async () => {
    const { parseCandidates } = await import(
      "@/lib/llm/prompts/bullet-rephrase"
    );

    const candidates = parseCandidates(
      "1. First candidate\n2. Second candidate\n\n3) Third candidate",
    );
    expect(candidates).toEqual([
      "First candidate",
      "Second candidate",
      "Third candidate",
    ]);
  });
});
