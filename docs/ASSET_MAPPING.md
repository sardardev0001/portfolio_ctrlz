# Asset mapping

All 165 PNGs in `design/` are preserved (55 initially mapped, plus 110 additional files below). Runtime images are optimized WebP copies with alpha retained for transparent graphics. All visible text, controls, frames, cards, progress bars, nav and forms are HTML/CSS/React. No full-page reference is served as site UI.

## Page references

| Page | Reference file | Runtime composition |
|---|---|---|
| Home | `design/Neon CTRL.Z Editing Portfolio Hero.png` | full-page design reference; rebuilt as HTML/CSS, never served as UI |
| About | `design/Neon Editor Portfolio_ About Me (1).png` | full-page design reference; rebuilt as HTML/CSS |
| Portfolio | `design/ChatGPT Image Oct 13, 2026, 10_12_37 PM-1.png` | full-page desktop design reference; rebuilt as HTML/CSS |
| Skills | `design/ChatGPT Image Oct 13, 2026, 10_12_38 PM-2.png` | full-page desktop design reference; rebuilt as HTML/CSS |
| Resume | `design/ChatGPT Image Oct 13, 2026, 10_12_40 PM-3.png` | full-page desktop design reference; rebuilt as HTML/CSS |
| Contact | `design/ChatGPT Image Oct 13, 2026, 10_12_41 PM-4.png` | full-page desktop design reference; rebuilt as HTML/CSS |

## Every source image

