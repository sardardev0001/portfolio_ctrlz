"use client";
import { useState } from "react";
import { useT } from "@/i18n/provider";
export default function ProjectVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const t = useT();
  const [error, setError] = useState(false);
  return (
    <>
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster}
        src={src}
        onError={() => setError(true)}
        onLoadedData={() => setError(false)}
      >
        {t("مرورگر شما پخش این ویدیو را پشتیبانی نمی‌کند.")}
      </video>
      {error && (
        <p role="alert" className="field-error">
          {t("video.failed")}
        </p>
      )}
    </>
  );
}
