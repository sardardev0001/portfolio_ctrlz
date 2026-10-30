"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
export default function Progress({
  level,
  label = "میزان مهارت",
}: {
  level: number;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.2 });
  return (
    <div
      ref={ref}
      className="skill-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={level}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.span
        style={{ width: `${level}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: visible ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}
