import { expect, test, type Page } from "@playwright/test";

const ready = {
  skills: ".skill-card",
  resume: ".experience-panel",
  about: ".about-feature",
  portfolio: ".project-card",
  contact: ".contact-method",
};

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ DNT: "1" });
  await context.addInitScript(() =>
    Object.defineProperty(navigator, "doNotTrack", { get: () => "1" }),
  );
});

async function localeCookie(page: Page, locale: string) {
  await page.context().addCookies([
    {
      name: "ctrlz-locale",
      value: locale,
      url:
        test.info().project.use.baseURL ||
        process.env.BASE_URL ||
        "http://127.0.0.1:3000",
    },
  ]);
}

async function inspectPages(page: Page, locale: "fa" | "en") {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const [route, selector] of Object.entries(ready)) {
    await page.goto(`/${route}`);
    await page.locator(selector).first().waitFor();
    if (route === "resume")
      await page.locator(".resume-skills-panel").waitFor();
    await expect(page.locator("html")).toHaveAttribute(
      "dir",
      locale === "fa" ? "rtl" : "ltr",
    );
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 650) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    });
    const audit = await page.evaluate(() => {
      const failures: string[] = [];
      let frames = 0,
        samples = 0;
      const canvas = document.createElement("canvas").getContext("2d")!;
      // Compare the computed CSS polygon with the actual SVG winding, not a copied fixture.
      for (const surface of document.querySelectorAll<HTMLElement>(
        ".hud-surface, .contact-method, .contact-message-panel, .contact-send-button",
      )) {
        const plate = surface.querySelector<HTMLElement>(
          ":scope > .frame-backplate",
        );
        const svg = surface.querySelector<SVGSVGElement>(
          ":scope > .hud-frame, :scope > .contact-hud-frame",
        );
        if (!plate || !svg) {
          failures.push(`missing surface/frame: ${surface.className}`);
          continue;
        }
        frames++;
        const style = getComputedStyle(surface);
        if (
          style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
          style.backgroundImage !== "none"
        )
          failures.push(`rectangular fill: ${surface.className}`);
        if (getComputedStyle(svg).overflow !== "visible")
          failures.push("clipped glow");
        const polygon = getComputedStyle(plate)
          .clipPath.slice(8, -1)
          .split(",")
          .map((pair) => pair.trim().split(/\s+/).map(parseFloat));
        const edge = svg.querySelector(".hud-frame-edge, .contact-hud-edge")!;
        const path = new Path2D(edge.getAttribute("d")!);
        const view = svg.viewBox.baseVal;
        const inside = (x: number, y: number) => {
          let result = false;
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i],
              [xj, yj] = polygon[j];
            if (
              yi > y !== yj > y &&
              x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
            )
              result = !result;
          }
          return result;
        };
        for (const x of [
          0.1, 0.5, 1, 1.7, 2.7, 14, 29.5, 30.5, 50, 69.5, 70.5, 85, 97.3, 98.3,
          99, 99.5, 99.9,
        ]) {
          for (const y of [
            0.1, 0.7, 1.7, 2.7, 4.7, 15, 35.1, 36.1, 37.1, 50, 62.9, 63.9, 64.9,
            85, 95.3, 97.3, 98.3, 99.3, 99.9,
          ]) {
            samples++;
            if (
              inside(x, y) !==
              canvas.isPointInPath(
                path,
                (x / 100) * view.width,
                (y / 100) * view.height,
              )
            )
              failures.push(`outline mismatch: ${surface.className} ${x},${y}`);
          }
        }
      }
      if (document.documentElement.scrollWidth > innerWidth + 1)
        failures.push("horizontal overflow");
      return { frames, samples, failures };
    });
    expect(audit.frames).toBeGreaterThan(0);
    expect(audit.failures, `${route}: ${JSON.stringify(audit)}`).toEqual([]);
    if (route === "skills") {
      for (const grid of [".skill-grid", ".creative-grid"]) {
        const columns = await page
          .locator(grid)
          .evaluate(
            (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
          );
        expect(columns).toBeLessThanOrEqual(3);
      }
    }
    if (route === "resume") {
      for (const selector of [
        ".education-header > div",
        ".education-details",
        ".experience-copy",
        ".course-copy",
        ".resume-about-content",
      ]) {
        const align = await page
          .locator(selector)
          .first()
          .evaluate((el) => {
            const s = getComputedStyle(el);
            return { align: s.textAlign, direction: s.direction };
          });
        expect(align).toEqual({
          align: "start",
          direction: locale === "fa" ? "rtl" : "ltr",
        });
      }
    }
    if (route === "about") {
      for (const selector of [".about-feature > div", ".about-lower h2"]) {
        await expect(page.locator(selector).first()).toHaveCSS(
          "direction",
          locale === "fa" ? "rtl" : "ltr",
        );
        await expect(page.locator(selector).first()).toHaveCSS(
          "text-align",
          "start",
        );
      }
    }
    if (route === "contact") {
      const composition = await page.evaluate(() => {
        const box = (selector: string) => {
          const b = document.querySelector(selector)!.getBoundingClientRect();
          return { x: b.x, right: b.right, width: b.width };
        };
        return {
          copy: box(".hero-contact .hero-copy"),
          art: box(".hero-contact .hero-visual"),
          layout: box(".contact-layout"),
          width: innerWidth,
        };
      });
      if (composition.width > 760) {
        if (locale === "fa")
          expect(composition.art.right).toBeLessThan(composition.copy.x);
        else expect(composition.copy.right).toBeLessThan(composition.art.x);
        expect(
          Math.abs(composition.copy.x - composition.layout.x),
        ).toBeLessThan(1);
      }
      await expect(page.locator("h1")).toContainText(
        locale === "fa" ? "تماس" : "Contact",
      );
      const matrix = await page
        .locator(".hero-visual .character-image")
        .evaluate((el) => getComputedStyle(el).transform);
      expect(matrix).toBe("none");
      for (const card of await page.locator(".contact-method").all()) {
        const action = card.locator(".contact-method-action");
        await action.focus();
        await expect(action).toBeFocused();
        expect(
          await card.locator(".contact-method-value").getAttribute("href"),
        ).toMatch(/^(mailto:|https:\/\/)/);
      }
    }
    await test.info().attach(`${route}-${locale}-geometry`, {
      body: JSON.stringify(audit),
      contentType: "application/json",
    });
  }
  expect(errors).toEqual([]);
}

