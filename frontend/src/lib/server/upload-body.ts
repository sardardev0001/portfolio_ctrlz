import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm, statfs } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

export const MAX_UPLOAD_BODY = 1_073_741_824 + 1_048_576;
export const UPLOAD_TIMEOUT_MS = 3_900_000;
export class UploadTooLarge extends Error {}
export class UploadDiskFull extends Error {}

// WSGI requires Content-Length. Spool even chunked requests to a private disk
// file, with backpressure, then stream to Django with the measured length.
// No whole-file Buffer/FormData/arrayBuffer is created at either stage.
export async function spoolBody(
  body: ReadableStream<Uint8Array> | null,
  signal: AbortSignal,
  limit = MAX_UPLOAD_BODY,
) {
  const directory = await mkdtemp(join(tmpdir(), "ctrlz-upload-"));
  const path = join(directory, "body");
  const cleanup = () => rm(directory, { recursive: true, force: true });
  let size = 0;
  try {
    const disk = await statfs(directory, { bigint: true });
    // Leave room for the Django disk upload, its persistent copy and system
    // operations on a small VPS. Requests without a length reserve the cap.
    if (
      disk.bavail * disk.bsize <
      BigInt(limit) * BigInt(3) + BigInt(536_870_912)
    )
      throw new UploadDiskFull();
    await pipeline(
      body
        ? Readable.fromWeb(body as NodeReadableStream<Uint8Array>)
        : Readable.from([]),
      new Transform({
        transform(chunk, _encoding, callback) {
          size += chunk.length;
          callback(size > limit ? new UploadTooLarge() : null, chunk);
        },
      }),
      createWriteStream(path, { flags: "wx", mode: 0o600 }),
      { signal },
    );
    return { path, size, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

// Node's HTTP client avoids fetch's shorter built-in response-header deadline
// during a large upload. The caller's AbortSignal bounds the entire operation.
export function forwardToBackend(
  url: URL,
  method: string,
  headers: Headers,
  signal: AbortSignal,
  bodyPath?: string,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const outgoing = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      { method, headers: Object.fromEntries(headers), signal },
      (incoming) => {
        const responseHeaders = new Headers();
        for (let i = 0; i < incoming.rawHeaders.length; i += 2)
          responseHeaders.append(
            incoming.rawHeaders[i],
            incoming.rawHeaders[i + 1],
          );
        const status = incoming.statusCode || 502;
        const noBody = method === "HEAD" || status === 204 || status === 304;
        if (noBody) incoming.resume();
        resolve(
          new Response(
            noBody
              ? null
              : (Readable.toWeb(incoming) as ReadableStream<Uint8Array>),
            {
              status,
              headers: responseHeaders,
            },
          ),
        );
      },
    );
    outgoing.on("error", reject);
    if (bodyPath) {
      void pipeline(createReadStream(bodyPath), outgoing, { signal }).catch(
        reject,
      );
    } else outgoing.end();
  });
}
