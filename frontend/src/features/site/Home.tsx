"use client";
import { useT } from "@/i18n/provider";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpLeft, Play, Film, Scissors, Mail } from "lucide-react";
import { getHero } from "./constants";
import type { Content } from "@/types/api";
import { Title, useEntrance, HeroVisual } from "./components";
import HomeStory from "./HomeStory";
const homeCards = [
  {
    href: "/about",
    title: "درباره من",
    body: "مسیر من، سبک ادیت و نگاهی به دنیای خلاقیتم.",
    icon: Film,
    tone: "blue",
  },
  {
    href: "/portfolio",
    title: "نمونه‌کارها",
    body: "مجموعه‌ای از پروژه‌ها و ادیت‌های من.",
    icon: Play,
    tone: "red",
  },
  {
    href: "/skills",
    title: "مهارت‌ها",
    body: "تدوین، موشن گرافیک، رنگ، صدا و روایت.",
    icon: Scissors,
    tone: "yellow",
  },
  {
    href: "/contact",
    title: "رزومه / تماس",
    body: "همکاری در پروژه‌ها و راه‌های ارتباط با من.",
    icon: Mail,
    tone: "cyan",
  },
];
export default function Home({ content }: { content: Content }) {
  const t = useT();
  const hero = getHero(content, "home");
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  return (
    <>
      <section className="hero hero-home" ref={ref}>
        <div className="hero-copy">
          <div className="home-brand">
            <Image
              src="/assets/brand/logo-clean-blue.webp"
              alt="CTRL.Z"
              width={490}
              height={216}
              priority
            />
          </div>
          <Title hero={hero} animated />
          <div className="home-card-grid">
            {homeCards.map(({ href, title, body, icon: Icon, tone }) => (
              <Link className={`home-card tone-${tone}`} key={href} href={href}>
                <span className="home-card-icon">
                  <Icon size={42} />
                </span>
                <span className="home-card-copy">
                  <strong>{t(title)}</strong>
                  <small>{t(body)}</small>
                </span>
                <ArrowUpLeft className="home-card-arrow" size={24} />
              </Link>
            ))}
          </div>
          <span className="hero-signoff">
            {t("CUT. COLOR. STORY.")} <br />
            {t("EDIT THE MOMENT.")}
          </span>
        </div>
        <HeroVisual page="home" artwork={hero.artwork} />
      </section>
      <HomeStory content={content} />
    </>
  );
}
