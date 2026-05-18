import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";

import db from "@astrojs/db";

export default defineConfig({
  site: "https://vijayjangir.com",
  output: "server",
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
  integrations: [react(), db()],
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./", import.meta.url)),
      },
    },
  },
});
