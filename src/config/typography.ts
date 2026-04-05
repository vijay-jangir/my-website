export const typographyConfig = {
  preset: "classic-inter",
  families: {
    body: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
    ui: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
    display: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  roles: {
    body: "Long-form copy, paragraphs, and general page text",
    ui: "Navigation, buttons, form controls, and interactive labels",
    display: "Hero text, section titles, and key headings",
    mono: "Eyebrows, metadata, JSON editors, and technical labels",
  },
} as const;

export function buildTypographyCssVariables() {
  return [
    `--site-font-body: ${typographyConfig.families.body}`,
    `--site-font-ui: ${typographyConfig.families.ui}`,
    `--site-font-display: ${typographyConfig.families.display}`,
    `--site-font-mono: ${typographyConfig.families.mono}`,
  ].join("; ");
}

export function getTypographySummary() {
  return {
    ...typographyConfig,
    cssVariables: buildTypographyCssVariables(),
  };
}
