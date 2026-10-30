import Image from "next/image";
export const softwareLogos: Record<string, string> = {
  Pr: "premiere-pro",
  Ae: "after-effects",
  Ps: "photoshop",
  Da: "davinci-resolve",
  Ai: "illustrator",
  Bl: "blender",
};
export default function SoftwareIcon({
  icon,
  image,
  title,
  size = 64,
}: {
  icon: string;
  image?: string;
  title: string;
  size?: number;
}) {
  const source =
    image ||
    (softwareLogos[icon] ? `/assets/software/${softwareLogos[icon]}.webp` : "");
  return (
    <span className="tool-icon-art" aria-hidden="true">
      {source ? (
        <Image
          src={source}
          unoptimized={
            source.startsWith("https://") || source.startsWith("/api/")
          }
          width={size}
          height={size}
          alt=""
        />
      ) : (
        <span>{icon || title.slice(0, 2)}</span>
      )}
    </span>
  );
}
