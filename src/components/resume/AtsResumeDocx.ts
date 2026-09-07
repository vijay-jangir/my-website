import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  type File,
} from "docx";

import type { ResumeVariant, SiteProfile } from "@/lib/portfolio-types";

const CALIBRI_FONT = "Calibri" as const;
const BASE_TEXT_COLOR = "111827" as const;
const MUTED_TEXT_COLOR = "4B5563" as const;

const documentDefaults = {
  paragraph: {
    spacing: {
      line: 276,
      after: 120,
    },
  },
  run: {
    font: CALIBRI_FONT,
    color: BASE_TEXT_COLOR,
    size: 20,
  },
} as const;

function createSectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: {
      before: 160,
      after: 80,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        font: CALIBRI_FONT,
        size: 24,
        color: BASE_TEXT_COLOR,
      }),
    ],
  });
}

function createSkillParagraph(label: string, skills: readonly { readonly label: string }[]) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        font: CALIBRI_FONT,
      }),
      new TextRun({
        text: skills.map((skill) => skill.label).join(", "),
        font: CALIBRI_FONT,
      }),
    ],
  });
}

export function buildAtsResumeDocxDocument(options: {
  readonly siteProfile: SiteProfile;
  readonly variant: ResumeVariant;
}): File {
  const { siteProfile, variant } = options;

  return new Document({
    creator: siteProfile.name,
    title: `${siteProfile.name} Resume`,
    description: "ATS-safe resume export",
    styles: {
      default: {
        document: documentDefaults,
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: {
              after: 80,
            },
            children: [
              new TextRun({
                text: siteProfile.name,
                bold: true,
                font: CALIBRI_FONT,
                size: 32,
                color: BASE_TEXT_COLOR,
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 60,
            },
            children: [
              new TextRun({
                text: variant.headline,
                font: CALIBRI_FONT,
                size: 24,
                color: BASE_TEXT_COLOR,
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 120,
            },
            children: [
              new TextRun({
                text: [
                  siteProfile.email,
                  siteProfile.location,
                  siteProfile.githubUrl,
                  siteProfile.linkedinUrl,
                ].join(" | "),
                font: CALIBRI_FONT,
                color: MUTED_TEXT_COLOR,
                size: 18,
              }),
            ],
          }),
          createSectionHeading("Summary"),
          new Paragraph({ text: variant.summary }),
          createSectionHeading("Highlights"),
          ...variant.highlights.map(
            (highlight) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [
                  new TextRun({
                    text: `${highlight.label}: `,
                    bold: true,
                    font: CALIBRI_FONT,
                  }),
                  new TextRun({
                    text: `${highlight.value} - ${highlight.detail}`,
                    font: CALIBRI_FONT,
                  }),
                ],
              }),
          ),
          createSectionHeading("Skills"),
          createSkillParagraph("Primary", variant.primarySkills),
          createSkillParagraph("Secondary", variant.secondarySkills),
          createSkillParagraph("Supporting", variant.supportingSkills),
          createSectionHeading("Projects"),
          ...variant.projects.flatMap((project) => [
            new Paragraph({
              spacing: {
                before: 40,
                after: 40,
              },
              children: [
                new TextRun({
                  text: project.title,
                  bold: true,
                  font: CALIBRI_FONT,
                }),
              ],
            }),
            new Paragraph({ text: project.summary }),
            new Paragraph({ text: project.impact }),
          ]),
          createSectionHeading("Experience"),
          ...variant.experiences.flatMap((experience) => [
            new Paragraph({
              spacing: {
                before: 40,
                after: 20,
              },
              children: [
                new TextRun({
                  text: `${experience.title} | ${experience.company}`,
                  bold: true,
                  font: CALIBRI_FONT,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: experience.date,
                  color: MUTED_TEXT_COLOR,
                  font: CALIBRI_FONT,
                }),
              ],
            }),
            new Paragraph({ text: experience.description }),
            ...experience.bullets.map(
              (bullet) =>
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({
                      text: bullet.text,
                      font: CALIBRI_FONT,
                    }),
                  ],
                }),
            ),
          ]),
        ],
      },
    ],
  });
}

export async function renderResumeDocxBuffer(options: {
  readonly siteProfile: SiteProfile;
  readonly variant: ResumeVariant;
}) {
  const document = buildAtsResumeDocxDocument(options);

  return Packer.toBuffer(document);
}
