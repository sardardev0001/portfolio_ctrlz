# Contact component revision

Update, 18 October 2026: The user selected the documented 15 October state in `.local/production-upgrade-before.zip` as the Contact revert reference. The four public CMS contact cards, Persian hero placement, Persian card text direction and form heading alignment are restored. Current English translation and the language button inside the navbar remain compatible. The backup is dated 18 October but its Contact component, CSS and tests were last written on 15 October; this project has no Git commits. The pre-revert Contact files are saved in `.local/contact-current-before-revert-2026-10-18.zip`. A real contact message was not submitted during the revert. Current contact cards still contain illustrative account values and need owner replacement before public launch.

Revert validation: frontend production build, lint, typecheck, format check and all 26 unit tests passed. Eight browser checks passed against the rebuilt local Docker stack across desktop and mobile, including six-page responsive matrices for both languages and the Contact keyboard/reduced-motion/retry case. Browser-intercepted form submissions confirmed validation, success and reset in both languages without creating a real message. The post-revert screenshots in `.local/contact-{fa,en}-*-restored.png` were compared with the 15 October captures in `docs/qa/contact/`; page-specific visual placement matches except for the newer shared navbar, logo and footer. The admin edit/hide test and real submission test were deliberately not rerun in this revert.

Specification: all five tasks in `C:/Users/pc/Downloads/CTRLZ_Complete_Contact_Prompts.md` (6,453 lines): Email, Telegram, Contact Message Form, YouTube and Instagram. Instructions in the supplied document were treated as implementation requirements within the user's request. The existing Django/Next application, CMS, account data and media pipeline remain the source of truth.

## Changed

- Four contact cards now use platform-specific blue/cyan, red, gold and purple palettes, layered vector HUD outlines, large vector icons, live title/account/description text and circular actions. Their explicit left-to-right grid preserves the physical Icon | Content | Arrow positions inside the Persian page.
- Contact Message Form uses a blue HUD panel, styled clapperboard SVG, geometric field containers, separate labels/icons, a two-column desktop identity row, tall resizable message area and a gold vector HUD submit button. Header text uses the existing `contact-form` PageBlock; field labels remain UI strings.
- Reused `SocialLink` for account values, labels, descriptions, order and public visibility. Its optional URL accepts a handle or profile URL; an email row uses its email handle. Blank legacy email handles can fall back to SiteSettings email. `display_value` and `href` are computed in the API, so React does not guess account formats. Changing only a handle updates the canonical destination. Direct YouTube channel/custom/user URLs retain their destination and use the editable display handle. Supported social destinations require HTTPS on their platform; mailto addresses are safely encoded.
- Reused `POST /api/v1/contact/`, storing messages in PostgreSQL. Existing response envelopes, honeypot and database-backed limits remain in force. Name (2–100), valid email (max 254), subject (3–160) and message (10–5000) are checked on both sides. Messages now have `updated_at` as well as `created_at` and status.
- Sending has a visible loading state and a request guard against duplicate submissions. Success resets input and offers a new-message action. Network, server and rate-limit errors preserve input and allow another attempt. Public success means the backend accepted the message.
- Admin can edit/hide/reorder all four methods without frontend changes. Search now includes labels and handles. The shared editor uses one labelled native modal, avoiding nested dialog announcements. Messages can be read and marked read/archived in the existing inbox.

## Created

`frontend/src/features/contact/` contains `SocialContactCard`, `ContactMessageForm`, `ContactHudFrame` and focused tests. `frontend/src/app/contact.css` scopes the visual and interaction rules. The existing Contact composition now renders these components. New backend normalization utility, two schema migrations, API integration tests, `frontend/e2e/contact.spec.ts`, `frontend/scripts/verify-contact.mjs` and `docs/asset-inspection/document_contact_assets.py` cover behavior and review artifacts. OpenAPI is regenerated in `docs/openapi.yaml`.

## Reused Assets

See [CONTACT_ASSETS.md](CONTACT_ASSETS.md) for the five isolated references and runtime decisions. All original artwork was retained. The existing character, background, logo and faint filmstrip texture are reused. Platform icons, frames, arrows, labels and controls are live SVG/HTML/CSS. Complete reference cards and the form PNG are never embedded in the application.

## Animations Implemented

Card/panel entry, staged icon/text/action reveal, restrained frame breathing and border light travel, ambient drift, pointer glow and up-to-3px mouse parallax, hover/focus brightening, small icon/lens/play response, and button loading/tap feedback. `useHudMotion` uses refs, requestAnimationFrame and CSS variables rather than React state per pointer movement. Nonessential ambient animations run only while visible. Reduced-motion keeps the static glow, disables parallax and ambient/hover movement, and presents content without spatial entry animation.

## Responsive Validation

