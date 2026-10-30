"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EditorDialog from "@/components/ui/EditorDialog";
import { ApiFailure, api, errorText } from "@/lib/api";
import { uploadMedia } from "@/lib/media-upload";
import { usePreferences, useT } from "@/i18n/provider";
import type { AdminUser, RecordData } from "@/types/api";
import { getOptions } from "./services";
export default function ResumeFiles({ user }: { user: AdminUser }) {
  const t = useT();
  const { locale } = usePreferences();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["admin", "resume-files", "slots"],
    queryFn: () => getOptions("resume-files"),
  });
  const [language, setLanguage] = useState<"fa" | "en" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState<RecordData | null>(null);
  const [notice, setNotice] = useState("");
  const canWrite = user.role !== "viewer" || user.is_superuser;
  const rows = query.data?.data || [];
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !language) return;
    let uploaded: RecordData | null = null;
    setBusy(true);
    setError(null);
    try {
      if (file.size <= 0 || file.size > 10_000_000)
        throw new ApiFailure("DOCUMENT_SIZE", null, 413);
      if (file.type !== "application/pdf")
        throw new ApiFailure("MEDIA_INVALID", null, 422);
      uploaded = await uploadMedia(
        file,
        setProgress,
        undefined,
        "managed-resume",
      );
      const current = rows.find((row) => row.language === language);
      await api(`admin/resume-files/${current ? `${current.id}/` : ""}`, {
        method: current ? "PATCH" : "POST",
        body: JSON.stringify({
          title: `CTRL.Z ${language.toUpperCase()}`,
          asset: uploaded.id,
          language,
          visible: true,
        }),
      });
      setFile(null);
      setLanguage(null);
      setNotice("common.saved");
      await client.invalidateQueries({ queryKey: ["admin"] });
      await client.invalidateQueries({ queryKey: ["resume"] });
    } catch (failure) {
      setError(failure);
      if (uploaded)
        await api(`admin/media/${uploaded.id}/`, { method: "DELETE" }).catch(
          () => undefined,
        );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`admin/resume-files/${deleting.id}/`, { method: "DELETE" });
      setDeleting(null);
      await client.invalidateQueries({ queryKey: ["admin"] });
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-heading">
        <h1>{t("فایل رزومه")}</h1>
        <p>{t("resume.pdf")}</p>
      </div>
      {query.isLoading ? (
        <p>{t("common.loading")}</p>
      ) : query.error ? (
        <p role="alert">{errorText(query.error, locale)}</p>
      ) : (
        <div className="admin-dashboard-grid">
          {(["fa", "en"] as const).map((lang) => {
            const row = rows.find((row) => row.language === lang);
            return (
              <section className="admin-card" key={lang}>
                <h2>{t(`resume.${lang}`)}</h2>
                {row ? (
                  <>
                    <p dir="auto">{String(row.filename)}</p>
                    <p>
                      {new Intl.NumberFormat(locale).format(
                        Number(row.size) / 1_000_000,
                      )}{" "}
                      MB
                    </p>
                    <time>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(String(row.updated_at)))}
                    </time>
                    <p>{t(row.visible ? "فعال" : "غیرفعال")}</p>
                    <a
                      className="button outline"
                      href={`/api/v1/media/${row.asset}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("common.preview")}
                    </a>
                  </>
                ) : (
                  <p>{t("resume.missing")}</p>
                )}
                {canWrite && (
                  <div className="dialog-actions">
                    <button
                      className="button"
                      onClick={() => {
                        setFile(null);
                        setError(null);
                        setLanguage(lang);
                      }}
                    >
                      {t("common.replace")}
                    </button>
                    {row && (
                      <button
                        className="button danger"
                        onClick={() => setDeleting(row)}
                      >
                        {t("common.delete")}
                      </button>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      {rows.some((row) => !row.language) && (
        <section className="admin-card">
          <h2>{t("resume.legacy")}</h2>
          {rows
            .filter((row) => !row.language)
            .map((row) => (
              <div className="analytics-row" key={row.id}>
                <a
                  href={`/api/v1/media/${row.asset}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="auto"
                >
                  {String(row.filename)}
                </a>
                {canWrite &&
                  (["fa", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      disabled={rows.some((item) => item.language === lang)}
                      onClick={async () => {
                        try {
                          await api(`admin/resume-files/${row.id}/`, {
                            method: "PATCH",
                            body: JSON.stringify({ language: lang }),
                          });
                          await client.invalidateQueries({
                            queryKey: ["admin"],
                          });
                        } catch (failure) {
                          setError(failure);
                        }
                      }}
                    >
                      {t(`resume.${lang}`)}
                    </button>
                  ))}
              </div>
            ))}
        </section>
      )}
      {notice && <p role="status">{t(notice)}</p>}
      {error != null && !language && (
        <p role="alert" className="field-error">
          {errorText(error, locale)}
        </p>
      )}
      {language && (
        <EditorDialog
          label={t(`resume.${language}`)}
          onClose={() => setLanguage(null)}
          dirty={Boolean(file)}
          busy={busy}
        >
          <section className="editor-panel">
            <h2>{t(`resume.${language}`)}</h2>
            <p>{t("resume.pdf")}</p>
            <form className="admin-form" onSubmit={save}>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                aria-label={t(`resume.${language}`)}
              />
              {busy && <progress value={progress} max={100} />}
              {error != null && (
                <p className="field-error" role="alert">
                  {errorText(error, locale)}
                </p>
              )}
              <button className="button" disabled={busy}>
                {t(busy ? "common.saving" : "common.save")}
              </button>
            </form>
          </section>
        </EditorDialog>
      )}
      {deleting && (
        <EditorDialog
          label={t("dialog.delete")}
          onClose={() => setDeleting(null)}
          busy={busy}
        >
          <section className="editor-panel">
            <h2>{t("dialog.delete")}</h2>
            <p>{t("dialog.deleteHelp")}</p>
            <div className="dialog-actions">
              <button onClick={() => setDeleting(null)}>
                {t("common.cancel")}
              </button>
              <button
                className="button danger"
                disabled={busy}
                onClick={() => void remove()}
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
