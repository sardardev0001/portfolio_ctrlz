import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import SafeRichText from "./SafeRichText";

afterEach(cleanup);

it("renders common formatting and blocks raw HTML and unsafe URLs", () => {
  const { container } = render(
    <SafeRichText
      text={
        "## Heading\n\n**Bold** and *italic*\n\n- Item\n\n[unsafe](javascript:alert(1))\n\n<script>alert(1)</script>"
      }
    />,
  );
  expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
  expect(screen.getByText("Bold").tagName).toBe("STRONG");
  expect(screen.getByText("italic").tagName).toBe("EM");
  expect(screen.getByText("Item").tagName).toBe("LI");
  expect(container.querySelector("script")).toBeNull();
  expect(screen.getByText("unsafe").closest("a")).not.toHaveAttribute(
    "href",
    "javascript:alert(1)",
  );
});
