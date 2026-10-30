import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AnimatedTypewriterText from "./AnimatedTypewriterText";

vi.mock("./useReducedMotionPreference", () => ({
  useReducedMotionPreference: () => false,
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AnimatedTypewriterText", () => {
  it("types graphemes, holds the full text for 5000ms, deletes and repeats", () => {
    vi.useFakeTimers();
    const { container } = render(
      <AnimatedTypewriterText text="آب" locale="fa" />,
    );
    const visible = () =>
      container.querySelector(".typewriter-visual")?.textContent?.trim() || "";
    expect(visible()).toBe("");
    act(() => vi.advanceTimersByTime(70));
    expect(visible()).toBe("آ");
    act(() => vi.advanceTimersByTime(70));
    expect(visible()).toBe("آب");
    act(() => vi.advanceTimersByTime(4999));
    expect(visible()).toBe("آب");
    act(() => vi.advanceTimersByTime(1));
    expect(visible()).toBe("آ");
    act(() => vi.advanceTimersByTime(45));
    expect(visible()).toBe("");
    act(() => vi.advanceTimersByTime(70));
    expect(visible()).toBe("آ");
    expect(
      screen.getByText("آب", { selector: ".sr-only" }),
    ).toBeInTheDocument();
  });
  it("renders the complete string when animation is disabled", () => {
    const { container } = render(
      <AnimatedTypewriterText text="Hello" locale="en" enabled={false} />,
    );
    expect(container.querySelector(".typewriter-visual")).toHaveTextContent(
      "Hello",
    );
  });
});
