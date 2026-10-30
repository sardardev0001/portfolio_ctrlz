"use client";
import { usePreferences, useT } from "@/i18n/provider";

import type { Social } from "@/types/api";
import { useHudMotion } from "@/components/hud/useHudMotion";
import ContactHudFrame from "./ContactHudFrame";
import { track } from "@/lib/analytics";

type ContactPlatform = "email" | "telegram" | "instagram" | "youtube";
const accessibleAction: Record<ContactPlatform, string> = {
  email: "ارسال ایمیل",
  telegram: "ارتباط در تلگرام",
  instagram: "مشاهده صفحه اینستاگرام",
  youtube: "مشاهده کانال یوتیوب",
};

function PlatformIcon({ platform }: { platform: ContactPlatform }) {
  return (
    <svg
      className="contact-platform-icon"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {platform === "email" && (
        <>
          <rect x="11" y="24" width="78" height="54" rx="5" />
          <path d="M13 30 50 57 87 30M13 72 39 51M87 72 61 51" />
          <path className="icon-hotspot" d="M17 29H83" />
        </>
      )}
      {platform === "telegram" && (
        <>
          <path d="M10 47 90 14 73 86 52 68 40 83 41 59 10 47Z" />
          <path d="M41 59 90 14 52 68M41 59 52 68" />
          <path className="icon-hotspot" d="M13 46 85 17" />
        </>
      )}
      {platform === "instagram" && (
        <>
          <rect x="15" y="15" width="70" height="70" rx="17" />
          <circle className="contact-icon-lens" cx="50" cy="50" r="17" />
          <circle className="contact-icon-dot" cx="72" cy="29" r="4" />
          <path className="icon-hotspot" d="M21 40V33Q21 21 33 21H52" />
        </>
      )}
      {platform === "youtube" && (
        <>
          <rect x="9" y="24" width="82" height="52" rx="14" />
          <path className="contact-icon-play" d="M43 36 66 50 43 64Z" />
          <path className="icon-hotspot" d="M23 29H76" />
        </>
      )}
    </svg>
  );
}

export default function SocialContactCard({ social }: { social: Social }) {
  const t = useT();
  const { locale } = usePreferences();
  const platform = social.platform as ContactPlatform;
  const { ref, entered, interaction } = useHudMotion<HTMLElement>();
  if (!social.href || !social.display_value) return null;
  const external = platform !== "email";
  return (
    <article
      ref={ref}
      {...interaction}
      className={`contact-method contact-method-${platform}`}
      data-entered={entered}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <span className="contact-method-texture" aria-hidden="true" />
      <span className="contact-method-ambient" aria-hidden="true" />
      <ContactHudFrame mode="card" />
      <span className="contact-method-icon parallax-art" aria-hidden="true">
        <PlatformIcon platform={platform} />
      </span>
      <div
        className="contact-method-copy"
        dir={locale === "fa" ? "rtl" : "ltr"}
      >
        <h2>{social.label}</h2>
        <a
          className="contact-method-value"
          href={social.href}
          onClick={() => {
            if (social.verified) track("social", social.platform);
          }}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          dir="ltr"
        >
          {social.display_value}
        </a>
        {social.description && <p>{social.description}</p>}
      </div>
      <a
        className="contact-method-action parallax-art"
        href={social.href}
        onClick={() => {
          if (social.verified) track("social", social.platform);
        }}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={`${t(accessibleAction[platform])} ${social.label}`}
      >
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="m17 11 9 9-9 9" />
        </svg>
      </a>
    </article>
  );
}
