"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

const STEP_SECONDS = 4;
const MOVE_SECONDS = 1;

/** Move the six real cards around the perimeter, without clones or DOM reorders. */
export function useStoryCarousel(
  grid: RefObject<HTMLUListElement | null>,
  viewport: RefObject<HTMLDivElement | null>,
  categoryKey: string,
  locale: "fa" | "en",
) {
  const reasons = useRef(new Set<string>());
  const applyPause = useRef<() => void>(() => {});
  const move = useRef<(direction: number) => void>(() => {});
  const phase = useRef(0);
  const completed = useRef(0);

  const pause = useCallback((reason: string, value: boolean) => {
    if (value) reasons.current.add(reason);
    else reasons.current.delete(reason);
    applyPause.current();
  }, []);
  const advance = useCallback(
    (direction: number) => move.current(direction),
    [],
  );

  useEffect(() => {
    const list = grid.current;
    const scroller = viewport.current;
    if (!list || !scroller) return;
    const items = Array.from(list.children) as HTMLElement[];
    if (items.length < 2) return;
    const modulo = (value: number) =>
      ((value % items.length) + items.length) % items.length;
    const pauseReasons = reasons.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loop: gsap.core.Timeline | undefined;
    let manual: gsap.core.Tween | undefined;
    let frame = 0;
    let scrollTimer = 0;
    let size = "";
    let origins: { x: number; y: number }[] = [];
    let ring: number[] = [];

    function syncPause() {
      const paused = pauseReasons.size > 0;
      list!.setAttribute("data-carousel-paused", String(paused));
      if (paused) loop?.pause();
      else loop?.resume();
    }
    applyPause.current = syncPause;

    function target(index: number, rotation: number) {
      const slot = ring[modulo(ring.indexOf(index) + rotation)];
      return {
        x: origins[slot].x - origins[index].x,
        y: origins[slot].y - origins[index].y,
        slot,
      };
    }
    function finish(rotation: number) {
      phase.current = modulo(rotation);
      completed.current += 1;
      list!.setAttribute("data-carousel-steps", String(completed.current));
      list!.setAttribute(
        "data-carousel-cycles",
        String(Math.floor(completed.current / items.length)),
      );
      list!.setAttribute("data-carousel-moving", "false");
      items.forEach((item, index) => {
        item.setAttribute(
          "data-carousel-slot",
          String(target(index, phase.current).slot),
        );
      });
    }
    function createLoop() {
      loop?.kill();
      loop = undefined;
      if (media.matches) return;
      const base = phase.current;
      loop = gsap.timeline({ repeat: -1, paused: true });
      for (let step = 1; step <= items.length; step++) {
        const rotation = modulo(base + step);
        loop.to(
          items,
          {
            x: (index) => target(index, rotation).x,
            y: (index) => target(index, rotation).y,
            duration: MOVE_SECONDS,
            ease: "power2.inOut",
            onStart: () => {
              list!.setAttribute("data-carousel-moving", "true");
            },
            onComplete: () => finish(rotation),
          },
          step * STEP_SECONDS - MOVE_SECONDS,
        );
      }
      syncPause();
    }
    function measure() {
      const nextSize = `${list!.offsetWidth}/${list!.offsetHeight}/${locale}`;
      if (nextSize === size) return;
      size = nextSize;
      loop?.kill();
      manual?.kill();
      origins = items.map((item) => ({
        x: item.offsetLeft,
        y: item.offsetTop,
      }));
      // Follow the top row in reading direction, then the lower row back.
      // This also handles the column-flow mobile grid without changing its DOM.
      const rows: number[][] = [];
      items.forEach((_, index) => {
        let row = rows.find(
          (row) => Math.abs(origins[row[0]].y - origins[index].y) < 2,
        );
        if (!row) {
          row = [];
          rows.push(row);
        }
        row.push(index);
      });
      rows.sort((a, b) => origins[a[0]].y - origins[b[0]].y);
      ring = rows.flatMap((row, index) =>
        row.sort(
          (a, b) =>
            (origins[a].x - origins[b].x) *
            (locale === "fa" ? -1 : 1) *
            (index % 2 ? -1 : 1),
        ),
      );
      items.forEach((item, index) => {
        const position = target(index, phase.current);
        gsap.set(item, { x: position.x, y: position.y });
        item.setAttribute("data-carousel-slot", String(position.slot));
      });
      list!.setAttribute("data-carousel-moving", "false");
      createLoop();
    }
    move.current = (direction) => {
      loop?.kill();
      loop = undefined;
      manual?.kill();
      const rotation = modulo(phase.current + direction);
      list!.setAttribute("data-carousel-moving", "true");
      manual = gsap.to(items, {
        x: (index) => target(index, rotation).x,
        y: (index) => target(index, rotation).y,
        duration: media.matches ? 0 : MOVE_SECONDS,
        ease: "power2.inOut",
        onComplete: () => {
          finish(rotation);
          createLoop();
        },
      });
    };
    function preference() {
      if (media.matches) {
        pauseReasons.add("reduced-motion");
        syncPause();
      } else {
        pauseReasons.delete("reduced-motion");
        if (!loop) createLoop();
        syncPause();
      }
    }
    function visibility() {
      pause("hidden", document.hidden);
    }
    function scrolling() {
      pause("scroll", true);
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => pause("scroll", false), 300);
    }
    const observer = new IntersectionObserver(([entry]) =>
      pause("offscreen", !entry.isIntersecting),
    );
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    list!.setAttribute("data-carousel-steps", String(completed.current));
    list!.setAttribute(
      "data-carousel-cycles",
      String(Math.floor(completed.current / items.length)),
    );
    pauseReasons.add("offscreen");
    preference();
    visibility();
    measure();
    observer.observe(scroller);
    resize.observe(list);
    media.addEventListener("change", preference);
    scroller.addEventListener("scroll", scrolling, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(scrollTimer);
      pauseReasons.delete("scroll");
      observer.disconnect();
      resize.disconnect();
      media.removeEventListener("change", preference);
      scroller.removeEventListener("scroll", scrolling);
      document.removeEventListener("visibilitychange", visibility);
      loop?.kill();
      manual?.kill();
      gsap.set(items, { clearProps: "transform" });
      applyPause.current = () => {};
      move.current = () => {};
    };
  }, [grid, viewport, categoryKey, locale, pause]);

  return { pause, advance };
}
