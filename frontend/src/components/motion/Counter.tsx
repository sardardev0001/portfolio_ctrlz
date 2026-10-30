"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "motion/react";
import { usePreferences } from "@/i18n/provider";
export default function Counter({ value }: { value: string }) {
  const { locale } = usePreferences();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const parsed = Number.parseInt(value, 10);
  const [number, setNumber] = useState(parsed);
  useEffect(() => {
    if (!inView || reduce || !Number.isFinite(parsed)) return;
    const controls = animate(0, parsed, {
      duration: 1.1,
      onUpdate: (n) => setNumber(Math.round(n)),
    });
    return () => controls.stop();
  }, [inView, reduce, parsed]);
  return (
    <strong ref={ref} aria-label={value}>
      {!Number.isFinite(parsed)
        ? value
        : `${new Intl.NumberFormat(locale).format(reduce ? parsed : number)}${value.replace(/^\d+/, "")}`}
    </strong>
  );
}
