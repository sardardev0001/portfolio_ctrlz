"use client";
import { useT } from "@/i18n/provider";
import Image from "next/image";
import { motion } from "motion/react";
import { useHudMotion } from "@/components/hud/useHudMotion";

export default function StoryVisual({
  image,
  quote,
  variant,
}: {
  image: string;
  quote: string;
  variant: "about" | "skills";
}) {
  const t = useT();
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLDivElement>();
  return (
    <div
      ref={ref}
      {...interaction}
      className={`story-visual story-visual-${variant}`}
    >
      <div className="story-image parallax-art">
        <Image
          src={image}
          alt={t("نمای سینمایی تدوینگر در برابر مانیتورهای تدوین")}
          fill
          sizes="(max-width: 760px) 90vw, 34vw"
          unoptimized={image.startsWith("https://")}
          loading="eager"
        />
      </div>
      <motion.blockquote
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: entered || reduced ? 1 : 0, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.3 }}
      >
        {quote}
        <svg viewBox="0 0 270 38" aria-hidden="true">
          <motion.path
            d="M8 20Q96 -4 238 12Q260 17 216 22L160 29Q204 20 258 32M218 8L219 1L231 7L239 0L244 10"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: entered || reduced ? 1 : 0 }}
            transition={{
              duration: reduced ? 0 : 0.8,
              delay: reduced ? 0 : 0.4,
            }}
          />
        </svg>
      </motion.blockquote>
    </div>
  );
}
