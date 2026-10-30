"use client";
import { usePreferences, useT } from "@/i18n/provider";
import { useRef } from "react";
import { useSiteQuery as useQuery } from "@/i18n/provider";
import { Crown, Monitor, Star, Target } from "lucide-react";
import { api, errorText } from "@/lib/api";
import Progress from "@/components/motion/Progress";
import HudFrame from "@/components/hud/HudFrame";
import HudSection from "@/components/hud/HudSection";
import SoftwareIcon from "@/features/skills/SoftwareIcon";
import SpecialtyCard from "@/features/skills/SpecialtyCard";
import { getHero } from "./constants";
import type { Content, Skill } from "@/types/api";
import { Title, Reveal, useEntrance, HeroVisual } from "./components";
import StoryVisual from "./StoryVisual";

export default function Skills({ content }: { content: Content }) {
  const t = useT();
  const { locale } = usePreferences();
  const hero = getHero(content, "skills");
  const story = content.blocks?.find((block) => block.key === "skills-story");
  const mastery = content.blocks?.find(
    (block) => block.key === "skills-mastery",
  );
  const creative = content.blocks?.find(
    (block) => block.key === "skills-creative",
  );
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["skills"],
    queryFn: () => api<Skill[]>("skills/"),
  });
  const software =
    data?.data.filter((skill) => skill.kind === "software") || [];
  const specialties =
    data?.data.filter((skill) => skill.kind === "creative") || [];
  return (
    <>
      <section
        className="hero hero-inner editorial-hero skills-intro"
        ref={ref}
      >
        <div className="hero-copy">
          <Crown className="editorial-crown" aria-hidden="true" />
          <Title hero={hero} />
        </div>
        <StoryVisual
          variant="skills"
          image={
            story?.items[0]?.image ||
            "/assets/components/skills-workstation.webp"
          }
          quote={story?.body || ""}
        />
        <HeroVisual page="skills" artwork={hero.artwork} />
      </section>
      {isLoading ? (
        <p className="feedback" role="status">
          {t("در حال دریافت مهارت‌ها...")}
        </p>
      ) : isError ? (
        <p className="feedback error" role="alert">
          {t(errorText(error))}
        </p>
      ) : (
        <div className="skills-panels">
          <HudSection
            className="mastery-panel hud-surface accent-blue"
            aria-labelledby="mastery-title"
          >
            <HudFrame />
            <header className="mastery-header">
              <Monitor aria-hidden="true" />
              <div>
                <h2 id="mastery-title">
                  {mastery?.title || t("تسلط بر نرم‌افزارها")}
                </h2>
                <p>{mastery?.body || ""}</p>
              </div>
            </header>
            <div className="skill-grid">
              {software.map((skill, index) => (
                <Reveal
                  key={skill.id}
                  index={index}
                  className={`skill-card hud-surface accent-${skill.accent || "purple"}`}
                >
                  <HudFrame />
                  <SoftwareIcon
                    icon={skill.icon}
                    image={skill.icon_url}
                    title={skill.title}
                  />
                  <div className="software-card-copy">
                    <h3 dir="ltr">{skill.title}</h3>
                    <div className="software-meter">
                      <Progress level={skill.level} label={skill.title} />
                      <strong>
                        <bdi>
                          {new Intl.NumberFormat(locale, {
                            style: "percent",
                          }).format(skill.level / 100)}
                        </bdi>
                      </strong>
                    </div>
                    <p>{skill.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </HudSection>
          <HudSection
            className="specialties-panel hud-surface accent-blue"
            aria-labelledby="specialties-title"
          >
            <HudFrame />
            <header className="specialties-header">
              <Star aria-hidden="true" />
              <div>
                <h2 id="specialties-title">
                  {creative?.title || t("مهارت‌های تخصصی و خلاقانه")}
                </h2>
                <p>{creative?.body || ""}</p>
              </div>
              <Target className="specialties-target" aria-hidden="true" />
            </header>
            <div className="creative-grid">
              {specialties.map((skill, index) => (
                <SpecialtyCard key={skill.id} skill={skill} index={index} />
              ))}
            </div>
          </HudSection>
        </div>
      )}
    </>
  );
}
