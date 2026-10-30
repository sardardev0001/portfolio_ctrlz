"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useT } from "@/i18n/provider";

type Kind = "list" | "cards" | "links";
type Entry = string | Record<string, string>;
const cardFields = [
  ["title", "عنوان"],
  ["text", "توضیح"],
  ["image", "نشانی تصویر"],
  ["imageAlt", "متن جایگزین تصویر"],
  ["icon", "آیکون"],
  ["accent", "رنگ تأکیدی"],
  ["category_slug", "دسته‌بندی"],
] as const;
const linkFields = [
  ["label", "عنوان"],
  ["url", "پیوند HTTPS"],
] as const;

export default function StructuredListInput({
  kind,
  label,
  value,
  onChange,
}: {
  kind: Kind;
  label: string;
  value: unknown;
  onChange: (value: Entry[]) => void;
}) {
  const t = useT();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const entries: Entry[] = Array.isArray(value) ? (value as Entry[]) : [];
  const fields = kind === "cards" ? cardFields : linkFields;
  const update = (index: number, key: string, text: string) => {
    const copy = [...entries];
    copy[index] =
      kind === "list"
        ? text
        : { ...(copy[index] as Record<string, string>), [key]: text };
    onChange(copy);
  };
  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= entries.length) return;
    const copy = [...entries];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(copy);
  };
  return (
    <fieldset className="structured-list">
      <legend>{t(label)}</legend>
      <p className="admin-hint">
        {t("برای تغییر ترتیب، بکشید یا از دکمه‌های بالا و پایین استفاده کنید.")}
      </p>
      {entries.map((entry, index) => (
        <div
          className="structured-list-row"
          key={index}
          draggable
          onDragStart={(event) => {
            setDragIndex(index);
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (dragIndex !== null) move(dragIndex, index);
            setDragIndex(null);
          }}
          onDragEnd={() => setDragIndex(null)}
        >
          <GripVertical aria-hidden="true" size={17} />
          <span className="sr-only">
            {t(label)} {index + 1}
          </span>
          <div className="structured-list-fields">
            {kind === "list" ? (
              <input
                aria-label={`${t(label)} ${index + 1}`}
                value={String(entry ?? "")}
                onChange={(event) => update(index, "", event.target.value)}
                required
              />
            ) : (
              fields.map(([key, title]) => (
                <label key={key}>
                  {t(title)}
                  <input
                    type={key === "url" ? "url" : "text"}
                    dir={key === "url" ? "ltr" : undefined}
                    value={String(
                      (entry as Record<string, string>)?.[key] ?? "",
                    )}
                    onChange={(event) => update(index, key, event.target.value)}
                    required={
                      key === "title" || key === "label" || key === "url"
                    }
                  />
                </label>
              ))
            )}
          </div>
          <div className="structured-list-actions">
            <button
              type="button"
              aria-label={`${t("بالا")} ${index + 1}`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              aria-label={`${t("پایین")} ${index + 1}`}
              disabled={index === entries.length - 1}
              onClick={() => move(index, index + 1)}
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              aria-label={`${t("حذف")} ${index + 1}`}
              onClick={() => onChange(entries.filter((_, i) => i !== index))}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="button"
        onClick={() =>
          onChange([
            ...entries,
            kind === "list"
              ? ""
              : kind === "links"
                ? { label: "", url: "" }
                : { title: "", text: "" },
          ])
        }
      >
        <Plus size={16} /> {t("افزودن")} {t(label)}
      </button>
    </fieldset>
  );
}
