import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { solveLoginChallenge } from "./solve-login-challenge";

const routes = ["/", "/about", "/portfolio", "/skills", "/resume", "/contact"];
const output = resolve("../docs/qa/production-upgrade");
mkdirSync(output, { recursive: true });

for (const locale of ["fa", "en"] as const) {
  test(`responsive production matrix ${locale}`, async ({
    page,
    context,
    baseURL,
  }, testInfo) => {
    test.setTimeout(300000);
    await context.addCookies([
      { name: "ctrlz-locale", value: locale, url: baseURL! },
    ]);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [360, 375, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 960 });
      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status(), route).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          locale === "fa" ? "rtl" : "ltr",
        );
        await expect(page.locator("html")).not.toHaveAttribute(
          "data-theme",
          /.+/,
        );
        await expect(page.locator(".theme-toggle")).toHaveCount(0);
        await expect(page.locator("main h1")).toBeVisible();
        if (route === "/skills")
          await expect(page.locator(".skill-card")).toHaveCount(6);
        if (route === "/portfolio")
          await expect(page.locator(".project-card")).toHaveCount(10);
        if (route === "/resume")
          await expect(page.locator(".experience-panel")).toBeVisible();
        const language = await page
          .locator(".site-header .language-toggle")
          .boundingBox();
        const nav = await page.locator(".site-header").boundingBox();
        expect(language).not.toBeNull();
        expect(language!.y).toBeGreaterThanOrEqual(nav!.y);
        expect(language!.y + language!.height).toBeLessThanOrEqual(
          nav!.y + nav!.height,
        );
        if (locale === "fa")
          expect(language!.x).toBeGreaterThan(nav!.x + nav!.width / 2);
        else
          expect(language!.x + language!.width).toBeLessThan(
            nav!.x + nav!.width / 2,
          );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${route} ${width}`,
        ).toBe(true);
        if (route === "/skills") {
          for (const grid of await page
            .locator(".skill-grid,.creative-grid")
            .all()) {
            const columns = await grid.evaluate(
              (el) =>
                getComputedStyle(el).gridTemplateColumns.split(" ").length,
            );
            expect(columns).toBe(width <= 600 ? 1 : width <= 1100 ? 2 : 3);
          }
        }
        if (route === "/resume") {
          expect(
            await page.locator(".resume-section").count(),
          ).toBeGreaterThanOrEqual(5);
          for (const section of await page.locator(".resume-section").all()) {
            expect(
              await section
                .locator(":scope > .resume-hud,:scope > .education-card")
                .count(),
            ).toBeLessThanOrEqual(2);
          }
        }
        if ((width === 375 || width === 1440) && route === "/") {
          for (const image of await page.locator("img").all())
            await image.scrollIntoViewIfNeeded();
          await expect
            .poll(() =>
              page
                .locator("img")
                .evaluateAll((images) =>
                  images.every((img) => img.complete && img.naturalWidth > 0),
                ),
            )
            .toBe(true);
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({
            path: resolve(output, `${locale}-fixed-${width}-home.png`),
            fullPage: true,
          });
        }
        const text = await page.locator("main").innerText();
        if (locale === "en")
          expect(text, `untranslated text on ${route}`).not.toMatch(
            /[\u0600-\u06ff]/,
          );
        expect(await page.locator('img[src*="logo-main"]').count()).toBe(0);
        expect(await page.locator(".site-footer").innerText()).not.toMatch(
          /نمایشی|demonstration|illustrative/i,
        );
      }
    }
    expect(errors).toEqual([]);
    await testInfo.attach("browser-errors", {
      body: JSON.stringify(errors),
      contentType: "application/json",
    });
    // The preference is already applied before any client JavaScript executes.
    const html = await (await context.request.get("/about")).text();
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(`dir="${locale === "fa" ? "rtl" : "ltr"}"`);
    expect(html).not.toContain("data-theme=");
  });
}

test("styles, filter history, full-card hit areas, keyboard and preferences", async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180000);
  await page.goto("/about");
  const styles = await page
    .locator(".style-link")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
  expect(styles).toHaveLength(5);
  for (const href of styles) {
    await page.goto("/about");
    await page.locator(`.style-link[href="${href}"]`).click();
    await expect(page).toHaveURL(new RegExp(href.replace("?", "\\?")));
    const slug = new URL(page.url()).searchParams.get("category")!;
    await expect(page.locator(".filter-list .selected")).toHaveCount(1);
    await page.reload();
    const response = await page.request.get(
      `/api/v1/projects/?category=${slug}`,
    );
    const data = (await response.json()).data;
    expect(
      data.every(
        (project: { category_slug: string }) => project.category_slug === slug,
      ),
    ).toBe(true);
    await expect(page.locator(".project-card")).toHaveCount(data.length);
    if (!data.length)
      await expect(page.locator(".feedback")).toContainText("پروژه‌ای");
  }
  await page.goto("/portfolio?category=cinematic");
  await expect(page.locator(".project-card").first()).toBeVisible();
  const initial = page.url();
  await page.getByRole("button", { name: "تغییر زبان", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(page.url()).toBe(initial);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
  for (const position of ["edge", "center", "text", "image", "bottom"]) {
    const card = page.locator(".project-card").first();
    await page.mouse.move(0, 0);
    await card.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(card).toHaveCSS("opacity", "1");
    await expect
      .poll(() =>
        card.evaluate((el) => {
          const m = getComputedStyle(el).transform;
          return m === "none" ? 0 : new DOMMatrixReadOnly(m).f;
        }),
      )
      .toBe(0);
    await expect(card).toHaveAttribute("data-entered", "true");
    const href = await card.locator("a").getAttribute("href");
    const box = (await card.boundingBox())!;
    const point =
      position === "edge"
        ? { x: box.x + 2, y: box.y + 12 }
        : position === "bottom"
          ? { x: box.x + box.width / 2, y: box.y + box.height - 3 }
          : position === "text"
            ? { x: box.x + 20, y: box.y + box.height - 25 }
            : {
                x: box.x + box.width / 2,
                y: box.y + box.height * (position === "image" ? 0.2 : 0.5),
              };
    if (!isMobile) {
      await page.mouse.move(point.x, point.y);
      await expect(card).toBeVisible();
      await expect
        .poll(() => card.evaluate((el) => el.matches(":hover")), {
          message: `Root hover at ${position}`,
        })
        .toBe(true);
      await expect(card.locator(".project-poster img")).not.toHaveCSS(
        "transform",
        "none",
      );
      await page.mouse.click(point.x, point.y);
    } else await page.touchscreen.tap(point.x, point.y);
    await expect(page).toHaveURL((url) => url.pathname === href!.split("?")[0]);
    await page.locator(".back-link").click();
    await expect(page).toHaveURL(initial);
  }
  const link = page.locator(".project-card a").first();
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/portfolio\/[^?]+/);
  await page
    .getByRole("button", { name: "Change language", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.goBack();
  await expect(page).toHaveURL(initial);
});

test("admin login, editorial translations, logout and unauthorized API", async ({
  page,
}) => {
  const username = process.env.E2E_ADMIN_USERNAME;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!username || !password)
    throw new Error("Secure QA credentials are required");
  expect((await page.request.get("/api/v1/admin/projects/")).status()).toBe(
    401,
  );
  await page.goto("/admin/login");
  await page.getByLabel("نام کاربری").fill(username);
  await page.getByLabel("رمز عبور").fill(password);
  await solveLoginChallenge(page);
  await page.getByRole("button", { name: "ورود امن" }).click();
  await expect(page.getByRole("heading", { name: "داشبورد" })).toBeVisible();
  const projects = (
    await (await page.request.get("/api/v1/admin/projects/")).json()
  ).data;
  const project = projects[0];
  const csrf = (await (await page.request.get("/api/v1/auth/csrf/")).json())
    .data.csrf_token;
  try {
    const updated = await page.request.patch(
      `/api/v1/admin/projects/${project.id}/`,
      {
        headers: { "X-CSRFToken": csrf },
        data: { translations: { en: { title: "QA editorial translation" } } },
      },
    );
    expect(updated.status()).toBe(200);
    await page
      .context()
      .addCookies([
        { name: "ctrlz-locale", value: "en", url: new URL(page.url()).origin },
      ]);
    await page.goto(`/portfolio/${project.slug}`);
    await expect(page.locator("h1")).toHaveText("QA editorial translation");
  } finally {
    const restored = await page.request.patch(
      `/api/v1/admin/projects/${project.id}/`,
      {
        headers: { "X-CSRFToken": csrf },
        data: { translations: project.translations || {} },
      },
    );
    expect(restored.status()).toBe(200);
  }
  await page.goto("/admin");
  await page.locator(".logout").click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await page.request.get("/api/v1/admin/projects/")).status()).toBe(
    401,
  );
  await page.goto("/admin/portfolio");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("every published detail, PDF, sitemap and localized 404", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(180000);
  const projects = (
    await (await page.request.get("/api/v1/projects/?page_size=100")).json()
  ).data;
  expect(projects.length).toBeGreaterThan(0);
  for (const project of projects) {
    const response = await page.goto(`/portfolio/${project.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(project.title);
  }
  const resume = (await (await page.request.get("/api/v1/resume/")).json())
    .data;
  for (const file of resume.files) {
    const response = await page.request.get(file.url);
    expect(response.status()).toBe(200);
    expect((await response.body()).subarray(0, 4).toString()).toBe("%PDF");
  }
  for (const path of ["/sitemap.xml", "/robots.txt", "/icon.png"])
    expect((await page.request.get(path)).status()).toBe(200);
  const missing = await page.goto("/missing-frame");
  expect(missing?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("این فریم");
  await context.addCookies([
    { name: "ctrlz-locale", value: "en", url: baseURL! },
  ]);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("This frame could not be found.");
});
