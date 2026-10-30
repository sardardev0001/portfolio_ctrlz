import type { Social } from "../src/types/api";
import { expect, test } from "@playwright/test";
import { solveLoginChallenge } from "./solve-login-challenge";

test("contact links and form support keyboard, reduced motion, and retry", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  const content = (await (await page.request.get("/api/v1/content/")).json())
    .data;
  await expect(page.locator(".contact-method")).toHaveCount(
    content.socials.filter((social: Social) =>
      ["email", "telegram", "instagram", "youtube"].includes(social.platform),
    ).length,
  );
  for (const card of await page.locator(".contact-method").all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("data-reduced", "true");
    await expect(card.locator(".contact-hud-travel")).toHaveCSS(
      "animation-name",
      "none",
    );
    const value = card.locator(".contact-method-value");
    const href = await value.getAttribute("href");
    expect(href).toMatch(
      /^(mailto:|https:\/\/(t\.me|www\.(instagram|youtube)\.com)\/)/,
    );
    await value.focus();
    await expect(value).toBeFocused();
    await expect(value).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Tab");
    await expect(card.locator(".contact-method-action")).toBeFocused();
    const box = await card.locator(".contact-method-action").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(43.9);
    expect(box!.height).toBeGreaterThanOrEqual(43.9);
  }
  await page
    .getByRole("textbox", { name: "نام و نام خانوادگی", exact: true })
    .fill("QA Contact Editor");
  await page
    .getByRole("textbox", { name: "ایمیل", exact: true })
    .fill("qa-contact@example.com");
  await page
    .getByRole("textbox", { name: "موضوع", exact: true })
    .fill("Contact retry verification");
  await page
    .getByRole("textbox", { name: "پیام شما", exact: true })
    .fill("Please keep this project request available after a network error.");
  await page.route("**/api/v1/contact/", (route) => route.abort("failed"));
  const submit = page.getByRole("button", { name: "ارسال پیام", exact: true });
  if (isMobile) await submit.tap();
  else await submit.click();
  await expect(page.getByText("ارتباط با سرور برقرار نشد.")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "پیام شما", exact: true }),
  ).toHaveValue(/keep this project/);
  await expect(submit).toBeEnabled();
  await page.unroute("**/api/v1/contact/");
  await page.route("**/api/v1/contact/", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Rate limited",
        data: null,
        error: { code: "RATE_LIMITED", details: {} },
        meta: {},
      }),
    }),
  );
  await submit.click();
  await expect(
    page.getByText("درخواست‌های زیادی ارسال شده؛ کمی بعد دوباره تلاش کنید."),
  ).toBeVisible();
  await expect(submit).toBeEnabled();
});

