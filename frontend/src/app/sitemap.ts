import type { MetadataRoute } from "next";
import { getProjectIndex } from "@/services/public";
import { getSiteUrl } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const routes = ["", "about", "portfolio", "skills", "resume", "contact"].map(
    (x) => ({
      url: `${origin}/${x}`,
      changeFrequency: "weekly" as const,
      priority: x ? 0.7 : 1,
    }),
  );
  try {
    const projects = await getProjectIndex();
    return [
      ...routes,
      ...projects.map((x) => ({
        url: `${origin}/portfolio/${x.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return routes;
  }
}
