import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const LLM_ENV_KEYS = [
  "LLM_PROVIDER",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "LLM_DAILY_LIMIT",
  "LLM_MAX_TOKENS",
] as const;

const originalEnv = Object.fromEntries(
  LLM_ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<string, string | undefined>;

function clearLlmEnv() {
  for (const key of LLM_ENV_KEYS) {
    delete process.env[key];
  }
}

function restoreLlmEnv() {
  for (const key of LLM_ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

async function importLlmModule() {
  vi.resetModules();
  return import("@/lib/llm/index");
}

beforeEach(() => {
  clearLlmEnv();
});

afterEach(() => {
  restoreLlmEnv();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("isLlmConfigured", () => {
  it("returns false when no API keys are set", async () => {
    const { isLlmConfigured } = await importLlmModule();
    expect(isLlmConfigured()).toBe(false);
  });

  it("returns true when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    const { isLlmConfigured } = await importLlmModule();
    expect(isLlmConfigured()).toBe(true);
  });

  it("returns true when GROQ_API_KEY is set", async () => {
    process.env.GROQ_API_KEY = "test-groq-key";
    const { isLlmConfigured } = await importLlmModule();
    expect(isLlmConfigured()).toBe(true);
  });
});

describe("complete", () => {
  it("throws LlmUnavailable when no provider is configured", async () => {
    const { complete } = await importLlmModule();
    const { LlmUnavailable } = await import("@/lib/llm/types");

    await expect(complete({ system: "test", prompt: "hello" })).rejects.toThrow(
      LlmUnavailable,
    );
  });

  it("returns text from mocked Gemini response", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";

    const mockResponse = {
      candidates: [{ content: { parts: [{ text: "Gemini says hello" }] } }],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const { complete, _resetQuota } = await importLlmModule();
    _resetQuota();

    const result = await complete({ system: "You are helpful.", prompt: "Hi" });

    expect(result).toBe("Gemini says hello");
    expect(fetch).toHaveBeenCalledOnce();

    const callUrl = (fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(callUrl).toContain("generativelanguage.googleapis.com");
    expect(callUrl).toContain("key=test-gemini-key");
  });

  it("routes to Groq when LLM_PROVIDER=groq", async () => {
    process.env.LLM_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";

    const mockResponse = {
      choices: [{ message: { content: "Groq says hello" } }],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const { complete, _resetQuota } = await importLlmModule();
    _resetQuota();

    const result = await complete({ system: "You are helpful.", prompt: "Hi" });

    expect(result).toBe("Groq says hello");

    const callUrl = (fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(callUrl).toContain("api.groq.com");

    const callOpts = (fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    expect(callOpts.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer test-groq-key" }),
    );
  });

  it("throws LlmQuotaExceeded after exceeding LLM_DAILY_LIMIT", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.LLM_DAILY_LIMIT = "2";

    const mockResponse = {
      candidates: [{ content: { parts: [{ text: "ok" }] } }],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const { complete, _resetQuota } = await importLlmModule();
    const { LlmQuotaExceeded } = await import("@/lib/llm/types");
    _resetQuota();

    // Two calls succeed
    await complete({ system: "s", prompt: "p" });
    await complete({ system: "s", prompt: "p" });

    // Third call exceeds the daily limit of 2
    await expect(complete({ system: "s", prompt: "p" })).rejects.toThrow(
      LlmQuotaExceeded,
    );
  });

  it("throws LlmTimeout when provider hangs", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";

    // Mock fetch that never resolves
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    // Use fake timers so we can advance past the 30s timeout instantly
    vi.useFakeTimers();

    const { complete, _resetQuota } = await importLlmModule();
    const { LlmTimeout } = await import("@/lib/llm/types");
    _resetQuota();

    const promise = complete({ system: "s", prompt: "p" });

    // Attach the rejection handler BEFORE advancing timers to avoid
    // an unhandled-rejection warning.
    const assertion = expect(promise).rejects.toThrow(LlmTimeout);

    // Advance past the 30s timeout
    await vi.advanceTimersByTimeAsync(31_000);

    await assertion;

    vi.useRealTimers();
  });
});
