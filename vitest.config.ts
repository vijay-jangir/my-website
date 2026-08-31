import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["lib/**", "src/lib/**", "src/actions/**", "src/pages/api/**"],
      exclude: ["legacy-next/**", "**/*.d.ts"],
      thresholds: {
        statements: 34,
        branches: 28,
        functions: 41,
        lines: 34,
      },
    },
  },
});
