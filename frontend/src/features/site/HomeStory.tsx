"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpLeft,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Film,
  Focus,
  Megaphone,
  Play,
  ScanLine,
  Trophy,
  Youtube,
} from "lucide-react";
import { usePreferences, useT } from "@/i18n/provider";
import type { Content } from "@/types/api";
import { storyCategories } from "./home-story-data";
import { useStoryCarousel } from "./useStoryCarousel";
import styles from "./HomeStory.module.css";

const icons = {
  film: Clapperboard,
  youtube: Youtube,
  motion: Focus,
  advertising: Megaphone,
  sports: Trophy,
  anime: ScanLine,
};

export default function HomeStory({ content }: { content: Content }) {
  const t = useT();
  const { locale } = usePreferences();
  const headingId = useId();
  const gridId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const categories = storyCategories(content.categories);
  const carousel = useStoryCarousel(
    grid,
    viewport,
    categories.map((category) => category.slug).join("|"),
    locale,
  );
  const [selected, setSelected] = useState(categories[0]?.slug || "");
  const active = Math.max(
    0,
    categories.findIndex((category) => category.slug === selected),
  );
  const block = content.blocks.find((item) => item.key === "home-next");
  const title = block?.title || t("story.title");
  const highlight = locale === "fa" ? "فرصتی" : "chance";
  const split = title.split(highlight);

  function select(index: number, focus = false) {
    if (!categories.length) return;
    const next = (index + categories.length) % categories.length;
    setSelected(categories[next].slug);
    const card = cards.current[next];
    const scroller = viewport.current;
    if (!card || !scroller) return;
    if (focus) card.focus({ preventScroll: true });
    const bounds = scroller.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    const overflow =
      rect.left < bounds.left
        ? rect.left - bounds.left - 12
        : rect.right > bounds.right
          ? rect.right - bounds.right + 12
          : 0;
    if (overflow)
      scroller.scrollBy({
        left: overflow,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }

  function onKey(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = index + (locale === "fa" ? -1 : 1);
    else if (event.key === "ArrowLeft")
      next = index + (locale === "fa" ? 1 : -1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = categories.length - 1;
    else if (event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
      return;
    } else return;
    event.preventDefault();
    select(next, true);
  }

  return (
    <section
      className={styles.story}
      aria-labelledby={headingId}
      data-home-story="true"
    >
      <div className={styles.intro}>
        <div className={styles.character}>
          <Image
            src="/assets/home-story/character.webp"
            alt={t("story.character")}
            width={870}
            height={1160}
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 34vw, 390px"
          />
        </div>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{t("THE STORY CONTINUES")}</span>
          <Image
            className={styles.crown}
            src="/favicon-32.png"
            width={36}
            height={36}
            alt=""
            aria-hidden="true"
          />
          <h2 id={headingId}>
            {split.length > 1 ? (
              <>
                {split[0]}
                <em>{highlight}</em>
                {split.slice(1).join(highlight)}
              </>
            ) : (
              title
            )}
          </h2>
          <p>{block?.body || t("story.description")}</p>
        </div>
      </div>
      {categories.length > 0 && (
        <div
          className={styles.capsule}
          role="group"
          aria-label={t("story.categories")}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") carousel.pause("hover", true);
          }}
          onPointerLeave={() => {
            carousel.pause("hover", false);
            carousel.pause("pressed", false);
          }}
          onPointerDown={() => carousel.pause("pressed", true)}
          onPointerUp={() => carousel.pause("pressed", false)}
          onPointerCancel={() => carousel.pause("pressed", false)}
          onFocusCapture={() => carousel.pause("focus", true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              carousel.pause("focus", false);
          }}
        >
          <button
            type="button"
            className={`${styles.arrow} ${styles.left}`}
            aria-label={t(locale === "fa" ? "story.next" : "story.previous")}
            aria-controls={gridId}
            disabled={categories.length < 2}
            onClick={() => {
              const direction = locale === "fa" ? 1 : -1;
              carousel.advance(direction);
              select(active + direction);
            }}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className={styles.viewport} ref={viewport}>
            <ul className={styles.grid} id={gridId} ref={grid}>
              {categories.map((category, index) => {
                const Icon = icons[category.icon as keyof typeof icons] || Film;
                return (
                  <li key={category.id}>
                    <Link
                      ref={(element) => {
                        cards.current[index] = element;
                      }}
                      className={styles.card}
                      href={category.href}
                      prefetch={false}
                      data-active={index === active}
                      data-category={category.slug}
                      aria-label={`${t("story.browse")} ${category.title}`}
                      onFocus={() => setSelected(category.slug)}
                      onKeyDown={(event) => onKey(event, index)}
                    >
                      <span className={styles.cardArt}>
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={t(category.alt)}
                            fill
                            sizes="(max-width: 640px) 210px, (max-width: 1024px) 27vw, 30vw"
                          />
                        ) : (
                          <Film
                            className={styles.fallbackArt}
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className={styles.caption}>
                        <Icon aria-hidden="true" />
                        <strong>{category.title}</strong>
                      </span>
                      {index === active && (
                        <span className={styles.play} aria-hidden="true">
                          <Play fill="currentColor" />
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            type="button"
            className={`${styles.arrow} ${styles.right}`}
            aria-label={t(locale === "fa" ? "story.previous" : "story.next")}
            aria-controls={gridId}
            disabled={categories.length < 2}
            onClick={() => {
              const direction = locale === "fa" ? -1 : 1;
              carousel.advance(direction);
              select(active + direction);
            }}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
      <div className={styles.footer}>
        <p
          className={styles.position}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {categories[active]?.title}
          <span aria-hidden="true"> / </span>
          <bdi>
            {categories.length
              ? new Intl.NumberFormat(locale).format(active + 1)
              : ""}
            <span aria-hidden="true"> — </span>
            {new Intl.NumberFormat(locale).format(categories.length)}
          </bdi>
        </p>
        <div className={styles.ctas}>
          <Link href="/portfolio">
            {t("پروژه‌ها را ببینید")}
            <ArrowUpLeft aria-hidden="true" />
          </Link>
          <Link href="/skills">
            {t("مهارت‌ها را کشف کنید")}
            <ArrowUpLeft aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
