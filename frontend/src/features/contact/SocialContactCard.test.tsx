import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { track } from "@/lib/analytics";
import type { Social } from "@/types/api";
import SocialContactCard from "./SocialContactCard";

vi.mock("@/components/hud/useHudMotion", () => ({
  useHudMotion: () => ({
    ref: { current: null },
    entered: true,
    interaction: { "data-active": true, "data-reduced": false },
  }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
afterEach(cleanup);

const email: Social = {
  id: 1,
  platform: "email",
  label: "ایمیل",
  handle: "editor@example.com",
  url: "",
  display_value: "editor@example.com",
  href: "mailto:editor@example.com",
  description: "درخواست همکاری",
};

describe("SocialContactCard", () => {
  it("records only owner-confirmed social destinations", () => {
    vi.mocked(track).mockClear();
    const { rerender } = render(<SocialContactCard social={email} />);
    const link = screen.getAllByRole("link")[0];
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(track).not.toHaveBeenCalled();
    rerender(<SocialContactCard social={{ ...email, verified: true }} />);
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith("social", "email");
  });
  it("renders editable API text as selectable mailto links", () => {
    render(<SocialContactCard social={email} />);
    expect(screen.getByRole("heading", { name: "ایمیل" })).toBeInTheDocument();
    expect(screen.getByText("درخواست همکاری")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "mailto:editor@example.com");
    expect(links[0]).not.toHaveAttribute("target");
  });

  it("keeps long values complete and secures external destinations", () => {
    const handle = `@${"longhandle".repeat(8)}`;
    render(
      <SocialContactCard
        social={{
          ...email,
          platform: "instagram",
          display_value: handle,
          href: "https://www.instagram.com/ctrlz.edits/",
        }}
      />,
    );
    const value = screen.getByRole("link", { name: handle });
    expect(value).toHaveAttribute("dir", "ltr");
    expect(value).toHaveAttribute("target", "_blank");
    expect(value).toHaveAttribute("rel", "noopener noreferrer");
    expect(value).toHaveTextContent(handle);
  });

  it("supports optional descriptions and refuses a missing backend destination", () => {
    const { rerender } = render(
      <SocialContactCard social={{ ...email, description: "" }} />,
    );
    expect(screen.queryByText("درخواست همکاری")).not.toBeInTheDocument();
    rerender(<SocialContactCard social={{ ...email, href: "" }} />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
