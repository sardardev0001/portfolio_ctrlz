import { test, expect } from "@playwright/test";
import { solveLoginChallenge } from "./solve-login-challenge";

test("education admin changes reach the public resume", async ({ page }) => {
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
  const title = `QA education ${Date.now()}`;
  let recordId: number | undefined;
  try {
    await page.goto("/admin/education");
    await page.getByRole("button", { name: "افزودن" }).click();
    await page.getByLabel("مدرک", { exact: true }).fill(title);
    await page
      .getByLabel("رشته", { exact: true })
      .fill("گرافیک و روایت تصویری");
    await page.getByLabel("مؤسسه", { exact: true }).fill("دانشگاه آزمایشی");
    await page.getByLabel("سال شروع", { exact: true }).fill("۱۳۹۸");
    await page.getByLabel("سال پایان", { exact: true }).fill("۱۴۰۲");
    await page
      .getByLabel("توضیح", { exact: true })
      .fill(
        "توضیح طولانی برای بررسی تحصیلات و اتصال واقعی پنل مدیریت به صفحه رزومه. ".repeat(
          3,
        ),
      );
    await page
      .getByLabel("مسیر تصویر دانشگاه", { exact: true })
      .fill("/assets/components/university.webp");
    await page
      .getByLabel("متن جایگزین تصویر", { exact: true })
      .fill("نمای دانشگاه آزمایشی");
    await page.getByLabel("ترتیب نمایش", { exact: true }).fill("27");
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
    const records = await (
      await page.request.get(
        `/api/v1/admin/education/?search=${encodeURIComponent(title)}`,
      )
    ).json();
    recordId = records.data[0]?.id;
    expect(recordId).toBeTruthy();
    await page.goto("/resume");
    const card = page.locator(".education-card").filter({ hasText: title });
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    await expect(card).toContainText("۱۳۹۸ — ۱۴۰۲");
    await expect(card.getByAltText("نمای دانشگاه آزمایشی")).toBeVisible();
    await page.goto("/admin/education");
    const row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "ویرایش", exact: true }).click();
    await page.getByLabel("در حال تحصیل", { exact: true }).check();
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
    await page.goto("/resume");
    await expect(
      page.locator(".education-card").filter({ hasText: title }),
    ).toContainText("۱۳۹۸ — اکنون");
    await page.goto("/admin/education");
    await page
      .getByRole("row")
      .filter({ hasText: title })
      .getByRole("button", { name: "ویرایش", exact: true })
      .click();
    await page.getByLabel("نمایش عمومی", { exact: true }).uncheck();
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("تغییرات ذخیره شد.")).toBeVisible();
    await page.goto("/resume");
    await expect(
      page.locator(".education-card").filter({ hasText: title }),
    ).toHaveCount(0);
    await page.goto("/admin/education");
    await page
      .getByRole("row")
      .filter({ hasText: title })
      .getByRole("button", { name: "حذف", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "حذف", exact: true })
      .click();
    await expect(page.getByRole("row").filter({ hasText: title })).toHaveCount(
      0,
    );
  } finally {
    if (recordId)
      await page.request.delete(`/api/v1/admin/education/${recordId}/`, {
        headers: { "X-CSRFToken": csrf },
      });
  }
});
