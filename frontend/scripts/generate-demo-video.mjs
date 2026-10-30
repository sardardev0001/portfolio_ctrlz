import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
});
const page = await browser.newPage();
await page.setContent('<canvas width="720" height="405"></canvas>');
const bytes = await page.evaluate(async () => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(24);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp8",
    videoBitsPerSecond: 300000,
  });
  const chunks = [];
  const done = new Promise((resolve) => {
    recorder.onstop = async () =>
      resolve(
        Array.from(
          new Uint8Array(
            await new Blob(chunks, { type: "video/webm" }).arrayBuffer(),
          ),
        ),
      );
  });
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  let frame = 0;
  const draw = () => {
    ctx.fillStyle = "#020814";
    ctx.fillRect(0, 0, 720, 405);
    ctx.strokeStyle = "#087dff";
    ctx.lineWidth = 3;
    ctx.strokeRect(25, 25, 670, 355);
    ctx.fillStyle = "#ffd42a";
    ctx.font = "bold 58px sans-serif";
    ctx.fillText("CTRL.Z", 55, 116);
    ctx.fillStyle = "#f7faff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("EDITOR PORTFOLIO / DEMO PREVIEW", 55, 161);
    ctx.fillStyle = "#a9b7d5";
    ctx.font = "16px sans-serif";
    ctx.fillText(
      "Illustrative animation - replace with your own video",
      55,
      197,
    );
    ["#087dff", "#ff344b", "#13c9ff"].forEach((color, row) => {
      ctx.fillStyle = color;
      for (let i = 0; i < 7; i++)
        ctx.fillRect(55 + i * 85, 240 + row * 28, 72, 18);
    });
    ctx.fillStyle = "#ffd42a";
    ctx.fillRect(55 + Math.min(frame / 55, 1) * 580, 226, 3, 110);
    frame++;
  };
  draw();
  recorder.start();
  const timer = setInterval(draw, 1000 / 24);
  await new Promise((resolve) => setTimeout(resolve, 2400));
  clearInterval(timer);
  recorder.stop();
  const result = await done;
  stream.getTracks().forEach((track) => track.stop());
  return result;
});
await browser.close();
writeFileSync("../backend/seed_assets/demo-preview.webm", Buffer.from(bytes));
console.log(`Created explicit demo video (${bytes.length} bytes).`);
