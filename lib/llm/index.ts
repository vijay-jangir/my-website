import { env } from "../env.js";
import { createProvider as createGeminiProvider } from "./providers/gemini.js";
import { createProvider as createGroqProvider } from "./providers/groq.js";
import type { LlmProvider } from "./types.js";
import { LlmQuotaExceeded, LlmTimeout, LlmUnavailable } from "./types.js";

const TIMEOUT_MS = 30_000;

/** In-memory daily call counter. Keyed by YYYY-MM-DD, resets naturally on date change. */
const dailyCounts = new Map<string, number>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyCount(): number {
  return dailyCounts.get(todayKey()) ?? 0;
}

function incrementDailyCount(): void {
  const key = todayKey();
  dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
}

/** Exposed for testing only — resets the in-memory quota counter. */
export function _resetQuota(): void {
  dailyCounts.clear();
}

export function isLlmConfigured(): boolean {
  return Boolean(env.geminiApiKey ?? env.groqApiKey);
}

function resolveProvider(): LlmProvider {
  if (env.llmProvider === "groq" && env.groqApiKey) {
    return createGroqProvider(env.groqApiKey);
  }

  if (env.geminiApiKey) {
    return createGeminiProvider(env.geminiApiKey);
  }

  if (env.groqApiKey) {
    return createGroqProvider(env.groqApiKey);
  }

  throw new LlmUnavailable();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new LlmTimeout()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function complete(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  if (!isLlmConfigured()) {
    throw new LlmUnavailable();
  }

  const limit =
    Number.isFinite(env.llmDailyLimit) && env.llmDailyLimit > 0
      ? env.llmDailyLimit
      : 50;

  if (getDailyCount() >= limit) {
    throw new LlmQuotaExceeded();
  }

  const provider = resolveProvider();
  const maxTokens = opts.maxTokens ?? env.llmMaxTokens;

  const result = await withTimeout(
    provider.complete({ system: opts.system, prompt: opts.prompt, maxTokens }),
    TIMEOUT_MS,
  );

  incrementDailyCount();
  return result;
}
