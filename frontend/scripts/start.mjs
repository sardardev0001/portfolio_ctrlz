import { cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = process.env.NEXT_BUILD_DIR || ".next";
const output = resolve(root, buildDir, "standalone");
const standalone = existsSync(resolve(output, "server.js"))
  ? output
  : resolve(output, "frontend");
if (!existsSync(resolve(standalone, "server.js"))) {
  throw new Error("Run pnpm build before pnpm start.");
}
cpSync(resolve(root, "public"), resolve(standalone, "public"), {
  recursive: true,
});
cpSync(resolve(root, buildDir, "static"), resolve(standalone, buildDir, "static"), {
  recursive: true,
});
process.env.HOSTNAME ||= "127.0.0.1";
await import(pathToFileURL(resolve(standalone, "server.js")).href);
