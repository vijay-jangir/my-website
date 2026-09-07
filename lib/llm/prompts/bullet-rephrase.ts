/**
 * Prompt template and post-validation for LLM bullet rephrasing.
 *
 * The system prompt hard-constrains the model: rephrase vocabulary only,
 * introduce NO new metric, employer, date, technology, or claim.
 * Post-validation rejects any candidate that violates the no-new-facts rule.
 */

const SYSTEM_PROMPT = `You are a resume bullet rephrasing assistant.

RULES — ABSOLUTE, NO EXCEPTIONS:
1. You receive ONE resume bullet and a list of JD-relevant keywords.
2. Rephrase the bullet so its vocabulary mirrors the JD keywords where truthful.
3. You MUST NOT introduce ANY new metric, number, percentage, dollar amount, or
   quantitative claim that is not already present in the source bullet.
4. You MUST NOT introduce ANY employer name, date, technology, framework, tool,
   or skill name that is not already present in the source bullet.
5. You MUST NOT invent facts, achievements, or outcomes.
6. Preserve the original meaning, scope, and factual content exactly.
7. Return EXACTLY 3 rephrased candidates, one per line, with no numbering,
   no bullet markers, and no blank lines.

If you cannot rephrase without inventing facts, return the original bullet
three times unchanged.`;

export function buildRephrasePrompt(
  bulletText: string,
  jdKeywords: readonly string[],
): { system: string; prompt: string } {
  const keywordList = jdKeywords.join(", ");

  return {
    system: SYSTEM_PROMPT,
    prompt: `Source bullet: ${bulletText}\n\nJD keywords to mirror: ${keywordList}`,
  };
}

/** Extract all numbers (integers, decimals, percentages, dollar amounts) from text. */
export function extractNumbers(text: string): ReadonlySet<string> {
  const matches = text.match(/\$?\d[\d,.]*%?/g);
  if (!matches) return new Set();
  return new Set(matches.map((m) => m.replace(/,/g, "")));
}

/**
 * Extract word-boundary skill-like tokens from text — lowercased, for
 * comparison against the source bullet. Catches multi-word terms when
 * they appear as provided aliases.
 */
export function extractSkillAliases(
  text: string,
  knownAliases: readonly string[],
): ReadonlySet<string> {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const alias of knownAliases) {
    const needle = alias.toLowerCase();
    if (lower.includes(needle)) {
      found.add(needle);
    }
  }

  return found;
}

export type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: string };

/**
 * Validate a single rephrased candidate against the source bullet.
 *
 * Rejects when:
 * - The candidate contains a number not present in the source.
 * - The candidate mentions a skill alias not present in the source.
 */
export function validateCandidate(
  candidate: string,
  sourceBullet: string,
  skillLabels: readonly string[],
): ValidationResult {
  const sourceNumbers = extractNumbers(sourceBullet);
  const candidateNumbers = extractNumbers(candidate);

  for (const num of candidateNumbers) {
    if (!sourceNumbers.has(num)) {
      return { valid: false, reason: `invented number: ${num}` };
    }
  }

  const sourceSkills = extractSkillAliases(sourceBullet, skillLabels);
  const candidateSkills = extractSkillAliases(candidate, skillLabels);

  for (const skill of candidateSkills) {
    if (!sourceSkills.has(skill)) {
      return { valid: false, reason: `introduced skill: ${skill}` };
    }
  }

  return { valid: true };
}

/** Parse the LLM response into individual candidate lines. */
export function parseCandidates(raw: string): readonly string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\d+[.)]\s*/, "").trim())
    .filter((line) => line.length > 0);
}
