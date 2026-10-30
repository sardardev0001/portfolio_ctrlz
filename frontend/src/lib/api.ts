import type { ApiResponse } from "@/types/api";
export class ApiFailure extends Error {
  constructor(
    public code: string,
    public details: unknown,
    public status: number,
  ) {
    super(code);
  }
}
let csrfToken = "";
let refreshPromise: Promise<void> | null = null;
function cookieCsrf() {
  return typeof document === "undefined"
    ? ""
    : decodeURIComponent(
        document.cookie
          .split("; ")
          .find((x) => x.startsWith("csrftoken="))
          ?.split("=")
          .slice(1)
          .join("=") || "",
      );
}
export async function ensureCsrf(signal?: AbortSignal) {
  const response = await fetch("/api/v1/auth/csrf/", {
    credentials: "same-origin",
    signal,
  });
  const body: ApiResponse<{ csrf_token: string }> = await response.json();
  if (!body.success)
    throw new ApiFailure(
      body.error?.code || "REQUEST_FAILED",
      body.error?.details,
      response.status,
    );
  csrfToken = body.data.csrf_token;
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const method = options.method || "GET";
  if (!["GET", "HEAD"].includes(method) && !csrfToken && !cookieCsrf())
    await ensureCsrf();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD"].includes(method))
    headers.set("X-CSRFToken", cookieCsrf() || csrfToken);
  const response = await fetch(`/api/v1/${path}`, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  if (
    response.status === 401 &&
    retry &&
    (!path.startsWith("auth/") || path === "auth/me/")
  ) {
    refreshPromise ??= api("auth/refresh/", { method: "POST" }, false)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
    await refreshPromise;
    return api<T>(path, options, false);
  }
  if (response.status === 204)
    return {
      success: true,
      message: "Deleted",
      data: null as T,
      error: null,
      meta: {},
    };
  const body: ApiResponse<T> = await response.json();
  if (!body.success)
    throw new ApiFailure(
      body.error?.code || "REQUEST_FAILED",
      body.error?.details,
      response.status,
    );
  return body;
}
import { translate, type Locale } from "@/i18n/core";
export const errorText = (
  error: unknown,
  locale: Locale = typeof document !== "undefined" &&
  document.documentElement.lang === "en"
    ? "en"
    : "fa",
) =>
  translate(
    error instanceof ApiFailure &&
      [
        "VIDEO_TOO_LARGE",
        "UPLOAD_DISK_FULL",
        "VIDEO_DURATION",
        "VIDEO_TYPE",
        "VIDEO_UNVERIFIED",
        "VIDEO_PROBE_UNAVAILABLE",
        "DOCUMENT_SIZE",
        "MEDIA_INVALID",
      ].includes(error.code)
      ? error.code
      : error instanceof ApiFailure
        ? {
            VALIDATION_ERROR: "اطلاعات فرم را بررسی کنید.",
            AUTH_FAILED: "نام کاربری یا رمز عبور درست نیست.",
            AUTH_REQUIRED: "لطفاً وارد پنل شوید.",
            FORBIDDEN: "اجازهٔ این عملیات را ندارید.",
            RATE_LIMITED:
              "درخواست‌های زیادی ارسال شده؛ کمی بعد دوباره تلاش کنید.",
            NOT_FOUND: "موردی پیدا نشد.",
          }[error.code] || "درخواست انجام نشد. دوباره تلاش کنید."
        : "ارتباط با سرور برقرار نشد.",
    locale,
  );

export function fieldErrors(
  error: unknown,
  locale: Locale = "fa",
): Record<string, string> {
  if (
    !(error instanceof ApiFailure) ||
    !error.details ||
    typeof error.details !== "object"
  )
    return {};
  return Object.fromEntries(
    Object.entries(error.details).map(([key]) => [
      key,
      [
        "VIDEO_TOO_LARGE",
        "VIDEO_DURATION",
        "VIDEO_TYPE",
        "VIDEO_UNVERIFIED",
      ].includes(error.code)
        ? errorText(error, locale)
        : translate("اطلاعات فرم را بررسی کنید.", locale),
    ]),
  );
}
