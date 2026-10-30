"use client";
import { useEffect, useRef } from "react";
import { LanguageToggle, usePreferences, useT } from "@/i18n/provider";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types/api";
import { adminNav, resources } from "./resources";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Analytics from "./Analytics";
import ResourcePage from "./ResourcePage";
import ResumeFiles from "./ResumeFiles";
import Settings from "./Settings";

export default function AdminApp({ path }: { path: string }) {
  const t = useT();
  const { locale } = usePreferences();
  const sidebar = useRef<HTMLElement>(null);
  const route = path.split("/")[0];
  const user = useQuery({
    queryKey: ["me"],
    queryFn: () => api<AdminUser>("auth/me/"),
    enabled: route !== "login",
    retry: false,
  });
  const router = useRouter();
  const client = useQueryClient();
  useEffect(() => {
    if (!sidebar.current) return;
    sidebar.current.scrollTop = Number(
      sessionStorage.getItem("ctrlz-admin-sidebar") || 0,
    );
    const active = sidebar.current.querySelector(
      '[aria-current="page"]',
    ) as HTMLElement | null;
    if (active) {
      const bounds = sidebar.current.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      if (rect.top < bounds.top)
        sidebar.current.scrollTop -= bounds.top - rect.top;
      else if (rect.bottom > bounds.bottom)
        sidebar.current.scrollTop += rect.bottom - bounds.bottom;
    }
  }, [route, user.isLoading]);
  useEffect(() => {
    if (route !== "login" && user.isError) router.replace("/admin/login");
  }, [route, user.isError, router]);
  if (route === "login") return <Login />;
  if (user.isLoading)
    return <main className="admin-loading">{t("در حال بررسی دسترسی...")}</main>;
  if (user.isError) {
    return (
      <main className="admin-loading">
        {t("برای ورود به پنل منتقل می‌شوید...")}
      </main>
    );
  }
  const resourceName =
    route === "resume" ? "experience" : route === "content" ? "heroes" : route;
  const resource = resources[resourceName];
  const isOwner =
    user.data!.data.role === "owner" || user.data!.data.is_superuser;
  async function logout() {
    await api("auth/logout/", { method: "POST" });
    client.clear();
    router.replace("/admin/login");
  }
  return (
    <div className="admin-shell" dir={locale === "fa" ? "rtl" : "ltr"}>
      <aside
        className="admin-sidebar"
        ref={sidebar}
        onScroll={(e) =>
          sessionStorage.setItem(
            "ctrlz-admin-sidebar",
            String(e.currentTarget.scrollTop),
          )
        }
      >
        <Link href="/admin" className="admin-brand">
          <Image
            src="/assets/brand/logo-clean-blue.webp"
            width={180}
            height={80}
            alt="CTRL.Z"
            priority
          />
        </Link>
        <span className="eyebrow">{t("EDITORIAL COMMAND")}</span>
        <nav aria-label={t("بخش‌های مدیریت")}>
          {adminNav.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              prefetch={false}
              aria-current={
                (
                  x.href === "/admin"
                    ? route === "dashboard"
                    : x.href.endsWith(resourceName)
                )
                  ? "page"
                  : undefined
              }
              className={
                (
                  x.href === "/admin"
                    ? route === "dashboard"
                    : x.href.endsWith(resourceName)
                )
                  ? "active"
                  : ""
              }
            >
              {t(x.label)}
            </Link>
          ))}
          <div className="admin-nav-group">
            <span>{t("محتوا")}</span>
            {[
              "heroes",
              "blocks",
              "stats",
              "socials",
              "profiles",
              "education",
              "certificates",
              "achievements",
              "resume-files",
              "skill-categories",
              "gallery",
              "users",
              "audit",
            ]
              .filter((x) => isOwner || x !== "users")
              .map((x) => (
                <Link
                  key={x}
                  href={`/admin/${x}`}
                  prefetch={false}
                  aria-current={resourceName === x ? "page" : undefined}
                  className={resourceName === x ? "active" : undefined}
                >
                  {t(resources[x].label)}
                </Link>
              ))}
          </div>
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          {t("خروج")}
        </button>
      </aside>
      <main className="admin-main">
        <div className="admin-top flex items-center justify-between">
          <span>
            <ShieldCheck size={16} /> {user.data!.data.username} ·{" "}
            {t(user.data!.data.role)}
          </span>
          <div className="admin-preferences">
            <LanguageToggle />
            <Link href="/" target="_blank">
              {t("نمایش سایت ↗")}
            </Link>
          </div>
        </div>
        {route === "dashboard" ? (
          <Dashboard />
        ) : route === "analytics" ? (
          <Analytics />
        ) : route === "resume-files" ? (
          <ResumeFiles user={user.data!.data} />
        ) : route === "settings" ? (
          <Settings user={user.data!.data} />
        ) : resource && (!resource.ownerOnly || isOwner) ? (
          <ResourcePage
            key={path}
            name={resourceName}
            resource={resource}
            user={user.data!.data}
            newMode={path.endsWith("/new")}
          />
        ) : (
          <div className="feedback">{t("صفحه یافت نشد یا دسترسی ندارید.")}</div>
        )}
      </main>
    </div>
  );
}
