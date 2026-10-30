/** One outline drives the visible SVG stroke and its responsive CSS surface.
 * These HUD outlines use only absolute, straight M/H/V/L segments. */
export function frameGeometry(outline: string, width: number, height: number) {
  const segments = outline.match(/[MHLV][\d .,-]+/g) || [];
  let x = 0;
  let y = 0;
  const points = segments.map((segment) => {
    const values = segment.slice(1).trim().split(/[ ,]+/).map(Number);
    if (segment[0] === "H") x = values[0];
    else if (segment[0] === "V") y = values[0];
    else [x, y] = values;
    return `${(x / width) * 100}% ${(y / height) * 100}%`;
  });
  return { outline, clipPath: `polygon(${points.join(", ")})` };
}

export default function FrameBackplate({
  geometry,
}: {
  geometry: ReturnType<typeof frameGeometry>;
}) {
  return (
    <span
      className="frame-backplate"
      aria-hidden="true"
      style={{ clipPath: geometry.clipPath }}
    />
  );
}