for (const locale of ["fa", "en"] as const) {
  test(`all five frame pages and directional layout ${locale}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await localeCookie(page, locale);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await inspectPages(page, locale);
  });
}

test("tablet and narrow phone frame layouts", async ({ page }, info) => {
  test.skip(
    info.project.name !== "chromium",
    "One responsive sweep includes tablet and narrow mobile.",
  );
  test.setTimeout(300000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 768, 1024])
    for (const locale of ["fa", "en"] as const) {
      await page.setViewportSize({ width, height: 1000 });
      await localeCookie(page, locale);
      await inspectPages(page, locale);
    }
});

test("contact changes the whole layout on language switch and validates inputs", async ({
  page,
}) => {
  await localeCookie(page, "fa");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  const copyX = () =>
    page
      .locator(".hero-contact .hero-copy")
      .evaluate((el) => el.getBoundingClientRect().x);
  const before = await copyX();
  await expect(page.locator('input[name="email"]')).toHaveCSS(
    "text-align",
    "end",
  );
  await page.locator(".language-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toContainText("Contact");
  await expect(page.locator('input[name="email"]')).toHaveCSS(
    "text-align",
    "start",
  );
  if ((page.viewportSize()?.width || 0) > 760)
    expect(await copyX()).toBeLessThan(before);
  await page.locator(".contact-send-button").click();
  await expect(page.locator(".contact-field [aria-invalid=true]")).toHaveCount(
    4,
  );
  await expect(page.locator(".contact-field [role=alert]")).toHaveCount(4);
  await expect(
    page.locator(".contact-field [role=alert]").first(),
  ).not.toContainText(/[\u0600-\u06ff]/);
});

test("viewport entrances, hover lift and restrained reduced motion", async ({
  page,
  isMobile,
}) => {
  await page.goto("/portfolio");
  const card = page.locator(".project-card").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-entered", "true");
  await expect(card).toHaveCSS("opacity", "1");
  if (!isMobile) {
    await card.hover();
    await expect(card.locator(".project-poster")).toHaveCSS(
      "translate",
      "0px -2px",
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card).toHaveAttribute("data-reduced", "true");
  await expect(card.locator(".hud-frame-travel")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(card).toHaveCSS("translate", "none");
  // The stretched hit target must keep the entire card clickable.
  const href = await card.locator("a").getAttribute("href");
  await card.click({ position: { x: 15, y: 15 } });
  await expect(page).toHaveURL(new RegExp(href!.split("?")[0]));
});
