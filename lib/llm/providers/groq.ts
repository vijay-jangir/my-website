import type { LlmProvider } from "../types.js";
import { LlmError } from "../types.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export function createProvider(apiKey: string): LlmProvider {
  return {
    async complete({ system, prompt, maxTokens }) {
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        throw new LlmError(
          `Groq API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: { content?: string };
        }>;
      };

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new LlmError("Groq returned no content");
      }

      return text;
    },
  };
}
