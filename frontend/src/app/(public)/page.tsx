import { getContent } from "@/services/public";
import PublicPage from "@/features/site/PublicPage";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const hero = content.heroes.find((item) => item.page === "home");
  return {
    title: `${content.settings?.brand || "CTRL.Z"} — ${hero?.title || "Editor Portfolio"}`,
    description: content.settings?.description || hero?.body,
    alternates: { canonical: `${getSiteUrl(content.settings?.site_url)}/` },
  };
}
export default async function Home() {
  return <PublicPage page="home" content={await getContent()} />;
}
