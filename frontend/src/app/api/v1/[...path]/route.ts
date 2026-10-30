import { NextRequest } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import {
  forwardToBackend,
  MAX_UPLOAD_BODY,
  spoolBody,
  UploadTooLarge,
  UploadDiskFull,
  UPLOAD_TIMEOUT_MS,
} from "@/lib/server/upload-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: number, code: string, message: string) {
  const requestId = randomUUID();
  return Response.json(
    {
      success: false,
      message,
      data: null,
      error: { code, details: null },
      meta: { request_id: requestId },
    },
    { status, headers: { "X-Request-ID": requestId } },
  );
}

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (
    path.some(
      (segment) => segment === "." || segment === ".." || segment.includes("/"),
    )
  ) {
    return failure(400, "INVALID_REQUEST", "Invalid API path.");
  }
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
  const url = new URL(
    `/api/v1/${path.map(encodeURIComponent).join("/")}/`,
    base,
  );
  url.search = request.nextUrl.search;
  const headers = new Headers(request.headers);
  for (const key of [
    "host",
    "connection",
    "content-length",
    "transfer-encoding",
    "accept-encoding",
    "x-ctrlz-client",
    "x-ctrlz-client-signature",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-ctrlz-upload-ticket",
  ])
    headers.delete(key);
  // Only the private Nginx ingress may supply the public TLS scheme. Django
  // needs it for is_secure(), CSRF and security middleware behind both proxies.
  if (process.env.TRUST_PROXY_HEADERS === "true")
    headers.set(
      "x-forwarded-proto",
      request.headers.get("x-forwarded-proto") === "https" ? "https" : "http",
    );
  if (process.env.API_PROXY_TOKEN) {
    const forwarded =
      process.env.TRUST_PROXY_HEADERS === "true"
        ? request.headers.get("x-real-ip") ||
          request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
        : undefined;
    const identity = forwarded && isIP(forwarded) ? forwarded : "127.0.0.1";
    headers.set("x-ctrlz-client", identity);
    headers.set(
      "x-ctrlz-client-signature",
      createHmac("sha256", process.env.API_PROXY_TOKEN)
        .update(identity)
        .digest("hex"),
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  const signal = AbortSignal.any([request.signal, controller.signal]);
  let body: Awaited<ReturnType<typeof spoolBody>> | undefined;
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      const isMediaUpload =
        request.method === "POST" && path.join("/") === "admin/media";
      const bodyLimit = isMediaUpload ? MAX_UPLOAD_BODY : 1_000_000;
      if (Number(request.headers.get("content-length")) > bodyLimit)
        return failure(413, "VIDEO_TOO_LARGE", "Upload too large.");
      // Authenticate before spooling large media. Django still independently
      // enforces authentication, CSRF, file content and editorial permissions.
      if (path[0] === "admin") {
        const auth = await forwardToBackend(
          new URL("/api/v1/auth/me/", base),
          "GET",
          headers,
          signal,
        );
        if (auth.status !== 200)
          return failure(
            auth.status === 403 ? 403 : 401,
            "AUTH_REQUIRED",
            "Sign in to continue.",
          );
        const account = (await auth.json()).data;
        if (
          !account?.is_superuser &&
          !["owner", "editor"].includes(account?.role)
        )
          return failure(403, "FORBIDDEN", "Editorial access is required.");
      }
      if (isMediaUpload) {
        const ticketHeaders = new Headers(headers);
        ticketHeaders.set("content-type", "application/json");
        const grant = await forwardToBackend(
          new URL("/api/v1/auth/upload-ticket/", base),
          "POST",
          ticketHeaders,
          signal,
        );
        if (grant.status !== 200)
          return failure(
            grant.status,
            grant.status === 403 ? "FORBIDDEN" : "AUTH_REQUIRED",
            "Upload authorization failed.",
          );
        const ticket = (await grant.json()).data?.ticket;
        if (typeof ticket !== "string") throw new Error("Invalid upload grant");
        headers.set("x-ctrlz-upload-ticket", ticket);
      }
      body = await spoolBody(request.body, signal, bodyLimit);
      headers.set("content-length", String(body.size));
    }
    const upstream = await forwardToBackend(
      url,
      request.method,
      headers,
      signal,
      body?.path,
    );
    clearTimeout(timer);
    const responseHeaders = new Headers(upstream.headers);
    for (const key of [
      "content-encoding",
      "content-length",
      "transfer-encoding",
      "connection",
      "set-cookie",
    ])
      responseHeaders.delete(key);
    for (const cookie of upstream.headers.getSetCookie())
      responseHeaders.append("set-cookie", cookie);
    const responseBody =
      request.method === "HEAD" ||
      upstream.status === 204 ||
      upstream.status === 304
        ? null
        : upstream.body;
    return new Response(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof UploadDiskFull)
      return failure(
        507,
        "UPLOAD_DISK_FULL",
        "Upload storage is temporarily full.",
      );
    if (error instanceof UploadTooLarge)
      return failure(413, "VIDEO_TOO_LARGE", "Upload too large.");
    return failure(503, "SERVICE_UNAVAILABLE", "The service is unavailable.");
  } finally {
    clearTimeout(timer);
    await body?.cleanup();
  }
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PATCH,
  proxy as PUT,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
};
