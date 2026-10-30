"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useInView } from "motion/react";
import { useReducedMotionPreference } from "@/components/motion/useReducedMotionPreference";

/** No React renders per pointer movement; all interaction writes share one frame. */
export function useHudMotion<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const frame = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const active = useInView(ref, { amount: 0.12 });
  const reduced = useReducedMotionPreference();
  const [entered, setEntered] = useState(false);
  const [ambient, setAmbient] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 761px) and (hover: hover) and (pointer: fine)",
    );
    const lowPower =
      navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
    const update = () =>
      setAmbient(media.matches && !lowPower && !document.hidden);
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  useEffect(() => {
    if (active) setEntered(true);
  }, [active]);
  const reset = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    ref.current?.style.setProperty("--parallax-x", "0px");
    ref.current?.style.setProperty("--parallax-y", "0px");
    ref.current?.style.setProperty("--pointer-x", "50%");
    ref.current?.style.setProperty("--pointer-y", "50%");
  }, []);
  useEffect(() => {
    if (!active || reduced) reset();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [active, reduced, reset]);
  const onPointerMove = useCallback(
    (event: PointerEvent<T>) => {
      if (
        reduced ||
        !ambient ||
        !active ||
        event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      )
        return;
      pointer.current = { x: event.clientX, y: event.clientY };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const element = ref.current;
        if (!element) return;
        const bounds = element.getBoundingClientRect();
        const x = Math.min(
          1,
          Math.max(0, (pointer.current.x - bounds.left) / bounds.width),
        );
        const y = Math.min(
          1,
          Math.max(0, (pointer.current.y - bounds.top) / bounds.height),
        );
        element.style.setProperty("--pointer-x", `${x * 100}%`);
        element.style.setProperty("--pointer-y", `${y * 100}%`);
        element.style.setProperty("--parallax-x", `${(x - 0.5) * 6}px`);
        element.style.setProperty("--parallax-y", `${(y - 0.5) * 6}px`);
      });
    },
    [active, reduced, ambient],
  );
  return {
    ref,
    entered,
    reduced: Boolean(reduced),
    interaction: {
      onPointerMove,
      onPointerLeave: reset,
      "data-active": active,
      "data-reduced": Boolean(reduced),
      "data-ambient": ambient && !reduced,
    },
  };
}

export const hudItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38 } },
};
