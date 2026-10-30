import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const output = "../docs/qa/contact";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
});
const results = [];
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1672, height: 941 },
    tablet: { width: 1024, height: 1366 },
    mobile: { width: 412, height: 915 },
    narrow: { width: 320, height: 780 },
  })) {
    const page = await browser.newPage({
      viewport,
      isMobile: ["mobile", "narrow"].includes(name),
      hasTouch: ["mobile", "narrow"].includes(name),
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("http://127.0.0.1:3000/contact");
    await page.locator(".contact-method").last().waitFor();
    assert.equal(await page.locator(".contact-method").count(), 4);
    for (const item of await page
      .locator(".contact-message-panel,.contact-method,main img")
      .all())
      await item.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1250);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${name}: horizontal overflow`,
    );
    assert.equal(
      await page
        .locator("main img")
        .evaluateAll(
          (images) =>
            images.filter((img) => !img.complete || !img.naturalWidth).length,
        ),
      0,
    );
    for (const card of await page.locator(".contact-method").all()) {
      await card.scrollIntoViewIfNeeded();
      const icon = await card.locator(".contact-method-icon").boundingBox();
      const content = await card.locator(".contact-method-copy").boundingBox();
      const arrow = await card.locator(".contact-method-action").boundingBox();
      assert(icon && content && arrow);
      assert(
        icon.x < content.x && content.x < arrow.x,
        `${name}: Icon | Content | Arrow`,
      );
      assert(
        arrow.width >= 43.9 && arrow.height >= 43.9,
        `${name}: touch target ${arrow.width}×${arrow.height}`,
      );
      if (name === "desktop") {
        const platform = (await card.getAttribute("class")).match(
          /contact-method-(email|telegram|instagram|youtube)/,
        )[1];
        await card.screenshot({ path: `${output}/desktop-${platform}.png` });
      }
    }
    const form = page.locator(".contact-message-panel");
    const nameField = await form.locator('input[name="name"]').boundingBox();
    const emailField = await form.locator('input[name="email"]').boundingBox();
    assert(nameField && emailField);
    if (["mobile", "narrow"].includes(name))
      assert(nameField.y < emailField.y, `${name}: stacked identity fields`);
    else assert(emailField.x < nameField.x, `${name}: email left, name right`);
    if (name === "desktop") {
      const intro = await page
        .locator(".hero-contact .hero-body")
        .boundingBox();
      const layout = await page.locator(".contact-layout").boundingBox();
      assert(
        intro && layout && layout.y >= intro.y + intro.height,
        "Desktop intro must not overlap contact panels",
      );
    }
    await form.scrollIntoViewIfNeeded();
    if (name === "desktop")
      await form.screenshot({ path: `${output}/desktop-form.png` });
    const firstCard = page.locator(".contact-method").first();
    await firstCard.scrollIntoViewIfNeeded();
    if (name === "desktop") {
      const box = await firstCard.boundingBox();
      await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.7);
      await page.waitForTimeout(300);
      const parallax = await firstCard.evaluate((element) =>
        Number.parseFloat(element.style.getPropertyValue("--parallax-x")),
      );
      assert(Number.isFinite(parallax) && Math.abs(parallax) <= 3.1);
      await page.mouse.move(1, 1);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: `${output}/${name}-contact.png`,
      fullPage: true,
    });
    results.push({
      viewport: name,
      images: "loaded",
      overflow: false,
      physicalCardOrder: "icon-content-arrow",
      browserErrors: [...errors],
    });
    assert.deepEqual(errors, []);
    // Render longer data without mutating database content.
    await firstCard.locator(".contact-method-value").evaluate((element) => {
      element.textContent =
        "very.long.editor.contact.address.with.more.characters@example.com";
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${name}: long email overflow`,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:3000/contact");
    await firstCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    assert.equal(await firstCard.getAttribute("data-reduced"), "true");
    assert.equal(
      await firstCard
        .locator(".contact-hud-travel")
        .evaluate((element) => getComputedStyle(element).animationName),
      "none",
    );
    if (name === "mobile") {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await form.scrollIntoViewIfNeeded();
      const frames = await page.evaluate(async () => {
        const intervals = [];
        let previous;
        const start = performance.now();
        await new Promise((resolve) => {
          function sample(time) {
            if (previous !== undefined) intervals.push(time - previous);
            previous = time;
            if (time - start < 3000) requestAnimationFrame(sample);
            else resolve();
          }
          requestAnimationFrame(sample);
        });
        const sorted = [...intervals].sort((a, b) => a - b);
        return {
          samples: intervals.length,
          averageFps: Math.round(
            1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length),
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
          "Headless Chromium mobile emulation on desktop; not physical-phone FPS",
      });
    }
    assert.deepEqual(errors, [], `${name}: reduced-motion browser errors`);
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
