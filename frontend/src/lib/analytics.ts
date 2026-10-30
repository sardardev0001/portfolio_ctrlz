import { api } from "./api";
export function track(kind: "page" | "project" | "social", key: string) {
  if (
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  )
    return;
  try {
    const storageKey = `ctrlz-event:${kind}:${key}`;
    const previous = Number(sessionStorage.getItem(storageKey) || 0);
    if (Date.now() - previous < 30000) return;
    sessionStorage.setItem(storageKey, String(Date.now()));
    let token = sessionStorage.getItem("ctrlz-analytics-session");
    if (!token) {
      token = crypto.randomUUID();
      sessionStorage.setItem("ctrlz-analytics-session", token);
    }
    void api("analytics/", {
      method: "POST",
      body: JSON.stringify({ kind, page: key, token }),
    }).catch(() => undefined);
  } catch {
    /* Session storage disabled: omit analytics without affecting navigation. */
  }
}
