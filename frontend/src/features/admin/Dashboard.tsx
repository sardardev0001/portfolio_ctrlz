"use client";
import { usePreferences, useT } from "@/i18n/provider";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FilePlus } from "lucide-react";
import { api, errorText } from "@/lib/api";
import type { RecordData } from "@/types/api";

export default function Dashboard() {
  const t = useT();
  const { locale } = usePreferences();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Record<string, unknown>>("admin/dashboard/"),
  });
  if (isLoading)
    return <p className="feedback">{t("در حال دریافت داشبورد...")}</p>;
  if (error) return <p className="feedback error">{errorText(error)}</p>;
  const d = data!.data;
  const stats = [
    { label: "پروژه‌ها", value: d.projects },
    { label: "منتشرشده", value: d.published },
    { label: "پیش‌نویس", value: d.drafts },
    { label: "پیام خوانده‌نشده", value: d.unread_messages },
    { label: "بازدید صفحات", value: d.views },
    { label: "بازدید پروژه‌ها", value: d.project_views },
    { label: "ارسال فرم", value: d.conversions },
  ];
  return (
    <>
      <div className="admin-heading">
        <span className="eyebrow">{t("MISSION CONTROL")}</span>
        <h1>{t("داشبورد")}</h1>
        <p>{t("نمایی از محتوای استودیو و فعالیت سایت")}</p>
      </div>
      <div className="admin-metrics">
        {stats.map((x) => (
          <div className="admin-metric" key={t(x.label)}>
            <strong>
              {new Intl.NumberFormat(locale).format(Number(x.value))}
            </strong>
            <span>{x.label}</span>
          </div>
        ))}
      </div>
      <div className="admin-quick">
        <Link href="/admin/portfolio/new" className="button">
          <FilePlus />
          {t("افزودن پروژه")}
        </Link>
        <Link href="/admin/skills" className="button outline">
          {t("مدیریت مهارت‌ها")}
        </Link>
        <Link href="/admin/messages" className="button outline">
          {t("مشاهده پیام‌ها")}
        </Link>
      </div>
      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <h2>{t("پیام‌های اخیر")}</h2>
          {((d.recent_messages as RecordData[]) || []).map((x) => (
            <Link href={`/admin/messages?edit=${x.id}`} key={x.id}>
              <strong>{String(x.subject)}</strong>
              <small>
                {String(x.name)} · {t(String(x.status))}
              </small>
            </Link>
          ))}
        </div>
        <div className="admin-card">
          <h2>{t("پروژه‌های اخیر")}</h2>
          {((d.recent_projects as RecordData[]) || []).map((x) => (
            <Link href={`/admin/portfolio?edit=${x.id}`} key={x.id}>
              <strong>{String(x.title)}</strong>
              <small>{String(x.status)}</small>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
