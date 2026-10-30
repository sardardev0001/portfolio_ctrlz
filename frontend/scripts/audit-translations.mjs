import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dictionary = Object.assign(
  {},
  ...["en-ui", "en-content"].map((name) =>
    JSON.parse(
      readFileSync(
        new URL(`../src/i18n/${name}.json`, import.meta.url),
        "utf8",
      ),
    ),
  ),
);
const origin = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
const gaps = [];
function inspect(value, path) {
  if (typeof value === "string") {
    if (
      /[\u0600-\u06ff]/.test(value) &&
      !dictionary[value] &&
      !dictionary[value.trim()]
    )
      gaps.push({ path, original: value });
  } else if (Array.isArray(value))
    value.forEach((item, index) => inspect(item, `${path}[${index}]`));
  else if (value && typeof value === "object") {
    const override = { ...value.translations?.en };
    if (Array.isArray(value.items) && Array.isArray(override.items))
      override.items = value.items.map((item, i) => ({
        ...item,
        ...override.items[i],
      }));
    for (const [key, item] of Object.entries({ ...value, ...override }))
      if (key !== "translations") inspect(item, `${path}.${key}`);
  }
}
async function read(path) {
  const response = await fetch(`${origin}/api/v1/${path}`);
  if (!response.ok)
    throw new Error(`Public content request failed: ${response.status}`);
  return response.json();
}
for (const path of ["content/", "skills/", "resume/"])
  inspect((await read(path)).data, path);
for (let page = 1; ; page++) {
  const response = await read(`projects/?page_size=100&page=${page}`);
  inspect(response.data, `projects-page-${page}`);
  if (!response.meta.pagination?.has_next) break;
}
const report = {
  checked_at: new Date().toISOString(),
  public_api: origin,
  fallback:
    "Original editorial text is retained when an English translation is missing.",
  gaps,
};
const output =
  process.env.TRANSLATION_REPORT ||
  fileURLToPath(
    new URL(
      "../../docs/qa/production-upgrade/translation-gaps.json",
      import.meta.url,
    ),
  );
writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
console.log(`Translation gaps: ${gaps.length}. Report: ${output}`);
