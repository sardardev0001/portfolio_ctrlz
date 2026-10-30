# Contact reference and asset mapping

All design files were inventoried recursively. The existing five original contact sheets and seven additional contact sheets were visually reviewed. No original artwork was deleted, renamed or modified. No new generated bitmap assets were needed.

| Component | Reference | Runtime decision |
|---|---|---|
| email | `design/ChatGPT Image Oct 13, 2026, 10_56_59 PM-4.png` | Reference only; geometry, labels, controls and icons rebuilt in code |
| telegram | `design/ChatGPT Image Oct 13, 2026, 10_57_00 PM-5.png` | Reference only; geometry, labels, controls and icons rebuilt in code |
| instagram | `design/ChatGPT Image Oct 13, 2026, 10_57_01 PM-6.png` | Reference only; geometry, labels, controls and icons rebuilt in code |
| youtube | `design/ChatGPT Image Oct 13, 2026, 10_57_02 PM-7.png` | Reference only; geometry, labels, controls and icons rebuilt in code |
| form | `design/ChatGPT Image Oct 13, 2026, 10_57_03 PM-8.png` | Reference only; geometry, labels, controls and icons rebuilt in code |

The full-page reference is `design/ChatGPT Image Oct 13, 2026, 10_12_41 PM-4.png`. Existing character-contact, the city background and shared brand/nav assets remain in use. `frontend/public/assets/components/grading-filmstrip.webp`, previously exported from `design/04_preview_filmstrip.png`, is reused as a faint decorative texture at 6–8% opacity. It carries no contact labels or controls. All displayed labels, account values, form fields, arrows and outlines are live HTML/SVG/CSS.

The four original card PNGs include baked text and frames, so they are comparison references only. Their simple platform symbols are reconstructed as editable SVG strokes, fills and highlights to support motion and retain sharp edges. The form's clapperboard is a styled Lucide SVG. Visual comparisons under `docs/qa/contact/` are QA artifacts and are never loaded by the site.

The comparisons preserve the source aspect ratio and scale each implementation/reference to the same width. Dynamic account data and accessible responsive sizes are allowed to differ. No numerical pixel-equivalence score is claimed.
