import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/900.css";
import "./globals.css";
import "./editorial.css";
import "./contact.css";
import "./resume-portfolio.css";
import { preferences } from "@/i18n/server";
import { PreferencesProvider } from "@/i18n/provider";
import "./preferences.css";
import Providers from "./providers";
import { getContent } from "@/services/public";
import "./admin-upgrade.css";
import "./frame-surfaces.css";
export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await preferences();
  const en = locale === "en";
  const settings = await getContent()
    .then((content) => content.settings)
    .catch(() => null);
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default:
        settings?.tagline ||
        (en
          ? "CTRL.Z — Editing beyond a simple cut"
          : "CTRL.Z — ادیت فراتر از یک کات ساده"),
      template: "%s | CTRL.Z",
    },
    description:
      settings?.description ||
      (en
        ? "CTRL.Z portfolio of editing, color and visual storytelling"
        : "پورتفولیوی تدوین، رنگ و داستان‌گویی بصری CTRL.Z"),
    openGraph: {
      type: "website",
      locale: en ? "en_US" : "fa_IR",
      siteName: "CTRL.Z",
      images: ["/assets/brand/logo-clean-blue.webp"],
    },
    icons: {
      icon: [
        { url: "/favicon.svg?v=2", type: "image/svg+xml" },
        { url: "/favicon-32.png?v=2", sizes: "32x32" },
        { url: "/favicon-16.png?v=2", sizes: "16x16" },
      ],
      apple: "/apple-touch-icon.png?v=2",
    },
    manifest: "/site.webmanifest",
    twitter: { card: "summary_large_image" },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = await preferences();
  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
    >
      <body>
        <PreferencesProvider locale={locale}>
          <Providers>{children}</Providers>
        </PreferencesProvider>
      </body>
    </html>
  );
}
