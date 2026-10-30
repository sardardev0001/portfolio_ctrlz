"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Copy, Plus, Search, Trash2 } from "lucide-react";
import EditorDialog from "@/components/ui/EditorDialog";
import { api, errorText, fieldErrors } from "@/lib/api";
import { inspectVideo } from "@/lib/media-upload";
import { usePreferences, useT } from "@/i18n/provider";
import TranslationsEditor from "./TranslationsEditor";
import VideoUpload from "./VideoUpload";
import ImageUpload from "./ImageUpload";
import type { AdminUser, RecordData } from "@/types/api";
import type { Field, Resource } from "./resources";
import FieldInput from "./FieldInput";
import { getOptions } from "./services";

export default function ResourcePage({
  name,
  resource,
  user,
  newMode = false,
}: {
  name: string;
  resource: Resource;
  user: AdminUser;
  newMode?: boolean;
}) {
  const t = useT();
  const { locale } = usePreferences();
  const client = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [baseline, setBaseline] = useState("");
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<RecordData | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const uploaded = useRef<number[]>([]);
  useEffect(() => {
    if (newMode) return;
    try {
      const key = `ctrlz-admin-flash:${name}`;
      const notice = sessionStorage.getItem(key);
      if (notice) {
        setMessage(notice);
        sessionStorage.removeItem(key);
      }
    } catch {
      /* Storage can be disabled without affecting the saved record. */
    }
  }, [name, newMode]);
  useEffect(() => {
    const pendingUploads = uploaded.current;
    return () => {
      pendingUploads.forEach((id) => {
        void api(`admin/media/${id}/`, { method: "DELETE" }).catch(
          () => undefined,
        );
      });
    };
  }, []);
  const canWrite =
    (user.role === "owner" || user.role === "editor" || user.is_superuser) &&
    !resource.readOnly;
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", name, page, search],
    queryFn: () =>
      api<RecordData[]>(
        `admin/${resource.endpoint}/?page=${page}&search=${encodeURIComponent(search)}`,
      ),
  });
  const { data: cats } = useQuery({
    queryKey: ["admin", "categories", "options"],
    queryFn: () => getOptions("categories"),
    enabled: name === "portfolio",
  });
  const { data: skillCats } = useQuery({
    queryKey: ["admin", "skill-categories", "options"],
    queryFn: () => getOptions("skill-categories"),
    enabled: name === "skills",
  });
  const { data: media } = useQuery({
    queryKey: ["admin", "media", "options"],
    queryFn: () => getOptions("media"),
    enabled: [
      "portfolio",
      "resume-files",
      "gallery",
      "education",
      "experience",
      "skills",
    ].includes(name),
  });
  const { data: projects } = useQuery({
    queryKey: ["admin", "projects", "options"],
    queryFn: () => getOptions("projects"),
    enabled: name === "gallery",
  });
  useEffect(() => {
    if (newMode) {
      setEditing(null);
      setForm({
        status: "draft",
        visible: true,
        order: 0,
        year: 2026,
        translations: {},
        tools: [],
        tags: [],
        kind: "software",
        level: 80,
        variant: "standard",
        accent: name === "education" ? "red" : "blue",
        typewriter_enabled: true,
        typewriter_speed_ms: 70,
        typewriter_delete_ms: 45,
        typewriter_hold_ms: 5000,
      });
    }
  }, [newMode, name]);
  function edit(row: RecordData | null) {
    setDirty(false);
    setErrors({});
    setBaseline(row ? JSON.stringify(row) : "");
    setMessage("");
    setEditing(row);
    setForm(
      row
        ? { ...row }
        : {
            status: "draft",
            visible: true,
            order: 0,
            year: 2026,
            translations: {},
            tools: [],
            tags: [],
            kind: "software",
            level: 80,
            variant: "standard",
            accent: name === "education" ? "red" : "blue",
            typewriter_enabled: true,
            typewriter_speed_ms: 70,
            typewriter_delete_ms: 45,
            typewriter_hold_ms: 5000,
          },
    );
  }
  function closeEditor() {
    uploaded.current.forEach((id) => {
      void api(`admin/media/${id}/`, { method: "DELETE" }).catch(
        () => undefined,
      );
    });
    uploaded.current.length = 0;
    setUploadFile(null);
    setEditing(null);
    setForm({});
    if (newMode) router.replace(`/admin/${name}`);
  }
  function choices(field: Field): [string, string][] | undefined {
    const list =
      field.key === "category"
        ? name === "skills"
          ? skillCats?.data
          : cats?.data
        : [
              "asset",
              "thumbnail_asset",
              "video_asset",
              "image_asset",
              "secondary_image_asset",
              "icon_asset",
              "artwork_asset",
              "certificate_asset",
            ].includes(field.key)
          ? media?.data
          : field.key === "project"
            ? projects?.data
            : undefined;
    const expected =
      field.key === "video_asset"
        ? "video/"
        : [
              "thumbnail_asset",
              "image_asset",
              "secondary_image_asset",
              "icon_asset",
              "artwork_asset",
            ].includes(field.key) ||
            (field.key === "asset" && name === "gallery")
          ? "image/"
          : field.key === "certificate_asset" ||
              (field.key === "asset" && name === "resume-files")
            ? "application/pdf"
            : "";
    return list
      ?.filter((x) => !expected || String(x.mime_type).startsWith(expected))
      .map((x) => [String(x.id), String(x.title || x.filename)]);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (name === "media" && !editing) {
        if (!uploadFile) throw new Error("فایل را انتخاب کنید.");
        if (uploadFile.type.startsWith("video/"))
          await inspectVideo(uploadFile);
        const body = new FormData();
        body.append("file", uploadFile);
        body.append("alt", String(form.alt || ""));
        body.append("usage", String(form.usage || ""));
        await api("admin/media/", { method: "POST", body });
        setUploadFile(null);
      } else {
        const payload: Record<string, unknown> = {};
        for (const field of resource.fields) {
          let value = form[field.key];
          if (field.type === "json") {
            if (typeof value === "string") value = JSON.parse(value);
            value = value || (field.key === "translations" ? {} : []);
          } else if (field.type === "date") value = value || null;
          else if (["list", "cards", "links"].includes(field.type || ""))
            value = Array.isArray(value) ? value : [];
          else if (field.key === "numeric_value")
            value = value === "" || value == null ? null : Number(value);
          else if (field.type === "number") value = Number(value || 0);
          else if (field.type === "checkbox") value = Boolean(value);
          else if (
            field.type === "select" &&
            [
              "category",
              "asset",
              "thumbnail_asset",
              "video_asset",
              "image_asset",
              "secondary_image_asset",
              "icon_asset",
              "artwork_asset",
              "certificate_asset",
              "project",
            ].includes(field.key)
          )
            value = value ? Number(value) : null;
          else value = value ?? "";
          if (field.key === "password" && !value && editing) continue;
          if (
            name === "experience" &&
            field.key === "end_date" &&
            form.is_current
          )
            value = null;
          payload[field.key] = value;
        }
        await api(
          `admin/${resource.endpoint}/${editing ? `${editing.id}/` : ""}`,
          { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) },
        );
      }
      uploaded.current = uploaded.current.filter(
        (id) => !Object.values(form).some((value) => Number(value) === id),
      );
      setMessage("common.saved");
      if (newMode) {
        try {
          sessionStorage.setItem(`ctrlz-admin-flash:${name}`, "common.saved");
        } catch {
          /* Keep the current success message when storage is unavailable. */
        }
      }
      closeEditor();
      await client.invalidateQueries({ queryKey: ["admin"] });
    } catch (err) {
      setErrors(fieldErrors(err));
      setMessage(
        err instanceof SyntaxError
          ? "فرمت JSON معتبر نیست."
          : errorText(err, "fa"),
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: RecordData) {
    try {
      await api(`admin/${resource.endpoint}/${row.id}/`, { method: "DELETE" });
      await client.invalidateQueries({ queryKey: ["admin"] });
      setMessage("حذف شد.");
      setDeleting(null);
    } catch (err) {
      setMessage(errorText(err, "fa"));
    }
  }
  async function status(row: RecordData, next: string) {
    try {
      await api(`admin/${resource.endpoint}/${row.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      await client.invalidateQueries({ queryKey: ["admin"] });
    } catch (err) {
      setMessage(errorText(err, "fa"));
    }
  }
  const list = data?.data || [];
  async function reorderVisible(from: number, to: number) {
    if (from === to || to < 0 || to >= list.length || reordering) return;
    const ids = list.map((row) => row.id);
    const [id] = ids.splice(from, 1);
    ids.splice(to, 0, id);
    setReordering(true);
    try {
      await api(`admin/${resource.endpoint}/reorder/`, {
        method: "POST",
        body: JSON.stringify({ ids }),
      });
      await client.invalidateQueries({ queryKey: ["admin", name] });
      setMessage("ترتیب نمایش ذخیره شد.");
    } catch (err) {
      setMessage(errorText(err, "fa"));
    } finally {
      setReordering(false);
    }
  }
  const showForm = newMode || editing !== null || Boolean(form.__new);
  return (
    <>
      <div className="admin-heading">
        <span className="eyebrow">{t("CONTENT MANAGEMENT")}</span>
        <h1>{t(resource.label)}</h1>
        <p>{t("ویرایش محتوا و ترتیب نمایش سایت")}</p>
      </div>
      <div className="admin-toolbar">
        <label className="search-box">
          <Search size={16} />
          <span className="sr-only">{t("جستجو")}</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("جستجو...")}
          />
        </label>
        {canWrite && !resource.singleton && !resource.noCreate && (
          <button
            className="button"
            onClick={() => {
              edit(null);
              setForm((v) => ({ ...v, __new: true }));
            }}
          >
            <Plus size={19} />
            {t("افزودن")}
          </button>
        )}
      </div>
      {message && (
        <p role="status" className="admin-notice">
          {t(message)}
        </p>
      )}
      {name === "media" && (
        <p className="admin-hint">
          {t("video.formats")} {t("resume.pdf")}
        </p>
      )}
      {isLoading ? (
        <p className="feedback">{t("در حال دریافت...")}</p>
      ) : error ? (
        <p className="feedback error">{errorText(error)}</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {resource.columns.map((c) => (
                    <th key={c}>{t(`column.${c}`)}</th>
                  ))}
                  <th>{t("عملیات")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, index) => (
                  <tr
                    key={row.id}
                    draggable={canWrite && "order" in row}
                    onDragStart={() => setDragged(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragged !== null) void reorderVisible(dragged, index);
                      setDragged(null);
                    }}
                    onDragEnd={() => setDragged(null)}
                  >
                    {resource.columns.map((c) => (
                      <td key={c} dir="auto">
                        {name === "media" &&
                        c === "filename" &&
                        String(row.mime_type).startsWith("image/") ? (
                          <>
                            <a
                              href={String(row.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Image
                                unoptimized
                                src={String(row.url)}
                                width={60}
                                height={45}
                                alt={String(row.alt || row.filename)}
                                style={{ objectFit: "cover" }}
                              />
                            </a>{" "}
                            {String(row[c])}
                          </>
                        ) : typeof row[c] === "boolean" ? (
                          t(row[c] ? "فعال" : "غیرفعال")
                        ) : c === "size" ? (
                          `${new Intl.NumberFormat(locale).format(Number(row[c]) / 1_000_000)} MB`
                        ) : c.endsWith("_at") ? (
                          new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(String(row[c])))
                        ) : c === "order" || c === "level" ? (
                          new Intl.NumberFormat(locale).format(Number(row[c]))
                        ) : (
                          t(String(row[c] ?? "—"))
                        )}
                      </td>
                    ))}
                    <td className="row-actions">
                      {canWrite && (
                        <>
                          <button onClick={() => edit(row)}>
                            {t("ویرایش")}
                          </button>
                          {"order" in row && (
                            <>
                              <button
                                type="button"
                                disabled={reordering || index === 0}
                                aria-label={`${t("بالا")} ${index + 1}`}
                                onClick={() =>
                                  void reorderVisible(index, index - 1)
                                }
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  reordering || index === list.length - 1
                                }
                                aria-label={`${t("پایین")} ${index + 1}`}
                                onClick={() =>
                                  void reorderVisible(index, index + 1)
                                }
                              >
                                <ArrowDown size={16} />
                              </button>
                            </>
                          )}
                          {name === "experience" && (
                            <button
                              type="button"
                              aria-label={t("کپی تجربه کاری")}
                              onClick={() => {
                                edit(null);
                                const { id: _id, ...copy } = row;
                                void _id;
                                setForm({ ...copy, __new: true });
                              }}
                            >
                              <Copy size={16} />
                            </button>
                          )}
                          {name === "portfolio" && (
                            <button
                              onClick={() =>
                                status(
                                  row,
                                  row.status === "published"
                                    ? "draft"
                                    : "published",
                                )
                              }
                            >
                              {row.status === "published"
                                ? t("لغو انتشار")
                                : t("انتشار")}
                            </button>
                          )}
                          {name === "messages" && row.status === "unread" && (
                            <button onClick={() => status(row, "read")}>
                              {t("خوانده شد")}
                            </button>
                          )}
                          {name === "messages" && row.status !== "archived" && (
                            <button onClick={() => status(row, "archived")}>
                              {t("بایگانی")}
                            </button>
                          )}
                          {!resource.singleton && (
                            <button
                              className="danger"
                              onClick={() => setDeleting(row)}
                              aria-label={t("حذف")}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="feedback">{t("موردی یافت نشد.")}</p>
            )}
          </div>
          <div className="pagination">
            <button
              disabled={!data?.meta.pagination?.has_previous}
              onClick={() => setPage((x) => x - 1)}
            >
              {t("قبلی")}
            </button>
            <span>
              {t("صفحه")} {new Intl.NumberFormat(locale).format(page)} /{" "}
              {new Intl.NumberFormat(locale).format(
                data?.meta.pagination?.total_pages || 1,
              )}
            </span>
            <button
              disabled={!data?.meta.pagination?.has_next}
              onClick={() => setPage((x) => x + 1)}
            >
              {t("بعدی")}
            </button>
          </div>
        </>
      )}
      {showForm && canWrite && (
        <EditorDialog
          onClose={closeEditor}
          label={`${t(editing ? "ویرایش" : "افزودن")} ${t(resource.label)}`}
          dirty={baseline ? JSON.stringify(form) !== baseline : dirty}
          busy={busy || uploading}
        >
          <section className="editor-panel">
            <div className="editor-header">
              <h2>
                {t(editing ? "ویرایش" : "افزودن")} {t(resource.label)}
              </h2>
            </div>
            {name === "messages" && editing && (
              <div className="message-body">
                <strong>
                  {String(editing.name)} — {String(editing.email)}
                </strong>
                <h3>{String(editing.subject)}</h3>
                <p>{String(editing.message)}</p>
              </div>
            )}
            <form method="post" onSubmit={save} className="admin-form">
              {message && (
                <p className="field-error" role="alert">
                  {t(message)}
                </p>
              )}
              {name === "media" && !editing && (
                <label>
                  {t("فایل")}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,application/pdf"
                    onChange={(e) => {
                      setUploadFile(e.target.files?.[0] || null);
                      setDirty(true);
                    }}
                    required
                  />
                </label>
              )}
              {resource.fields
                .filter((field) => field.key !== "translations")
                .map((field) =>
                  field.key === "video_asset" ? (
                    <VideoUpload
                      key={field.key}
                      value={form.video_asset}
                      onChange={(id) => {
                        setDirty(true);
                        setForm((x) => ({ ...x, video_asset: id }));
                      }}
                      onUploaded={(asset) => uploaded.current.push(asset.id)}
                      onBusy={setUploading}
                    />
                  ) : [
                      "thumbnail_asset",
                      "image_asset",
                      "secondary_image_asset",
                      "icon_asset",
                      "artwork_asset",
                    ].includes(field.key) ? (
                    <div key={field.key} className="admin-media-field">
                      <FieldInput
                        field={field}
                        value={form[field.key]}
                        onChange={(v) => {
                          setDirty(true);
                          setForm((x) => ({ ...x, [field.key]: v }));
                        }}
                        choices={choices(field)}
                        error={errors[field.key]}
                      />
                      <ImageUpload
                        value={form[field.key]}
                        onChange={(id) => {
                          setDirty(true);
                          setForm((x) => ({ ...x, [field.key]: id }));
                        }}
                        onUploaded={(asset) => uploaded.current.push(asset.id)}
                        onBusy={setUploading}
                      />
                    </div>
                  ) : (
                    <FieldInput
                      key={field.key}
                      field={field}
                      value={form[field.key]}
                      onChange={(v) => {
                        setDirty(true);
                        setForm((x) => ({ ...x, [field.key]: v }));
                      }}
                      choices={choices(field)}
                      error={errors[field.key]}
                    />
                  ),
                )}
              {resource.fields.some(
                (field) => field.key === "translations",
              ) && (
                <TranslationsEditor
                  fields={resource.fields}
                  items={form.items}
                  arrays={form}
                  value={form.translations}
                  onChange={(value) => {
                    setDirty(true);
                    setForm((x) => ({ ...x, translations: value }));
                  }}
                />
              )}
              <button className="button" disabled={busy || uploading}>
                {busy ? t("در حال ذخیره...") : t("ذخیره تغییرات")}
              </button>
            </form>
          </section>
        </EditorDialog>
      )}
      {deleting && (
        <EditorDialog
          onClose={() => setDeleting(null)}
          label={t("dialog.delete")}
        >
          <section className="editor-panel">
            <h2>{t("dialog.delete")}</h2>
            <p dir="auto">
              {String(
                deleting.title ||
                  deleting.name ||
                  deleting.filename ||
                  deleting.id,
              )}
            </p>
            <p>{t("dialog.deleteHelp")}</p>
            <div className="dialog-actions">
              <button
                className="button outline"
                onClick={() => setDeleting(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="button danger"
                onClick={() => void remove(deleting)}
              >
                {t("common.delete")}
              </button>
            </div>
          </section>
        </EditorDialog>
      )}
    </>
  );
}
