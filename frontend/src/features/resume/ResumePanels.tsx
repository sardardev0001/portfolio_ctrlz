"use client";
import { usePreferences, useT } from "@/i18n/provider";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpLeft, Film, Play, Star, Users, Wrench } from "lucide-react";
import HudFrame from "@/components/hud/HudFrame";
import SafeRichText from "@/components/ui/SafeRichText";
import { useHudMotion } from "@/components/hud/useHudMotion";
import SoftwareIcon from "@/features/skills/SoftwareIcon";
import { useHydrated } from "@/lib/use-hydrated";
import type { PageBlock, Resume, Skill } from "@/types/api";

type PanelTitle = Pick<PageBlock, "title" | "body"> | undefined;

function Panel({
  title,
  subtitle,
  accent,
  icon,
  className = "",
  children,
}: {
  title: string;
  subtitle: string;
  accent: "blue" | "gold" | "red";
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLElement>();
  return (
    <motion.section
      ref={ref}
      {...interaction}
      className={`resume-hud hud-surface accent-${accent} ${className}`}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={
        entered || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
      }
      transition={{ duration: reduced ? 0 : 0.46 }}
      data-entered={entered || reduced}
      aria-label={title}
    >
      <HudFrame />
      <header className="resume-hud-head">
        <span className="resume-hud-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="resume-hud-divider" aria-hidden="true" />
      {children}
    </motion.section>
  );
}

function SafeImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  const t = useT();
  const [failed, setFailed] = useState("");
  return src && failed !== src ? (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={src.startsWith("/api/") || src.startsWith("https://")}
      onError={() => setFailed(src)}
    />
  ) : (
    <span
      className="resume-image-fallback"
      role="img"
      aria-label={t("تصویر در دسترس نیست")}
    >
      <Film aria-hidden="true" />
    </span>
  );
}