| Reference file | Size / alpha | Runtime asset | Used page / component | Notes |
|---|---|---|---|---|
| `design/ChatGPT Image Oct 13, 2026, 05_01_04 PM-1.png` | 1024×1536, transparent | `frontend/public/assets/characters/character-home.webp` | Home dominant right-side character | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_07 PM-2.png` | 2172×724, transparent | `frontend/public/assets/brand/logo-main.webp` | Global/Home white and yellow logo artwork | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_08 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/skill-motion-art.webp` | Skill motion: existing blue editor illustration | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_11 PM-4.png` | 1448×1086, transparent | `frontend/public/assets/nav-portfolio-art.webp` | Home Portfolio card artwork only | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_12 PM-5.png` | 1448×1086, transparent | `frontend/public/assets/nav-contact-art.webp` | Home Contact card artwork only | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_13 PM-6.png` | 1254×1254, transparent | `frontend/public/assets/premiere-billboard.webp` | Decorative software billboard | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_16 PM-7.png` | 1122×1402, transparent | `frontend/public/assets/brand-edit-moment.webp` | Decorative branded editing artwork | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 05_01_17 PM-8.png` | 1254×1254, transparent | `frontend/public/assets/decor/film-reel.webp` | Foreground film reel decoration | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 10_12_37 PM-1.png` | 1672×941, opaque | `frontend/public/assets/portfolio/project-09.webp` | Project: بدون محدودیت; gym artwork crop, no UI | Crop: [1080, 700, 1280, 757] |
| `design/ChatGPT Image Oct 13, 2026, 10_12_38 PM-2.png` | 1672×941, opaque | Reference only | Skills | full-page desktop design reference; rebuilt as HTML/CSS |
| `design/ChatGPT Image Oct 13, 2026, 10_12_40 PM-3.png` | 1672×941, opaque | Reference only | Resume | full-page desktop design reference; rebuilt as HTML/CSS |
| `design/ChatGPT Image Oct 13, 2026, 10_12_41 PM-4.png` | 1672×941, opaque | Reference only | Contact | full-page desktop design reference; rebuilt as HTML/CSS |
| `design/ChatGPT Image Oct 13, 2026, 10_56_55 PM-1.png` | 1448×1086, transparent | `frontend/public/assets/logo-contact.webp` | Contact logo graphic variant | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 10_56_56 PM-2.png` | 1122×1402, transparent | `frontend/public/assets/characters/character-contact.webp` | Contact seated character | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 10_56_58 PM-3.png` | 1086×1448, transparent | `frontend/public/assets/billboard-contact.webp` | Contact neon billboard artwork | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 10_56_59 PM-4.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 10_57_00 PM-5.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 10_57_01 PM-6.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 10_57_02 PM-7.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 10_57_03 PM-8.png` | 1122×1402, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 10_57_04 PM-9.png` | 1448×1086, transparent | `frontend/public/assets/decor/contact-workstation.webp` | Contact foreground laptop/headphones/film reel | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 10_57_05 PM-10.png` | 1448×1086, transparent | `frontend/public/assets/city-monitors-contact.webp` | Contact transparent cyberpunk building layer | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_02_15 PM-1.png` | 1448×1086, transparent | `frontend/public/assets/logo-resume.webp` | Resume logo variant | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_02_16 PM-2.png` | 1086×1448, transparent | `frontend/public/assets/characters/character-resume.webp` | Resume positive gesture character | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_02_17 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/city-monitors-resume.webp` | Resume transparent building/screen layer | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_02_18 PM-4.png` | 1024×1536, transparent | `frontend/public/assets/billboard-resume.webp` | Resume neon billboard | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_02_19 PM-5.png` | 1122×1402, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_02_20 PM-6.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_02_21 PM-7.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_02_22 PM-8.png` | 1619×971, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_02_23 PM-9.png` | 1619×971, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_02_24 PM-10.png` | 2172×724, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_05_22 PM-1.png` | 1448×1086, transparent | `frontend/public/assets/logo-skills.webp` | Skills logo variant | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_05_23 PM-2.png` | 1024×1536, transparent | `frontend/public/assets/characters/character-skills.webp` | Skills thumbs-up character | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_05_24 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/decor/editing-studio.webp` | Skills hero studio artwork | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_05_25 PM-4.png` | 1086×1448, transparent | `frontend/public/assets/filmstrip-skills.webp` | Skills branded cinematic filmstrip graphic | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_05_26 PM-5.png` | 1086×1448, transparent | `frontend/public/assets/billboard-skills.webp` | Skills billboard artwork | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_05_28 PM-6.png` | 1448×1086, transparent | `frontend/public/assets/skill-color-art.webp` | Skill color grading: graphic workstation crop only | Crop: [220, 155, 1220, 440] |
| `design/ChatGPT Image Oct 13, 2026, 11_05_30 PM-7.png` | 1448×1086, transparent | `frontend/public/assets/skill-story-art.webp` | Skill storytelling: graphic film strip crop only | Crop: [410, 120, 1280, 485] |
| `design/ChatGPT Image Oct 13, 2026, 11_05_31 PM-8.png` | 1448×1086, transparent | Reference only | — | No runtime use in current implementation; retained for design reference |
| `design/ChatGPT Image Oct 13, 2026, 11_05_32 PM-9.png` | 1448×1086, transparent | `frontend/public/assets/skill-social-art.webp` | Skill social montage crop only | Crop: [195, 155, 1250, 510] |
| `design/ChatGPT Image Oct 13, 2026, 11_05_33 PM-10.png` | 1448×1086, transparent | `frontend/public/assets/skill-sound-art.webp` | Skill sound: headphone/waveform artwork crop only | Crop: [175, 100, 1240, 465] |
| `design/ChatGPT Image Oct 13, 2026, 11_08_15 PM-1.png` | 1448×1086, transparent | `frontend/public/assets/logo-portfolio.webp` | Portfolio logo variant | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_08_16 PM-2.png` | 1086×1448, transparent | `frontend/public/assets/characters/character-portfolio.webp` | Portfolio pointing character | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_08_17 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/decor/about-film-frame.webp` | Portfolio hero filmstrip and editor graphic | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_08_20 PM-4.png` | 1086×1448, transparent | `frontend/public/assets/billboard-portfolio.webp` | Portfolio billboard artwork | Optimized WebP; original preserved |
| `design/ChatGPT Image Oct 13, 2026, 11_08_21 PM-5.png` | 1448×1086, transparent | `frontend/public/assets/portfolio/project-01.webp` | Project: سفر قهرمان; cropped artwork excluding badge/play/duration/title | Crop: [520, 190, 1150, 610] |
| `design/ChatGPT Image Oct 13, 2026, 11_08_23 PM-6.png` | 1448×1086, transparent | `frontend/public/assets/portfolio/project-02.webp` | Project: فراتر از یک انتخاب; artwork crop | Crop: [535, 200, 1180, 620] |
| `design/ChatGPT Image Oct 13, 2026, 11_08_24 PM-7.png` | 1448×1086, transparent | `frontend/public/assets/portfolio/project-03.webp` | Project: معرفی برند; artwork crop retaining Ae as graphic subject | Crop: [110, 215, 1335, 725] |
| `design/ChatGPT Image Oct 13, 2026, 11_08_25 PM-8.png` | 1448×1086, transparent | `frontend/public/assets/portfolio/project-04.webp` | Project: روح بازی; artwork crop | Crop: [575, 165, 1180, 580] |
| `design/ChatGPT Image Oct 13, 2026, 11_08_26 PM-9.png` | 1448×1086, transparent | `frontend/public/assets/portfolio/project-05.webp` | Project: زندگی در مسیر; inner artwork excluding decorative frame | Crop: [80, 240, 1370, 790] |
| `design/ChatGPT Image Oct 13, 2026, 11_08_27 PM-10.png` | 1448×1086, transparent | `frontend/public/assets/portfolio/project-10.webp` | Project: جاده‌های ناشناخته; motorcycle artwork crop | Crop: [575, 190, 1155, 620] |
| `design/Neon CTRL.Z Editing Portfolio Hero.png` | 1672×941, opaque | Reference only | Home | full-page design reference; rebuilt as HTML/CSS, never served as UI |
| `design/Neon Editor Portfolio_ About Me (1).png` | 1672×941, opaque | `frontend/public/assets/portfolio/project-06.webp` | Project: سایه‌های درون; artwork-only anime crop from About reference | Crop: [1077, 690, 1234, 789] |
| `design/Neon Ruins at Sunset.png` | 1672×941, opaque | `frontend/public/assets/backgrounds/city-background-small.webp` | Lower bandwidth responsive global background | Optimized WebP; original preserved |