Automated visual checks cover desktop 1672×941, tablet 1024×1366, mobile 412×915 and narrow 320×780. Tablet uses a full-width form and two social columns; mobile uses stacked fields and a single social column. Card internals preserve the reference positions. Long email display, touch targets, image loading, horizontal overflow, small pointer movement and reduced-motion CSS are checked. Mobile input text is 16px to avoid focus zoom.

Captures, machine-readable checks and six reference/implementation comparisons are under [qa/contact](qa/contact/). Comparisons scale both images to equal width; they support visual review and do not claim numerical pixel equivalence. Account values remain the existing editable demonstration data.

The final local mobile-emulation sample measured 168 frames over approximately three seconds, 56 average FPS and an 18.6 ms 95th-percentile frame interval. This is headless Chromium on this desktop, without physical-device validation; it is not a phone FPS guarantee.

## Accessibility

Semantic sections, headings, real form controls and labels; explicit labelled-by/described-by relationships prevent the character count or an error from changing a field's accessible name. Errors identify invalid fields and focus moves to the first invalid control. Status/error feedback is announced. Account text is LTR inside Persian content. Account and arrow links are separate sibling controls, with visible keyboard focus and 44px circular action targets. External social links use `noopener noreferrer`; mailto links use their native action. Decorative layers are hidden from assistive technology. The admin editor has one accessible dialog role.

## Tests

| Check | Result |
|---|---|
| Backend SQLite integration and normalization | 27 passed |
| Backend PostgreSQL integration and normalization | 27 passed in 17.58 seconds |
| Backend Ruff / format / configured mypy | Passed; 49 formatted files and 69 typed source files |
| Frontend Vitest | 18 passed |
| Frontend lint / format / TypeScript | Passed; final source checks recorded under `.local/contact-*` |
| Desktop/mobile browser regression | 26 passed in the full run; the two inbox cases passed separately in 15.5 seconds after correcting a test selector |
| Four-viewport visual and reduced-motion checks | Passed at all four sizes; images loaded, no browser errors or horizontal overflow |
| API schema validation | Passed |

Coverage includes valid and invalid social formats, canonical URLs, safe quoted emails, direct YouTube channel URLs, admin search/edit/visibility propagation, contact validation/storage/timestamps/spam/rate limits, long values, optional descriptions, accessible validation, pending/duplicate submission, success/reset, network/server/rate-limit feedback and retry preservation. Browser flows submit through the public form, verify the same record in the admin inbox, mark it read, and create/edit/hide all four contact types. Temporary records are cleaned up.

The first browser run exposed the admin search and nested-dialog issues above. The final application regression passed 26 cases; two inbox cases initially timed out because an exact label-text selector included the select's option text. Those two cases were rerun with the accessible combobox role and passed on desktop and mobile, including the exact saved `read` status. All 28 distinct browser scenarios are therefore covered, across the full and focused runs; a single all-green 28-case run is not claimed. A stale local Playwright binary shim was bypassed by invoking the project's `node_modules/@playwright/test/cli.js` directly. Simulated network and 429 responses exercise frontend retry behavior; actual server rate limiting is verified in backend integration tests. Browser tests use local credentials through environment variables.

## Build

Development images and both production images built successfully for this revision. The frontend standalone build completed compilation and TypeScript validation. The main local stack is the review environment: `http://127.0.0.1:3000/contact`. The production QA stack remains stopped; this revision does not deploy public hosting.

Reproduction (from the project root, after starting the local stack):

```powershell
docker compose exec -T backend sh -c 'python manage.py check && python manage.py makemigrations --check --dry-run && ruff check . && ruff format --check . && mypy && pytest tests/test_api.py -q --tb=short'
pnpm --dir frontend lint
pnpm --dir frontend format:check
pnpm --dir frontend typecheck
pnpm --dir frontend test
docker compose -f docker-compose.prod.yml build frontend backend
```

For browser checks, set `E2E_ADMIN_USERNAME` / `E2E_ADMIN_PASSWORD` privately and use an installed Chromium (optionally `PLAYWRIGHT_EXECUTABLE_PATH`). From `frontend/`, run `node node_modules/@playwright/test/cli.js test` followed by `node scripts/verify-contact.mjs`. The visual script should run after admin browser tests finish so temporary records do not enter captures. From the project root, `.venv/Scripts/python.exe docs/asset-inspection/document_contact_assets.py` regenerates comparison images without altering runtime assets. Machine-specific logs are ignored under `.local/contact-*`.

## Known Issues

Physical-phone GPU performance, Safari/WebKit and external account ownership were not tested. Existing account values remain demonstration content and must be replaced by the owner. Local Chromium mobile emulation results are desktop diagnostics. The previously documented MinIO source-build/provenance limitation remains outside this contact revision; the working local stack continues to use its existing cached object-store image.
