// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/[...path]/route";
import { forwardToBackend, spoolBody } from "./upload-body";

vi.mock("./upload-body", () => ({
  forwardToBackend: vi.fn(),
  spoolBody: vi.fn(),
  MAX_UPLOAD_BODY: 1_074_790_400,
  UPLOAD_TIMEOUT_MS: 3_900_000,
  UploadTooLarge: class extends Error {},
  UploadDiskFull: class extends Error {},
}));
afterEach(() => vi.resetAllMocks());
const context = { params: Promise.resolve({ path: ["admin", "media"] }) };
it("rejects anonymous uploads before reading or writing the request body", async () => {
  vi.mocked(forwardToBackend).mockResolvedValue(
    Response.json({ success: false }, { status: 401 }),
  );
  const response = await POST(
    new NextRequest("http://localhost/api/v1/admin/media/", { method: "POST" }),
    context,
  );
  expect(response.status).toBe(401);
  expect(spoolBody).not.toHaveBeenCalled();
});
it("rejects readonly staff before spooling", async () => {
  vi.mocked(forwardToBackend).mockResolvedValue(
    Response.json({ data: { role: "viewer" } }),
  );
  const response = await POST(
    new NextRequest("http://localhost/api/v1/admin/media/", { method: "POST" }),
    context,
  );
  expect(response.status).toBe(403);
  expect(spoolBody).not.toHaveBeenCalled();
});
it("rejects a declared oversized file before forwarding", async () => {
  const response = await POST(
    new NextRequest("http://localhost/api/v1/admin/media/", {
      method: "POST",
      headers: { "content-length": "1074790401" },
    }),
    context,
  );
  expect(response.status).toBe(413);
  expect(forwardToBackend).not.toHaveBeenCalled();
});

it("checks CSRF/upload authorization before reading an owner's file", async () => {
  vi.mocked(forwardToBackend)
    .mockResolvedValueOnce(Response.json({ data: { role: "owner" } }))
    .mockResolvedValueOnce(Response.json({ success: false }, { status: 403 }));
  const response = await POST(
    new NextRequest("http://localhost/api/v1/admin/media/", { method: "POST" }),
    context,
  );
  expect(response.status).toBe(403);
  expect(spoolBody).not.toHaveBeenCalled();
});

it("forwards the scoped grant and preserves the public HTTPS scheme", async () => {
  vi.stubEnv("TRUST_PROXY_HEADERS", "true");
  const cleanup = vi.fn().mockResolvedValue(undefined);
  vi.mocked(spoolBody).mockResolvedValue({
    path: "/tmp/test-body",
    size: 7,
    cleanup,
  });
  vi.mocked(forwardToBackend)
    .mockResolvedValueOnce(Response.json({ data: { role: "owner" } }))
    .mockResolvedValueOnce(
      Response.json({ data: { ticket: "test-only-grant" } }),
    )
    .mockResolvedValueOnce(Response.json({ data: { id: 1 } }, { status: 201 }));
  try {
    const response = await POST(
      new NextRequest("http://localhost/api/v1/admin/media/", {
        method: "POST",
        headers: { "x-forwarded-proto": "https" },
      }),
      context,
    );
    expect(response.status).toBe(201);
    const forwardedHeaders = vi.mocked(forwardToBackend).mock.calls[2][2];
    expect(forwardedHeaders.get("x-ctrlz-upload-ticket")).toBe(
      "test-only-grant",
    );
    expect(forwardedHeaders.get("x-forwarded-proto")).toBe("https");
    expect(cleanup).toHaveBeenCalledOnce();
  } finally {
    vi.unstubAllEnvs();
  }
});
