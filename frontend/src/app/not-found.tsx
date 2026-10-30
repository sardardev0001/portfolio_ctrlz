"use client";
import { useT } from "@/i18n/provider";
import Link from "next/link";
export default function NotFound() {
  const t = useT();
  return (
    <main className="error-page">
      <span className="eyebrow">{t("notFound.eyebrow")}</span>
      <h1>{t("این فریم پیدا نشد.")}</h1>
      <Link className="button" href="/">
        {t("بازگشت به خانه")}
      </Link>
    </main>
  );
}
