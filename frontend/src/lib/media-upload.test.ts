import { describe, expect, it } from "vitest";
import { validateVideoLimits } from "./media-upload";
import { ApiFailure, errorText } from "./api";
import { messages } from "@/i18n/messages";
import { translate } from "@/i18n/core";
describe("video limits and bilingual errors", () => {
  it.each([
    [0, true],
    [0.1, true],
    [29, true],
    [-1, false],
    [NaN, false],
    [Infinity, false],
    [30, true],
    [120, true],
    [121, false],
  ] as const)("duration %i", (seconds, accepted) => {
    if (accepted) expect(() => validateVideoLimits(100, seconds)).not.toThrow();
    else expect(() => validateVideoLimits(100, seconds)).toThrow(ApiFailure);
  });
  it("uses the exact GiB byte limit", () => {
    expect(() => validateVideoLimits(1_073_741_824, 30)).not.toThrow();
    expect(() => validateVideoLimits(1_073_741_825, 30)).toThrow(ApiFailure);
  });
  it.each([
    "VIDEO_TOO_LARGE",
    "VIDEO_DURATION",
    "VIDEO_TYPE",
    "VIDEO_UNVERIFIED",
    "VIDEO_PROBE_UNAVAILABLE",
  ])("localizes %s", (code) => {
    expect(errorText(new ApiFailure(code, null, 422), "fa")).toMatch(
      /[\u0600-\u06ff]/,
    );
    expect(errorText(new ApiFailure(code, null, 422), "en")).not.toMatch(
      /[\u0600-\u06ff]/,
    );
  });
  it("has complete keyed messages in both languages", () => {
    for (const [key, [fa, en]] of Object.entries(messages)) {
      expect(fa.length, key).toBeGreaterThan(0);
      expect(en.length, key).toBeGreaterThan(0);
      expect(translate(key, "fa")).toBe(fa);
      expect(translate(key, "en")).toBe(en);
    }
  });
});
