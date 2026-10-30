"use client";

import { useRef } from "react";
import { usePreferences, useT } from "@/i18n/provider";
import SafeRichText from "./SafeRichText";

export default function RichTextEditor({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const t = useT();
  const { locale } = usePreferences();
  const input = useRef<HTMLTextAreaElement>(null);
  function wrap(before: string, after: string, placeholder: string) {
    const area = input.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selection = value.slice(start, end) || placeholder;
    onChange(
      value.slice(0, start) + before + selection + after + value.slice(end),
    );
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(
        start + before.length,
        start + before.length + selection.length,
      );
    });
  }
  function unlink() {
    const area = input.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = value.slice(start, end);
    onChange(
      value.slice(0, start) +
        selected.replace(/\[([^\]]+)\]\(https:\/\/[^)]+\)/g, "$1") +
        value.slice(end),
    );
    area.focus();
  }
  return (
    <div className="rich-text-editor">
      <label htmlFor={`rich-${label}`}>{t(label)}</label>
      <div
        className="rich-text-toolbar"
        role="toolbar"
        aria-label={t("قالب‌بندی متن")}
      >
        <button
          type="button"
          onClick={() => wrap("**", "**", t("متن برجسته"))}
          aria-label={t("پررنگ")}
        >
          {t("rich.bold.short")}
        </button>
        <button
          type="button"
          onClick={() => wrap("*", "*", t("متن مورب"))}
          aria-label={t("مورب")}
        >
          <i>{t("rich.italic.short")}</i>
        </button>
        <button
          type="button"
          onClick={() => wrap("\n## ", "\n", t("عنوان"))}
          aria-label={t("عنوان")}
        >
          {t("rich.heading.short")}
        </button>
        <button
          type="button"
          onClick={() => wrap("\n- ", "\n", t("مورد فهرست"))}
          aria-label={t("فهرست معمولی")}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => wrap("\n1. ", "\n", t("مورد فهرست"))}
          aria-label={t("فهرست شماره‌دار")}
        >
          {t("rich.number.short")}
        </button>
        <button
          type="button"
          onClick={() => wrap("[", "](https://example.com)", t("متن لینک"))}
          aria-label={t("افزودن لینک")}
        >
          {t("rich.link.short")}
        </button>
        <button type="button" onClick={unlink} aria-label={t("حذف لینک")}>
          {t("rich.unlink.short")}
        </button>
      </div>
      <textarea
        id={`rich-${label}`}
        ref={input}
        rows={7}
        value={value}
        dir={locale === "fa" ? "rtl" : "ltr"}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      <div className="rich-text-preview">
        <strong>{t("پیش‌نمایش")}</strong>
        <SafeRichText text={value} />
      </div>
      {error && (
        <span role="alert" className="field-error">
          {t(error)}
        </span>
      )}
    </div>
  );
}
