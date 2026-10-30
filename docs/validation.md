# Validation record

The Contact refinement is documented separately in [CONTACT_IMPLEMENTATION_REPORT.md](CONTACT_IMPLEMENTATION_REPORT.md), with normalized account links, a real message submission flow and desktop/tablet/mobile/narrow captures under `docs/qa/contact/`. The older baseline results below are retained for history.

The later Education / Skills / About revision has its own [current report](EDITORIAL_IMPLEMENTATION_REPORT.md): 12 backend tests, 9 frontend unit tests, 22 browser regression tests and 6 focused animation checks passed. The tables below retain the initial full-project baseline; revised page screenshots and viewport checks are in `docs/qa/editorial/`.

Date: 2026-10-15. Workspace: `D:\MY_PROJECT\Portfolio_ctrlz`.

The application is implemented and functional locally. External deployment is **not complete**: a clean MinIO source build failed, and the working local object store uses an existing cached image whose provenance is unverified. Do not interpret successful application checks as verification of that image or a public deployment.

## Checks

| Check | Result | Evidence / scope |
|---|---|---|
| Backend API/integration tests, SQLite | PASS, 10 tests | `.local/backend-final.log`; statement coverage 894/1029 = 86.88% |
| Backend API/integration tests, Docker PostgreSQL | PASS, 10 tests | `.local/backend-postgres-tests.log` |
| Backend lint and formatting | PASS | Ruff; 46 formatted source files |
| Backend types | PASS | mypy, 62 source files |
| Django system checks | PASS | No issues |
| Migration consistency | PASS | No model changes missing migrations |
| Frontend ESLint / Prettier / TypeScript | PASS | `.local/frontend-release-checks.log`, Linux development image |
| Frontend unit tests | PASS, 3 tests | API client behavior; Vitest |
| Production frontend build | PASS | `.local/frontend-production-release-build.log`, Linux standalone output |
| Desktop and mobile E2E | PASS, 20 tests in 2.6 minutes | `.local/e2e-release.log`; desktop Chromium and emulated Pixel 7 |
| Production HTTPS workflow | PASS | `.local/production-release-smoke.log`, `.local/production-verification.json` |
| Development Docker services | PASS | PostgreSQL, MinIO, Django and Next healthy at final inspection |
| Production-like Docker services | PASS with cached storage image | Nginx TLS, standalone Next, Gunicorn, PostgreSQL and MinIO |
| Clean MinIO source build | **FAIL / unresolved** | `.local/minio-build.log`; upstream Go modules returned 403 or unavailable/private repository errors |
| Public deployment | NOT PERFORMED | No public domain, certificate or external storage account configured |

The E2E suite checks six public pages, image loading and browser errors, all skill progress fills, mobile menu, portfolio filtering/search/detail, contact validation/submission, reduced-motion navigation, staff authentication, project create/edit/order/publish/unpublish/delete and navigation through the main admin resources. It is not a claim that every field combination in every resource was exhaustively tested.

Backend tests cover published filtering and pagination, contact spam/rate limiting, CSRF/authentication and roles, project/skill/resume changes, messages, upload content validation, private/public media, refresh rotation/logout/password revocation, video byte ranges and separate refresh/login rate windows. Upload fixtures isolate test storage from real media.

## Production workflow evidence

The isolated `ctrlz-production-qa` Compose project was exercised at `https://127.0.0.1:8443` with an ignored temporary self-signed certificate and certificate errors allowed only in the QA client. The verification script checks:

- Secure, HttpOnly authentication cookies with CSRF-protected writes.
- S3 upload and byte-for-byte retrieval after publication; anonymous private media returns 404.
- Uploaded WebM HTTP 206 ranges and actual native browser playback (720px width, readyState 4).
- Downloadable PDF signature and persisted contact message read/archive actions.
- Runtime canonical and robots origins using `SITE_URL`.

Temporary production verification projects, messages and uploaded objects are removed by the verification script. The script does not print credentials. The sample PDF, WebM and editorial content are clearly marked as demonstrations.

After verification, the temporary production QA containers were stopped with volumes preserved. The main development stack remains healthy and running at `http://127.0.0.1:3000` (Django API on port 8000). The browser suite's seven exact test-message records were removed without changing editorial records or audit logs.

## Reproduction and evidence

Commands and environment setup are in [README](../README.md). Test code is in [backend/tests](../backend/tests) and [frontend/e2e/flows.spec.ts](../frontend/e2e/flows.spec.ts). The production workflow is reproducible with [verify-production.mjs](../frontend/scripts/verify-production.mjs). Screenshots of the public pages and admin at both viewport sizes are in [qa](qa/). Source references and all 165 original images are indexed in [ASSET_MAPPING.md](ASSET_MAPPING.md).

`.local/` contains ignored machine-specific logs and measurements and is not required for a fresh checkout. This document records their relevant results. Secrets and TLS private keys are excluded from source control.

For repeated local browser runs, the development-only rate-window table was reset with a `DEBUG` assertion before the final suite. Production rate limits remain enforced; there is no application endpoint to bypass them.

## Remaining limits

The pinned MinIO recipe could not download required upstream dependencies even with direct fallback. The local cached image proves the storage integration works but does not establish a reproducible, trusted storage supply. Use a supported S3-compatible provider or a verified distributable image before external deployment. The sample HTTP Nginx profile needs a real TLS edge; an explicit TLS configuration example is provided.

No real-device performance/FPS, WebKit/Safari, public CA certificate/domain, remote GitHub Actions run, external S3 provider, sustained concurrency test or destructive backup restore has been verified. See [performance.md](performance.md) for the measured local browser results.