## Runtime routing

The root-level optimized files generated during inspection remain in `frontend/public/assets/`. Standardized aliases in `brand/`, `characters/`, `backgrounds/`, `portfolio/`, and `decor/` are the paths used in code and seed data. Dynamic admin media goes through `/api/v1/media/{id}/`, not through this static folder.

No native mobile full-page design reference was supplied. The mobile composition is reconstructed with responsive CSS using the same graphic layers.


## Additional assets inspected on 2026-10-15

The source folder now contains **165 PNGs**: the initial 55 above and 110 additional files below. Seven visual contact sheets and metadata with dimensions, alpha ranges and SHA-256 are saved under `docs/asset-inspection/additional/`. Six transparent software marks are used inside real React skill cards. Graphic frames, baked labels, dates, progress bars, controls and sheets remain design references. All originals are preserved.

| ID | Source | Size / alpha | Runtime / component | Decision |
|---|---|---|---|---|
| N001 | `design/01_gold_neon_frame.png` | 630×459, transparent | Reference only / Skills / color grading | Frame, text or control reference; UI is rebuilt in React/CSS |
| N002 | `design/02_video_editing_timeline_panel.png` | 508×472, transparent | `frontend/public/assets/components/grading-workstation.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N003 | `design/03_color_grading_control_panel.png` | 420×454, transparent | `frontend/public/assets/components/grading-scopes.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N004 | `design/04_preview_filmstrip.png` | 166×399, transparent | `frontend/public/assets/components/grading-filmstrip.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N005 | `design/05_davinci_style_logo.png` | 243×244, transparent | `frontend/public/assets/components/grading-badge.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N006 | `design/06_persian_title_banner.png` | 857×371, transparent | Reference only / Skills / color grading | Frame, text or control reference; UI is rebuilt in React/CSS |
| N007 | `design/07-film-reel.png` | 1072×1213, transparent | Reference only / Skills / color grading | Decorative artwork inspected; retained without changing the chosen page composition |
| N008 | `design/07_rgb_color_wheel.png` | 275×266, transparent | `frontend/public/assets/components/color-wheel.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N009 | `design/08_neon_progress_bar.png` | 728×153, transparent | Reference only / Skills / color grading | Frame, text or control reference; UI is rebuilt in React/CSS |
| N010 | `design/09_cyberpunk_sunset_scene.png` | 400×199, transparent | `frontend/public/assets/components/grading-sunset.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N011 | `design/10_cyberpunk_blue_scene.png` | 377×197, transparent | `frontend/public/assets/components/grading-blue.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N012 | `design/ChatGPT Image Oct 14, 2026, 11_51_28 PM-1.png` | 1254×1254, transparent | `frontend/public/assets/components/graduation-cap.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N013 | `design/ChatGPT Image Oct 14, 2026, 11_51_29 PM-2.png` | 1448×1086, transparent | Reference only / Resume / education | Frame, text or control reference; UI is rebuilt in React/CSS |
| N014 | `design/ChatGPT Image Oct 14, 2026, 11_51_30 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/components/university.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N015 | `design/ChatGPT Image Oct 14, 2026, 11_51_31 PM-4.png` | 1672×941, transparent | Reference only / Resume / education | Frame, text or control reference; UI is rebuilt in React/CSS |
| N016 | `design/ChatGPT Image Oct 14, 2026, 11_51_31 PM-5.png` | 2172×724, transparent | Reference only / Resume / education | Decorative artwork inspected; retained without changing the chosen page composition |
| N017 | `design/ChatGPT Image Oct 14, 2026, 11_51_32 PM-6.png` | 1254×1254, transparent | Reference only / Resume / education | Frame, text or control reference; UI is rebuilt in React/CSS |
| N018 | `design/ChatGPT Image Oct 14, 2026, 11_52_06 PM-1.png` | 1254×1254, transparent | Reference only / Resume / experience | Decorative artwork inspected; retained without changing the chosen page composition |
| N019 | `design/ChatGPT Image Oct 14, 2026, 11_52_09 PM-2.png` | 1619×971, transparent | Reference only / Resume / experience | Decorative artwork inspected; retained without changing the chosen page composition |
| N020 | `design/ChatGPT Image Oct 14, 2026, 11_52_10 PM-3.png` | 1619×971, transparent | Reference only / Resume / experience | Decorative artwork inspected; retained without changing the chosen page composition |
| N021 | `design/ChatGPT Image Oct 14, 2026, 11_52_10 PM-4.png` | 1619×971, transparent | Reference only / Resume / experience | Decorative artwork inspected; retained without changing the chosen page composition |
| N022 | `design/ChatGPT Image Oct 14, 2026, 11_52_11 PM-5.png` | 1619×971, transparent | Reference only / Resume / experience | Decorative artwork inspected; retained without changing the chosen page composition |
| N023 | `design/ChatGPT Image Oct 14, 2026, 11_54_15 PM-1.png` | 1672×941, transparent | Reference only / About / storytelling | Frame, text or control reference; UI is rebuilt in React/CSS |
| N024 | `design/ChatGPT Image Oct 14, 2026, 11_54_16 PM-2.png` | 1448×1086, transparent | Reference only / About / storytelling | Decorative artwork inspected; retained without changing the chosen page composition |
| N025 | `design/ChatGPT Image Oct 14, 2026, 11_54_16 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/components/cinematic-face.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N026 | `design/ChatGPT Image Oct 14, 2026, 11_54_17 PM-4.png` | 1254×1254, transparent | Reference only / About / storytelling | Decorative artwork inspected; retained without changing the chosen page composition |
| N027 | `design/ChatGPT Image Oct 14, 2026, 11_54_26 PM-1.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N028 | `design/ChatGPT Image Oct 14, 2026, 11_54_27 PM-2.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N029 | `design/ChatGPT Image Oct 14, 2026, 11_54_28 PM-3.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N030 | `design/ChatGPT Image Oct 14, 2026, 11_54_28 PM-4.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N031 | `design/ChatGPT Image Oct 14, 2026, 11_54_40 PM-1.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N032 | `design/ChatGPT Image Oct 14, 2026, 11_54_41 PM-2.png` | 1254×1254, transparent | `frontend/public/assets/software/premiere-pro.webp` / Skills software card | 192 px transparent graphic; title, card and progress remain code |
| N033 | `design/ChatGPT Image Oct 14, 2026, 11_54_42 PM-3.png` | 1254×1254, transparent | `frontend/public/assets/software/after-effects.webp` / Skills software card | 192 px transparent graphic; title, card and progress remain code |
| N034 | `design/ChatGPT Image Oct 14, 2026, 11_54_43 PM-4.png` | 1254×1254, transparent | `frontend/public/assets/software/photoshop.webp` / Skills software card | 192 px transparent graphic; title, card and progress remain code |
| N035 | `design/ChatGPT Image Oct 14, 2026, 11_54_44 PM-5.png` | 1254×1254, transparent | `frontend/public/assets/software/illustrator.webp` / Skills software card | 192 px transparent graphic; title, card and progress remain code |
| N036 | `design/ChatGPT Image Oct 14, 2026, 11_54_45 PM-6.png` | 1254×1254, transparent | `frontend/public/assets/software/davinci-resolve.webp` / Skills software card | 192 px transparent graphic; title, card and progress remain code |
| N037 | `design/ChatGPT Image Oct 14, 2026, 11_54_46 PM-7.png` | 1254×1254, transparent | `frontend/public/assets/software/blender.webp` / Skills software card | 192 px transparent graphic; title, card and progress remain code |
| N038 | `design/ChatGPT Image Oct 14, 2026, 11_54_53 PM-1.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N039 | `design/ChatGPT Image Oct 14, 2026, 11_54_54 PM-2.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N040 | `design/ChatGPT Image Oct 14, 2026, 11_54_55 PM-3.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N041 | `design/ChatGPT Image Oct 14, 2026, 11_54_56 PM-4.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N042 | `design/ChatGPT Image Oct 14, 2026, 11_54_57 PM-5.png` | 1564×1006, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N043 | `design/ChatGPT Image Oct 14, 2026, 11_56_34 PM-1.png` | 1448×1086, transparent | `frontend/public/assets/components/sports-editor.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N044 | `design/ChatGPT Image Oct 14, 2026, 11_56_37 PM-2.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N045 | `design/ChatGPT Image Oct 14, 2026, 11_56_48 PM-1.png` | 1122×1402, transparent | `frontend/public/assets/components/cinematic-editor.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N046 | `design/ChatGPT Image Oct 14, 2026, 11_56_49 PM-2.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N047 | `design/ChatGPT Image Oct 14, 2026, 11_56_50 PM-3.png` | 1448×1086, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N048 | `design/ChatGPT Image Oct 14, 2026, 11_56_51 PM-4.png` | 2172×724, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N049 | `design/ChatGPT Image Oct 14, 2026, 11_56_52 PM-5.png` | 1448×1086, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N050 | `design/ChatGPT Image Oct 14, 2026, 11_56_53 PM-6.png` | 1672×941, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N051 | `design/ChatGPT Image Oct 14, 2026, 11_56_54 PM-7.png` | 1448×1086, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N052 | `design/ChatGPT Image Oct 14, 2026, 11_57_39 PM-1.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N053 | `design/ChatGPT Image Oct 14, 2026, 11_57_40 PM-2.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N054 | `design/ChatGPT Image Oct 14, 2026, 11_57_41 PM-3.png` | 1448×1086, transparent | `frontend/public/assets/components/sound-wave.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N055 | `design/ChatGPT Image Oct 14, 2026, 11_57_42 PM-4.png` | 2172×724, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N056 | `design/ChatGPT Image Oct 14, 2026, 11_57_43 PM-5.png` | 1448×1086, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N057 | `design/ChatGPT Image Oct 14, 2026, 11_57_50 PM-1.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N058 | `design/ChatGPT Image Oct 14, 2026, 11_57_51 PM-2.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N059 | `design/ChatGPT Image Oct 14, 2026, 11_57_52 PM-3.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N060 | `design/ChatGPT Image Oct 14, 2026, 11_57_53 PM-4.png` | 1254×1254, transparent | Reference only / Skills / software and creative cards | Decorative artwork inspected; retained without changing the chosen page composition |
| N061 | `design/ChatGPT Image Oct 14, 2026, 11_57_54 PM-5.png` | 1448×1086, transparent | `frontend/public/assets/components/social-workstation.webp` / layered React components | Optimized illustration only; HUD frames, Persian text, dates and progress are code |
| N062 | `design/ChatGPT Image Oct 14, 2026, 11_57_55 PM-6.png` | 1448×1086, transparent | Reference only / Skills / software and creative cards | Frame, text or control reference; UI is rebuilt in React/CSS |
| N063 | `design/ChatGPT Image Oct 14, 2026, 11_57_56 PM-1.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N064 | `design/ChatGPT Image Oct 14, 2026, 11_57_57 PM-2.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N065 | `design/ChatGPT Image Oct 14, 2026, 11_57_58 PM-3.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N066 | `design/ChatGPT Image Oct 14, 2026, 11_57_59 PM-4.png` | 1774×887, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N067 | `design/ChatGPT Image Oct 14, 2026, 11_58_00 PM-5.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N068 | `design/ChatGPT Image Oct 14, 2026, 11_58_02 PM-1.png` | 1086×1448, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N069 | `design/ChatGPT Image Oct 14, 2026, 11_58_02 PM-6.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N070 | `design/ChatGPT Image Oct 14, 2026, 11_58_03 PM-7.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N071 | `design/ChatGPT Image Oct 14, 2026, 11_58_04 PM-1.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N072 | `design/ChatGPT Image Oct 14, 2026, 11_58_05 PM-2 (1).png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N073 | `design/ChatGPT Image Oct 14, 2026, 11_58_05 PM-2.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N074 | `design/ChatGPT Image Oct 14, 2026, 11_58_06 PM-3.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N075 | `design/ChatGPT Image Oct 14, 2026, 11_58_07 PM-3.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N076 | `design/ChatGPT Image Oct 14, 2026, 11_58_07 PM-4.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N077 | `design/ChatGPT Image Oct 14, 2026, 11_58_08 PM-4.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N078 | `design/ChatGPT Image Oct 14, 2026, 11_58_08 PM-5.png` | 1774×887, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N079 | `design/ChatGPT Image Oct 14, 2026, 11_58_09 PM-5.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N080 | `design/ChatGPT Image Oct 14, 2026, 11_58_09 PM-6.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N081 | `design/ChatGPT Image Oct 14, 2026, 11_58_10 PM-6.png` | 1774×887, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N082 | `design/ChatGPT Image Oct 14, 2026, 11_58_10 PM-7.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N083 | `design/ChatGPT Image Oct 14, 2026, 11_58_11 PM-7.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N084 | `design/ChatGPT Image Oct 14, 2026, 11_58_12 PM-8.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N085 | `design/ChatGPT Image Oct 14, 2026, 11_58_21 PM-1.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N086 | `design/ChatGPT Image Oct 14, 2026, 11_58_22 PM-2.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N087 | `design/ChatGPT Image Oct 14, 2026, 11_58_23 PM-3.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N088 | `design/ChatGPT Image Oct 14, 2026, 11_58_23 PM-4.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N089 | `design/ChatGPT Image Oct 14, 2026, 11_58_24 PM-5.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N090 | `design/ChatGPT Image Oct 14, 2026, 11_58_25 PM-1.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N091 | `design/ChatGPT Image Oct 14, 2026, 11_58_25 PM-2.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N092 | `design/ChatGPT Image Oct 14, 2026, 11_58_25 PM-6.png` | 1774×887, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N093 | `design/ChatGPT Image Oct 14, 2026, 11_58_25 PM-7.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N094 | `design/ChatGPT Image Oct 14, 2026, 11_58_26 PM-8.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N095 | `design/ChatGPT Image Oct 14, 2026, 11_58_27 PM-3.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N096 | `design/ChatGPT Image Oct 14, 2026, 11_58_28 PM-4.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N097 | `design/ChatGPT Image Oct 14, 2026, 11_58_29 PM-5.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N098 | `design/ChatGPT Image Oct 14, 2026, 11_58_30 PM-6.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N099 | `design/ChatGPT Image Oct 14, 2026, 11_58_31 PM-7.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N100 | `design/ChatGPT Image Oct 14, 2026, 11_58_32 PM-1.png` | 1672×941, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N101 | `design/ChatGPT Image Oct 14, 2026, 11_58_33 PM-2.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N102 | `design/ChatGPT Image Oct 14, 2026, 11_58_34 PM-3.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N103 | `design/ChatGPT Image Oct 14, 2026, 11_58_35 PM-4.png` | 1448×1086, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N104 | `design/ChatGPT Image Oct 14, 2026, 11_58_37 PM-5.png` | 1122×1402, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N105 | `design/ChatGPT Image Oct 14, 2026, 11_58_37 PM-6.png` | 1122×1402, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N106 | `design/ChatGPT Image Oct 14, 2026, 11_58_38 PM-7.png` | 1254×1254, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N107 | `design/ChatGPT Image Oct 14, 2026, 11_58_39 PM-8.png` | 1122×1402, transparent | Reference only / Portfolio / artwork and editing motifs | Decorative artwork inspected; retained without changing the chosen page composition |
| N108 | `design/ChatGPT Image Oct 14, 2026, 11_58_40 PM-9.png` | 2172×724, transparent | Reference only / Portfolio / artwork and editing motifs | Frame, text or control reference; UI is rebuilt in React/CSS |
| N109 | `design/Neon Cyber UI Asset Pack.png` | 1536×1024, transparent | Reference only / Skills / About asset sheet | Frame, text or control reference; UI is rebuilt in React/CSS |
| N110 | `design/Neon Cyberpunk Anime Asset Sheet.png` | 1536×1024, transparent | Reference only / Skills / About asset sheet | Frame, text or control reference; UI is rebuilt in React/CSS |

## Education, Skills and About revision

See [EDITORIAL_ASSETS.md](EDITORIAL_ASSETS.md) for all 15 component exports and crop provenance. The existing city, main logo, six software marks and character assets are reused. About reuses the existing Skills thumbs-up character for the closer frontal composition; the previous character export remains preserved. All 165 PNG originals and the additional asset-pack preview JPG are preserved. Baked title, date, frame and progress PNGs remain reference-only.

## Resume and Portfolio revision

The later [RESUME_PORTFOLIO_ASSETS.md](RESUME_PORTFOLIO_ASSETS.md) supersedes the earlier reference-only classifications for the ten illustrations listed there, including the experience scenes, briefcase, medal, trophy, About characters and studio headphones. Their source PNGs remain preserved. Existing portfolio poster artwork is reused, while the frame, text, metadata, controls and entry waveform are rendered in code.
