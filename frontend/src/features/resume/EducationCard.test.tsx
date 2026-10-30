import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Education } from "@/types/api";
import EducationCard, { educationDates } from "./EducationCard";

vi.mock("@/components/hud/useHudMotion", () => ({
  useHudMotion: () => ({
    ref: { current: null },
    entered: true,
    reduced: true,
    interaction: { "data-active": true, "data-reduced": true },
  }),
  hudItem: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
}));
afterEach(cleanup);
const education: Education = {
  id: 1,
  degree: "کارشناسی",
  field: "گرافیک",
  institution: "دانشگاه نمونه",
  start_year: "۱۳۹۸",
  end_year: "۱۴۰۲",
  is_current: false,
  years: "",
  description: "آشنایی با اصول روایت تصویری",
  image: "/assets/components/university.webp",
  image_url: "",
  image_alt: "نمای دانشگاه نمونه",
  accent: "red",
  visible: true,
  order: 0,
};
describe("EducationCard", () => {
  it("renders semantic API data, degree, institution and completed years", () => {
    render(<EducationCard education={education} />);
    expect(
      screen.getByRole("article", { name: "تحصیلات" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "کارشناسی گرافیک",
    );
    expect(screen.getByText("دانشگاه نمونه")).toBeInTheDocument();
    expect(screen.getByText("۱۳۹۸ — ۱۴۰۲")).toBeInTheDocument();
    expect(screen.getByAltText("نمای دانشگاه نمونه")).toBeInTheDocument();
  });
  it("uses اکنون for current education or a missing end year", () => {
    expect(educationDates({ ...education, is_current: true })).toBe(
      "۱۳۹۸ — اکنون",
    );
    expect(educationDates({ ...education, end_year: "" })).toBe("۱۳۹۸ — اکنون");
  });
  it("preserves older API date strings", () => {
    expect(
      educationDates({
        ...education,
        start_year: "",
        end_year: "",
        years: "۱۳۹۰ — ۱۳۹۴",
      }),
    ).toBe("۱۳۹۰ — ۱۳۹۴");
  });
  it("provides an accessible fallback when the optional image is missing", () => {
    render(<EducationCard education={{ ...education, image: "" }} />);
    expect(
      screen.getByRole("img", { name: "تصویر دانشگاه در دسترس نیست" }),
    ).toBeInTheDocument();
  });
  it("recovers when an image fails to load", () => {
    render(<EducationCard education={education} />);
    fireEvent.error(screen.getByAltText("نمای دانشگاه نمونه"));
    expect(
      screen.getByRole("img", { name: "تصویر دانشگاه در دسترس نیست" }),
    ).toBeInTheDocument();
  });
  it("keeps long editorial text complete", () => {
    const description =
      "توضیح کامل و طولانی برای بررسی روایت تصویری و طراحی گرافیک ".repeat(12);
    render(
      <EducationCard
        education={{
          ...education,
          degree: "کارشناسی ارشد طراحی و ارتباطات بصری",
          institution: "دانشگاه هنر، معماری و رسانه‌های نوین",
          description,
        }}
      />,
    );
    expect(
      screen.getByText("دانشگاه هنر، معماری و رسانه‌های نوین"),
    ).toBeInTheDocument();
    expect(screen.getByText(/توضیح کامل و طولانی/)).toHaveTextContent(
      description.trim(),
    );
  });
});
