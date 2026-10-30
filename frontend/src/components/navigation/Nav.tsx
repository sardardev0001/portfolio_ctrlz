"use client";

import { LanguageToggle, usePreferences, useT } from "@/i18n/provider";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  FileText,
  House,
  Mail,
  UserRound,
} from "lucide-react";
import { useReducedMotionPreference } from "@/components/motion/useReducedMotionPreference";

const links = [
  { href: "/", label: "خانه", Icon: House },
  { href: "/about", label: "درباره من", Icon: UserRound },
  { href: "/portfolio", label: "نمونه‌کارها", Icon: BriefcaseBusiness },
  { href: "/skills", label: "مهارت‌ها", Icon: ChartNoAxesColumnIncreasing },
  { href: "/resume", label: "رزومه", Icon: FileText },
  { href: "/contact", label: "تماس", Icon: Mail },
] as const;

export default function Nav() {
  const t = useT();
  const { locale } = usePreferences();
  const path = usePathname();
  const reduced = useReducedMotionPreference();
  const active = (href: string) =>
    path === href || (href === "/portfolio" && path.startsWith("/portfolio/"));
  return (
    <>
      <header className="site-header">
        <LanguageToggle />
        <Link href="/" className="brand-logo" aria-label={t("CTRL.Z — خانه")}>
          <Image
            src="/assets/brand/logo-clean-blue.webp"
            width={280}
            height={124}
            alt="CTRL.Z"
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label={t("ناوبری اصلی")}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active(href) ? "active" : ""}`}
              aria-current={active(href) ? "page" : undefined}
            >
              {active(href) && (
                <motion.span
                  layoutId="nav-active"
                  className="nav-active"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 330, damping: 28 }
                  }
                />
              )}
              <span>{t(label)}</span>
            </Link>
          ))}
        </nav>
      </header>
      <nav
        className="mobile-dock"
        aria-label={t("ناوبری موبایل")}
        dir={locale === "fa" ? "rtl" : "ltr"}
      >
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`mobile-dock-link ${active(href) ? "is-active" : ""}`}
            aria-current={active(href) ? "page" : undefined}
          >
            {active(href) && (
              <motion.span
                className="mobile-dock-active"
                layoutId="mobile-dock-active"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 360, damping: 30 }
                }
              />
            )}
            <Icon size={20} strokeWidth={2} aria-hidden="true" />
            <span>{t(label)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
