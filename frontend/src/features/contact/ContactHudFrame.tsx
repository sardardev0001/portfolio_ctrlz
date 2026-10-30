import FrameBackplate, { frameGeometry } from "@/components/hud/FrameBackplate";

/** Responsive vector HUD frame and matching surface, including the send button. */
export default function ContactHudFrame({
  mode,
}: {
  mode: "card" | "form" | "button";
}) {
  const card =
    "M19 4H151L160 8H287L296 4H431L446 18V42L442 46V75L446 79V102L432 116H282L276 112H167L161 116H18L4 102V81L8 76V43L4 39V19Z";
  const form =
    "M18 4H198L207 9H393L402 4H582L596 18V149L592 154V543L596 548V682L582 696H401L393 691H207L199 696H18L4 682V549L8 543V154L4 148V18Z";
  const button =
    "M14 4H179L187 7H410L419 4H586L596 14V56L586 66H419L411 63H188L180 66H14L4 56V14Z";
  const outline = mode === "card" ? card : mode === "button" ? button : form;
  const geometry = frameGeometry(
    outline,
    mode === "card" ? 450 : 600,
    mode === "card" ? 120 : mode === "button" ? 70 : 700,
  );
  return (
    <>
      <FrameBackplate geometry={geometry} />
      <svg
        className={`contact-hud-frame contact-hud-frame-${mode}`}
        viewBox={
          mode === "card"
            ? "0 0 450 120"
            : mode === "button"
              ? "0 0 600 70"
              : "0 0 600 700"
        }
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path className="contact-hud-shadow" d={outline} />
        <path className="contact-hud-core" d={outline} />
        <path className="contact-hud-edge" d={outline} />
        <path className="contact-hud-inner" d={outline} />
        <path
          className="contact-hud-top"
          d={
            mode === "button"
              ? "M19 4H116M470 4H580L596 20"
              : mode === "card"
                ? "M22 4H88M307 4H426L446 23"
                : "M24 4H134M438 4H577L596 23"
          }
        />
        <path
          className="contact-hud-bottom"
          d={
            mode === "button"
              ? "M4 47V56L15 66H105M500 66H585L596 55"
              : mode === "card"
                ? "M9 92V104L20 116H102M350 116H430L446 100"
                : "M4 649V682L19 696H138M470 696H582L596 682V646"
          }
        />
        <path className="contact-hud-travel" d={outline} pathLength="100" />
      </svg>
    </>
  );
}
