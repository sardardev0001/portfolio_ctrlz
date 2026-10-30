/** Server runtime origin. SITE_URL can change between Docker deployments. */
export function getSiteUrl(editorialUrl?: string) {
  return new URL(
    process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      editorialUrl ||
      "http://localhost:3000",
  ).origin;
}
