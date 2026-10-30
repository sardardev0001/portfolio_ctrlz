import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
});
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const output = "../docs/qa/editorial";
mkdirSync(output, { recursive: true });
const results = [];
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1672, height: 941 },
    tablet: { width: 1024, height: 1366 },
    mobile: { width: 412, height: 915 },
  })) {
    const page = await browser.newPage({
      viewport,
      isMobile: name === "mobile",
      hasTouch: name === "mobile",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    for (const route of ["about", "skills", "resume"]) {
      await page.goto(`${base}/${route}`);
      await page.locator("main h1").waitFor();
      if (route === "skills")
        await page.locator(".creative-card").last().waitFor();
      if (route === "resume")
        await page.locator(".education-card").first().waitFor();
      for (const item of await page
        .locator(".hud-surface,.info-card,.style-card,.timeline-item,.resume-card")
        .all()) {
        await item.scrollIntoViewIfNeeded();
        await page.waitForTimeout(80);
      }
      for (const img of await page.locator("main img").all())
        await img.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
      assert.equal(
        await page
          .locator("main img")
          .evaluateAll(
            (images) =>
              images.filter((img) => !img.complete || !img.naturalWidth).length,
          ),
        0,
        `${name}/${route}: image loading`,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${name}/${route}: overflow`,
      );
      if (route === "resume") {
        const card = page.locator(".education-card").first();
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const date = await card.locator(".education-date").boundingBox();
        const details = await card.locator(".education-details").boundingBox();
        const image = await card
          .locator(".education-image-frame")
          .boundingBox();
        assert(date && details && image);
        if (name === "desktop")
          assert(
            date.x < details.x && details.x < image.x,
            "Desktop physical order must be Date | Details | Image",
          );
        if (name === "tablet")
          assert(image.y > date.y, "Tablet image must use its own grid row");
        if (name === "mobile")
          assert(
            image.y < details.y && details.y < date.y,
            "Mobile order must be image, details, date",
          );
        if (name === "desktop") {
          const box = await card.boundingBox();
          await page.mouse.move(
            box.x + box.width * 0.8,
            box.y + box.height * 0.7,
          );
          await page.waitForTimeout(250);
          const parallax = await card.evaluate((element) =>
            Number.parseFloat(element.style.getPropertyValue("--parallax-x")),
          );
          assert(
            Number.isFinite(parallax) && Math.abs(parallax) <= 3.1,
            "Pointer parallax must remain small",
          );
          await page.mouse.move(1, 1);
          await card.screenshot({ path: `${output}/desktop-education.png` });
        }
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({
        path: `${output}/${name}-${route}.png`,
        fullPage: true,
      });
      results.push({
        viewport: name,
        route,
        images: "loaded",
        horizontalOverflow: false,
        browserErrors: [...errors],
      });
      assert.deepEqual(errors, [], `${name}/${route}: browser errors`);
    }
    if (name === "mobile") {
      await page.goto(`${base}/skills`);
      await page.locator(".specialty-card").first().scrollIntoViewIfNeeded();
      const frames = await page.evaluate(async () => {
        const intervals = [];
        let previous;
        const started = performance.now();
        await new Promise((resolve) => {
          function frame(time) {
            if (previous !== undefined) intervals.push(time - previous);
            previous = time;
            if (time - started < 3000) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
        const sorted = [...intervals].sort((a, b) => a - b);
        return {
          samples: intervals.length,
          averageFps: Math.round(
            1000 /
              (intervals.reduce((sum, value) => sum + value, 0) /
                intervals.length),
          ),
          p95FrameMs: Number(
            sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
          ),
        };
      });
      results.push({
        viewport: name,
        motion: frames,
        environment:
          "Headless Chromium mobile emulation on this desktop; not physical-device FPS",
      });
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${base}/resume`);
    const card = page.locator(".education-card").first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    assert.equal(
      await card
        .locator(".hud-frame-edge")
        .evaluate((element) => getComputedStyle(element).animationName),
      "none",
    );
    assert.equal(await card.getAttribute("data-reduced"), "true");
    await page.close();
  }
  writeFileSync(
    `${output}/validation.json`,
    JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
  );
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
