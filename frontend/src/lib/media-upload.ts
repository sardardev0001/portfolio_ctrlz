import { ApiFailure, ensureCsrf } from "./api";
import type { RecordData } from "@/types/api";
export const VIDEO_MAX_BYTES = 1_073_741_824;
export const VIDEO_MIN_DURATION = 0;
export const VIDEO_MAX_DURATION = 120;
export const UPLOAD_TIMEOUT_MS = 3_900_000;
export function validateVideoLimits(size: number, duration?: number) {
  if (size > VIDEO_MAX_BYTES)
    throw new ApiFailure("VIDEO_TOO_LARGE", null, 413);
  if (size <= 0) throw new ApiFailure("MEDIA_INVALID", null, 422);
  if (
    duration !== undefined &&
    (!Number.isFinite(duration) ||
      duration < VIDEO_MIN_DURATION ||
      duration > VIDEO_MAX_DURATION)
  )
    throw new ApiFailure("VIDEO_DURATION", null, 422);
}
export async function inspectVideo(
  file: File,
  signal?: AbortSignal,
): Promise<number> {
  signal?.throwIfAborted();
  validateVideoLimits(file.size);
  if (!["video/mp4", "video/webm"].includes(file.type))
    throw new ApiFailure("VIDEO_TYPE", null, 422);
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const clean = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      video.onloadedmetadata = video.onerror = null;
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };
    const abort = () => {
      clean();
      reject(new DOMException("Upload cancelled", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    const timer = window.setTimeout(() => {
      clean();
      reject(new ApiFailure("VIDEO_TYPE", null, 422));
    }, 15000);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      try {
        validateVideoLimits(file.size, video.duration);
        if (!video.videoWidth || !video.videoHeight)
          throw new ApiFailure("VIDEO_TYPE", null, 422);
        const duration = video.duration;
        clean();
        resolve(duration);
      } catch (error) {
        clean();
        reject(error);
      }
    };
    video.onerror = () => {
      clean();
      reject(new ApiFailure("VIDEO_TYPE", null, 422));
    };
    video.src = url;
  });
}
export async function uploadMedia(
  file: File,
  progress: (value: number) => void,
  signal?: AbortSignal,
  usage = "managed-project-video",
): Promise<RecordData> {
  signal?.throwIfAborted();
  await ensureCsrf(signal);
  signal?.throwIfAborted();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/admin/media/");
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.setRequestHeader(
      "X-CSRFToken",
      decodeURIComponent(
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("csrftoken="))
          ?.split("=")
          .slice(1)
          .join("=") || "",
      ),
    );
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.round((100 * event.loaded) / event.total));
    };
    const abort = () => xhr.abort();
    signal?.addEventListener("abort", abort, { once: true });
    xhr.onloadend = () => signal?.removeEventListener("abort", abort);
    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText);
        if (!result.success)
          reject(
            new ApiFailure(
              result.error?.code || "REQUEST_FAILED",
              result.error?.details,
              xhr.status,
            ),
          );
        else resolve(result.data);
      } catch {
        reject(new ApiFailure("REQUEST_FAILED", null, xhr.status));
      }
    };
    xhr.onabort = () =>
      reject(new DOMException("Upload cancelled", "AbortError"));
    xhr.onerror = xhr.ontimeout = () =>
      reject(new ApiFailure("REQUEST_FAILED", null, 503));
    const body = new FormData();
    body.append("file", file);
    body.append("usage", usage);
    xhr.send(body);
  });
}
