import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { api, ApiFailure } from "@/lib/api";
import ContactMessageForm, { contactSchema } from "./ContactMessageForm";

vi.mock("@/lib/api", async (original) => ({
  ...(await original<typeof import("@/lib/api")>()),
  api: vi.fn(),
}));
vi.mock("@/components/hud/useHudMotion", () => ({
  useHudMotion: () => ({
    ref: { current: null },
    entered: true,
    interaction: { "data-active": true, "data-reduced": true },
  }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const values = {
  name: "Test Editor",
  email: "test@example.com",
  subject: "Project request",
  message: "Please edit a sample video project.",
};
function showForm() {
  render(<ContactMessageForm title="ارسال پیام" description="فرم تماس" />);
}
function fillForm() {
  fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), {
    target: { value: values.name },
  });
  fireEvent.change(screen.getByLabelText("ایمیل"), {
    target: { value: values.email },
  });
  fireEvent.change(screen.getByLabelText("موضوع"), {
    target: { value: values.subject },
  });
  fireEvent.change(screen.getByLabelText("پیام شما"), {
    target: { value: values.message },
  });
}

describe("contact message behavior", () => {
  it("enforces the same field limits as the API", () => {
    expect(contactSchema.safeParse(values).success).toBe(true);
    for (const invalid of [
      { name: "x" },
      { email: "bad" },
      { subject: "Hi" },
      { message: "short" },
      { name: "x".repeat(101) },
      { subject: "x".repeat(161) },
      { message: "x".repeat(5001) },
    ])
      expect(contactSchema.safeParse({ ...values, ...invalid }).success).toBe(
        false,
      );
  });

  it("connects accessible errors to the fields and focuses the first invalid field", async () => {
    showForm();
    fireEvent.click(screen.getByRole("button", { name: "ارسال پیام" }));
    const error = await screen.findByText("نام خود را کامل وارد کنید.");
    const input = screen.getByPlaceholderText("نام شما");
    expect(input).toHaveAttribute("aria-describedby", error.id);
    expect(input).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(input).toHaveFocus());
    expect(api).not.toHaveBeenCalled();
  });

  it("prevents repeated sending, announces loading, resets only after success", async () => {
    let resolveRequest!: (value: Awaited<ReturnType<typeof api>>) => void;
    vi.mocked(api).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    showForm();
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "ارسال پیام" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "در حال ارسال..." }),
      ).toBeDisabled(),
    );
    fireEvent.submit(
      screen.getByRole("button", { name: "در حال ارسال..." }).closest("form")!,
    );
    await waitFor(() => expect(api).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolveRequest({
        success: true,
        data: { received: true },
        message: "ok",
        error: null,
        meta: {},
      });
    });
    expect(
      await screen.findByText("پیام شما با موفقیت ارسال شد."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "پیام جدید" }));
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveValue("");
  });

  it.each([
    [new Error("network"), "ارتباط با سرور برقرار نشد."],
    [
      new ApiFailure("RATE_LIMITED", {}, 429),
      "درخواست‌های زیادی ارسال شده؛ کمی بعد دوباره تلاش کنید.",
    ],
    [
      new ApiFailure("SERVER_ERROR", {}, 500),
      "درخواست انجام نشد. دوباره تلاش کنید.",
    ],
  ])("keeps input available for retry after %s", async (failure, message) => {
    vi.mocked(api).mockRejectedValueOnce(failure);
    showForm();
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "ارسال پیام" }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText("پیام شما")).toHaveValue(values.message);
    expect(screen.getByRole("button", { name: "ارسال پیام" })).toBeEnabled();
  });
});
