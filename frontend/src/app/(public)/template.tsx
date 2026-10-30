"use client";
import { motion } from "motion/react";

/** Next owns the route key; transition animation never retains an old router subtree. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0.01, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
