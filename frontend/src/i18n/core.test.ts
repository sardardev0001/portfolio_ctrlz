import { describe, expect, it } from "vitest";
import { localize, missingTranslationKeys, translate } from "./core";
import { validSocial } from "@/lib/social";
import type { Social } from "@/types/api";

describe("locale content and social publication", () => {
  it("detects missing named messages", () => {
    expect(translate("common.nonexistent_test_key", "en")).toBe(
      "common.nonexistent_test_key",
    );
    expect(missingTranslationKeys.has("common.nonexistent_test_key")).toBe(
      true,
    );
  });
  it("keeps technical values stable in both locales", () => {
    const item = {
      status: "published",
      kind: "software",
      slug: "draft",
      language: "en",
      platform: "email",
      title: "نمونه‌کارها",
    };
    for (const locale of ["fa", "en"] as const) {
      const result = localize(item, locale);
      expect(result.status).toBe("published");
      expect(result.kind).toBe("software");
      expect(result.slug).toBe("draft");
      expect(result.language).toBe("en");
      expect(result.platform).toBe("email");
    }
  });
  it("retains stable category keys and original editorial fallback", () => {
    const record = {
      title: "نمونه‌کارها",
      slug: "cinematic",
      body: "متن اختصاصی ترجمه نشده",
    };
    expect(localize(record, "en")).toEqual({
      title: "Portfolio",
      slug: "cinematic",
      body: record.body,
    });
    expect(translate("مشاهده ", "en")).toBe("View ");
    expect(
      localize(
        {
          category_title: "عنوان تازه",
          category_translations: { en: { title: "New category" } },
        },
        "en",
      ).category_title,
    ).toBe("New category");
  });
  it("merges translated card text without losing its image or category", () => {
    const record = {
      items: [
        { title: "سینما", image: "/assets/a.webp", category_slug: "cinematic" },
      ],
      translations: { en: { items: [{ title: "Cinema" }] } },
    };
    expect(localize(record, "en").items[0]).toEqual({
      title: "Cinema",
      image: "/assets/a.webp",
      category_slug: "cinematic",
    });
  });
  it("publishes only owner-confirmed safe social URLs", () => {
    const social = {
      verified: true,
      url: "https://www.instagram.com/confirmed_account/",
    } as Social;
    expect(validSocial(social)).toBe(true);
    expect(validSocial({ ...social, verified: false })).toBe(false);
    for (const url of [
      "javascript:alert(1)",
      "https://example.com/a",
      "",
      "https://user:pass@social.com/",
    ]) {
      expect(validSocial({ ...social, url })).toBe(false);
    }
  });
});
