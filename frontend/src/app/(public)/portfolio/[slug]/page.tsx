import { preferences } from "@/i18n/server";
import { translate } from "@/i18n/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpLeft, Play } from "lucide-react";
import { UpstreamError, getProject } from "@/services/public";
import { getSiteUrl } from "@/lib/site-url";
import ProjectVideo from "@/features/site/ProjectVideo";
import SafeRichText from "@/components/ui/SafeRichText";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const project = await getProject((await params).slug);
    return {
      title: project.title,
      description: project.short_description,
      openGraph: { images: [project.poster_url] },
      alternates: { canonical: `${getSiteUrl()}/portfolio/${project.slug}` },
    };
  } catch {
    return {};
  }
}
export default async function ProjectDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await preferences();
  const t = (text: string) => translate(text, locale);
  let project;
  try {
    project = await getProject((await params).slug);
  } catch (error) {
    if (!(error instanceof UpstreamError) || error.status !== 404) throw error;
    notFound();
  }
  if (!project) return null;
  const origin = (await searchParams).from || "";
  const query = new URLSearchParams(origin.slice(0, 2000));
  for (const key of [...query.keys()])
    if (!["category", "page", "search"].includes(key)) query.delete(key);
  const back = `/portfolio${query.size ? `?${query}` : ""}`;
  const video = project.video_url;
  return (
    <main className="project-detail">
      <Link href={back} className="back-link">
        <ArrowRight /> {t("بازگشت به نمونه‌کارها")}
      </Link>
      <div className="detail-hero">
        <div className="detail-copy">
          <span className="eyebrow">
            {t("SELECTED WORK /")}
            {project.year}
          </span>
          <h1>{project.title}</h1>
          <p>{project.short_description}</p>
          <div className="detail-meta">
            <span>
              {t("دسته‌بندی")}
              <strong>{project.category_title}</strong>
            </span>
            <span>
              {t("مدت")}
              <strong>{project.duration}</strong>
            </span>
            <span>
              {t("مشتری")}
              <strong>{project.client}</strong>
            </span>
            <span>
              {t("سال")}
              <strong>
                {new Intl.NumberFormat(locale).format(project.year)}
              </strong>
            </span>
          </div>
          {video && (
            <a
              href={video}
              target="_blank"
              rel="noopener noreferrer"
              className="button"
            >
              <Play /> {t("مشاهده ویدیو")}
            </a>
          )}
        </div>
        <div className="detail-poster">
          <Image
            src={project.poster_url}
            unoptimized={project.poster_url.startsWith("https://")}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 60vw"
          />
        </div>
      </div>
      {video?.startsWith("/api/v1/media/") && (
        <section className="content-section detail-video-section">
          <h2>{t("تماشای پروژه")}</h2>
          <ProjectVideo src={video} poster={project.poster_url} />
        </section>
      )}
      <section className="detail-body">
        <div>
          <span className="eyebrow">{t("PROJECT STORY")}</span>
          <h2>{t("داستان پروژه")}</h2>
          <SafeRichText text={project.description} />
        </div>
        <div className="neon-panel">
          <h3>{t("ابزارها")}</h3>
          <div className="tag-list">
            {project.tools.map((tool: string) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
          <h3>{t("برچسب‌ها")}</h3>
          <div className="tag-list">
            {project.tags.map((tag: string) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>
      {project.gallery.length > 0 && (
        <section className="content-section">
          <h2>{t("گالری")}</h2>
          <div className="detail-gallery">
            {project.gallery.map(
              (asset: { id: number; url: string; caption: string }) => (
                <figure key={asset.id}>
                  <Image
                    src={asset.url}
                    unoptimized={asset.url.startsWith("https://")}
                    alt={asset.caption || project.title}
                    width={800}
                    height={500}
                  />
                  <figcaption>{asset.caption}</figcaption>
                </figure>
              ),
            )}
          </div>
        </section>
      )}
      {project.related && project.related.length > 0 && (
        <section className="content-section">
          <h2>{t("پروژه‌های مرتبط")}</h2>
          <div className="portfolio-grid">
            {project.related.map(
              (x: {
                id: number;
                slug: string;
                title: string;
                poster_url: string;
              }) => (
                <Link
                  href={`/portfolio/${x.slug}`}
                  key={x.id}
                  className="project-card"
                >
                  <div className="project-poster">
                    <Image
                      src={x.poster_url}
                      unoptimized={x.poster_url.startsWith("https://")}
                      alt=""
                      fill
                      sizes="250px"
                    />
                  </div>
                  <h3>
                    {x.title} <ArrowUpLeft size={17} />
                  </h3>
                </Link>
              ),
            )}
          </div>
        </section>
      )}
    </main>
  );
}
