"use client";
import type { Field } from "./resources";
import { useT } from "@/i18n/provider";
import StructuredListInput from "./StructuredListInput";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function FieldInput({
  field,
  value,
  onChange,
  choices,
  error,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  choices?: [string, string][];
  error?: string;
}) {
  const t = useT();
  const base = {
    id: field.key,
    required: field.required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${field.key}-error` : undefined,
  };
  if (field.type === "list" || field.type === "cards" || field.type === "links")
    return (
      <StructuredListInput
        kind={field.type}
        label={field.label}
        value={value}
        onChange={onChange}
      />
    );
  if (field.type === "richtext")
    return (
      <RichTextEditor
        label={field.label}
        value={String(value ?? "")}
        onChange={onChange}
        error={error}
      />
    );
  if (field.type === "checkbox")
    return (
      <label className="check-label">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {t(field.label)}
      </label>
    );
  return (
    <label htmlFor={field.key}>
      {t(field.label)}
      {field.type === "textarea" ? (
        <textarea
          {...base}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      ) : field.type === "select" ? (
        <select
          {...base}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{t("انتخاب کنید")}</option>
          {(choices || field.options || []).map(([id, title]) => (
            <option value={id} key={id}>
              {t(title)}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...base}
          type={
            field.key === "password"
              ? "password"
              : field.type === "json"
                ? "text"
                : field.type || "text"
          }
          value={
            field.type === "json"
              ? typeof value === "string"
                ? value
                : JSON.stringify(
                    value ?? (field.key === "translations" ? {} : []),
                  )
              : String(value ?? "")
          }
          onChange={(e) => onChange(e.target.value)}
          dir={
            field.type === "url" || field.type === "email" ? "ltr" : undefined
          }
        />
      )}
      {error && (
        <span id={`${field.key}-error`} className="field-error" role="alert">
          {t(error)}
        </span>
      )}
    </label>
  );
}
