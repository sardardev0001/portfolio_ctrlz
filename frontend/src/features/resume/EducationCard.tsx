"use client";
import { useT } from "@/i18n/provider";
import { useId, useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import HudFrame from "@/components/hud/HudFrame";
import { hudItem, useHudMotion } from "@/components/hud/useHudMotion";
import type { Education } from "@/types/api";

export function educationDates(education: Education) {
  if (!education.start_year && !education.end_year)
    return education.years || (education.is_current ? "اکنون" : "");
  return `${education.start_year || "—"} — ${education.is_current || !education.end_year ? "اکنون" : education.end_year}`;
}

export default function EducationCard({ education }: { education: Education }) {
  const t = useT();
  const titleId = useId();
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLElement>();
  const [failedSource, setFailedSource] = useState("");
  const image = education.image_url || education.image;
  const imageAvailable = image && failedSource !== image;
  const accent = ["red", "blue", "gold"].includes(education.accent)
    ? education.accent
    : "red";
  return (
    <motion.article
      ref={ref}
      {...interaction}
      className={`education-card hud-surface accent-${accent}`}
      aria-labelledby={titleId}
      initial={reduced ? false : { opacity: 0, y: 20, scale: 0.985 }}
      animate={
        entered || reduced
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 20, scale: 0.985 }
      }
      transition={{ duration: reduced ? 0 : 0.5 }}
    >
      <HudFrame />
      <motion.div
        className="education-content"
        initial="hidden"
        animate={entered || reduced ? "visible" : "hidden"}
        transition={{ staggerChildren: reduced ? 0 : 0.08 }}
      >
        <motion.header className="education-header" variants={hudItem}>
          <Image
            src="/assets/components/graduation-cap.webp"
            width={66}
            height={58}
            alt=""
            className="education-cap"
          />
          <div>
            <h2 id={titleId}>{t("تحصیلات")}</h2>
            <p>{t("آموزش‌های دانشگاهی و آکادمیک")}</p>
          </div>
        </motion.header>
        <motion.div
          className="education-divider"
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: entered || reduced ? 1 : 0 }}
          transition={{
            duration: reduced ? 0 : 0.65,
            delay: reduced ? 0 : 0.12,
          }}
        />
        <div className="education-grid">
          <motion.div variants={hudItem} className="education-date">
            <span dir="ltr">
              {t(educationDates(education)).replace("اکنون", t("اکنون"))}
            </span>
          </motion.div>
          <motion.div variants={hudItem} className="education-details">
            <h3>
              {education.degree}
              {education.field && <span> {education.field}</span>}
            </h3>
            <p className="education-institution">{education.institution}</p>
            {education.description && (
              <p className="education-description">
                <motion.i
                  aria-hidden="true"
                  initial={reduced ? false : { scale: 0, rotate: 45 }}
                  animate={{
                    scale:
                      entered || reduced ? (reduced ? 1 : [0, 1, 1.14, 1]) : 0,
                    rotate: 45,
                  }}
                  transition={{
                    duration: reduced ? 0 : 0.65,
                    delay: reduced ? 0 : 0.35,
                  }}
                />
                {education.description}
              </p>
            )}
          </motion.div>
          <motion.div variants={hudItem} className="education-image-frame">
            <div className="education-image-parallax">
              {imageAvailable ? (
                <Image
                  src={image}
                  unoptimized={
                    image.startsWith("https://") || image.startsWith("/api/")
                  }
                  alt={
                    education.image_alt ||
                    t("نمای ") + education.institution + t("")
                  }
                  fill
                  sizes="(max-width: 760px) 85vw, (max-width: 1200px) 38vw, 20vw"
                  onError={() => setFailedSource(image)}
                />
              ) : (
                <div
                  className="education-image-fallback"
                  role="img"
                  aria-label={t("تصویر دانشگاه در دسترس نیست")}
                >
                  <GraduationCap size={46} />
                  <span>{t("مسیر یادگیری")}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        <svg
          className="education-signature"
          viewBox="0 0 180 35"
          aria-hidden="true"
        >
          <motion.path
            d="M5 25L13 11L20 26L31 4L30 27Q45 15 47 23Q49 31 63 22Q89 31 175 12M5 32Q65 34 147 25"
            fill="none"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: entered || reduced ? 1 : 0 }}
            transition={{
              duration: reduced ? 0 : 0.85,
              delay: reduced ? 0 : 0.45,
            }}
          />
        </svg>
      </motion.div>
    </motion.article>
  );
}
