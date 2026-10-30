"use client";
import { useT } from "@/i18n/provider";
import Image from "next/image";
import Link from "next/link";
import { useRef, useOptimistic, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSiteQuery as useQuery } from "@/i18n/provider";
import { ArrowLeft, ArrowRight, Play, Search } from "lucide-react";
import { motion } from "motion/react";
import HudFrame from "@/components/hud/HudFrame";
import { useHudMotion } from "@/components/hud/useHudMotion";
import { api, errorText } from "@/lib/api";
import { getHero } from "./constants";
import type { Content, Project } from "@/types/api";
import { Title, useEntrance, HeroVisual } from "./components";
export default function Portfolio({ content }: { content: Content }) {
  const t = useT();
  const hero = getHero(content, "portfolio");
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get("category") || "";
  const search = params.get("search") || "";
  const [input, setInput] = useOptimistic(search);
  const [, startSearch] = useTransition();
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    const href = `/portfolio${next.size ? `?${next}` : ""}`;
    if (key === "search") router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }
  const query = useQuery({
    queryKey: ["projects", category, search, page],
    queryFn: () =>
      api<Project[]>(
        `projects/?page=${page}&page_size=10${category ? `&category=${encodeURIComponent(category)}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
      ),
  });
  return (
    <>
      <section className="hero hero-inner hero-portfolio" ref={ref}>
        <div className="hero-copy">
          <span className="eyebrow">{t("SELECTED WORKS / 2026")}</span>
          <Title hero={hero} />
        </div>
        <HeroVisual page="portfolio" artwork={hero.artwork} />
      </section>
      <section className="portfolio-section">
        <div className="filter-bar neon-panel">
          <div
            className="filter-list"
            role="group"
            aria-label={t("فیلتر دسته‌بندی")}
          >
            {[
              { label: t("همه پروژه‌ها"), slug: "" },
              ...content.categories.map((x) => ({
                label: x.title,
                slug: x.slug,
              })),
            ].map((x) => (
              <button
                key={x.slug}
                className={category === x.slug ? "selected" : ""}
                aria-pressed={category === x.slug}
                onClick={() => {
                  update("category", x.slug);
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
          <label className="search-box">
            <Search size={18} />
            <span className="sr-only">{t("جستجوی پروژه")}</span>
            <input
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                startSearch(() => {
                  setInput(value);
                  update("search", value);
                });
              }}
              placeholder={t("جستجوی پروژه...")}
            />
          </label>
        </div>
        {query.isLoading ? (
          <p className="feedback">{t("در حال دریافت پروژه‌ها...")}</p>
        ) : query.isError ? (
          <p className="feedback error">{t(errorText(query.error))}</p>
        ) : (
          <>
            <div className="portfolio-grid">
              {query.data?.data.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  returnQuery={params.toString()}
                />
              ))}
            </div>
            {query.data?.data.length === 0 && (
              <p className="feedback">{t("پروژه‌ای با این جستجو پیدا نشد.")}</p>
            )}
            <div className="pagination">
              <button
                disabled={!query.data?.meta.pagination?.has_previous}
                onClick={() => update("page", String(page - 1))}
                aria-label={t("صفحه قبلی")}
              >
                <ArrowRight />
              </button>
              <span>
                {t("صفحه")} {page} {t("از")}{" "}
                {query.data?.meta.pagination?.total_pages || 1}
              </span>
              <button
                disabled={!query.data?.meta.pagination?.has_next}
                onClick={() => update("page", String(page + 1))}
                aria-label={t("صفحه بعدی")}
              >
                <ArrowLeft />
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
export function ProjectCard({
  project,
  returnQuery = "",
  index = 0,
}: {
  project: Project;
  returnQuery?: string;
  index?: number;
}) {
  const t = useT();
  const { ref, entered, reduced, interaction } = useHudMotion<HTMLElement>();
  const accent =
    project.category_slug === "advertising"
      ? "red"
      : project.category_slug === "motion"
        ? "gold"
        : "blue";
  return (
    <motion.article
      ref={ref}
      {...interaction}
      className={`project-card portfolio-hud hud-surface accent-${accent} project-${project.category_slug}`}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={
        entered || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
      }
      transition={{
        duration: reduced ? 0 : 0.48,
        delay: reduced ? 0 : (index % 3) * 0.07,
      }}
      data-entered={entered || reduced}
    >
      <HudFrame />
      <Link
        prefetch={false}
        href={`/portfolio/${project.slug}${returnQuery ? `?from=${encodeURIComponent(returnQuery)}` : ""}`}
        aria-label={t("مشاهده ") + project.title + t("")}
      >
        <span className="project-hit-area" aria-hidden="true" />
        <div className="project-poster">
          <Image
            src={
              project.poster_url || "/assets/backgrounds/city-background.webp"
            }
            unoptimized={project.poster_url.startsWith("https://")}
            alt={project.title}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 1000px) 45vw, 20vw"
          />
          <span className="project-category">{project.category_title}</span>
          <span className="project-play">
            <Play fill="currentColor" size={20} aria-hidden="true" />
          </span>
          <span className="project-duration">{project.duration}</span>
        </div>
        <div className="project-info">
          <h3>{project.title}</h3>
          <p>{project.short_description}</p>
        </div>
      </Link>
    </motion.article>
  );
}
