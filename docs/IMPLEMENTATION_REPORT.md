# CTRL.Z implementation report

## Changed

Implemented a Persian RTL portfolio and editorial CMS, connected its pages to Django, and completed local application and Docker verification. Latest corrections cover hydration-safe forms/menu, route transition state, runtime metadata, software logos and in-view skill progress fills.

## Created

Next frontend, Django domain applications and migrations, custom admin, API schema, seed data, optimized assets, automated tests, Compose profiles, Nginx configuration, CI/hooks and project documentation. Start with [README](../README.md).

## Deleted

Replaced redundant npm `package-lock.json` and backend `requirements.txt` with pnpm and uv locks. All original files in `design/` are preserved.

## Architecture

Next App Router server rendering → same-origin API proxy → Django/DRF → PostgreSQL and S3-compatible media. SQLite/filesystem are available for direct development. [Architecture details](architecture.md).

## Public Pages

Home, About, Portfolio, project detail, Skills, Resume and Contact, plus missing/error states, metadata, robots and sitemap. Local preview: `http://127.0.0.1:3000`.

## Admin Pages

Login, dashboard, projects/categories/gallery, skills/categories, experience/education/certificates/achievements/resume files, messages, media, hero/page blocks/stats/social/profile/settings, analytics, users and audit. Resource forms support validation, upload, ordering and appropriate publication/status controls. Owner/editor/viewer roles control access. Local entry: `http://127.0.0.1:3000/admin`.

## Design Implementation

Persian typography, RTL composition, dark cyberpunk city, blue/yellow neon, character art and responsive page-specific layouts follow the supplied references. Navigation, text, headings, frames, buttons, cards, forms, filters, timelines and progress bars are CSS/React. Full-page reference screenshots are not used as the site UI.

| Page | Reference in `design/` |
|---|---|
| Home | `Neon CTRL.Z Editing Portfolio Hero.png` |
| About | `Neon Editor Portfolio_ About Me (1).png` |
| Portfolio | `ChatGPT Image Oct 13, 2026, 10_12_37 PM-1.png` |
| Skills | `ChatGPT Image Oct 13, 2026, 10_12_38 PM-2.png` |
| Resume | `ChatGPT Image Oct 13, 2026, 10_12_40 PM-3.png` |
| Contact | `ChatGPT Image Oct 13, 2026, 10_12_41 PM-4.png` |

## Assets Used

All 165 source PNGs were inventoried and visually reviewed. Runtime assets are optimized WebP copies/crops: city background, CTRL.Z logos, page characters, foreground decoration, project/skill artwork and six transparent software marks. Artwork remains image content; controls and readable text remain real HTML. [ASSET_MAPPING.md](ASSET_MAPPING.md) maps every original to its usage or retained-reference status, export and component. The source city is `Neon Ruins at Sunset.png`; the main logo source is `ChatGPT Image Oct 13, 2026, 05_01_07 PM-2.png`.

## Animation System

GSAP hero entrances/scroll effects, Motion route/card/progress animation and CSS hover/glow. Stable wrapper observation fixes progress animation visibility. Reduced-motion behavior and cleanup are implemented and tested. [Animation system](animation-system.md).

## Backend

Django applications for accounts, audit, media, site content, portfolio, skills, resume, contact and analytics. Validated writes, idempotent demo seed, structured request logging and deferred storage deletion are implemented. Demo PDF and WebM are provided as clearly labeled samples.

## API

Versioned `/api/v1/` endpoints, consistent JSON envelopes/error codes, pagination/filter/search/order, CSRF/authentication, staff CRUD and byte-range media. [OpenAPI snapshot](openapi.yaml) and [response standard](api-response-standard.md).

## Database

Committed Django migrations; PostgreSQL exercised in Compose and SQLite in direct tests. Content is fetched from the database, including portfolio, skills, resume and contact submissions. Seed preserves existing editorial changes.

## Security

HttpOnly JWT cookies; Secure cookies outside DEBUG; CSRF, refresh rotation/revocation, role checks, database-backed throttles, signed trusted proxy identity, content/MIME/signature/size upload validation and private-media access control. Secrets remain in ignored `.env`; login credentials are read there, not included in this report. No independent security audit is claimed.

## Tests

10 backend tests pass on both SQLite and PostgreSQL, 86.88% backend statement coverage, and 3 frontend unit tests pass. All 20 final desktop/mobile browser tests pass in 2.6 minutes, including all progress fills. [Validation results](validation.md).

## Docker

Working development stack: Next, Django, PostgreSQL, MinIO. Production-like profile: standalone Next, Gunicorn, Nginx and TLS template. Frontend/backend images build successfully. Clean MinIO source build remains unresolved; the local validation uses an existing cached storage image.

## Validation

Production-like local HTTPS verifies cookies, S3 upload/private/public reads, native video playback/ranges, PDF download and contact persistence/read/archive. Lint, type checks, migrations and production frontend build pass. [Evidence and limits](validation.md).

## Performance

Local production browser measurements are documented in [performance.md](performance.md), with environment, transfer sizes and page-level LCP/CLS. They are local observations, not field data or a physical-device performance guarantee.

## Known Issues

Clean MinIO source build fails on upstream dependencies. The cached working image has unverified provenance and must be replaced or verified before external deployment. Illustrative seed projects, work history, metrics, links, PDF and video require real editorial content. Public deployment has not been completed, so the full external-production definition of done is not met.

## Not Tested

Physical midrange-device FPS, WebKit/Safari, public domain/CA certificate, remote CI, external S3 provider, sustained concurrent load and destructive restore. Resource forms are implemented, but every possible CRUD/field combination is not exhaustively tested.

## Next Recommended Step

Select a supported external S3-compatible store or verified storage image, replace demonstration content from admin, configure the real domain/TLS and run the production verification script against that environment. Credentials for the local admin are `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` in `.env`.
