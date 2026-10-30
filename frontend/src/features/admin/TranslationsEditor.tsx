"use client";
import type { Field } from "./resources";
import { usePreferences, useT } from "@/i18n/provider";

const translatable = new Set([
  "title",
  "label",
  "description",
  "short_description",
  "body",
  "subtitle",
  "highlight",
  "name",
  "role",
  "location",
  "specialization",
  "bio",
  "tagline",
  "degree",
  "field",
  "institution",
  "company",
  "issuer",
  "image_alt",
  "caption",
  "level_label",
  "client",
  "start",
  "end",
  "years",
  "value",
  "prefix",
  "suffix",
  "location",
]);
export default function TranslationsEditor({
  fields,
  value,
  onChange,
  items,
  arrays,
}: {
  fields: Field[];
  value: unknown;
  onChange: (value: unknown) => void;
  items?: unknown;
  arrays?: Record<string, unknown>;
}) {
  const t = useT();
  const { locale } = usePreferences();
  const translations = (
    value && typeof value === "object" ? value : {}
  ) as Record<
    string,
    Record<string, string | string[] | Record<string, string>[]>
  >;
  const textFields = fields.filter(
    (f) =>
      translatable.has(f.key) &&
      !["select", "number", "checkbox"].includes(f.type || ""),
  );
  return (
    <fieldset className="translations-editor">
      <legend>{t("translation.title")}</legend>
      <p>{t("translation.help")}</p>
      {(["fa", "en"] as const).map((lang) => (
        <details key={lang}>
          <summary>
            {t(`language.${lang}`)} ·{" "}
            {new Intl.NumberFormat(locale).format(
              textFields.filter((f) => !translations[lang]?.[f.key]).length,
            )}{" "}
            {t("translation.missing")}
          </summary>
          <div
            className="translation-fields"
            dir={lang === "fa" ? "rtl" : "ltr"}
          >
            {textFields.map((field) => (
              <label key={field.key}>
                {t(field.label)} — {t(`language.${lang}`)}
                <textarea
                  rows={field.type === "textarea" ? 3 : 1}
                  lang={lang}
                  value={String(translations[lang]?.[field.key] || "")}
                  onChange={(e) => {
                    const next = {
                      ...translations,
                      [lang]: {
                        ...translations[lang],
                        [field.key]: e.target.value,
                      },
                    };
                    if (!e.target.value) delete next[lang][field.key];
                    onChange(next);
                  }}
                />
              </label>
            ))}
            {fields.some((field) => field.key === "tags") && (
              <label>
                {t("translation.tags")}
                <textarea
                  value={((translations[lang]?.tags || []) as string[]).join(
                    "\n",
                  )}
                  onChange={(e) => {
                    const copy = { ...translations[lang] };
                    if (e.target.value)
                      copy.tags = e.target.value.split("\n").filter(Boolean);
                    else delete copy.tags;
                    onChange({ ...translations, [lang]: copy });
                  }}
                />
              </label>
            )}
            {(
              [
                "responsibilities",
                "achievements",
                "projects",
                "technologies",
              ] as const
            ).map((key) => {
              const source = arrays?.[key];
              if (!Array.isArray(source) || source.length === 0) return null;
              const translated = Array.isArray(translations[lang]?.[key])
                ? (translations[lang][key] as string[])
                : [];
              const title =
                fields.find((field) => field.key === key)?.label || key;
              return (
                <fieldset key={key}>
                  <legend>
                    {t(title)} — {t(`language.${lang}`)}
                  </legend>
                  {source.map((item, index) => (
                    <label key={`${key}:${index}`}>
                      {String(item)}
                      <input
                        lang={lang}
                        value={translated[index] || ""}
                        onChange={(event) => {
                          const next = source.map((_, i) =>
                            i === index
                              ? event.target.value
                              : translated[i] || "",
                          );
                          onChange({
                            ...translations,
                            [lang]: { ...translations[lang], [key]: next },
                          });
                        }}
                      />
                    </label>
                  ))}
                </fieldset>
              );
            })}
            {Array.isArray(items) &&
              items.map((item, index) => (
                <fieldset key={index}>
                  <legend>{String(index + 1)}</legend>
                  {["title", "text", "imageAlt"]
                    .filter((key) => typeof item[key] === "string")
                    .map((key) => (
                      <label key={key}>
                        {t(
                          key === "text"
                            ? "متن"
                            : key === "imageAlt"
                              ? "متن جایگزین تصویر"
                              : "عنوان",
                        )}
                        <textarea
                          value={String(
                            (
                              translations[lang]?.items as unknown as Record<
                                string,
                                string
                              >[]
                            )?.[index]?.[key] || "",
                          )}
                          onChange={(e) => {
                            const current =
                              (translations[lang]?.items as unknown as Record<
                                string,
                                string
                              >[]) || [];
                            const next = items.map((_, i) => ({
                              ...current[i],
                              ...(i === index ? { [key]: e.target.value } : {}),
                            }));
                            if (!e.target.value) delete next[index][key];
                            onChange({
                              ...translations,
                              [lang]: { ...translations[lang], items: next },
                            });
                          }}
                        />
                      </label>
                    ))}
                </fieldset>
              ))}
          </div>
        </details>
      ))}
    </fieldset>
  );
}
