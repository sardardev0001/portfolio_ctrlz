"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { errorText } from "@/lib/api";
import { uploadMedia } from "@/lib/media-upload";
import { usePreferences, useT } from "@/i18n/provider";
import type { RecordData } from "@/types/api";

export default function ImageUpload({
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
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function choose(file?: File) {
    if (!file) return;
    setError("");
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 10_000_000 ||
      file.size <= 0
    ) {
      setError(t("یک تصویر PNG، JPEG یا WebP تا ۱۰ مگابایت انتخاب کنید."));
      return;
    }
    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);
    setProgress(0);
    controller.current = new AbortController();
    onBusy(true);
    try {
      const asset = await uploadMedia(
        file,
        setProgress,
        controller.current.signal,
        "managed-editorial-image",
      );
      onUploaded(asset);
      onChange(asset.id);
    } catch (err) {
      setError(
        controller.current.signal.aborted
          ? t("بارگذاری لغو شد.")
          : errorText(err, locale),
      );
      setPreview("");
    } finally {
      onBusy(false);
      setProgress(null);
    }
  }
  return (
    <div
      className="image-upload"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void choose(event.dataTransfer.files[0]);
      }}
    >
      <label>
        {t("تصویر را انتخاب کنید یا اینجا رها کنید")}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            void choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {Boolean(preview || value) && (
        <Image
          unoptimized
          width={140}
          height={100}
          alt={t("پیش‌نمایش تصویر")}
          src={value ? `/api/v1/media/${value}/` : preview}
          style={{ objectFit: "cover" }}
        />
      )}
      {progress !== null && (
        <>
          <progress
            max={100}
            value={progress}
            aria-label={t("پیشرفت بارگذاری تصویر")}
          />
          <button type="button" onClick={() => controller.current?.abort()}>
            {t("لغو بارگذاری")}
          </button>
        </>
      )}
      {Boolean(value) && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setPreview("");
          }}
        >
          {t("حذف تصویر")}
        </button>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
