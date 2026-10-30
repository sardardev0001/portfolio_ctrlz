import { test, expect } from "@playwright/test";
import { solveLoginChallenge } from "./solve-login-challenge";
const routes = ["/", "/about", "/portfolio", "/skills", "/resume", "/contact"];
for (const route of routes)
  test(`public route ${route} loads without broken images`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".hero-copy h1")).toBeVisible();
    if (route === "/skills")
      await expect(page.locator(".creative-card")).toHaveCount(7);
    if (route === "/portfolio")
      await expect(page.locator(".project-card")).toHaveCount(10);
    if (route === "/resume")
      await expect(page.locator(".experience-panel")).toBeVisible();
    for (const img of await page.locator("img").all())
      await img.scrollIntoViewIfNeeded();
    for (const card of await page
      .locator(
        ".info-card,.project-card,.skill-card,.creative-card,.timeline-item,.resume-card",
      )
      .all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card).toHaveCSS("opacity", "1");
    }
    if (route === "/skills") {
      for (const bar of await page.getByRole("progressbar").all()) {
        await bar.scrollIntoViewIfNeeded();
        if (await bar.locator("i").count()) {
          await expect(bar.locator("i").first()).toHaveCSS("opacity", "1");
          const level = Number(await bar.getAttribute("aria-valuenow"));
          await expect(bar.locator(".is-filled")).toHaveCount(
            Math.round((level * 12) / 100),
          );
          continue;
        }
        await expect
          .poll(() =>
            bar.locator("span").evaluate((element) => {
              const transform = getComputedStyle(element).transform;
              return transform === "none"
                ? 1
                : new DOMMatrixReadOnly(transform).a;
            }),
          )
          .toBe(1);
      }
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect
      .poll(async () =>
        page
          .locator("img")
          .evaluateAll(
            (images) =>
              images.filter((img) => !img.complete || img.naturalWidth === 0)
                .length,
          ),
      )
      .toBe(0);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `../docs/qa/${test.info().project.name}-${route.replace(/\//g, "") || "home"}.png`,
      fullPage: true,
    });
  });
test("navigation and project filters/search/detail", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) {
    await expect(
      page.getByRole("navigation", { name: "ناوبری موبایل" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "ناوبری موبایل" })
      .getByRole("link", { name: "نمونه‌کارها" })
      .click();
  } else
    await page
      .getByRole("navigation", { name: "ناوبری اصلی" })
      .getByRole("link", { name: "نمونه‌کارها" })
      .click();
  await expect(page.locator(".project-card")).toHaveCount(10);
  await page.getByRole("button", { name: "ادیت سینمایی" }).click();
  await expect(page.locator(".project-card")).toHaveCount(2);
  await page.getByRole("button", { name: "همه پروژه‌ها" }).click();
  await page.getByPlaceholder("جستجوی پروژه...").fill("سفر قهرمان");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.locator(".project-card a").first().click();
  await expect(page.locator(".detail-copy h1")).toHaveText("سفر قهرمان");
});
test("contact form validation and success", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "ارسال پیام" }).click();
  await expect(page.getByText("نام خود را کامل وارد کنید.")).toBeVisible();
  await expect(page).not.toHaveURL(/[?&]message=/);
  await page.getByPlaceholder("نام شما").fill("Test Editor");
  await page.getByPlaceholder("name@example.com").fill("test@example.com");
  await page.getByPlaceholder("همکاری، سفارش پروژه...").fill("Testing");
  await page
    .getByPlaceholder("ایده یا پروژه‌تان را اینجا بنویسید...")
    .fill("Please edit a sample video project.");
  await page.getByRole("button", { name: "ارسال پیام" }).click();
  await expect(page.getByText("پیام شما با موفقیت ارسال شد.")).toBeVisible();
});
test("reduced motion keeps navigation usable", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  await page
    .getByRole("navigation", {
      name: isMobile ? "ناوبری موبایل" : "ناوبری اصلی",
    })
    .getByRole("link", { name: "درباره من" })
    .click();
  await expect(page.locator("main h1")).toContainText("درباره من");
  expect(errors).toEqual([]);
});
test("admin auth and CRUD", async ({ page }) => {
  if (!process.env.E2E_ADMIN_PASSWORD)
    throw new Error("E2E_ADMIN_PASSWORD is required for admin verification");
  await page.goto("/admin");
  await expect(page).toHaveURL(/admin\/login/);
  await page
    .getByLabel("نام کاربری")
    .fill(process.env.E2E_ADMIN_USERNAME || "ctrlz-admin");
  await page.getByLabel("رمز عبور").fill(process.env.E2E_ADMIN_PASSWORD!);
  await solveLoginChallenge(page);
  await page.getByRole("button", { name: "ورود امن" }).click();
  await expect(page.getByRole("heading", { name: "داشبورد" })).toBeVisible();
  await page.getByRole("link", { name: "پروژه‌ها" }).first().click();
  await expect(page.getByRole("heading", { name: "پروژه‌ها" })).toBeVisible();
  await page.getByRole("button", { name: "افزودن" }).click();
  await page.getByRole("textbox", { name: "عنوان", exact: true }).fill("E2E draft");
  const slug = `e2e-draft-${Date.now()}`;
  await page.getByLabel("شناسه انگلیسی").fill(slug);
  await page.getByLabel("دسته‌بندی").selectOption({ index: 1 });
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
  await page.getByPlaceholder("جستجو...").fill("E2E draft");
  const row = page.getByRole("row").filter({ hasText: "E2E draft" }).last();
  await row.getByRole("button", { name: "انتشار", exact: true }).click();
  await expect(row).toContainText("منتشرشده");
  await row.getByRole("button", { name: "لغو انتشار", exact: true }).click();
  await expect(row).toContainText("پیش‌نویس");
  await row.getByRole("button", { name: "ویرایش", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "عنوان", exact: true })
    .fill("E2E draft edited");
  await dialog.getByLabel("ترتیب نمایش").fill("25");
  await dialog.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "E2E draft edited" }).last(),
  ).toBeVisible();
  await page
    .getByRole("row")
    .filter({ hasText: "E2E draft edited" })
    .last()
    .getByRole("button", { name: "حذف" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "حذف", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "E2E draft edited" }),
  ).toHaveCount(0);
  for (const resource of [
    "skills",
    "resume",
    "messages",
    "media",
    "analytics",
    "settings",
    "categories",
    "education",
    "certificates",
    "achievements",
    "heroes",
    "blocks",
    "socials",
    "users",
  ]) {
    await page.goto(`/admin/${resource}`);
    await expect(page.locator(".admin-main h1")).toBeVisible();
    await expect(page.locator(".feedback.error")).toHaveCount(0);
  }
  await page.screenshot({
    path: `../docs/qa/${test.info().project.name}-admin.png`,
    fullPage: true,
  });
});
