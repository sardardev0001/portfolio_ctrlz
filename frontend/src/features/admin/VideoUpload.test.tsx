import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import VideoUpload from "./VideoUpload";
import { inspectVideo, uploadMedia } from "@/lib/media-upload";
import { translate } from "@/i18n/core";

vi.mock("@/i18n/provider", () => ({
  useT: () => (key: string) => translate(key, "fa"),
  usePreferences: () => ({ locale: "fa" }),
}));
vi.mock("@/lib/media-upload", () => ({
  inspectVideo: vi.fn(),
  uploadMedia: vi.fn(),
}));
beforeEach(() => {
  vi.resetAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:video");
  URL.revokeObjectURL = vi.fn();
});
it("shows size and duration, progress and cancellation without changing the existing asset", async () => {
  vi.mocked(inspectVideo).mockResolvedValue(0.1);
  vi.mocked(uploadMedia).mockImplementation(
    (_file, progress, signal) =>
      new Promise((_resolve, reject) => {
        progress(50);
        signal?.addEventListener("abort", () =>
          reject(new DOMException("Cancelled", "AbortError")),
        );
      }),
  );
  const onChange = vi.fn();
  const { container } = render(
    <VideoUpload
      value={42}
      onChange={onChange}
      onUploaded={vi.fn()}
      onBusy={vi.fn()}
    />,
  );
  fireEvent.change(container.querySelector("input")!, {
    target: {
      files: [new File(["video"], "short.mp4", { type: "video/mp4" })],
    },
  });
  await waitFor(() =>
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "50"),
  );
  expect(screen.getByText(/حجم فایل/)).toHaveTextContent("مدت ویدیو");
  fireEvent.click(screen.getByRole("button", { name: "لغو آپلود" }));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("آپلود لغو شد"),
  );
  expect(onChange).not.toHaveBeenCalled();
  expect(container.querySelector("video")).toHaveAttribute(
    "src",
    "/api/v1/media/42/",
  );
});
it("rejects failed preflight before uploading", async () => {
  vi.mocked(inspectVideo).mockRejectedValue(new Error("invalid"));
  const { container } = render(
    <VideoUpload
      value={null}
      onChange={vi.fn()}
      onUploaded={vi.fn()}
      onBusy={vi.fn()}
    />,
  );
  fireEvent.change(container.querySelector("input")!, {
    target: { files: [new File(["bad"], "bad.mp4", { type: "video/mp4" })] },
  });
  await screen.findByRole("alert");
  expect(uploadMedia).not.toHaveBeenCalled();
});
