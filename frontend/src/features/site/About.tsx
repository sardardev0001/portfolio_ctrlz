"use client";
import { useT } from "@/i18n/provider";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useSiteQuery as useQuery } from "@/i18n/provider";
import {
  Camera,
  Crown,
  Film,
  Gamepad2,
  Infinity,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import Counter from "@/components/motion/Counter";
import HudFrame from "@/components/hud/HudFrame";
import HudSection from "@/components/hud/HudSection";
import SoftwareIcon from "@/features/skills/SoftwareIcon";
import { api, errorText } from "@/lib/api";
import { getHero } from "./constants";
import type { Content, Skill } from "@/types/api";
import { Title, Reveal, useEntrance, HeroVisual } from "./components";
import StoryVisual from "./StoryVisual";

const featureIcons = {
  experience: Sparkles,
  interests: Gamepad2,
  goal: Target,
};
const statIcons = [Camera, Users, Star, Infinity];

export default function About({ content }: { content: Content }) {
  const t = useT();
  const hero = getHero(content, "about");
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  const cards = content.blocks?.find((block) => block.key === "about-cards");
  const styles = content.blocks?.find((block) => block.key === "about-styles");
  const story = content.blocks?.find((block) => block.key === "about-story");
  const toolbox = content.blocks?.find((block) => block.key === "about-tools");
  const { data, error } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api<Skill[]>("skills/"),
  });
  return (
    <>
      <section className="hero hero-inner editorial-hero about-intro" ref={ref}>
        <div className="hero-copy">
          <Crown className="editorial-crown" aria-hidden="true" />
          <Title hero={{ ...hero, body: content.profile.bio || hero.body }} />
        </div>
        <StoryVisual
          variant="about"
          image={
            story?.items[0]?.image || "/assets/decor/about-film-frame.webp"
          }
          quote={story?.body || ""}
        />
        <HeroVisual page="about" artwork={hero.artwork} />
      </section>
      <div className="about-middle">
        <section
          className="about-features"
          aria-label={cards?.title || t("ویژگی‌ها")}
        >
          {(cards?.items || []).map((item, i) => {
            const Icon =
              featureIcons[item.icon as keyof typeof featureIcons] ||
              [Sparkles, Gamepad2, Target][i % 3];
            const accent = ["blue", "red", "gold"].includes(item.accent || "")
              ? item.accent
              : ["blue", "red", "gold"][i % 3];
            return (
              <Reveal
                key={`${i}-${item.title}`}
                index={i}
                className={`info-card about-feature hud-surface accent-${accent}`}
              >
                <HudFrame />
                <Icon size={33} aria-hidden="true" />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </section>
        <HudSection
          className="about-stats hud-surface accent-blue"
          aria-label={t("آمار فعالیت")}
        >
          <HudFrame />
          {content.stats.map((stat, i) => {
            const Icon = statIcons[i % statIcons.length];
            return (
              <div key={stat.id}>
                <Icon aria-hidden="true" />
                <div>
                  <Counter value={stat.value} />
                  <span>{stat.label}</span>
                </div>
              </div>
            );
          })}
        </HudSection>
      </div>
      <div className="about-lower">
        <section className="about-tools" aria-labelledby="about-tools-title">
          <h2 id="about-tools-title">
            {toolbox?.title || t("ابزارهای اصلی من")}
          </h2>
          {error ? (
            <p className="feedback error">{t(errorText(error))}</p>
          ) : (
            <div className="about-tool-row">
              {data?.data
                .filter((skill) => skill.kind === "software")
                .map((skill) => (
                  <div key={skill.id}>
                    <SoftwareIcon
                      icon={skill.icon}
                      image={skill.icon_url}
                      title={skill.title}
                      size={86}
                    />
                    <span dir="ltr">{skill.title}</span>
                  </div>
                ))}
            </div>
          )}
          {toolbox?.body && (
            <blockquote className="about-signoff">{toolbox.body}</blockquote>
          )}
        </section>
        <section
          className="about-work-styles"
          aria-labelledby="about-styles-title"
        >
          <h2 id="about-styles-title">{styles?.title}</h2>
          <div className="about-style-grid">
            {(styles?.items || []).map((item, i) => (
              <Reveal
                key={`${i}-${item.title}`}
                index={i}
                className={`style-card about-style-card hud-surface accent-${["blue", "cyan", "purple", "blue", "red"][i % 5]}`}
              >
                <HudFrame />
                <Link
                  className="style-link"
                  href={`/portfolio?category=${encodeURIComponent(item.category_slug || "unconfigured")}`}
                  aria-label={item.title}
                >
                  <div className="about-style-image">
                    <Image
                      src={
                        item.image ||
                        `/assets/portfolio/project-${String(i + 1).padStart(2, "0")}.webp`
                      }
                      alt={item.imageAlt || ""}
                      unoptimized={Boolean(item.image?.startsWith("https://"))}
                      fill
                      sizes="(max-width: 600px) 90vw, (max-width: 1100px) 28vw, 13vw"
                    />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
      <Film className="about-film-decoration" aria-hidden="true" />
    </>
  );
}