test("contact submission is persisted and visible in the admin inbox", async ({
  page,
}) => {
  if (!process.env.E2E_ADMIN_PASSWORD)
    throw new Error("E2E_ADMIN_PASSWORD is required");
  const uniqueSubject = `QA contact ${Date.now()}`;
  await page.goto("/contact");
  await page
    .getByLabel("نام و نام خانوادگی", { exact: true })
    .fill("QA Contact Editor");
  await page
    .getByLabel("ایمیل", { exact: true })
    .fill("qa-contact@example.com");
  await page.getByLabel("موضوع", { exact: true }).fill(uniqueSubject);
  await page
    .getByLabel("پیام شما", { exact: true })
    .fill(
      "Please edit our sample film. This is an automated contact integration check.",
    );
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/contact/") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "ارسال پیام", exact: true }).click();
  const sent = await response;
  expect(sent.status()).toBe(201);
  const messageId: number = (await sent.json()).data.id;
  await expect(page.getByText("پیام شما با موفقیت ارسال شد.")).toBeVisible();
  await page.goto("/admin/login");
  await page
    .getByLabel("نام کاربری")
    .fill(process.env.E2E_ADMIN_USERNAME || "ctrlz-admin");
  await page.getByLabel("رمز عبور").fill(process.env.E2E_ADMIN_PASSWORD);
  await solveLoginChallenge(page);
  await page.getByRole("button", { name: "ورود امن" }).click();
  await expect(page.getByRole("heading", { name: "داشبورد" })).toBeVisible();
  const csrf = (await (await page.request.get("/api/v1/auth/csrf/")).json())
    .data.csrf_token;
  try {
    await page.goto("/admin/messages");
    await page.getByPlaceholder("جستجو...").fill(uniqueSubject);
    const row = page.getByRole("row").filter({ hasText: uniqueSubject });
    await expect(row).toContainText("qa-contact@example.com");
    await row.getByRole("button", { name: "ویرایش", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText(
      "Please edit our sample film.",
    );
    await page
      .getByRole("combobox", { name: "وضعیت", exact: true })
      .selectOption("read", { timeout: 15000 });
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(row.locator("td").nth(3)).toHaveText("خوانده‌شده");
  } finally {
    if (messageId)
      await page.request
        .delete(`/api/v1/admin/messages/${messageId}/`, {
          headers: { "X-CSRFToken": csrf },
          timeout: 5000,
        })
        .catch(() => undefined);
  }
});

test("all four contact methods can be edited and hidden in admin", async ({
  page,
}) => {
  test.setTimeout(240000);
  if (!process.env.E2E_ADMIN_PASSWORD)
    throw new Error("E2E_ADMIN_PASSWORD is required");
  await page.goto("/admin/login");
  await page
    .getByLabel("نام کاربری")
    .fill(process.env.E2E_ADMIN_USERNAME || "ctrlz-admin");
  await page.getByLabel("رمز عبور").fill(process.env.E2E_ADMIN_PASSWORD);
  await solveLoginChallenge(page);
  await page.getByRole("button", { name: "ورود امن" }).click();
  await expect(page.getByRole("heading", { name: "داشبورد" })).toBeVisible();
  const csrf = (await (await page.request.get("/api/v1/auth/csrf/")).json())
    .data.csrf_token;
  const ids: number[] = [];
  try {
    for (const platform of ["email", "telegram", "instagram", "youtube"]) {
      const label = `QA ${platform} ${Date.now()}`;
      await page.goto("/admin/socials");
      await page.getByRole("button", { name: "افزودن" }).click();
      await page.getByLabel("پلتفرم", { exact: true }).fill(platform);
      await page.getByLabel("عنوان", { exact: true }).fill(label);
      await page
        .getByLabel("شناسه", { exact: true })
        .fill(
          platform === "email" ? "qa-initial@example.com" : "qa_ctrlz_initial",
        );
      await page
        .getByLabel("توضیح", { exact: true })
        .fill("توضیح قابل ویرایش آزمایشی");
      await page.getByLabel("ترتیب نمایش", { exact: true }).fill("7");
      const creation = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/v1/admin/socials/") &&
          response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
      await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
      const created = await creation;
      expect(created.status()).toBe(201);
      ids.push((await created.json()).data.id);
      const records = (
        await (
          await page.request.get(
            `/api/v1/admin/socials/?search=${encodeURIComponent(label)}`,
          )
        ).json()
      ).data;
      expect(records).toHaveLength(1);
      await page.goto("/contact");
      const card = page.locator(".contact-method").filter({ hasText: label });
      await expect(card).toBeVisible();
      await page.goto("/admin/socials");
      await page
        .getByRole("row")
        .filter({ hasText: label })
        .getByRole("button", { name: "ویرایش", exact: true })
        .click();
      const nextHandle =
        platform === "email" ? "qa-edited@example.com" : "qa_ctrlz_edited";
      await page.getByLabel("شناسه", { exact: true }).fill(nextHandle);
      await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
      await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
      await page.goto("/contact");
      await expect(card.locator(".contact-method-value")).toHaveText(
        platform === "email" ? nextHandle : `@${nextHandle}`,
      );
      const saved = (
        await (
          await page.request.get(`/api/v1/admin/socials/${ids.at(-1)}/`)
        ).json()
      ).data;
      expect(saved.display_value).toBe(
        platform === "email" ? nextHandle : `@${nextHandle}`,
      );
      expect(saved.verified).toBe(false);
      await page.goto("/admin/socials");
      await page
        .getByRole("row")
        .filter({ hasText: label })
        .getByRole("button", { name: "ویرایش", exact: true })
        .click();
      await page.getByLabel("نمایش عمومی", { exact: true }).uncheck();
      await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
      await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
      await page.goto("/contact");
      await expect(card).toHaveCount(0);
    }
  } finally {
    for (const id of ids)
      await page.request.delete(`/api/v1/admin/socials/${id}/`, {
        headers: { "X-CSRFToken": csrf },
      });
  }
});
