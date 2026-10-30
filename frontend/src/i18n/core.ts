import ui from "./en-ui.json";
import content from "./en-content.json";
import { messages } from "./messages";
import admin from "./admin.json";
import columns from "./columns.json";

export type Locale = "fa" | "en";
const english: Record<string, string> = { ...content, ...ui, ...admin };
const keyed: Record<string, [string, string]> = messages;
const columnLabels: Record<string, string[]> = columns;
const enumLabels: Record<string, string> = {
  owner: "مالک",
  editor: "ویرایشگر",
  viewer: "مشاهده‌گر",
  draft: "پیش‌نویس",
  published: "منتشرشده",
  unread: "خوانده‌نشده",
  read: "خوانده‌شده",
  archived: "بایگانی",
  software: "نرم‌افزار",
  creative: "خلاقانه",
  full_time: "تمام‌وقت",
  part_time: "پاره‌وقت",
  contract: "قراردادی",
  project: "پروژه‌ای",
  freelance: "فریلنسری",
  internship: "کارآموزی",
  other: "سایر",
  onsite: "حضوری",
  remote: "دورکاری",
  hybrid: "ترکیبی",
  create: "ایجاد",
  update: "ویرایش",
  delete: "حذف",
  upload: "آپلود",
};
const headings = Object.fromEntries(
  Object.entries(admin)
    .filter(([, en]) => /^[A-Z][A-Z /&.0-9_-]+$/.test(en))
    .map(([fa, en]) => [en, fa]),
);
const resolveTranslation = (text: string, locale: Locale): string =>
  keyed[text]
    ? keyed[text][locale === "fa" ? 0 : 1]
    : text.startsWith("column.") && columnLabels[text.slice(7)]
      ? columnLabels[text.slice(7)][locale === "fa" ? 0 : 1]
      : enumLabels[text]
        ? locale === "fa"
          ? enumLabels[text]
          : text[0].toUpperCase() + text.slice(1)
        : headings[text]
          ? locale === "fa"
            ? headings[text]
            : text
          : locale === "en"
            ? (english[text] ??
              (english[text.trim()]
                ? text.replace(text.trim(), english[text.trim()])
                : text))
            : text;

export const missingTranslationKeys = new Set<string>();
export function translate(text: string, locale: Locale): string {
  const resolved = resolveTranslation(text, locale);
  if (
    /^(common|dialog|video|resume|translation|settings|analytics|language|notFound|column)\./.test(
      text,
    ) &&
    resolved === text &&
    !missingTranslationKeys.has(text)
  ) {
    missingTranslationKeys.add(text);
    if (process.env.NODE_ENV === "development")
      console.warn(`Missing translation: ${text}`);
  }
  return resolved;
}

// CMS translations override reviewed defaults. Missing editorial translations
// deliberately retain their original text instead of inventing content.
export function localize<T>(value: T, locale: Locale): T {
  const technical = new Set([
    "slug",
    "key",
    "page",
    "status",
    "kind",
    "role_code",
    "platform",
    "accent",
    "variant",
    "icon",
    "language",
    "filename",
    "mime_type",
    "url",
    "href",
    "site_url",
    "video_url",
    "poster_url",
    "thumbnail",
    "image",
    "artwork",
    "icon_image",
    "external_video_url",
  ]);
  function walk(input: unknown): unknown {
    if (typeof input === "string") return translate(input, locale);
    if (Array.isArray(input)) return input.map(walk);
    if (!input || typeof input !== "object") return input;
    const record = input as Record<string, unknown>;
    const translations = record.translations as
      Record<string, Record<string, unknown>> | undefined;
    const override = { ...(translations?.[locale] || {}) };
    const category = record.category_translations as
      Record<string, { title?: string }> | undefined;
    if (category?.[locale]?.title)
      override.category_title = category[locale].title;
    if (Array.isArray(record.items) && Array.isArray(override.items)) {
      const translated = override.items as Record<string, unknown>[];
      override.items = record.items.map((item, i) => ({
        ...(item as object),
        ...translated[i],
      }));
    }
    return Object.fromEntries(
      Object.entries({ ...record, ...override }).map(([key, item]) => [
        key,
        key === "translations" || technical.has(key) || key.endsWith("_url")
          ? item
          : walk(item),
      ]),
    );
  }
  return walk(value) as T;
}
