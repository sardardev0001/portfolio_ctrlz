import { expect, test, type Page } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { solveLoginChallenge } from "./solve-login-challenge";

// These write tests are deliberately opt-in and must target an isolated QA database.
test.skip(
  process.env.CTRLZ_QA_WRITE_TESTS !== "true",
  "Requires an isolated QA backend and temporary staff account.",
);
const output = resolve("../docs/qa/admin-i18n-upgrade");
mkdirSync(output, { recursive: true });
const videoPath = resolve("../backend/seed_assets/demo-preview-30.webm");
async function login(page: Page) {
  await page.goto("/admin/login");
  await page
    .locator('input[autocomplete="username"]')
    .fill(process.env.E2E_ADMIN_USERNAME!);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill(process.env.E2E_ADMIN_PASSWORD!);
  await solveLoginChallenge(page);
  await page.locator("form > button.button").click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator(".admin-sidebar")).toBeVisible();
}
async function english(page: Page) {
  if ((await page.locator("html").getAttribute("lang")) !== "en") {
    await page.locator(".admin-top .language-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
}
async function csrf(page: Page) {
  return (await (await page.request.get("/api/v1/auth/csrf/")).json()).data
    .csrf_token as string;
}

test("all create forms are centered dialogs; locale, focus and unsaved changes survive", async ({
  page,
}, info) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", (error) =>
    errors.push(`${page.url()}: ${error.message}`),
  );
  await login(page);
  await english(page);
  for (const route of [
    "portfolio",
    "categories",
    "skill-categories",
    "skills",
    "experience",
    "education",
    "certificates",
    "achievements",
    "heroes",
    "blocks",
    "stats",
    "socials",
    "media",
    "gallery",
    "users",
  ]) {
    await page.goto(`/admin/${route}`);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    const box = (await dialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(
      12,
    );
    expect(box.y).toBeGreaterThanOrEqual(10);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 10);
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement)),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Add", exact: true }),
    ).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden",
    );
  }
  await page.goto("/admin/messages");
  await expect(
    page.getByRole("button", { name: "Add", exact: true }),
  ).toHaveCount(0);
  await page.goto("/admin/portfolio");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.locator("#title").fill("Preserved draft");
  await page.locator("dialog .language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("#title")).toHaveValue("Preserved draft");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(2);
  await page
    .getByRole("button", { name: "دور ریختن تغییرات", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
  await page.getByRole("button", { name: "افزودن", exact: true }).click();
  await page.screenshot({
    path: resolve(output, `${info.project.name}-modal-fa.png`),
  });
  await page.keyboard.press("Escape");
  await page.goto("/admin/audit");
  const before = await page
    .locator(".admin-sidebar")
    .evaluate((el) => el.scrollTop);
  await page.locator('.admin-sidebar a[href="/admin/users"]').click();
  await expect(
    page.locator('.admin-sidebar a[href="/admin/users"]'),
  ).toHaveAttribute("aria-current", "page");
  const after = await page
    .locator(".admin-sidebar")
    .evaluate((el) => el.scrollTop);
  expect(after).toBeGreaterThan(0);
  expect(Math.abs(after - before)).toBeLessThan(100);
  await page.locator(".admin-top .language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(
    await page.locator(".admin-sidebar").evaluate((el) => el.scrollTop),
  ).toBe(after);
  expect(errors).toEqual([]);
});

test("project video uploads, plays, replaces and removes through the real API", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await login(page);
  await english(page);
  const slug = `qa-video-${info.project.name}-${Date.now()}`;
  await page.goto("/admin/portfolio");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.locator("#title").fill(slug);
  await page.locator("#slug").fill(slug);
  await page.locator("#category").selectOption({ index: 1 });
  await page.locator("#status").selectOption("published");
  const faTitle = "پروژهٔ آزمون ویدیو";
  const enTitle = "Bilingual video test project";
  for (const [index, language, title] of [
    [0, "fa", faTitle],
    [1, "en", enTitle],
  ] as const) {
    await page
      .locator("dialog .translations-editor details")
      .nth(index)
      .locator("summary")
      .click();
    await page
      .locator(`dialog textarea[lang="${language}"]`)
      .first()
      .fill(title);
  }
  await page.locator(".video-upload input").setInputFiles(videoPath);
  await expect(page.locator(".video-upload [role=status]")).toContainText(
    "Video validated",
    { timeout: 60000 },
  );
  await page
    .locator(".admin-form")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  const projects = (
    await (
      await page.request.get(`/api/v1/admin/projects/?search=${slug}`)
    ).json()
  ).data;
  expect(projects).toHaveLength(1);
  const record = projects[0];
  expect(record.translations.fa.title).toBe(faTitle);
  expect(record.translations.en.title).toBe(enTitle);
  const oldAsset = record.video_asset;
  await page.goto(`/portfolio/${slug}`);
  await expect(page.locator("main h1")).toHaveText(enTitle);
  await page.locator(".site-header .language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("main h1")).toHaveText(faTitle);
  await page.locator(".site-header .language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const video = page.locator(".detail-video-section video");
  await expect(video).toHaveAttribute("controls", "");
  await expect(video).toHaveAttribute("playsinline", "");
  await video.evaluate(async (el) => {
    el.muted = true;
    await el.play();
  });
  await expect
    .poll(() => video.evaluate((el) => el.currentTime))
    .toBeGreaterThan(0.2);
  await video.evaluate((el) => el.pause());
  expect(await video.evaluate((el) => el.paused)).toBe(true);
  await page.route(`**/api/v1/media/${oldAsset}/`, (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await video.evaluate((el) => el.load());
  await expect(
    page.getByRole("alert").filter({ hasText: "Video playback failed" }),
  ).toBeVisible();
  await page.unroute(`**/api/v1/media/${oldAsset}/`);
  await page.screenshot({
    path: resolve(output, `${info.project.name}-video.png`),
  });
  await page.goto(`/admin/portfolio?search=${slug}`);
  // Search state is intentionally owned by the table, so target the known title.
  await page.getByPlaceholder("Search…").fill(slug);
  await page
    .getByRole("row")
    .filter({ hasText: slug })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await page.locator(".video-upload input").setInputFiles(videoPath);
  await expect(page.locator(".video-upload [role=status]")).toContainText(
    "Video validated",
    { timeout: 60000 },
  );
  await page
    .locator(".admin-form")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  expect((await page.request.get(`/api/v1/media/${oldAsset}/`)).status()).toBe(
    404,
  );
  await page
    .getByRole("row")
    .filter({ hasText: slug })
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await page.getByRole("button", { name: "Remove video", exact: true }).click();
  await page
    .locator(".admin-form")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.goto(`/portfolio/${slug}`);
  await expect(page.locator(".detail-video-section")).toHaveCount(0);
  await page.request.delete(`/api/v1/admin/projects/${record.id}/`, {
    headers: { "X-CSRFToken": await csrf(page) },
  });
});

test("two resume slots download only their own language and persist after refresh", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(180000);
  await login(page);
  await english(page);
  const source = readFileSync(
    resolve("../backend/seed_assets/resume-demo.pdf"),
  );
  const ids: number[] = [];
  for (const lang of ["fa", "en"]) {
    await page.goto("/admin/resume-files");
    const card = page.locator(".admin-card").filter({
      has: page.getByRole("heading", {
        name: lang === "fa" ? "Persian resume (FA)" : "English resume (EN)",
        exact: true,
      }),
    });
    await card
      .getByRole("button", { name: "Replace file", exact: true })
      .click();
    await page.locator('dialog input[type="file"]').setInputFiles({
      name: `QA-${lang}.pdf`,
      mimeType: "application/pdf",
      buffer: Buffer.concat([source, Buffer.from(`\n% QA ${lang}\n`)]),
    });
    await page
      .locator("dialog form")
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await page.reload();
    await expect(card).toContainText(`QA-${lang}.pdf`);
    const row = (
      await (await page.request.get("/api/v1/admin/resume-files/")).json()
    ).data.find((r: { language: string }) => r.language === lang);
    ids.push(row.id);
    const response = await page.request.get(`/api/v1/resume/${lang}/download/`);
    expect(response.headers()["content-type"]).toBe("application/pdf");
    expect(response.headers()["content-disposition"]).toContain(
      `${lang.toUpperCase()}.pdf`,
    );
    expect((await response.body()).toString().endsWith(`% QA ${lang}\n`)).toBe(
      true,
    );
  }
  for (const lang of ["fa", "en"]) {
    await context.addCookies([
      { name: "ctrlz-locale", value: lang, url: baseURL! },
    ]);
    await page.goto("/resume");
    await expect(page.locator(".download-button")).toHaveAttribute(
      "href",
      `/api/v1/resume/${lang}/download/`,
    );
  }
  for (const id of ids)
    await page.request.delete(`/api/v1/admin/resume-files/${id}/`, {
      headers: { "X-CSRFToken": await csrf(page) },
    });
  await page.goto("/resume");
  await expect(page.locator(".download-button")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("not available");
});

test("settings save/refresh, public metadata, real and empty analytics", async ({
  page,
}) => {
  test.setTimeout(120000);
  await login(page);
  await english(page);
  await page.goto("/admin/settings");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const description = `QA metadata ${Date.now()}`;
  await page.locator("#description").fill(description);
  await page
    .locator(".admin-form")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.locator("#description")).toHaveValue(description);
  await page.keyboard.press("Escape");
  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description,
  );
  await page.goto("/admin/analytics");
  await expect(
    page.getByRole("heading", { name: "Traffic analytics" }),
  ).toBeVisible();
  await expect(page.locator(".admin-metrics")).not.toContainText("—");
  const token = await csrf(page);
  const response = await page.request.post("/api/v1/analytics/", {
    headers: { "X-CSRFToken": token },
    data: { page: "/contact", token: `qa-event-${Date.now()}` },
  });
  expect(response.status()).toBe(201);
  const report = await (
    await page.request.get("/api/v1/admin/analytics/?days=7")
  ).json();
  expect(report.data.views).toBeGreaterThan(0);
  await page.locator(".analytics-filters select").selectOption("custom");
  await page.locator('input[type="date"]').nth(0).fill("2020-01-01");
  await page.locator('input[type="date"]').nth(1).fill("2020-01-07");
  await page.getByRole("button", { name: "Apply filter", exact: true }).click();
  await expect(
    page.getByText("No data", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".analytics-filters select")).toHaveValue("30");
});

test("public and admin responsive locales, fixed theme, favicon, and scrollbars", async ({
  page,
  context,
  baseURL,
}, info) => {
  test.setTimeout(300000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);
  const errors: string[] = [];
  page.on("pageerror", (error) =>
    errors.push(`${page.url()}: ${error.message}`),
  );
  for (const locale of ["fa", "en"]) {
    await context.addCookies([
      { name: "ctrlz-locale", value: locale, url: baseURL! },
      { name: "ctrlz-theme", value: "light", url: baseURL! },
    ]);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      for (const route of [
        "/",
        "/about",
        "/portfolio",
        "/skills",
        "/resume",
        "/contact",
        "/admin",
        "/admin/analytics",
        "/admin/settings",
      ]) {
        expect((await page.goto(route))?.status()).toBe(200);
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
        expect(
          await page.evaluate(
            () => getComputedStyle(document.documentElement).colorScheme,
          ),
        ).toBe("dark");
        await expect(page.locator("main h1").first()).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          `${route}/${width}/${locale}`,
        ).toBe(true);
        expect(
          await page.evaluate(
            () => getComputedStyle(document.body).scrollbarWidth,
          ),
        ).toBe("thin");
        if (route === "/contact" || route === "/admin/analytics")
          await page.screenshot({
            path: resolve(
              output,
              `${info.project.name}-${locale}-dark-${width}-${route.split("/").at(-1)}.png`,
            ),
          });
      }
    }
  }
  for (const icon of [
    "/favicon.svg?v=2",
    "/favicon-16.png?v=2",
    "/favicon-32.png?v=2",
    "/apple-touch-icon.png?v=2",
    "/site.webmanifest",
  ])
    expect((await page.request.get(icon)).status()).toBe(200);
  expect(errors).toEqual([]);
});

