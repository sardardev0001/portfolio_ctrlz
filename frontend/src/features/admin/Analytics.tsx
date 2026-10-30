"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, errorText } from "@/lib/api";
import { usePreferences, useT } from "@/i18n/provider";
type Row = { key: string; count: number };
type Report = {
  views: number;
  project_views: number;
  conversions: number;
  resume_downloads: number;
  social_clicks: number;
  daily: { date: string; count: number }[];
  popular_pages: Row[];
  popular_projects: Row[];
  resume_languages: Row[];
  socials: Row[];
  has_data: boolean;
  timezone: string;
};
export default function Analytics() {
  const t = useT();
  const { locale } = usePreferences();
  const [days, setDays] = useState("30");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [range, setRange] = useState("days=30");
  const query = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => api<Report>(`admin/analytics/?${range}`),
  });
  const d = query.data?.data;
  const number = (n: number) => new Intl.NumberFormat(locale).format(n);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Tehran",
    }).format(new Date(`${value}T12:00:00+03:30`));
  return (
    <>
      <div className="admin-heading">
        <h1>{t("analytics.title")}</h1>
        <p>{t("analytics.help")}</p>
      </div>
      <form
        className="analytics-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setRange(
            days === "custom" ? `start=${start}&end=${end}` : `days=${days}`,
          );
        }}
      >
        <label>
          {t("analytics.days")}
          <select
            value={days}
            onChange={(e) => {
              setDays(e.target.value);
              if (e.target.value !== "custom")
                setRange(`days=${e.target.value}`);
            }}
          >
            {[7, 30, 90].map((n) => (
              <option value={n} key={n}>
                {number(n)} {t("analytics.days")}
              </option>
            ))}
            <option value="custom">{t("analytics.custom")}</option>
          </select>
        </label>
        {days === "custom" && (
          <>
            <label>
              {t("analytics.start")}
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </label>
            <label>
              {t("analytics.end")}
              <input
                type="date"
                min={start}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </label>
            <button className="button">{t("analytics.apply")}</button>
          </>
        )}
        <button
          type="button"
          className="button outline"
          onClick={() => {
            setDays("30");
            setStart("");
            setEnd("");
            setRange("days=30");
          }}
        >
          {t("common.reset")}
        </button>
      </form>
      {query.isFetching && <p role="status">{t("common.loading")}</p>}
      {query.error && (
        <p role="alert" className="field-error">
          {errorText(query.error, locale)}
        </p>
      )}
      {d && (
        <>
          <p>
            {t("analytics.zone")}: <bdi>{d.timezone}</bdi>
          </p>
          {!d.has_data && <p className="feedback">{t("common.empty")}</p>}
          <div className="admin-metrics">
            {(
              [
                ["pages", "views"],
                ["projects", "project_views"],
                ["contact", "conversions"],
                ["resume", "resume_downloads"],
                ["social", "social_clicks"],
              ] as const
            ).map(([key, field]) => (
              <div className="admin-metric" key={key}>
                <strong>{d.has_data ? number(d[field]) : "—"}</strong>
                <span>{t(`analytics.${key}`)}</span>
              </div>
            ))}
          </div>
          <section className="admin-card">
            <h2>{t("analytics.daily")}</h2>
            {d.daily.length ? (
              <div
                className="analytics-chart"
                role="img"
                aria-label={t("analytics.daily")}
              >
                {d.daily.map((row) => (
                  <div className="analytics-day" key={row.date}>
                    <span>{number(row.count)}</span>
                    <div
                      style={{
                        height: `${Math.max(2, (160 * row.count) / Math.max(1, ...d.daily.map((x) => x.count)))}px`,
                      }}
                    />
                    <time>{date(row.date)}</time>
                  </div>
                ))}
              </div>
            ) : (
              <p>{t("common.empty")}</p>
            )}
          </section>
          <div className="admin-dashboard-grid">
            {(
              [
                ["popularPages", d.popular_pages],
                ["popularProjects", d.popular_projects],
                ["resume", d.resume_languages],
                ["social", d.socials],
              ] as [string, Row[]][]
            ).map(([key, rows]) => (
              <section className="admin-card" key={key}>
                <h2>{t(`analytics.${key}`)}</h2>
                {rows.length ? (
                  <table className="admin-table">
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.key}>
                          <th scope="row">
                            <bdi>
                              {row.key === "fa" || row.key === "en"
                                ? t(`resume.${row.key}`)
                                : row.key}
                            </bdi>
                          </th>
                          <td>{number(row.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>{t("common.empty")}</p>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
