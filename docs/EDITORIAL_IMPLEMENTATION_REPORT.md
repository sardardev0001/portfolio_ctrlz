# Education, Skills, Color Grading and About revision

The five supplied Markdown files were read as the requested implementation specification. The two Color Grading files have identical SHA-256 (`EDBF082D59EA188CB7F8AD831DA59B1C5393C3407C6313FB72F154331B63E7DD`) and describe one component, so they are implemented once. The existing shared navigation, footer, authentication and project architecture are retained.

## Changed

- About now has independent biography, story artwork and character layers, followed by three feature cards beside the stats strip, real software icons and five editable work-style cards. Biography comes from Profile; hero text/artwork and PageBlock content remain editable in admin.
- Skills now has a complete blue HUD mastery panel, six software cards with real icons and numeric progress, and seven specialty cards with independent visual layers and segmented progress. Data, ordering and visibility come from the existing Skill model.
- The color-grading specialty uses separately positioned workstation, scopes, color wheel, tool badge, filmstrip and preview images. Its gold HUD geometry, Persian title/description and progress segments are real SVG/HTML/CSS.
- Resume education is a reusable `EducationCard`: red multi-layer HUD frame, graduation artwork, divider, blue geometric date chip, degree/field/institution/description, university image and SVG signature. Desktop uses explicit physical grid positions Date | Details | Image; mobile uses image, details and date.
- Education adds field, start/end year, current status, image/path/upload relation, alt text and accent. Legacy `years` is retained and backfilled through a migration. Skills adds editable accent, display variant, icon image/upload and artwork upload. Public URLs and visibility checks support those assets.
- Admin supports the new fields and image-only media selectors. Upload images through the existing media library, then select them on education or skills forms. Missing/failed education images have an accessible fallback. Uploaded media becomes public only while a related visible record permits it.
- Seed adds CMS blocks and upgrades only recognized untouched demonstration defaults. Custom editorial descriptions/assets are preserved. Sample university art and learning history remain explicitly illustrative.

## Created

`components/hud/` contains `HudFrame`, `SegmentedProgress` and `useHudMotion`. New feature components include `EducationCard`, shared `SoftwareIcon`, layered `SpecialtyCard` and `StoryVisual`. Styling is scoped in `frontend/src/app/editorial.css`. Added model migrations, six education unit tests, backend integration coverage, an education admin browser flow, the three-viewport verification script and reproducible artwork exports/comparison scripts.

## Reused Assets

No replacement images were generated. Original design files were preserved. Fifteen optimized artwork exports are mapped with source names, crops and dimensions in [EDITORIAL_ASSETS.md](EDITORIAL_ASSETS.md). The existing city background, main logo, character renders, six software icons and artwork-only project crops are reused. The graduation cap and university image come from the isolated education assets. The university's baked red border is cropped away and rebuilt in code. Text-bearing banners, complete frames, date badges and progress PNGs remain reference-only.

References used:

| Target | Supplied reference |
|---|---|
| About | `design/Neon Editor Portfolio_ About Me (1).png` |
| Skills | `design/ChatGPT Image Oct 13, 2026, 10_12_38 PM-2.png` |
| Education | education region of `design/ChatGPT Image Oct 13, 2026, 10_12_40 PM-3.png`, plus isolated education assets |
| Color grading | isolated `01_gold_neon_frame.png` through `10_cyberpunk_blue_scene.png`; frame/banner/progress used as geometry references, artwork used as layers |

## Animations

### Animation Implemented

Staggered entry, divider expansion, signature stroke reveal, skill fill and sequential progress segments, restrained neon breathing/travel, scope scan, monitor flicker, short icon greeting, hover glow and image scaling. Pointer effects use refs, CSS variables and requestAnimationFrame; image parallax is capped at approximately 3px per axis and does not render React state per mouse move. Nonessential ambient animation runs only while the component is in view. Existing GSAP hero cleanup is retained. Reduced-motion preference is applied after hydration using a stable server/client snapshot to prevent mismatched SSR attributes.

## Responsive

### Responsive Validation

The verification script exercises About, Skills and Resume at desktop 1672×941, tablet 1024×1366 and mobile 412×915. Software cards use 6/3/2 columns, with specialties using 7/4/2 or a single mobile column where appropriate. Education uses its explicit desktop grid, a separate image row on tablet and stacked content on mobile. Tablet story artwork uses its own row to avoid overlapping the character or quotation.

The final mobile-emulation motion sample recorded 177 frames, 59 average FPS and a 16.8 ms 95th-percentile frame interval in headless Chromium on this desktop. This is a local diagnostic, not a measurement from a physical phone.

Screenshots, component capture, side-by-side reference comparisons and machine-readable results are under [docs/qa/editorial](qa/editorial/). Comparisons use scaled copies of the supplied reference and implemented page, preserving source files. They support visual review; no numerical pixel-diff score is claimed. Dynamic editorial text and responsive layouts naturally differ from the fixed reference screenshot.

## Accessibility

Semantic article/section/heading structure, labelled numeric progress bars, real selectable Persian text, image alt text and an accessible missing-image state. Decorative frames/icons are hidden from assistive technology. No extra focusable controls were added to display-only cards. Existing visible focus states remain. Reduced-motion disables ambient animation and pointer parallax while preserving the composition. Long degree, institution and description content remains complete and can wrap.

## Tests

Reproduction commands are in [README](../README.md); relevant logs are ignored machine-specific `.local/editorial-*` files. The initial run exposed a reduced-motion hydration mismatch; the stable hydration snapshot fixed it and both desktop/mobile regression cases then passed.

| Verification | Result |
|---|---|
| Backend SQLite integration suite | 12 passed |
| Backend Docker PostgreSQL suite | 12 passed |
| Backend Ruff / format / mypy | Passed; 66 source files checked by mypy |
| Django checks / migration consistency | Passed; no missing migrations |
| Frontend unit tests | 9 passed, including 6 education cases |
| Full desktop/mobile browser regression | 22 passed in 3.0 minutes |
| Focused skills/resume/reduced-motion regression after animation changes | 6 passed in 55.8 seconds |
| Frontend lint / formatting / TypeScript | Passed |
| Production standalone frontend image | Built successfully |
| About, Skills, Resume visual checks | 9 page/viewport combinations; final results in `docs/qa/editorial/validation.json` |

- Education unit tests: completed/current/legacy dates, content rendering, missing image, failed image and long text.
- Backend integration: education CRUD/date validation, public/hidden uploaded image behavior, skill configuration/ranges, CMS image validation and seed preservation.
- Browser regression: public pages, images, progress fills, portfolio behavior, contact, reduced motion and general admin flows. The added education admin flow creates, edits, changes current status, hides and deletes a temporary record and checks the public Resume after each change.
- Dedicated visual verification checks image loading, browser errors, horizontal overflow, physical education grid ordering, small mouse parallax and reduced-motion CSS at all three viewport sizes. Temporary education records are cleaned up.

## Build

Development frontend/backend images and the production standalone frontend are built from the implementation. The main local stack remains accessible at `http://127.0.0.1:3000`; the existing temporary production QA stack remains stopped. Later presentation-only adjustments were checked by the three-viewport script and frontend lint/type/unit gates; no additional full browser-suite run was needed after those adjustments.

## Known Issues

The previously documented clean MinIO source-build/provenance issue is unchanged; the working local stack uses its existing cached image. No public deployment or external storage account was configured in this revision. Mobile motion measurements use Chromium emulation on this desktop and are not physical-phone FPS. Safari/WebKit and physical-device GPU performance were not tested. Seed history, metrics and artwork are demonstrations and should be replaced before public launch.
