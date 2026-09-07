import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  site: "https://vijayjangir.com",
  output: "server",
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./", import.meta.url)),
      },
    },
  },
});
