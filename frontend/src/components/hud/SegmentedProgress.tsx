"use client";
import { motion } from "motion/react";
export default function SegmentedProgress({
  value,
  label,
  entered,
  reduced,
}: {
  value: number;
  label: string;
  entered: boolean;
  reduced: boolean;
}) {
  const progress = Math.max(0, Math.min(100, value));
  return (
    <div
      className="segmented-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <motion.i
          key={i}
          aria-hidden="true"
          className={i < Math.round((progress * 12) / 100) ? "is-filled" : ""}
          initial={reduced ? false : { opacity: 0.16, scaleX: 0.4 }}
          animate={{
            opacity: entered || reduced ? 1 : 0.16,
            scaleX: entered || reduced ? 1 : 0.4,
          }}
          transition={{
            duration: reduced ? 0 : 0.22,
            delay: reduced ? 0 : 0.35 + i * 0.035,
          }}
        />
      ))}
    </div>
  );
}
