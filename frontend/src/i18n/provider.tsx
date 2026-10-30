"use client";
import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api";
import { localize, translate, type Locale } from "./core";

const PreferencesContext = createContext({
  locale: "fa" as Locale,
});
export function PreferencesProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <PreferencesContext.Provider value={{ locale }}>
      {children}
    </PreferencesContext.Provider>
  );
}
export const usePreferences = () => useContext(PreferencesContext);
export function useT() {
  const { locale } = usePreferences();
  return (text: string) => translate(text, locale);
}
export function useSiteQuery<T>(options: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<ApiResponse<T>>;
}) {
  const { locale } = usePreferences();
  return useQuery({
    ...options,
    select: (result) => ({ ...result, data: localize(result.data, locale) }),
  });
}
export function LanguageToggle() {
  const { locale } = usePreferences();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function changeLanguage() {
    document.cookie = `ctrlz-locale=${locale === "fa" ? "en" : "fa"}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    // A server refresh preserves URL, query, React Query cache, and page state.
    startTransition(() => router.refresh());
  }
  return (
    <button
      type="button"
      className="language-toggle"
      disabled={pending}
      onClick={changeLanguage}
      aria-label={t("تغییر زبان")}
      aria-pressed={locale === "en"}
      aria-busy={pending}
    >
      <span aria-hidden="true">◎</span>{" "}
      <bdi>{locale === "fa" ? "English" : "فارسی"}</bdi>
    </button>
  );
}
