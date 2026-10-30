"use client";
import { useT } from "@/i18n/provider";

import { useRef } from "react";
import type { Content } from "@/types/api";
import ContactMessageForm from "@/features/contact/ContactMessageForm";
import SocialContactCard from "@/features/contact/SocialContactCard";
import { getHero } from "./constants";
import { HeroVisual, Title, useEntrance } from "./components";

const contactPlatforms = new Set(["email", "telegram", "instagram", "youtube"]);

export default function Contact({ content }: { content: Content }) {
  const t = useT();
  const hero = getHero(content, "contact");
  const formBlock = content.blocks.find(
    (block) => block.key === "contact-form",
  );
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  return (
    <section className="contact-composition" ref={ref}>
      <section className="hero hero-inner hero-contact">
        <div className="hero-copy">
          <span className="eyebrow">{t("بیایید اثری عالی بسازیم")}</span>
          <Title hero={hero} />
        </div>
        <HeroVisual page="contact" artwork={hero.artwork} />
      </section>
      <section
        className="contact-layout"
        aria-label={t("راه‌های تماس و ارسال پیام")}
      >
        <ContactMessageForm
          title={formBlock?.title || t("ارسال پیام")}
          description={
            formBlock?.body ||
            t("فرم زیر را تکمیل کنید تا با شما در ارتباط باشم.")
          }
        />
        <div className="social-stack" aria-label={t("راه‌های ارتباطی")}>
          {content.socials
            .filter((social) => contactPlatforms.has(social.platform))
            .map((social) => (
              <SocialContactCard key={social.id} social={social} />
            ))}
        </div>
      </section>
    </section>
  );
}
