# Local production performance

This table records the initial full-project baseline before the subsequent Education / Skills / About revision. That revision's responsive motion measurements and their emulation limits are recorded in [its report](EDITORIAL_IMPLEMENTATION_REPORT.md) and `docs/qa/editorial/validation.json`.

Measured 2026-10-15 against the final standalone Next production image behind Nginx TLS at `https://127.0.0.1:8443`. Chromium desktop viewport: 1672×941, no CPU or network throttling, one sequential visit per page, fresh page contexts. The self-signed certificate was accepted only by the local QA client. These are local lab observations, not field Core Web Vitals, a Lighthouse score or physical-device FPS measurements.

| Page | LCP (ms) | CLS | JS (KiB) | Images (KiB) | Resource requests | Horizontal overflow |
|---|---:|---:|---:|---:|---:|---|
| Home | 1892 | 0.0001 | 199 | 1443 | 46 | No |
| About | 1052 | 0.0054 | 199 | 774 | 43 | No |
| Portfolio | 1180 | 0.0170 | 199 | 792 | 62 | No |
| Skills | 1848 | 0.0052 | 199 | 703 | 49 | No |
| Resume | 2140 | 0.0901 | 199 | 618 | 38 | No |
| Contact | 1848 | 0.0123 | 199 | 561 | 38 | No |

The script uses PerformanceObserver for LCP and layout shifts, excludes shifts after recent input, waits for fonts and hero artwork, and records encoded response-body bytes from the resource timing API. Image totals include Next optimized images and `/assets/` requests. The script's resource byte totals are not the complete wire transfer size. Local TLS overhead, concurrent test activity and image-cache state affect the results; a single run does not establish a percentile.

Artwork uses WebP with preserved transparency, image dimensions and responsive Next Image delivery. Content renders on the server; fonts are self-hosted. Large character/city graphics dominate page weight. Hero effects use transform/opacity, animation cleanup and reduced-motion alternatives. Image-heavy artwork still warrants checking over a real mobile connection before launch. Resume has the highest observed CLS at 0.0901; compare repeated real-device measurements before drawing conclusions from that one run.

Reproduce with [measure-performance.mjs](../frontend/scripts/measure-performance.mjs). Supply `BASE_URL` and the installed Chromium path through `PLAYWRIGHT_EXECUTABLE_PATH`; use `QA_SELF_SIGNED=true` only for a local self-signed endpoint. Raw machine-specific output is saved to ignored `.local/performance.json`. No Lighthouse/mobile CPU-throttling, sustained-load or physical midrange-device FPS result is claimed.
