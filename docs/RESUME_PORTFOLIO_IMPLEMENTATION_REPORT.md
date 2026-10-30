# Resume and portfolio component implementation — 2026-10-15

Specifications: `CTRLZ_All_Components_Merged_Exact.md` and `CTRLZ_Complete_Resume_About_Prompts.md`, supplied from the user's Downloads folder. Their component requirements were applied to the existing Django/Next.js project. Repeated Education and Color Grading tasks share the previously implemented components.

## Changed

- Resume now uses the reference's desktop arrangement: work timeline on the left; education/certificates above skills/achievements; a full-width red About story panel below. Live API records control text, dates, order, visibility, progress and metrics.
- Experience records support uploaded or built-in artwork, alt text, current-employment status and accent. Dates and timeline markers are DOM/CSS elements; no Persian content is embedded into artwork.
- Certificates support software icons, uploaded icon images, an optional PDF and a verification link. Empty certificate destinations produce no fake link. Removing an uploaded PDF is supported.
- Achievements support numeric counters, zero, prefixes/suffixes and icon choices. Software levels support an editable level label and semantic progress values.
- About's title, subtitle, story, two uploaded visuals and visibility are editable under Admin → Page sections → `resume-about`. The primary image is the left scene and the secondary image is the right face. Built-in artwork remains available through the existing items configuration.
- Portfolio cards have layered HUD frames with category accents, readable title/subtitle, real duration/category metadata, play controls and responsive proportions. Search, category filtering and project detail navigation retain their existing API flow.
- Sound Design now layers the independent studio headphones over the editor/waveform visual and uses a headphone badge plus a restrained SVG entry waveform.
- Admin forms expose the new fields and filter media choices by image/PDF type. The API rejects incorrect MIME types. Uploaded media inherits public visibility from its related records.
- Demo seed upgrades untouched demonstration data while preserving edited content. Demo text and claims remain labeled; genuine credentials and client history must be entered by the owner.

## Created

`frontend/src/features/resume/ResumePanels.tsx`, its unit tests, `frontend/src/app/resume-portfolio.css`, the responsive browser QA script, ten optimized illustration exports, source-to-runtime asset documentation, reference comparison script, and database migrations for resume, skills and PageBlock fields. `docs/openapi.yaml` includes the new contract.

## Reused Assets

The original `design/` artwork, existing four portfolio poster WebPs, shared software icons, EducationCard, HudFrame, SegmentedProgress and useHudMotion are reused. See [RESUME_PORTFOLIO_ASSETS.md](RESUME_PORTFOLIO_ASSETS.md) for source filenames and runtime roles. No full component screenshot is used as an interactive card.

## Animations

Viewport reveals, staggered rows, timeline lighting, segmented level fills, count-up values, restrained HUD border light, desktop pointer glow/parallax and category-specific poster treatment use Motion/CSS. About visuals enter independently and parallax in opposite directions; its heart pulses briefly on hover/focus. The sound waveform draws once on entry and pauses offscreen. Shared ambient frame effects run only while visible. Pointer movement writes CSS variables through requestAnimationFrame without rendering React on every event.

## Responsive

The resume reflows to two columns on tablet and a readable single column on mobile. About illustrations crop independently around the text. Portfolio cards adapt to the existing grid breakpoints. Browser checks cover 1672, 1024, 412 and 320 px widths, including physical desktop panel order and mobile stacking. Screenshots are in [qa/resume-portfolio](qa/resume-portfolio/).

## Accessibility

Sections, lists, headings, links and progress bars retain semantic markup. Decorative artwork/SVG is hidden from assistive technology; meaningful experience images use CMS alt text. Focus indicators, mixed RTL/LTR text handling, missing-image fallbacks and reduced-motion styling are supported. Certificate links exist only when their destination is configured.

## Tests

- Backend: 30 API tests pass with SQLite and all 30 pass with PostgreSQL. Coverage includes new CRUD fields, certificate PDF validation/removal, PageBlock image uploads, visible/private media, current dates, ordering/visibility, numeric zero and preservation of edited seed data. Django's final system check reports no issues.
- Frontend: 23 unit tests pass; TypeScript and ESLint pass.
- Backend Ruff lint/format and mypy pass (72 source files).
- OpenAPI snapshot generation/validation and migration drift check pass.
- Browser regression: the 20-case desktop/mobile run passed 19 cases; one mobile navigation case reached the existing server content timeout while production compilation was running. After compilation and the final service restart, the same navigation/filter/detail test passed on desktop and mobile (2/2), completing coverage of all 20 distinct cases. No test expectations or application timeout settings were weakened.
- Focused final browser verification passes all eight resume/portfolio route/viewport combinations: zero horizontal overflow, broken images or browser errors. Desktop panel ordering, mobile stacking, metric/text separation, frame variants, independent sound layers and reduced motion also pass. Captures and ten reference comparison sheets are current under [qa/resume-portfolio](qa/resume-portfolio/).
- Mobile-viewport animation sample: 150 requestAnimationFrame intervals, 60 average FPS and 16.9 ms p95 frame time in headless desktop Chromium; see `qa/resume-portfolio/motion.json` for the environment limit.

## Build

The final optimized Next.js build succeeds in Docker, including TypeScript and static page generation. Final backend/frontend development and production images are built; the development services are running at `http://127.0.0.1:3000`. The initial direct Windows build encountered a sandbox process error; a later normal Docker rebuild received HTTP 403 from Docker Hub metadata. The final local images are rebuilt using the already cached dependency/runtime images and current application sources. Dependency manifests/locks are unchanged by this component task. The canonical Dockerfiles remain in the repository for normal connected builds.

## Known Issues

- No numerical pixel-perfect equivalence is claimed. Live text lengths and item counts affect panel height; desktop component crops and equal-width reference sheets document the result.
- Mobile animation timings are measured in headless desktop Chromium with a mobile viewport; they do not establish physical-device FPS.
- Initial records, metrics and course history remain demonstration content. Certificate download/verification links require genuine uploaded files or configured URLs.
- The existing clean MinIO source-build limitation remains documented in README; it is independent of these UI changes.
