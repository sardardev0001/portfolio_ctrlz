import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const output = resolve(root, "frontend/public/assets/home-story");
const names = [
  "character",
  "cinematic",
  "vlog",
  "travel",
  "motion",
  "advertising",
  "sports",
  "gaming",
  "drone",
  "documentary",
];
const entries = [];
for (const [index, role] of names.entries()) {
  const file = `ChatGPT Image Oct 18, 2026, 08_33_${String(11 + index).padStart(2, "0")} PM-${index + 1}.png`;
  const source = `design/fix2/${file}`;
  const image = sharp(resolve(root, source));
  const metadata = await image.metadata();
  const stats = await image.stats();
  const alpha = stats.channels[3];
  const used = !["travel", "gaming", "drone", "documentary"].includes(role);
  entries.push({
    source,
    role,
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    hasAlpha: metadata.hasAlpha,
    alphaRange: alpha ? [alpha.min, alpha.max] : null,
    transparent: !stats.isOpaque,
    used,
    note: used
      ? "Used by the home story section."
      : "No matching category exists; user chose existing categories only.",
    destination: used ? `frontend/public/assets/home-story/${role}.webp` : null,
    maxWidth: used ? (role === "character" ? 870 : 720) : null,
  });
}
entries.push({
  source: "design/fix2/Neon Cyberpunk Hero and Persian UI (1).png",
  role: "composition-reference-only",
  width: 1672,
  height: 941,
  transparent: false,
  destination: null,
});
entries.push({
  source: "frontend/public/assets/backgrounds/city-background-small.webp",
  role: "existing-section-background",
  destination: "/assets/backgrounds/city-background-small.webp",
});
entries.push({
  source: "frontend/public/assets/portfolio/project-01.webp",
  role: "anime",
  destination: "/assets/portfolio/project-01.webp",
  used: true,
  note: "Existing sixth category and existing project artwork; no new category or invented other group.",
});
const manifest = resolve(root, "docs/HOME_STORY_FIX2_ASSETS.json");
await writeFile(
  manifest,
  JSON.stringify({ state: "planned", entries }, null, 2) + "\n",
);
await mkdir(output, { recursive: true });
for (const entry of entries.filter((entry) => entry.maxWidth)) {
  const result = await sharp(resolve(root, entry.source))
    .resize({ width: entry.maxWidth, withoutEnlargement: true })
    .webp({
      quality: entry.role === "character" ? 88 : 82,
      alphaQuality: 100,
      effort: 6,
    })
    .toFile(resolve(root, entry.destination));
  Object.assign(entry, {
    outputWidth: result.width,
    outputHeight: result.height,
    outputBytes: result.size,
  });
}
await writeFile(
  manifest,
  JSON.stringify({ state: "generated", entries }, null, 2) + "\n",
);
console.log(
  "Prepared six transparent WebP assets and source manifest; reference and original PNGs preserved.",
);
