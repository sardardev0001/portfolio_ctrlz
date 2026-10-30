import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("carousel responsive, reduced motion and manual movement", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(90000);
  await context.setExtraHTTPHeaders({ DNT: "1" });
  await context.addInitScript(() =>
    Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const locale of ["fa", "en"]) {
    await context.addCookies([
      { name: "ctrlz-locale", value: locale, url: baseURL! },
    ]);
    for (const width of [390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1050 });
      await page.goto("/");
      const section = page.locator("[data-home-story]");
      const list = section.locator("ul");
      await section.getByRole("group").scrollIntoViewIfNeeded();
      await expect(list).toHaveAttribute("data-carousel-paused", "true");
      await expect(list).toHaveAttribute("data-carousel-steps", "0");
      await expect(list.locator("a[data-category]")).toHaveCount(6);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const first = list.locator("li").first();
      const before = await first.boundingBox();
      await section
        .getByRole("button", {
          name: locale === "fa" ? "دستهٔ بعدی" : "Next category",
          exact: true,
        })
        .click();
      await expect(list).toHaveAttribute("data-carousel-steps", "1");
      const after = await first.boundingBox();
      expect(
        Math.hypot(after!.x - before!.x, after!.y - before!.y),
      ).toBeGreaterThan(10);
      await expect(page.locator(".hero-home + [data-home-story]")).toHaveCount(
        1,
      );
    }
  }
  expect(errors).toEqual([]);
});

