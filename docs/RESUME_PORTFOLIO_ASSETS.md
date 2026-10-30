# Resume and portfolio artwork

The supplied full-page and component images are visual references. Persian text, dates, numbers, progress bars, links, frame geometry and interaction remain React/SVG/CSS. Source PNGs are preserved in `design/`.

`asset-inspection/export_resume_assets.py` exports the following independent illustrations as alpha WebP at quality 82, bounded to 1200 × 900. These exports total approximately 1.57 MB before HTTP image resizing. The four portfolio poster WebPs are reused from the existing project library.

| Original filename in design/ | Runtime filename in frontend/public/assets/components/ | Role |
| --- | --- | --- |
| ChatGPT Image Oct 14, 2026, 11_52_09 PM-2.png | experience-editor.webp | First experience illustration |
| ChatGPT Image Oct 14, 2026, 11_52_10 PM-3.png | experience-city.webp | Second experience illustration |
| ChatGPT Image Oct 14, 2026, 11_52_10 PM-4.png | experience-red.webp | Third experience illustration |
| ChatGPT Image Oct 14, 2026, 11_52_11 PM-5.png | experience-start.webp | Fourth experience illustration |
| ChatGPT Image Oct 14, 2026, 11_54_16 PM-2.png | resume-about-back.webp | About panel left scene |
| ChatGPT Image Oct 14, 2026, 11_54_16 PM-3.png | resume-about-face.webp | About panel right face |
| ChatGPT Image Oct 14, 2026, 11_54_53 PM-1.png | certificate-medal.webp | Certificates heading artwork |
| ChatGPT Image Oct 14, 2026, 11_52_06 PM-1.png | experience-briefcase.webp | Experience heading artwork |
| ChatGPT Image Oct 14, 2026, 11_54_26 PM-1.png | achievement-trophy.webp | Achievements heading artwork |
| ChatGPT Image Oct 14, 2026, 11_57_39 PM-1.png | sound-headphones.webp | Independent sound card headphones |

The existing `sound-wave.webp` editor illustration is layered behind the headphones. The entry waveform is SVG. Existing software icon artwork, grading workstation/scopes/wheel/preview layers and EducationCard artwork are shared with the earlier implementation; see [EDITORIAL_ASSETS.md](EDITORIAL_ASSETS.md).

Experience illustrations, certificate icons/PDFs and both About visuals can be replaced from the admin media library. About subtitle and text are normal CMS fields. Public uploaded media is available only while referenced by a visible public record, or to authenticated staff.

Fresh browser captures and equal-width comparison sheets are in [qa/resume-portfolio](qa/resume-portfolio/). `asset-inspection/compare_resume_components.py` reproduces the sheets while retaining each image's aspect ratio. Differences caused by live text lengths and responsive layout remain visible; no numerical pixel-equivalence score is claimed.
