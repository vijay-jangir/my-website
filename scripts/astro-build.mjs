import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const astroBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "astro.cmd" : "astro",
);

const args = ["build"];
const env = { ...process.env };

if (env.ASTRO_DB_REMOTE_URL && env.ASTRO_DB_APP_TOKEN) {
  args.push("--remote");
} else if (!env.ASTRO_DATABASE_FILE) {
  env.ASTRO_DATABASE_FILE = path.join(rootDir, ".astro", "content.db");
}

const result = spawnSync(astroBin, args, {
  cwd: rootDir,
  env,
  shell: false,
  stdio: "inherit",
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