test("every admin resource renders in both locales and Persian create dialogs", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(240000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await login(page);
  const routes = [
    "portfolio",
    "categories",
    "skill-categories",
    "skills",
    "experience",
    "education",
    "certificates",
    "achievements",
    "resume-files",
    "messages",
    "heroes",
    "blocks",
    "stats",
    "socials",
    "profiles",
    "media",
    "gallery",
    "analytics",
    "users",
    "settings",
    "audit",
  ];
  for (const locale of ["fa", "en"]) {
    await context.addCookies([
      { name: "ctrlz-locale", value: locale, url: baseURL! },
    ]);
    for (const route of routes) {
      expect((await page.goto(`/admin/${route}`))?.status()).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible();
      const active = page
        .locator(`.admin-sidebar a[href="/admin/${route}"]`)
        .first();
      await expect(active).toHaveAttribute("aria-current", "page");
      expect(await page.locator("main").innerText()).not.toMatch(
        /column\.[a-z_]+/,
      );
      if (locale === "en")
        expect(await page.locator(".admin-sidebar").innerText()).not.toMatch(
          /[\u0600-\u06ff]/,
        );
      const add = page.getByRole("button", { name: "افزودن", exact: true });
      if (locale === "fa" && (await add.count())) {
        await add.click();
        await expect(page.locator("dialog[open]")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.locator("dialog[open]")).toHaveCount(0);
      }
    }
  }
});

test("dashboard create route preserves the success notice after navigation", async ({
  page,
}) => {
  await login(page);
  await english(page);
  const slug = `qa-new-route-${Date.now()}`;
  await page.goto("/admin/portfolio/new");
  await page.locator("#title").fill(slug);
  await page.locator("#slug").fill(slug);
  await page.locator("#category").selectOption({ index: 1 });
  await page
    .locator(".admin-form")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/portfolio$/);
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  const row = (
    await (
      await page.request.get(`/api/v1/admin/projects/?search=${slug}`)
    ).json()
  ).data[0];
  expect(row.slug).toBe(slug);
  await page.request.delete(`/api/v1/admin/projects/${row.id}/`, {
    headers: { "X-CSRFToken": await csrf(page) },
  });
});
