// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { forwardToBackend, MAX_UPLOAD_BODY, spoolBody } from "./upload-body";

describe("disk-backed API uploads", () => {
  it("allows 1 GiB plus multipart overhead", () => {
    expect(MAX_UPLOAD_BODY).toBe(1_073_741_824 + 1_048_576);
  });
  it("forwards measured Content-Length, cookies and bytes without buffering the body", async () => {
    const controller = new AbortController();
    const body = await spoolBody(
      new Response("multipart-test").body,
      controller.signal,
    );
    const server = createServer((request, response) => {
      expect(request.headers["content-length"]).toBe("14");
      let received = "";
      request.on("data", (chunk) => {
        received += chunk;
      });
      request.on("end", () => {
        response.setHeader("set-cookie", ["a=1; HttpOnly", "b=2; HttpOnly"]);
        response.end(received);
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    try {
      expect(await readFile(body.path, "utf8")).toBe("multipart-test");
      const address = server.address() as { port: number };
      const response = await forwardToBackend(
        new URL(`http://127.0.0.1:${address.port}`),
        "POST",
        new Headers({ "content-length": String(body.size) }),
        controller.signal,
        body.path,
      );
      expect(response.headers.getSetCookie()).toHaveLength(2);
      expect(await response.text()).toBe("multipart-test");
    } finally {
      await body.cleanup();
      server.close();
    }
    expect(existsSync(body.path)).toBe(false);
  });
  it("cleans partial files on overflow and cancellation", async () => {
    const before = (await readdir(tmpdir())).filter((name) =>
      name.startsWith("ctrlz-upload-"),
    );
    await expect(
      spoolBody(new Response("oversize").body, new AbortController().signal, 3),
    ).rejects.toThrow();
    const controller = new AbortController();
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(100));
      },
    });
    const pending = spoolBody(stream, controller.signal);
    setTimeout(() => controller.abort(), 20);
    await expect(pending).rejects.toThrow();
    expect(
      (await readdir(tmpdir())).filter((name) =>
        name.startsWith("ctrlz-upload-"),
      ),
    ).toEqual(before);
  });
});