export function WorkExperiencePanel({
  items,
  heading,
}: {
  items: Resume["experience"];
  heading?: PanelTitle;
}) {
  const t = useT();
  if (!items.length) return null;
  return (
    <Panel
      title={heading?.title || t("تجربه‌های کاری")}
      subtitle={
        heading?.body || t("مسیر حرفه‌ای من در دنیای تدوین و تولید محتوا")
      }
      accent="blue"
      className="experience-panel"
      icon={
        <Image
          src="/assets/components/experience-briefcase.webp"
          width={67}
          height={62}
          alt=""
        />
      }
    >
      <ol className="experience-list">
        {items.map((item, index) => {
          const accent = ["gold", "blue", "cyan", "red"].includes(item.accent)
            ? item.accent
            : item.is_current
              ? "gold"
              : "blue";
          const date =
            t("") +
            item.start +
            t("") +
            (item.is_current
              ? " — " + t("اکنون")
              : item.end
                ? ` — ${item.end}`
                : "") +
            t("");
          return (
            <li
              key={item.id}
              className={`experience-row row-${accent}`}
              style={{ "--row-index": index } as CSSProperties}
            >
              <span className="experience-date" dir="ltr">
                {date}
              </span>
              <span className="experience-node" aria-hidden="true" />
              <div className="experience-copy">
                <h3>{item.title}</h3>
                {item.company && <strong>{item.company}</strong>}
                {(item.employment_type ||
                  item.workplace_type ||
                  item.location) && (
                  <div className="experience-meta">
                    {[item.employment_type, item.workplace_type, item.location]
                      .filter((part): part is string => Boolean(part))
                      .map((part) => (
                        <span key={part}>{t(part)}</span>
                      ))}
                  </div>
                )}
                {item.description && <SafeRichText text={item.description} />}
                {(
                  [
                    ["مسئولیت‌ها", item.responsibilities],
                    ["دستاوردها", item.achievements],
                    ["پروژه‌ها", item.projects],
                    ["فناوری‌ها", item.technologies],
                  ] as const
                ).map(
                  ([label, values]) =>
                    Array.isArray(values) &&
                    values.length > 0 && (
                      <div className="experience-details" key={label}>
                        <b>{t(label)}</b>
                        <ul>
                          {values.map((value, i) => (
                            <li key={`${i}:${value}`}>{value}</li>
                          ))}
                        </ul>
                      </div>
                    ),
                )}
                {Array.isArray(item.links) && item.links.length > 0 && (
                  <div className="experience-links">
                    {item.links.map((link, i) => (
                      <a
                        key={`${i}:${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="experience-image">
                <SafeImage
                  src={item.image_url || item.image}
                  alt={item.image_alt || t("تصویر ") + item.title + t("")}
                  sizes="(max-width: 700px) 85vw, (max-width: 1150px) 25vw, 20vw"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export function CoursesCertificatesPanel({
  items,
  heading,
}: {
  items: Resume["certificates"];
  heading?: PanelTitle;
}) {
  const t = useT();
  if (!items.length) return null;
  return (
    <Panel
      title={heading?.title || t("دوره‌ها و گواهینامه‌ها")}
      subtitle={heading?.body || t("مهارت‌های تخصصی و دوره‌های معتبر")}
      accent="gold"
      className="courses-panel"
      icon={
        <Image
          src="/assets/components/certificate-medal.webp"
          width={65}
          height={68}
          alt=""
        />
      }
    >
      <ol className="courses-list">
        {items.map((item, index) => {
          const link = item.certificate_url || item.verification_url;
          return (
            <li
              key={item.id}
              className="course-row"
              style={{ "--row-index": index } as CSSProperties}
            >
              <span className="course-icon">
                <SoftwareIcon
                  icon={item.icon}
                  image={item.icon_url}
                  title={item.title}
                  size={59}
                />
              </span>
              <div className="course-copy">
                <h3>{item.title}</h3>
                {item.issuer && <p>{item.issuer}</p>}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("مشاهده گواهینامه ") + item.title + t("")}
                  >
                    {t("مشاهده گواهینامه")}{" "}
                    <ArrowUpLeft size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
              <span className="course-node" aria-hidden="true" />
              <time className="course-year" dir="ltr">
                {item.year}
              </time>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function AchievementNumber({ item }: { item: Resume["achievements"][number] }) {
  const { locale } = usePreferences();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const value =
    item.numeric_value ??
    Number.parseInt(item.value.replace(/[^0-9]/g, ""), 10);
  const hasNumber = Number.isFinite(value);
  const prefix =
    item.numeric_value === null
      ? item.value.startsWith("+")
        ? "+"
        : ""
      : item.prefix;
  const suffix =
    item.numeric_value === null
      ? item.value.replace(/^[^0-9]*[0-9]+/, "")
      : item.suffix;
  const [count, setCount] = useState(0);
  const prefersReduced = useReducedMotion();
  const reduced = useHydrated() && Boolean(prefersReduced);
  useEffect(() => {
    if (!seen || reduced || !hasNumber) return;
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (n) => setCount(Math.round(n)),
    });
    return () => controls.stop();
  }, [seen, reduced, hasNumber, value]);
  return (
    <strong
      ref={ref}
      className="achievement-value"
      dir="ltr"
      aria-label={item.value}
    >
      {hasNumber
        ? `${prefix}${new Intl.NumberFormat(locale).format(reduced || !seen ? value : count)}${suffix}`
        : item.value}
    </strong>
  );
}

export function AchievementsPanel({
  items,
  heading,
}: {
  items: Resume["achievements"];
  heading?: PanelTitle;
}) {
  const t = useT();
  if (!items.length) return null;
  const icons = { play: Play, users: Users, star: Star };
  return (
    <Panel
      title={heading?.title || t("دستاوردها")}
      subtitle={heading?.body || t("چند مورد از افتخارات و موفقیت‌های من")}
      accent="blue"
      className="achievements-panel"
      icon={
        <Image
          src="/assets/components/achievement-trophy.webp"
          width={66}
          height={66}
          alt=""
        />
      }
    >
      <ol className="achievement-list">
        {items.map((item, index) => {
          const Icon =
            icons[item.icon as keyof typeof icons] ||
            [Play, Users, Star][index % 3];
          return (
            <li
              key={item.id}
              className="achievement-row"
              style={{ "--row-index": index } as CSSProperties}
            >
              <Icon aria-hidden="true" />
              <AchievementNumber item={item} />
              <span>
                {item.description && item.description !== "آمار نمایشی اولیه"
                  ? item.description
                  : item.title}
              </span>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export function ResumeSkillsPanel({
  items,
  heading,
}: {
  items: Skill[];
  heading?: PanelTitle;
}) {
  const t = useT();
  if (!items.length) return null;
  return (
    <Panel
      title={heading?.title || t("مهارت‌ها")}
      subtitle={heading?.body || t("ابزارها و مهارت‌های تخصصی من")}
      accent="blue"
      className="resume-skills-panel"
      icon={<Wrench size={58} strokeWidth={1.7} />}
    >
      <ol className="resume-skill-list">
        {items.map((item, index) => {
          const level = Math.max(0, Math.min(100, item.level));
          const label =
            item.level_label ||
            (level <= 30
              ? t("مقدماتی")
              : level <= 70
                ? t("متوسط")
                : t("پیشرفته"));
          return (
            <li
              key={item.id}
              className={`resume-skill-item software-${item.icon.toLowerCase()}`}
              style={{ "--row-index": index } as CSSProperties}
            >
              <SoftwareIcon
                icon={item.icon}
                image={item.icon_url}
                title={item.title}
                size={82}
              />
              <h3 dir="ltr">{item.title}</h3>
              <div
                className="resume-skill-bar"
                role="progressbar"
                aria-label={t("سطح ") + item.title + t(": ") + label + t("")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={level}
              >
                {Array.from({ length: 7 }, (_, i) => (
                  <i
                    key={i}
                    className={
                      i < Math.round((level * 7) / 100) ? "filled" : ""
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>
              <strong>{label}</strong>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export function ResumeAboutPanel({
  block,
  bio,
}: {
  block?: PageBlock;
  bio: string;
}) {
  const t = useT();
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLElement>();
  if (!block) return null;
  const left =
    block.image_url ||
    block.items.find((item) => item.image)?.image ||
    "/assets/components/resume-about-back.webp";
  const right =
    block.secondary_image_url ||
    block.items.filter((item) => item.image)[1]?.image ||
    "";
  return (
    <motion.section
      ref={ref}
      {...interaction}
      className="resume-about hud-surface accent-red"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={
        entered || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
      }
      transition={{ duration: reduced ? 0 : 0.55 }}
      data-entered={entered || reduced}
      aria-label={block.title || t("درباره من")}
    >
      <HudFrame />
      {left && (
        <div
          className="resume-about-visual resume-about-left"
          aria-hidden="true"
        >
          <SafeImage src={left} alt="" sizes="(max-width: 700px) 80vw, 23vw" />
        </div>
      )}
      <div className="resume-about-content">
        <header>
          <span className="resume-about-heart" aria-hidden="true">
            ♥
          </span>
          <div>
            <h2>{block.title || t("درباره من")}</h2>
            <p>
              {block.subtitle ||
                block.items.find((item) => !item.image)?.title ||
                t("داستان کوتاهی از مسیر من")}
            </p>
          </div>
        </header>
        <SafeRichText text={block.body || bio} />
        <Link href="/contact">
          {t("شروع همکاری")}
          <ArrowUpLeft size={17} aria-hidden="true" />
        </Link>
      </div>
      {right && (
        <div
          className="resume-about-visual resume-about-right"
          aria-hidden="true"
        >
          <SafeImage src={right} alt="" sizes="(max-width: 700px) 80vw, 23vw" />
        </div>
      )}
    </motion.section>
  );
}
