"use client";
import { useT } from "@/i18n/provider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { validSocial } from "@/lib/social";
import {
  Instagram,
  Youtube,
  Send,
  Linkedin,
  Github,
  Link as LinkIcon,
} from "lucide-react";
import Nav from "@/components/navigation/Nav";
import { track } from "@/lib/analytics";
import type { Content } from "@/types/api";
export default function PublicShell({
  children,
  content,
}: {
  children: React.ReactNode;
  content: Content;
}) {
  const t = useT();
  const path = usePathname();

  useEffect(() => {
    if (
      ["/", "/about", "/portfolio", "/skills", "/resume", "/contact"].includes(
        path,
      )
    )
      track("page", path);
    else if (path.startsWith("/portfolio/"))
      track("project", decodeURIComponent(path.slice(11)));
  }, [path]);
  return (
    <div className="public-shell">
      <div className="city-layer" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />
      <Nav />
      {children}
      <footer className="site-footer">
        <span dir="ltr">
          {content.settings?.brand || "CTRL.Z"} <b>·</b>{" "}
          {t("CUT. COLOR. STORY.")}
        </span>
        {content.socials.some(validSocial) && (
          <nav className="footer-socials" aria-label={t("شبکه‌های اجتماعی")}>
            {content.socials.filter(validSocial).map((social) => {
              const Icon =
                (
                  {
                    instagram: Instagram,
                    youtube: Youtube,
                    telegram: Send,
                    linkedin: Linkedin,
                    github: Github,
                  } as const
                )[social.platform as "instagram"] || LinkIcon;
              return (
                <a
                  key={social.id}
                  href={social.href || social.url}
                  onClick={() => track("social", social.platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <Icon size={19} aria-hidden="true" />
                  <bdi>{social.label}</bdi>
                </a>
              );
            })}
          </nav>
        )}
        <span>© {new Date().getFullYear()} CTRL.Z</span>
        <small>{t("footer.credit")}</small>
      </footer>
    </div>
  );
}
