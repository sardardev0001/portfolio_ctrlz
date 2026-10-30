import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { request, chromium } from "@playwright/test";

const baseURL = process.env.BASE_URL || "https://127.0.0.1:8443";
const ignoreHTTPSErrors = process.env.QA_SELF_SIGNED === "true";
assert(
  process.env.E2E_ADMIN_PASSWORD,
  "Set E2E_ADMIN_PASSWORD before production verification.",
);
const context = await request.newContext({
  baseURL,
  ignoreHTTPSErrors,
  extraHTTPHeaders: { Origin: baseURL },
});
const anonymous = await request.newContext({ baseURL, ignoreHTTPSErrors });
const media = [];
let projectId;
let messageId;
let csrf;
async function payload(response, expected = 200) {
  assert.equal(
    response.status(),
    expected,
    `Unexpected API status: ${response.url()}`,
  );
  const body = await response.json();
  assert.equal(body.success, true);
  return body.data;
}
async function upload(name, mimeType, buffer) {
  const asset = await payload(
    await context.post("/api/v1/admin/media/", {
      headers: { "X-CSRFToken": csrf },
      multipart: {
        file: { name, mimeType, buffer },
        alt: "Production QA demo",
        usage: "qa-temporary",
      },
    }),
    201,
  );
  media.push(asset.id);
  return asset;
}
try {
  csrf = (await payload(await context.get("/api/v1/auth/csrf/"))).csrf_token;
  const challenge = await payload(await context.get("/api/v1/auth/challenge/"));
  const challengeAnswer =
    challenge.operator === "+"
      ? challenge.left + challenge.right
      : challenge.left - challenge.right;
  await payload(
    await context.post("/api/v1/auth/login/", {
      headers: { "X-CSRFToken": csrf },
      data: {
        username: process.env.E2E_ADMIN_USERNAME || "ctrlz-admin",
        password: process.env.E2E_ADMIN_PASSWORD,
        challenge_id: challenge.challenge_id,
        challenge_answer: challengeAnswer,
      },
    }),
  );
  csrf = (await payload(await context.get("/api/v1/auth/csrf/"))).csrf_token;
  const cookie = (await context.storageState()).cookies.find(
    (item) => item.name === "ctrlz_access",
  );
  assert(
    cookie?.secure && cookie?.httpOnly,
    "Production access cookie must be Secure and HttpOnly.",
  );
  const imageBytes = readFileSync("public/assets/portfolio/project-01.webp");
  const image = await upload("qa-poster.webp", "image/webp", imageBytes);
  const video = await upload(
    "qa-preview.webm",
    "video/webm",
    readFileSync("../backend/seed_assets/demo-preview-30.webm"),
  );
  assert.equal((await anonymous.get(image.url)).status(), 404);
  const categories = await payload(
    await context.get("/api/v1/admin/categories/"),
  );
  const slug = `qa-storage-${Date.now()}`;
  const project = await payload(
    await context.post("/api/v1/admin/projects/", {
      headers: { "X-CSRFToken": csrf },
      data: {
        title: "Explicit demo video / QA",
        slug,
        category: categories[0].id,
        thumbnail_asset: image.id,
        video_asset: video.id,
        status: "published",
        description: "Temporary verification record, removed after the check.",
      },
    }),
    201,
  );
  projectId = project.id;
  const publicImage = await anonymous.get(image.url);
  assert.equal(publicImage.status(), 200);
  assert((await publicImage.body()).equals(imageBytes));
  const range = await anonymous.get(video.url, {
    headers: { Range: "bytes=4-13" },
  });
  assert.equal(range.status(), 206);
  assert.equal((await range.body()).length, 10);
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  });
  const page = await browser.newPage({ ignoreHTTPSErrors });
  await page.goto(`${baseURL}/portfolio/${slug}`);
  await page.locator("video").waitFor();
  const expectedOrigin = process.env.EXPECTED_SITE_URL || baseURL;
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  assert(canonical?.startsWith(`${expectedOrigin}/portfolio/`));
  const robots = await anonymous.get("/robots.txt");
  assert((await robots.text()).includes(`${expectedOrigin}/sitemap.xml`));
  await page.locator("video").evaluate(async (element) => {
    element.muted = true;
    await element.play();
  });
  await page.waitForFunction(
    () => document.querySelector("video")?.currentTime > 0.1,
  );
  const videoState = await page.locator("video").evaluate((element) => ({
    width: element.videoWidth,
    ready: element.readyState,
  }));
  assert(videoState.width > 0 && videoState.ready >= 2);
  await browser.close();
  const resume = await payload(await anonymous.get("/api/v1/resume/"));
  for (const language of ["fa", "en"]) {
    const file = resume.files.find((item) => item.language === language);
    const response = await anonymous.get(
      `/api/v1/resume/${language}/download/`,
    );
    if (file) {
      assert.equal(response.status(), 200);
      assert.equal((await response.body()).subarray(0, 5).toString(), "%PDF-");
      assert(
        response
          .headers()
          ["content-disposition"].includes(`${language.toUpperCase()}.pdf`),
      );
    } else
      assert.equal(
        response.status(),
        404,
        "Missing language must not fall back to another resume.",
      );
  }
  const message = await payload(
    await anonymous.post("/api/v1/contact/", {
      data: {
        name: "Production QA",
        email: "qa@example.com",
        subject: "Temporary smoke verification",
        message:
          "This verifies production contact persistence and will be removed.",
      },
    }),
    201,
  );
  messageId = message.id;
  for (const status of ["read", "archived"]) {
    const updated = await payload(
      await context.patch(`/api/v1/admin/messages/${messageId}/`, {
        headers: { "X-CSRFToken": csrf },
        data: { status },
      }),
    );
    assert.equal(updated.status, status);
  }
  writeFileSync(
    "../.local/production-verification.json",
    JSON.stringify(
      {
        https: true,
        canonical_and_robots_origin: expectedOrigin,
        secure_http_only_cookie: true,
        s3_upload_and_read: true,
        private_media_404: true,
        video_range: true,
        native_video_playback: videoState,
        resume_language_routing: true,
        resume_languages_available: resume.files.map((file) => file.language),
        contact_persistence: true,
        message_read_archive: true,
      },
      null,
      2,
    ),
  );
  console.log(
    "Production HTTPS, cookie security, S3 media, native video, PDF and contact workflow verified.",
  );
} finally {
  const headers = { "X-CSRFToken": csrf || "" };
  if (projectId)
    await context.delete(`/api/v1/admin/projects/${projectId}/`, { headers });
  if (messageId)
    await context.delete(`/api/v1/admin/messages/${messageId}/`, { headers });
  for (const id of media)
    await context.delete(`/api/v1/admin/media/${id}/`, { headers });
  await context.dispose();
  await anonymous.dispose();
}
