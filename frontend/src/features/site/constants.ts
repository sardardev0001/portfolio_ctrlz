import type { Content, Hero } from "@/types/api";
export type PageKey =
  "home" | "about" | "portfolio" | "skills" | "resume" | "contact";
export const art: Record<PageKey, string> = {
  home: "/assets/characters/character-home.webp",
  about: "/assets/characters/character-skills.webp",
  portfolio: "/assets/characters/character-portfolio.webp",
  skills: "/assets/characters/character-skills.webp",
  resume: "/assets/characters/character-resume.webp",
  contact: "/assets/characters/character-contact.webp",
};

const pageTitles: Record<PageKey, string> = {
  home: "CTRL.Z",
  about: "درباره من",
  portfolio: "نمونه‌کارها",
  skills: "مهارت‌ها",
  resume: "رزومه",
  contact: "تماس با من",
};
export function getHero(content: Content, page: PageKey): Hero {
  return (
    content.heroes.find((hero) => hero.page === page) || {
      id: 0,
      page,
      title: pageTitles[page],
      highlight: "",
      subtitle: "",
      body: "",
      artwork: "",
    }
  );
}
