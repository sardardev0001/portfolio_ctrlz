import { expect, test } from "@playwright/test";
import { solveLoginChallenge } from "./solve-login-challenge";

test("login validates a math challenge and refreshes it after a failed attempt", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await solveLoginChallenge(page);
  const answer = Number(await page.locator("#challenge-answer").inputValue());
  await page
    .locator("#challenge-answer")
    .fill(
      String(answer).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]),
    );
  await expect(page.locator("#challenge-answer")).toHaveValue(String(answer));
  const refreshed = page.waitForResponse((response) =>
    response.url().endsWith("/auth/challenge/"),
  );
  await page.getByRole("button", { name: "سؤال امنیتی جدید" }).click();
  await refreshed;
  await solveLoginChallenge(page);
  const freshAnswer = Number(
    await page.locator("#challenge-answer").inputValue(),
  );
  await page.getByLabel("نام کاربری").fill("challenge-test-invalid-user");
  await page.getByLabel("رمز عبور", { exact: true }).fill("invalid-password");
  await page.locator("#challenge-answer").fill(String((freshAnswer + 1) % 101));
  const rejected = page.waitForResponse((response) =>
    response.url().endsWith("/auth/login/"),
  );
  await page.getByRole("button", { name: "ورود امن" }).click();
  expect((await rejected).status()).toBe(400);
  await expect(page.locator(".login-panel [role='alert']")).toContainText(
    "پاسخ سؤال امنیتی نادرست است",
  );
  await expect(page.locator("#challenge-answer")).toHaveValue("");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("button", { name: "ورود امن" })).toBeEnabled();
});
