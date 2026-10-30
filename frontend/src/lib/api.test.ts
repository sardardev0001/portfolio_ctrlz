import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiFailure, ensureCsrf, errorText } from "./api";
function response(body: unknown, status = 200) {
  return { status, ok: status < 400, json: async () => body } as Response;
}
const success = (data: unknown, meta = {}) => ({
  success: true,
  message: "OK",
  data,
  error: null,
  meta,
});
describe("central API client", () => {
  beforeEach(() => {
    document.cookie = "csrftoken=testing";
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());
  it("can cancel CSRF preparation before a large upload starts", async () => {
    const controller = new AbortController();
    vi.mocked(fetch).mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Cancelled", "AbortError")),
          );
        }),
    );
    const pending = ensureCsrf(controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
  it("returns the shared pagination envelope", async () => {
    vi.mocked(fetch).mockResolvedValue(
      response(
        success([{ id: 1 }], {
          pagination: {
            page: 1,
            total_items: 1,
            total_pages: 1,
            page_size: 20,
            has_next: false,
            has_previous: false,
          },
        }),
      ),
    );
    const result = await api<{ id: number }[]>("projects/");
    expect(result.data[0].id).toBe(1);
    expect(result.meta.pagination?.total_items).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/projects/",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });
  it("sends CSRF for unsafe requests", async () => {
    vi.mocked(fetch).mockResolvedValue(response(success({ id: 1 })));
    await api("admin/projects/", {
      method: "POST",
      body: JSON.stringify({ title: "Example" }),
    });
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect((init.headers as Headers).get("X-CSRFToken")).toBe("testing");
    expect((init.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });
  it("uses error codes instead of message strings", async () => {
    vi.mocked(fetch).mockResolvedValue(
      response(
        {
          success: false,
          message: "Some text",
          data: null,
          error: { code: "VALIDATION_ERROR", details: { title: ["Required"] } },
          meta: {},
        },
        400,
      ),
    );
    await expect(
      api("contact/", { method: "POST", body: "{}" }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR", status: 400 });
    expect(errorText(new ApiFailure("RATE_LIMITED", null, 429))).toContain(
      "درخواست",
    );
  });
});
