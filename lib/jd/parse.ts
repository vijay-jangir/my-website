import type { JdSection } from "@/lib/portfolio-types";

export const SECTION_DEFINITIONS = [
  {
    id: "title",
    label: "Title",
    weight: 6,
    patterns: [/^title\b/i, /^role\b/i, /^position\b/i],
  },
  {
    id: "required",
    label: "Required",
    weight: 5,
    patterns: [
      /^required\b/i,
      /^requirements\b/i,
      /^must have\b/i,
      /^minimum qualifications\b/i,
    ],
  },
  {
    id: "responsibilities",
    label: "Responsibilities",
    weight: 3,
    patterns: [
      /^responsibilities\b/i,
      /^what you(?:'|')ll do\b/i,
      /^what you will do\b/i,
      /^role overview\b/i,
    ],
  },
  {
    id: "preferred",
    label: "Preferred",
    weight: 1.5,
    patterns: [
      /^preferred\b/i,
      /^nice to have\b/i,
      /^bonus\b/i,
      /^preferred qualifications\b/i,
    ],
  },
  {
    id: "company",
    label: "Company",
    weight: 0.5,
    patterns: [/^about (the )?company\b/i, /^about us\b/i, /^who we are\b/i],
  },
] as const;

export const DEFAULT_SECTION: JdSection = {
  id: "overview",
  label: "Overview",
  weight: 1,
  content: "",
};

export function parseSections(rawText: string): JdSection[] {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return [];
  }

  const lines = trimmed.split(/\n+/).map((line) => line.trim());
  const sections: JdSection[] = [];
  let currentSection = { ...DEFAULT_SECTION };

  for (const line of lines) {
    const matchingDefinition = SECTION_DEFINITIONS.find((section) =>
      section.patterns.some((pattern) => pattern.test(line)),
    );

    if (matchingDefinition) {
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      currentSection = {
        id: matchingDefinition.id,
        label: matchingDefinition.label,
        weight: matchingDefinition.weight,
        content: "",
      };
      continue;
    }

    currentSection.content = `${currentSection.content}\n${line}`.trim();
  }

  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    return [
      {
        ...DEFAULT_SECTION,
        content: trimmed,
      },
    ];
  }

  return sections;
}

export function getSectionRank(sectionId: string) {
  const rank = SECTION_DEFINITIONS.findIndex(
    (section) => section.id === sectionId,
  );
  return rank === -1 ? SECTION_DEFINITIONS.length : rank;
}
