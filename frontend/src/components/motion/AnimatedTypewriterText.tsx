"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotionPreference } from "./useReducedMotionPreference";

type Phase = "typing" | "deleting";
function graphemes(text: string, locale: string): string[] {
  if (typeof Intl.Segmenter !== "undefined")
    return [
      ...new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text),
    ].map((part) => part.segment);
  return Array.from(text);
}

export default function AnimatedTypewriterText({
  text,
  locale,
  highlight = "",
  enabled = true,
  typingMs = 70,
  deletingMs = 45,
  holdMs = 5000,
}: {
  text: string;
  locale: "fa" | "en";
  highlight?: string;
  enabled?: boolean;
  typingMs?: number;
  deletingMs?: number;
  holdMs?: number;
}) {
  const reduced = useReducedMotionPreference();
  const letters = useMemo(() => graphemes(text, locale), [text, locale]);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  useEffect(() => {
    setCount(0);
    setPhase("typing");
  }, [text, locale]);
  useEffect(() => {
    if (!enabled || reduced || letters.length === 0) return;
    let delay: number;
    if (phase === "typing" && count < letters.length) delay = typingMs;
    else if (phase === "typing") delay = holdMs;
    else delay = deletingMs;
    const timer = window.setTimeout(
      () => {
        if (phase === "typing" && count < letters.length) setCount(count + 1);
        else if (phase === "typing") {
          setCount(Math.max(0, count - 1));
          setPhase("deleting");
        } else if (count > 1) setCount(count - 1);
        else {
          setCount(0);
          setPhase("typing");
        }
      },
      Math.max(0, delay),
    );
    return () => window.clearTimeout(timer);
  }, [count, phase, letters, enabled, reduced, typingMs, deletingMs, holdMs]);
  const shown = enabled && !reduced ? letters.slice(0, count).join("") : text;
  const start = highlight ? text.indexOf(highlight) : -1;
  const formatted =
    start < 0 ? (
      shown
    ) : (
      <>
        {shown.slice(0, start)}
        <em>{shown.slice(start, start + highlight.length)}</em>
        {shown.slice(start + highlight.length)}
      </>
    );
  return (
    <span className="typewriter" dir={locale === "fa" ? "rtl" : "ltr"}>
      <span className="typewriter-reserve" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter-visual" aria-hidden="true">
        {formatted}
        {enabled && !reduced && <span className="typewriter-cursor" />}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
