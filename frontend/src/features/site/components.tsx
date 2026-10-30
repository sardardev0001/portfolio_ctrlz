"use client";
import { useT } from "@/i18n/provider";
import Image from "next/image";
import { usePreferences } from "@/i18n/provider";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { useReducedMotionPreference } from "@/components/motion/useReducedMotionPreference";
import type { Hero } from "@/types/api";
import AnimatedTypewriterText from "@/components/motion/AnimatedTypewriterText";
import SafeRichText from "@/components/ui/SafeRichText";
import { art, type PageKey } from "./constants";
export function Title({
  hero,
  animated = false,
}: {
  hero: Hero;
  animated?: boolean;
}) {
  const t = useT();
  const { locale } = usePreferences();
  const value = t(hero.highlight);
  const parts = value ? t(hero.title).split(value) : [t(hero.title)];
  return (
    <>
      <h1>
        {animated ? (
          <AnimatedTypewriterText
            key={`${locale}:${hero.title}`}
            text={t(hero.title)}
            locale={locale}
            highlight={value}
            enabled={hero.typewriter_enabled !== false}
            typingMs={hero.typewriter_speed_ms ?? 70}
            deletingMs={hero.typewriter_delete_ms ?? 45}
            holdMs={hero.typewriter_hold_ms ?? 5000}
          />
        ) : value && parts.length > 1 ? (
          <>
            {parts[0]}
            <em>{value}</em>
            {parts.slice(1).join(value)}
          </>
        ) : (
          t(hero.title)
        )}
      </h1>
      <div className="hero-subtitle">{t(hero.subtitle)}</div>
      <SafeRichText text={t(hero.body)} className="hero-body" />
    </>
  );
}
export function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <span className="section-line" />
    </div>
  );
}
export function Reveal({
  children,
  className = "",
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  const reduced = useReducedMotionPreference();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduced ? 0 : 0.46,
        delay: reduced ? 0 : (index % 3) * 0.07,
      }}
    >
      {children}
    </motion.div>
  );
}
export function useEntrance(ref: React.RefObject<HTMLElement | null>) {
  const { locale } = usePreferences();
  useEffect(() => {
    if (
      !ref.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-visual",
        { opacity: 0, x: locale === "fa" ? -65 : 65, scale: 0.93 },
        { opacity: 1, x: 0, scale: 1, duration: 1.1, ease: "back.out(1.1)" },
      );
      gsap.fromTo(
        ".hero-copy > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, delay: 0.1 },
      );
      gsap.to(".hero-visual", {
        y: -30,
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [ref, locale]);
}
export function HeroVisual({
  page,
  artwork,
}: {
  page: PageKey;
  artwork?: string;
}) {
  const source = artwork || art[page];
  return (
    <div className={`hero-visual hero-visual-${page}`} aria-hidden="true">
      <Image
        src={source}
        unoptimized={source.startsWith("https://")}
        alt=""
        fill
        loading="eager"
        sizes="(max-width: 760px) 100vw, 55vw"
        className="character-image"
      />
      <span className="hero-light" />
    </div>
  );
}
