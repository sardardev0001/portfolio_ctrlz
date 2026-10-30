import { expect, type Page } from "@playwright/test";

export async function solveLoginChallenge(page: Page) {
  await expect(page.locator(".login-challenge-question")).toHaveText(
    /^\d+\s*[+−]\s*\d+\s*=\s*\?$/,
  );
  const question = await page.locator(".login-challenge-question").innerText();
  const match = question.match(/^(\d+)\s*([+−])\s*(\d+)\s*=\s*\?$/);
  if (!match)
    throw new Error(`Unexpected login security question: ${question}`);
  const left = Number(match[1]);
  const right = Number(match[3]);
  const answer = match[2] === "+" ? left + right : left - right;
  if (answer < 0 || answer > 100)
    throw new Error(`Invalid login security answer: ${answer}`);
  await page.locator("#challenge-answer").fill(String(answer));
}
