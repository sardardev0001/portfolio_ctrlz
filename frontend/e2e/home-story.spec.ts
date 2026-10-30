import { test, expect } from "@playwright/test";

const target = '[data-home-story="true"]';
const out = "../docs/qa/home-story-fix2";

test.beforeEach(async ({ context }) => {
  // A read-only QA run should neither record visits nor require analytics CSRF
  // origins for its temporary frontend port.
  await context.setExtraHTTPHeaders({ DNT: "1" });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "doNotTrack", { get: () => "1" });
  });
});

for (const locale of ["fa", "en"]) {
  test(`story layout, real assets and responsive ${locale}`, async ({
    page,
    context,
    baseURL,
  }, info) => {
    test.setTimeout(180000);
    await context.addCookies([
      { name: "ctrlz-locale", value: locale, url: baseURL! },
    ]);
    await context.setExtraHTTPHeaders({ DNT: "1" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    for (const width of [390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      expect((await page.goto("/"))?.status()).toBe(200);
      const section = page.locator(target);
      await section.scrollIntoViewIfNeeded();
      await expect(section.getByRole("heading", { level: 2 })).toContainText(
        locale === "fa"
          ? "هر فریم فرصتی برای روایت است"
          : "Every frame is a chance to tell a story",
      );
      const categories = (
        await (await page.request.get("/api/v1/content/")).json()
      ).data.categories;
      await expect(section.locator("a[data-category]")).toHaveCount(
        categories.length,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      for (const image of await section.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty("complete", true);
        expect(
          await image.evaluate(
            (element: HTMLImageElement) => element.naturalWidth,
          ),
        ).toBeGreaterThan(0);
      }
      await section.scrollIntoViewIfNeeded();
      const character = section.getByRole("img", { name: /CTRL.Z/ });
      const artwork = await character.boundingBox();
      const heading = await section
        .getByRole("heading", { level: 2 })
        .boundingBox();
      if (width >= 768)
        expect(artwork!.x + artwork!.width).toBeLessThan(heading!.x + 35);
      await expect(section.locator('a[href="/portfolio"]')).toBeVisible();
      await expect(section.locator('a[href="/skills"]')).toBeVisible();
      expect(
        await character.evaluate(
          (element) => getComputedStyle(element).animationName,
        ),
      ).toBe("none");
      await section.screenshot({
        path: `${out}/verified-${info.project.name}-${locale}-${width}.png`,
      });
      await expect(page.locator(".hero-home + " + target)).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test(`story controls, keyboard and locale preserve selection ${locale}`, async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: "ctrlz-locale", value: locale, url: baseURL! },
    ]);
    await context.setExtraHTTPHeaders({ DNT: "1" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const section = page.locator(target);
    const cards = section.locator("a[data-category]");
    await section.scrollIntoViewIfNeeded();
    const next = section.getByRole("button", {
      name: locale === "fa" ? "دستهٔ بعدی" : "Next category",
      exact: true,
    });
    await next.click();
    await expect(cards.nth(1)).toHaveAttribute("data-active", "true");
    await next.click();
    await expect(cards.nth(2)).toHaveAttribute("data-active", "true");
    await cards.nth(2).focus();
    await page.keyboard.press(locale === "fa" ? "ArrowLeft" : "ArrowRight");
    await expect(cards.nth(3)).toBeFocused();
    await expect(cards.nth(3)).toHaveAttribute("data-active", "true");
    await page.keyboard.press("End");
    await expect(cards.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(cards.first()).toBeFocused();
    await cards.nth(2).focus();
    const slug = await cards.nth(2).getAttribute("data-category");
    await page.locator(".site-header .language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      locale === "fa" ? "en" : "fa",
    );
    await expect(section.locator('a[data-active="true"]')).toHaveAttribute(
      "data-category",
      slug!,
    );
    await expect(page.locator("html")).toHaveAttribute(
      "dir",
      locale === "fa" ? "ltr" : "rtl",
    );
    // Space activates a real link with the same behavior as Enter.
    await section.locator(`a[data-category="${slug}"]`).focus();
    await page.keyboard.press("Space");
    await expect(page).toHaveURL(new RegExp(`/portfolio\\?category=${slug}$`));
  });
}

test("every story category reaches its real filter, survives refresh and history", async ({
  page,
  context,
  isMobile,
}) => {
  test.setTimeout(180000);
  await context.setExtraHTTPHeaders({ DNT: "1" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const categories = await page
    .locator(`${target} a[data-category]`)
    .evaluateAll((links) =>
      links.map((link) => ({
        slug: link.getAttribute("data-category")!,
        href: link.getAttribute("href")!,
      })),
    );
  expect(categories.length).toBeGreaterThan(0);
  for (const category of categories) {
    await page.goto("/");
    const link = page.locator(`${target} a[data-category="${category.slug}"]`);
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    const position = { x: box!.width * 0.5, y: 15 };
    if (isMobile) await link.tap({ position });
    else await link.click({ position });
    await expect(page).toHaveURL(
      new RegExp(`/portfolio\\?category=${category.slug}$`),
    );
    const response = await page.request.get(
      `/api/v1/projects/?category=${category.slug}&page_size=10`,
    );
    expect(response.ok()).toBe(true);
    const projects = (await response.json()).data;
    expect(
      projects.every(
        (project: { category_slug: string }) =>
          project.category_slug === category.slug,
      ),
    ).toBe(true);
    await expect(
      page.locator('.filter-list [aria-pressed="true"]'),
    ).toHaveCount(1);
    await expect(page.locator(".project-card")).toHaveCount(projects.length);
    if (projects.length === 0)
      await expect(page.locator(".feedback")).toBeVisible();
    await page.reload();
    expect(new URL(page.url()).searchParams.get("category")).toBe(
      category.slug,
    );
    await expect(page.locator(".project-card")).toHaveCount(projects.length);
    await page.goBack();
    await expect(page.locator(target)).toBeVisible();
  }
});
