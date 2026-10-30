"use client";
import { useLayoutEffect, useRef, useState } from "react";
import FrameBackplate, { frameGeometry } from "./FrameBackplate";

const outline =
  "M24 6H290L302 12H690L702 6H976L994 24V142L986 150V250L994 258V376L976 394H712L700 388H300L288 394H24L6 376V260L14 252V148L6 140V24Z";
const inner =
  "M29 15H283L296 21H704L717 15H971L985 29V135L977 145V255L985 265V371L971 385H718L706 379H294L282 385H29L15 371V267L23 257V143L15 133V29Z";
const highlight =
  "M34 6H180M820 6H964L994 36M994 330V374L974 394H850M150 394H26L6 374V332M6 70V26L26 6";

/** Tall panels retain shallow cuts rather than stretching them through headings. */
function fitPath(path: string, height: number) {
  const scale = Math.min(1, height / 400);
  const fitY = (y: number) => {
    if (y <= 70) return y * scale;
    if (y >= 330) return height - (400 - y) * scale;
    if (y <= 155) return height * 0.36 + (y - 144) * scale;
    return height * 0.64 + (y - 256) * scale;
  };
  return path.replace(/[MHLV][\d .,-]+/g, (segment) => {
    const values = segment.slice(1).trim().split(/[ ,]+/).map(Number);
    if (segment[0] === "H") return segment;
    const yi = segment[0] === "V" ? 0 : 1;
    values[yi] = Number(fitY(values[yi]).toFixed(3));
    return segment[0] + values.join(" ");
  });
}

/** Scalable geometry, never a flattened bitmap frame. */
export default function HudFrame({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [height, setHeight] = useState(400);
  useLayoutEffect(() => {
    const element = svg.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.max(1, Math.round(entry.contentRect.height));
      setHeight((previous) => (previous === next ? previous : next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const geometry = frameGeometry(fitPath(outline, height), 1000, height);
  return (
    <>
      <FrameBackplate geometry={geometry} />
      <svg
        ref={svg}
        className={`hud-frame ${className}`}
        viewBox={`0 0 1000 ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path className="hud-frame-shadow" d={geometry.outline} />
        <path className="hud-frame-edge" d={geometry.outline} />
        <path className="hud-frame-inner" d={fitPath(inner, height)} />
        <path className="hud-frame-highlight" d={fitPath(highlight, height)} />
        <path
          className="hud-frame-travel"
          d={geometry.outline}
          pathLength="100"
        />
      </svg>
    </>
  );
}
