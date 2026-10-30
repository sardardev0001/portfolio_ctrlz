"use client";
import { useT } from "@/i18n/provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useT();
  return (
    <main className="error-page">
      <span className="eyebrow">{t("CONNECTION INTERRUPTED")}</span>
      <h1>{t("ارتباط با استودیو قطع شد")}</h1>
      <p>{t("سرور در دسترس نیست. لحظه‌ای بعد دوباره تلاش کنید.")}</p>
      <button className="button" onClick={reset}>
        {t("تلاش دوباره")}
      </button>
    </main>
  );
}
