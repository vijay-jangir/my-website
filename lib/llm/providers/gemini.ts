import type { LlmProvider } from "../types.js";
import { LlmError } from "../types.js";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export function createProvider(apiKey: string): LlmProvider {
  return {
    async complete({ system, prompt, maxTokens }) {
      const url = `${GEMINI_URL}?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      });

      if (!response.ok) {
        throw new LlmError(
          `Gemini API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new LlmError("Gemini returned no content");
      }

      return text;
    },
  };
}
