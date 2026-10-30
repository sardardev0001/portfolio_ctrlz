import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContent } from "@/services/public";
import PublicPage from "@/features/site/PublicPage";
import { getSiteUrl } from "@/lib/site-url";
const pages = ["about", "portfolio", "skills", "resume", "contact"];
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  if (!pages.includes(page)) return {};
  const c = await getContent();
  const h = c.heroes.find((x) => x.page === page);
  return {
    title: h?.title,
    description: h?.subtitle,
    alternates: { canonical: `${getSiteUrl(c.settings?.site_url)}/${page}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!pages.includes(page)) notFound();
  const content = await getContent();
  if (!content.heroes.some((x) => x.page === page)) notFound();
  return <PublicPage page={page} content={content} />;
}
