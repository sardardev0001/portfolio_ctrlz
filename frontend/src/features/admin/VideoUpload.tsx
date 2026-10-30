"use client";
import { useEffect, useRef, useState } from "react";
import { usePreferences, useT } from "@/i18n/provider";
import { errorText } from "@/lib/api";
import { inspectVideo, uploadMedia } from "@/lib/media-upload";
import type { RecordData } from "@/types/api";
export default function VideoUpload({
  value,
  onChange,
  onUploaded,
  onBusy,
}: {
  value: unknown;
  onChange: (id: number | null) => void;
  onUploaded: (asset: RecordData) => void;
  onBusy: (busy: boolean) => void;
}) {
  const t = useT();
  const { locale } = usePreferences();
  const [state, setState] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const [preview, setPreview] = useState("");
  const [selected, setSelected] = useState<{
    size: number;
    duration?: number;
  } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function choose(file?: File) {
    if (!file) return;
    setError(null);
    setState("video.checking");
    setSelected({ size: file.size });
    controller.current = new AbortController();
    const signal = controller.current.signal;
    onBusy(true);
    try {
      const duration = await inspectVideo(file, signal);
      signal.throwIfAborted();
      setSelected({ size: file.size, duration });
      setPreview(URL.createObjectURL(file));
      setState("video.uploading");
      setProgress(0);
      const asset = await uploadMedia(file, setProgress, signal);
      onUploaded(asset);
      onChange(asset.id);
      setState("video.ready");
    } catch (err) {
      setError(signal.aborted ? null : err);
      setState(signal.aborted ? "video.cancelled" : "");
      setPreview("");
    } finally {
      onBusy(false);
    }
  }
  const busy = ["video.checking", "video.uploading"].includes(state);
  return (
    <fieldset className="video-upload">
      <legend>{t("video.upload")}</legend>
      <p>{t("video.hint")}</p>
      <small>{t("video.formats")}</small>
      <input
        aria-label={t("video.upload")}
        type="file"
        accept="video/mp4,video/webm"
        disabled={busy}
        onChange={(e) => {
          void choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {selected && (
        <p>
          {t("video.size")}: {selected.size.toLocaleString(locale)}{" "}
          {t("video.bytes")}
          {selected.duration !== undefined && (
            <>
              {" "}
              · {t("video.duration")}:{" "}
              {selected.duration.toLocaleString(locale, {
                maximumFractionDigits: 3,
              })}{" "}
              {t("video.seconds")}
            </>
          )}
        </p>
      )}
      {state && <p role="status">{t(state)}</p>}
      {state === "video.uploading" && (
        <progress
          max={100}
          value={progress}
          aria-label={t("video.uploading")}
        />
      )}
      {state === "video.uploading" && (
        <p>
          {(progress / 100).toLocaleString(locale, { style: "percent" })}{" "}
          {progress === 100 && t("video.processing")}
        </p>
      )}
      {busy && (
        <button
          type="button"
          className="button outline"
          onClick={() => controller.current?.abort()}
        >
          {t("video.cancel")}
        </button>
      )}
      {error != null && (
        <p className="field-error" role="alert">
          {errorText(error, locale)}
        </p>
      )}
      {Boolean(preview || value) && (
        <video
          key={preview || String(value)}
          src={preview || `/api/v1/media/${value}/`}
          controls
          playsInline
          preload="metadata"
        />
      )}
      {Boolean(value) && (
        <button
          type="button"
          disabled={busy}
          className="button outline"
          onClick={() => {
            onChange(null);
            setPreview("");
            setState("");
            setSelected(null);
          }}
        >
          {t("video.remove")}
        </button>
      )}
    </fieldset>
  );
}
