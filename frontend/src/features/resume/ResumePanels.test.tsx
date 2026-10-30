import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { PageBlock, Resume, Skill } from "@/types/api";
import {
  AchievementsPanel,
  CoursesCertificatesPanel,
  ResumeAboutPanel,
  ResumeSkillsPanel,
  WorkExperiencePanel,
} from "./ResumePanels";

vi.mock("@/components/hud/useHudMotion", () => ({
  useHudMotion: () => ({
    ref: { current: null },
    entered: true,
    reduced: true,
    interaction: { "data-active": true, "data-reduced": true },
  }),
}));
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useInView: () => false };
});
afterEach(cleanup);

const work: Resume["experience"][number] = {
  id: 1,
  title: "تدوینگر",
  company: "استودیو",
  start: "۱۴۰۳",
  end: "",
  description: "روایت تصویری",
  image: "",
  image_url: "",
  image_alt: "",
  is_current: true,
  accent: "gold",
  order: 0,
  visible: true,
};
const course: Resume["certificates"][number] = {
  id: 1,
  title: "Premiere Pro پیشرفته",
  issuer: "مرکز آموزش",
  year: "۱۴۰۲",
  url: "",
  description: "",
  icon: "Pr",
  icon_url: "",
  certificate_url: "https://example.com/cert.pdf",
  verification_url: "",
  order: 0,
  visible: true,
};
const skill: Skill = {
  id: 1,
  title: "Premiere Pro",
  kind: "software",
  level: 0,
  level_label: "آغاز راه",
  description: "",
  icon: "Pr",
  artwork: "",
  artwork_url: "",
  icon_url: "",
  accent: "blue",
  variant: "standard",
  order: 0,
  visible: true,
};

describe("resume HUD panels", () => {
  it("renders current experience, dynamic rows and missing image fallback", () => {
    render(
      <WorkExperiencePanel
        items={[
          work,
          {
            ...work,
            id: 2,
            title: "مدیر محتوا",
            is_current: false,
            end: "۱۴۰۴",
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("region", { name: "تجربه‌های کاری" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("۱۴۰۳ — اکنون")).toBeInTheDocument();
    expect(
      screen.getAllByRole("img", { name: "تصویر در دسترس نیست" }),
    ).toHaveLength(2);
  });
  it("renders certificate links only when present and handles many rows", () => {
    render(
      <CoursesCertificatesPanel
        items={Array.from({ length: 11 }, (_, i) => ({
          ...course,
          id: i + 1,
          certificate_url: i === 0 ? course.certificate_url : "",
        }))}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(11);
    expect(
      screen.getAllByRole("link", { name: /مشاهده گواهینامه/ }),
    ).toHaveLength(1);
    expect(screen.getAllByText("۱۴۰۲")).toHaveLength(11);
  });
  it("exposes numeric progress and a backend level label", () => {
    render(
      <ResumeSkillsPanel
        items={[skill, { ...skill, id: 2, level: 100, level_label: "" }]}
      />,
    );
    expect(
      screen.getByRole("progressbar", { name: "سطح Premiere Pro: آغاز راه" }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(
      screen.getByRole("progressbar", { name: "سطح Premiere Pro: پیشرفته" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });
  it("preserves zero and large achievement values", () => {
    const items: Resume["achievements"] = [
      {
        id: 1,
        title: "آغاز",
        value: "0",
        numeric_value: 0,
        prefix: "+",
        suffix: "",
        icon: "play",
        description: "",
        order: 0,
        visible: true,
      },
      {
        id: 2,
        title: "بازدید",
        value: "100K+",
        numeric_value: 100,
        prefix: "+",
        suffix: "K",
        icon: "users",
        description: "",
        order: 1,
        visible: true,
      },
    ];
    render(<AchievementsPanel items={items} />);
    expect(screen.getByLabelText("0")).toHaveTextContent("+۰");
    expect(screen.getByLabelText("100K+")).toHaveTextContent("+۱۰۰K");
  });
  it("uses independent CMS visuals and story text", () => {
    const block: PageBlock = {
      id: 1,
      key: "resume-about",
      title: "داستان من",
      subtitle: "زیرعنوان قابل مدیریت",
      body: "متن قابل مدیریت",
      image_url: "/api/v1/media/41/",
      secondary_image_url: "/api/v1/media/42/",
      items: [
        { title: "آغاز مسیر" },
        {
          title: "پشت نما",
          image: "/assets/components/resume-about-back.webp",
        },
        { title: "چهره", image: "/assets/components/resume-about-face.webp" },
      ],
    };
    const { container } = render(
      <ResumeAboutPanel block={block} bio="متن جایگزین" />,
    );
    expect(screen.getByRole("region", { name: "داستان من" })).toHaveTextContent(
      "متن قابل مدیریت",
    );
    expect(screen.getByText("زیرعنوان قابل مدیریت")).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll("img")).map(
        (img) => new URL(img.src).pathname,
      ),
    ).toEqual(["/api/v1/media/41/", "/api/v1/media/42/"]);
    expect(screen.getByRole("link", { name: /شروع همکاری/ })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
