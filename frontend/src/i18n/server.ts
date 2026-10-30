import { cookies } from "next/headers";
import type { Locale } from "./core";
export async function preferences(): Promise<{ locale: Locale }> {
  const jar = await cookies();
  return {
    locale: jar.get("ctrlz-locale")?.value === "en" ? "en" : "fa",
  };
}