test("three complete real-time circular cycles in both locales and mobile/desktop", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(600000);
  const cases = [390, 1440].flatMap((width) =>
    ["fa", "en"].map((locale) => async () => {
      const context = await browser.newContext({
        viewport: { width, height: 1050 },
        hasTouch: width === 390,
        isMobile: width === 390,
        reducedMotion: "no-preference",
        extraHTTPHeaders: { DNT: "1" },
      });
      await context.addInitScript(() =>
        Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }),
      );
      await context.addCookies([
        { name: "ctrlz-locale", value: locale, url: baseURL! },
      ]);
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("requestfailed", (request) => {
        if (request.failure()?.errorText !== "net::ERR_ABORTED")
          errors.push(`${request.url()}: ${request.failure()?.errorText}`);
      });
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      try {
        await page.goto(baseURL!);
        const section = page.locator("[data-home-story]");
        await expect(section).toBeVisible({ timeout: 15000 });
        const capsule = section.getByRole("group");
        const list = section.locator("ul");
        await page.bringToFront();
        await expect
          .poll(
            async () => {
              await capsule.scrollIntoViewIfNeeded();
              await page.mouse.move(0, 0);
              return list.getAttribute("data-carousel-paused");
            },
            { timeout: 15000 },
          )
          .toBe("false");
        const surface = await section.evaluate((element) => {
          const css = getComputedStyle(element);
          return {
            color: css.backgroundColor,
            image: css.backgroundImage,
            top: css.borderTopWidth,
            bottom: css.borderBottomWidth,
            after: getComputedStyle(element, "::after").content,
          };
        });
        expect(surface).toEqual({
          color: "rgba(0, 0, 0, 0)",
          image: "none",
          top: "0px",
          bottom: "0px",
          after: "none",
        });
        const baseline = await list.evaluate((element, language) => {
          const elements = Array.from(element.children) as HTMLElement[];
          const origin = element.getBoundingClientRect();
          const positions = elements.map((item) => {
            const rect = item.getBoundingClientRect();
            return { x: rect.x - origin.x, y: rect.y - origin.y };
          });
          const rows: number[][] = [];
          positions.forEach((position, index) => {
            let row = rows.find(
              (row) => Math.abs(positions[row[0]].y - position.y) < 2,
            );
            if (!row) {
              row = [];
              rows.push(row);
            }
            row.push(index);
          });
          rows.sort((a, b) => positions[a[0]].y - positions[b[0]].y);
          const ring = rows.flatMap((row, index) =>
            row.sort(
              (a, b) =>
                (positions[a].x - positions[b].x) *
                (language === "fa" ? -1 : 1) *
                (index % 2 ? -1 : 1),
            ),
          );
          const trace: {
            step: number;
            positions: { x: number; y: number }[];
          }[] = [];
          const frames: { time: number; x: number; y: number }[] = [];
          const observer = new MutationObserver(() => {
            const step = Number((element as HTMLElement).dataset.carouselSteps);
            if (!step || trace.at(-1)?.step === step) return;
            const bounds = element.getBoundingClientRect();
            trace.push({
              step,
              positions: elements.map((item) => {
                const rect = item.getBoundingClientRect();
                return { x: rect.x - bounds.x, y: rect.y - bounds.y };
              }),
            });
          });
          observer.observe(element, {
            attributes: true,
            attributeFilter: ["data-carousel-steps"],
          });
          let frame = 0;
          function sample(time: number) {
            const bounds = element.getBoundingClientRect();
            const rect = elements[0].getBoundingClientRect();
            frames.push({ time, x: rect.x - bounds.x, y: rect.y - bounds.y });
            if (Number((element as HTMLElement).dataset.carouselSteps) < 18)
              frame = requestAnimationFrame(sample);
          }
          frame = requestAnimationFrame(sample);
          (window as unknown as { carouselProbe: unknown }).carouselProbe = {
            trace,
            frames,
            stop: () => {
              observer.disconnect();
              cancelAnimationFrame(frame);
            },
          };
          return {
            positions,
            ring,
            hrefs: elements.map((item) =>
              item.querySelector("a")!.getAttribute("href"),
            ),
            frame: element
              .parentElement!.parentElement!.getBoundingClientRect()
              .toJSON(),
          };
        }, locale);
        expect(baseline.positions).toHaveLength(6);
        await expect
          .poll(
            async () => Number(await list.getAttribute("data-carousel-steps")),
            { timeout: 115000, intervals: [250] },
          )
          .toBeGreaterThanOrEqual(18);
        await capsule.hover();
        const probe = await page.evaluate(() => {
          const data = (
            window as unknown as {
              carouselProbe: {
                trace: {
                  step: number;
                  positions: { x: number; y: number }[];
                }[];
                frames: { time: number; x: number; y: number }[];
                stop: () => void;
              };
            }
          ).carouselProbe;
          data.stop();
          return { trace: data.trace, frames: data.frames };
        });
        expect(probe.trace.length).toBeGreaterThanOrEqual(18);
        for (const entry of probe.trace.filter((entry) => entry.step <= 18)) {
          for (let index = 0; index < 6; index++) {
            const slot =
              baseline.ring[(baseline.ring.indexOf(index) + entry.step) % 6];
            expect(
              Math.abs(entry.positions[index].x - baseline.positions[slot].x),
            ).toBeLessThan(1.5);
            expect(
              Math.abs(entry.positions[index].y - baseline.positions[slot].y),
            ).toBeLessThan(1.5);
          }
        }
        // At least several intermediate positions, rather than a six-image swap.
        const intermediate = probe.frames.filter(
          (frame) =>
            !baseline.positions.some(
              (position) =>
                Math.hypot(position.x - frame.x, position.y - frame.y) < 2,
            ),
        );
        expect(intermediate.length).toBeGreaterThan(30);
        const discontinuities = probe.frames.slice(1).filter((frame, index) => {
          const previous = probe.frames[index];
          return (
            frame.time - previous.time < 60 &&
            Math.hypot(frame.x - previous.x, frame.y - previous.y) > 140
          );
        });
        expect(discontinuities).toEqual([]);
        expect(
          await list
            .locator("a")
            .evaluateAll((links) =>
              links.map((link) => link.getAttribute("href")),
            ),
        ).toEqual(baseline.hrefs);
        await expect(list).toHaveAttribute("data-carousel-paused", "true");
        const frozen = await list
          .locator("li")
          .evaluateAll((items) =>
            items.map((item) => (item as HTMLElement).style.transform),
          );
        const steps = Number(await list.getAttribute("data-carousel-steps"));
        await page.waitForTimeout(4300);
        expect(
          await list
            .locator("li")
            .evaluateAll((items) =>
              items.map((item) => (item as HTMLElement).style.transform),
            ),
        ).toEqual(frozen);
        expect(Number(await list.getAttribute("data-carousel-steps"))).toBe(
          steps,
        );
        const finalFrame = await capsule.boundingBox();
        expect(Math.abs(finalFrame!.width - baseline.frame.width)).toBeLessThan(
          0.5,
        );
        expect(
          Math.abs(finalFrame!.height - baseline.frame.height),
        ).toBeLessThan(0.5);
        await capsule.screenshot({
          path: `../docs/qa/home-story-carousel/verified-${locale}-${width}-capsule.png`,
        });
        await page.mouse.move(0, 0);
        await expect
          .poll(
            async () => Number(await list.getAttribute("data-carousel-steps")),
            { timeout: 6500 },
          )
          .toBeGreaterThan(steps);
        const link = list.locator("a").first();
        await link.focus();
        await expect(list).toHaveAttribute("data-carousel-paused", "true");
        const focusFrozen = await list
          .locator("li")
          .evaluateAll((items) =>
            items.map((item) => (item as HTMLElement).style.transform),
          );
        await page.waitForTimeout(1300);
        expect(
          await list
            .locator("li")
            .evaluateAll((items) =>
              items.map((item) => (item as HTMLElement).style.transform),
            ),
        ).toEqual(focusFrozen);
        const href = await link.getAttribute("href");
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(new URL(href!, baseURL!).toString());
        expect(errors).toEqual([]);
        return {
          width,
          locale,
          cycles: 3,
          completed: steps,
          intermediateFrames: intermediate.length,
          sampledFrames: probe.frames.length,
          discontinuities: discontinuities.length,
          surface,
          hoverPause: true,
          resumed: true,
          focusPause: true,
          link: href,
          consoleErrors: errors,
        };
      } finally {
        await context.close();
      }
    }),
  );
  // Keep the actual 72-second cycles. One context at a time preserves page
  // visibility; background tabs legitimately pause the carousel.
  const results = [];
  for (const run of cases) results.push(await run());
  await writeFile(
    resolve("../docs/qa/home-story-carousel/three-cycle-results.json"),
    JSON.stringify(results, null, 2) + "\n",
  );
});
