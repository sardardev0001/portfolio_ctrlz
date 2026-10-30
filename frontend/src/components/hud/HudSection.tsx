"use client";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useHudMotion } from "./useHudMotion";

/** Shared viewport entrance and interaction budget for large editorial panels. */
export default function HudSection({
  children,
  ...props
}: {
  children: ReactNode;
  className: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLElement>();
  return (
    <motion.section
      {...props}
      ref={ref}
      {...interaction}
      initial={{ opacity: 0, y: 14 }}
      animate={
        entered || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
      }
      transition={{ duration: reduced ? 0 : 0.46 }}
    >
      {children}
    </motion.section>
  );
}
