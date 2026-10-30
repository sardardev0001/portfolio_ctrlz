import type { Content } from "@/types/api";

// These are visual mappings to existing category keys, never new CMS records.
const artwork: Record<string, { image: string; icon: string; alt: string }> = {
  cinematic: {
    image: "/assets/home-story/cinematic.webp",
    icon: "film",
    alt: "story.image.cinematic",
  },
  vlog: {
    image: "/assets/home-story/vlog.webp",
    icon: "youtube",
    alt: "story.image.vlog",
  },
  motion: {
    image: "/assets/home-story/motion.webp",
    icon: "motion",
    alt: "story.image.motion",
  },
  advertising: {
    image: "/assets/home-story/advertising.webp",
    icon: "advertising",
    alt: "story.image.advertising",
  },
  sports: {
    image: "/assets/home-story/sports.webp",
    icon: "sports",
    alt: "story.image.sports",
  },
  anime: {
    image: "/assets/portfolio/project-01.webp",
    icon: "anime",
    alt: "story.image.anime",
  },
};
const order = ["cinematic", "vlog", "motion", "advertising", "sports", "anime"];

export function storyCategories(categories: Content["categories"]) {
  return [...categories]
    .sort((a, b) => {
      const first = order.indexOf(a.slug);
      const second = order.indexOf(b.slug);
      return (
        (first < 0 ? order.length : first) -
        (second < 0 ? order.length : second)
      );
    })
    .map((category) => ({
      ...category,
      href: `/portfolio?${new URLSearchParams({ category: category.slug })}`,
      ...(artwork[category.slug] || { image: "", icon: "film", alt: "" }),
    }));
}
