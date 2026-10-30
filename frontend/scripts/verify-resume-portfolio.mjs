import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const output = "../docs/qa/resume-portfolio";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
const results = [];
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1672, height: 941 },
    tablet: { width: 1024, height: 900 },
    mobile: { width: 412, height: 915 },
    narrow: { width: 320, height: 780 },
  })) {
    for (const route of ["resume", "portfolio"]) {
      const page = await browser.newPage({ viewport, reducedMotion: name === "narrow" ? "reduce" : "no-preference" });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      const response = await page.goto(`http://127.0.0.1:3000/${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      assert.equal(response?.status(), 200, `${name}/${route}: status`);
      await page.locator(route === "resume" ? ".experience-row" : ".project-card").first().waitFor({ timeout: 30000 });
      for (const item of await page.locator(route === "resume" ? ".resume-hud,.resume-about,.education-card" : ".project-card").all()) {
        await item.scrollIntoViewIfNeeded();
      }
      await page.waitForTimeout(1250);
      await page.waitForFunction(
        () => [...document.querySelectorAll("main img")].every((img) => img.complete && img.naturalWidth > 0),
        null,
        { timeout: 30000 },
      );
      await page.evaluate(() => document.fonts.ready);
      const summary = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        broken: [...document.querySelectorAll("main img")].filter((img) => !img.complete || !img.naturalWidth).length,
      }));
      assert(summary.overflow <= 1, `${name}/${route}: horizontal overflow ${summary.overflow}px`);
      assert.equal(summary.broken, 0, `${name}/${route}: broken images`);
      assert.deepEqual(errors, [], `${name}/${route}: browser errors`);
      if (route === "resume") {
        assert.equal(await page.locator(".experience-row").count(), 4);
        assert.equal(await page.locator(".course-row").count(), 4);
        assert.equal(await page.locator(".achievement-row").count(), 3);
        assert(await page.locator(".achievement-row").evaluateAll((rows) => rows.every((row) => {
          const value = row.querySelector(".achievement-value").getBoundingClientRect();
          const text = row.querySelector("span:last-child").getBoundingClientRect();
          return value.right <= text.left + 1;
        })), `${name}/resume: metric and description overlap`);
        assert.equal(await page.locator(".resume-skill-item").count(), 6);
        assert.equal(await page.locator(".resume-about").count(), 1);
        if (name === "desktop") {
          const experience = await page.locator(".experience-panel").boundingBox();
          const education = await page.locator(".resume-education-stack").boundingBox();
          const courses = await page.locator(".courses-panel").boundingBox();
          assert(experience && education && courses);
          assert(experience.x < education.x && education.x < courses.x, "desktop resume panel order");
        }
        if (name === "mobile" || name === "narrow") {
          const experience = await page.locator(".experience-panel").boundingBox();
          const education = await page.locator(".resume-education-stack").boundingBox();
          assert(experience && education && education.y >= experience.y + experience.height - 2, "mobile stacked panels");
        }
        if (name === "narrow") {
          assert.equal(await page.locator(".resume-hud .experience-row").first().evaluate((node) => getComputedStyle(node).opacity), "1");
        }
      } else {
        assert.equal(await page.locator(".project-card").count(), 10);
        const accents = await page.locator(".project-card").evaluateAll((cards) => cards.slice(0, 4).map((card) => card.className));
        assert(accents[0].includes("accent-blue") && accents[1].includes("accent-red") && accents[2].includes("accent-gold") && accents[3].includes("accent-blue"), "portfolio category variants");
        assert.equal(await page.locator(".project-card .hud-frame").count(), 10);
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${output}/${route}-${name}.png`, fullPage: true });
      if (name === "desktop") {
        const panels = route === "resume"
          ? ["experience-panel", "courses-panel", "resume-skills-panel", "achievements-panel", "resume-about"]
          : ["project-card"];
        for (const selector of panels) {
          const matches = page.locator(`.${selector}`);
          const limit = selector === "project-card" ? 4 : 1;
          for (let index = 0; index < limit; index++) {
            await matches.nth(index).screenshot({ path: `${output}/${selector}-${index + 1}.png` });
          }
        }
      }
      results.push({ route, viewport: name, ...summary, errors });
      await page.close();
    }
  }
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  await page.goto("http://127.0.0.1:3000/skills");
  const sound = page.locator(".sound-design-card");
  await sound.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  assert.equal(await sound.locator(".sound-headphones img").count(), 1);
  assert.equal(await sound.locator(".sound-entry-wave").getAttribute("aria-hidden"), "true");
  await sound.screenshot({ path: `${output}/sound-design.png` });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(200);
  assert.equal(await sound.locator(".sound-entry-wave").evaluate((node) => getComputedStyle(node).animationName), "none");
  await page.reload();
  await sound.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert.equal(await sound.getAttribute("data-reduced"), "true");
  await page.setViewportSize({ width: 412, height: 915 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://127.0.0.1:3000/resume");
  await page.locator(".experience-panel").scrollIntoViewIfNeeded();
  const motion = await page.evaluate(async () => {
    const intervals = [];
    let previous;
    const started = performance.now();
    await new Promise((resolve) => {
      const frame = (time) => {
        if (previous !== undefined) intervals.push(time - previous);
        previous = time;
        if (time - started < 2500) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    intervals.sort((a, b) => a - b);
    return {
      samples: intervals.length,
      averageFps: Math.round(1000 / (intervals.reduce((sum, value) => sum + value, 0) / intervals.length)),
      p95FrameMs: Number(intervals[Math.floor(intervals.length * 0.95)].toFixed(2)),
    };
  });
  writeFileSync(`${output}/motion.json`, JSON.stringify({ ...motion, environment: "Headless Chromium mobile viewport on desktop; not a physical-device measurement" }, null, 2));
  await page.close();
} finally {
  await browser.close();
}
writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
