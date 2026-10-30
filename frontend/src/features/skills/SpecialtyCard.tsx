"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { Headphones, Clapperboard, Film, Orbit, Play, Zap } from "lucide-react";
import HudFrame from "@/components/hud/HudFrame";
import SegmentedProgress from "@/components/hud/SegmentedProgress";
import { hudItem, useHudMotion } from "@/components/hud/useHudMotion";
import type { Skill } from "@/types/api";

export type SpecialtyCardProps = { skill: Skill; index?: number };
const icons = {
  blue: Film,
  cyan: Orbit,
  gold: Orbit,
  red: Play,
  purple: Clapperboard,
  orange: Zap,
};
function LayerImage({ src, className }: { src: string; className: string }) {
  return (
    <div className={className}>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 600px) 85vw, (max-width: 1100px) 43vw, 29vw"
        unoptimized={src.startsWith("https://") || src.startsWith("/api/")}
      />
    </div>
  );
}

export default function SpecialtyCard({
  skill,
  index = 0,
}: SpecialtyCardProps) {
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLElement>();
  const accent =
    skill.accent in icons ? (skill.accent as keyof typeof icons) : "blue";
  const grading = skill.variant === "color-grading";
  const sound = skill.icon === "sound" || skill.icon === "sound-wave";
  const Icon = sound ? Headphones : icons[accent];
  return (
    <motion.article
      ref={ref}
      {...interaction}
      data-entered={entered || reduced}
      className={`creative-card specialty-card hud-surface accent-${accent}${grading ? " color-grading-card" : ""}${sound ? " sound-design-card" : ""}`}
      aria-label={skill.title}
      initial={reduced ? false : "hidden"}
      animate={entered || reduced ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduced ? 0 : 0.45,
            delay: reduced ? 0 : (index % 3) * 0.07,
            staggerChildren: reduced ? 0 : 0.06,
          },
        },
      }}
    >
      <HudFrame />
      <motion.div
        className="specialty-visual"
        variants={hudItem}
        aria-hidden="true"
      >
        {grading ? (
          <>
            <LayerImage
              className="grading-main parallax-art"
              src={
                skill.artwork_url ||
                skill.artwork ||
                "/assets/components/grading-workstation.webp"
              }
            />
            <motion.div
              className="grading-scopes scope-scan"
              variants={hudItem}
            >
              <Image
                src="/assets/components/grading-scopes.webp"
                alt=""
                fill
                sizes="100px"
              />
            </motion.div>
            <motion.div className="grading-wheel" variants={hudItem}>
              <Image
                src="/assets/components/color-wheel.webp"
                alt=""
                width={54}
                height={54}
              />
            </motion.div>
            <motion.div className="grading-filmstrip" variants={hudItem}>
              <Image
                src="/assets/components/grading-filmstrip.webp"
                alt=""
                fill
                sizes="28px"
              />
            </motion.div>
            <div className="grading-previews">
              <Image
                src="/assets/components/grading-sunset.webp"
                alt=""
                width={72}
                height={36}
              />
              <Image
                src="/assets/components/grading-blue.webp"
                alt=""
                width={72}
                height={36}
              />
            </div>
          </>
        ) : sound ? (
          <>
            <LayerImage
              className="sound-editor"
              src={
                skill.artwork_url ||
                skill.artwork ||
                "/assets/components/sound-wave.webp"
              }
            />
            <LayerImage
              className="sound-headphones parallax-art"
              src="/assets/components/sound-headphones.webp"
            />
            <svg
              className="sound-entry-wave"
              viewBox="0 0 220 60"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                pathLength="1"
                d="M0 30H20L23 24L26 36L30 15L34 46L39 27L43 33L48 4L53 55L58 19L63 41L69 28L75 32L83 15L89 44L95 27L102 33L111 8L118 51L125 25L132 36L141 19L147 41L153 28L160 31L168 22L174 38L180 29H220"
              />
            </svg>
          </>
        ) : (
          <LayerImage
            className="specialty-main parallax-art"
            src={
              skill.artwork_url ||
              skill.artwork ||
              "/assets/decor/editing-studio.webp"
            }
          />
        )}
      </motion.div>
      <motion.div
        className="specialty-badge"
        variants={hudItem}
        aria-hidden="true"
      >
        {grading || skill.icon_url ? (
          <Image
            src={skill.icon_url || "/assets/components/grading-badge.webp"}
            alt=""
            width={42}
            height={42}
            unoptimized={Boolean(skill.icon_url)}
          />
        ) : (
          <Icon size={27} />
        )}
      </motion.div>
      <motion.div className="specialty-text" variants={hudItem}>
        <h3>{skill.title}</h3>
        <p>{skill.description}</p>
      </motion.div>
      <SegmentedProgress
        value={skill.level}
        label={skill.title}
        entered={entered}
        reduced={reduced}
      />
    </motion.article>
  );
}
