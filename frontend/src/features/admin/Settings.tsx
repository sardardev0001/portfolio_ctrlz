"use client";
import { useState } from "react";
import Link from "next/link";
import { LanguageToggle, useT } from "@/i18n/provider";
import type { AdminUser } from "@/types/api";
import ResourcePage from "./ResourcePage";
import { resources } from "./resources";
export default function Settings({ user }: { user: AdminUser }) {
  const t = useT();
  const [tab, setTab] = useState("general");
  return (
    <>
      <div className="admin-heading">
        <h1>{t("تنظیمات سایت")}</h1>
      </div>
      <div className="settings-tabs" role="tablist">
        {["general", "preferences", "security"].map((key) => (
          <button
            id={`settings-tab-${key}`}
            key={key}
            role="tab"
            aria-selected={tab === key}
            aria-controls={`settings-${key}`}
            onClick={() => setTab(key)}
          >
            {t(`settings.${key}`)}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id={`settings-${tab}`}
        aria-labelledby={`settings-tab-${tab}`}
      >
        {tab === "general" ? (
          <ResourcePage
            name="settings"
            resource={resources.settings}
            user={user}
          />
        ) : tab === "preferences" ? (
          <div className="admin-card admin-preferences">
            <LanguageToggle />
          </div>
        ) : (
          <div className="admin-card">
            <p>{t("settings.securityHelp")}</p>
            {(user.role === "owner" || user.is_superuser) && (
              <Link className="button" href="/admin/users">
                {t("کاربران و دسترسی")}
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}
