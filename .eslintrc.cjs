module.exports = {
  root: true,
  env: {
    browser: true,
    es2024: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:astro/recommended"],
  ignorePatterns: [
    ".astro",
    ".next",
    "dist",
    "coverage",
    "node_modules",
  ],
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      plugins: ["@typescript-eslint", "react"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
      },
      rules: {
        "react/react-in-jsx-scope": "off",
      },
    },
    {
      files: ["**/*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    // Architectural guard: public routes must never import from lib/llm/.
    // Private surfaces (admin, assistant, api/jd, api/studio, api/intelligence,
    // api/resume/rephrase) are excluded — they are allowed to use LLM code.
    {
      files: [
        "src/pages/*.astro",
        "src/pages/*.ts",
        "src/pages/blog/**",
        "src/pages/projects/**",
        "src/pages/api/auth/**",
        "src/pages/api/resume/pdf.ts",
        "src/pages/api/resume/docx.ts",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/lib/llm", "@/lib/llm/*", "**/lib/llm", "**/lib/llm/*"],
                message:
                  "Public routes must not import from lib/llm/. LLM calls are private-only (admin, assistant, api/studio, api/intelligence, api/resume/rephrase).",
              },
            ],
          },
        ],
      },
    },
  ],
};
