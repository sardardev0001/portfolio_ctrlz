import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
});
const results = [];
for (const route of [
  "/",
  "/about",
  "/portfolio",
  "/skills",
  "/resume",
  "/contact",
]) {
  const page = await browser.newPage({
    viewport: { width: 1672, height: 941 },
    ignoreHTTPSErrors: process.env.QA_SELF_SIGNED === "true",
  });
  await page.addInitScript(() => {
    window.__metrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        window.__metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.bringToFront();
  await page.goto((process.env.BASE_URL || "http://127.0.0.1:3000") + route, {
    waitUntil: "networkidle",
  });
  await page.locator("main h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".hero-visual img").evaluate((img) =>
    img.complete
      ? undefined
      : new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
          setTimeout(resolve, 10000);
        }),
  );
  await page.screenshot();
  await page.waitForTimeout(1500);
  const metrics = await page.evaluate(() => {
    const entries = performance.getEntriesByType("resource");
    const total = (kind) =>
      entries
        .filter((x) => x.initiatorType === kind)
        .reduce((sum, x) => sum + x.encodedBodySize, 0);
    return {
      lcp_ms: window.__metrics.lcp ? Math.round(window.__metrics.lcp) : null,
      cls: Number(window.__metrics.cls.toFixed(4)),
      js_kb: Math.round(total("script") / 1024),
      image_kb: Math.round(
        entries
          .filter((x) => /\/_next\/image|\/assets\//.test(x.name))
          .reduce((sum, x) => sum + x.encodedBodySize, 0) / 1024,
      ),
      requests: entries.length,
      horizontal_overflow:
        document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  results.push({ route, ...metrics });
  await page.close();
}
await browser.close();
writeFileSync(
  "../.local/performance.json",
  JSON.stringify(
    {
      environment:
        "Local Chromium desktop, 1672x941, no CPU/network throttling; not field data",
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results));
