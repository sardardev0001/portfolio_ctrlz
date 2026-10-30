# Editorial component assets

Existing source artwork only. No generated replacement images or flattened UI sheets are used. Exported by `docs/asset-inspection/export_component_assets.py` (WebP quality 88, alpha preserved). University artwork is cropped inside the baked red border so its new frame is rendered in code.

| Source in design/ | Runtime | Export size | Crop | Bytes |
|---|---|---:|---|---:|
| `02_video_editing_timeline_panel.png` | `frontend/public/assets/components/grading-workstation.webp` | 489×391 | [10, 69, 499, 460] | 50,164 |
| `03_color_grading_control_panel.png` | `frontend/public/assets/components/grading-scopes.webp` | 407×345 | [7, 73, 414, 418] | 28,218 |
| `04_preview_filmstrip.png` | `frontend/public/assets/components/grading-filmstrip.webp` | 136×383 | [22, 7, 158, 390] | 11,962 |
| `05_davinci_style_logo.png` | `frontend/public/assets/components/grading-badge.webp` | 219×203 | [10, 10, 229, 213] | 10,718 |
| `07_rgb_color_wheel.png` | `frontend/public/assets/components/color-wheel.webp` | 255×253 | [12, 6, 267, 259] | 15,920 |
| `09_cyberpunk_sunset_scene.png` | `frontend/public/assets/components/grading-sunset.webp` | 374×176 | [10, 11, 384, 187] | 24,086 |
| `10_cyberpunk_blue_scene.png` | `frontend/public/assets/components/grading-blue.webp` | 354×173 | [15, 13, 369, 186] | 27,694 |
| `ChatGPT Image Oct 13, 2026, 11_05_24 PM-3.png` | `frontend/public/assets/components/skills-workstation.webp` | 1000×735 | [9, 14, 1444, 1069] | 228,120 |
| `ChatGPT Image Oct 14, 2026, 11_51_28 PM-1.png` | `frontend/public/assets/components/graduation-cap.webp` | 256×191 | [43, 183, 1212, 1056] | 13,648 |
| `ChatGPT Image Oct 14, 2026, 11_51_30 PM-3.png` | `frontend/public/assets/components/university.webp` | 1000×510 | [76, 214, 1371, 875] | 224,326 |
| `ChatGPT Image Oct 14, 2026, 11_57_41 PM-3.png` | `frontend/public/assets/components/sound-wave.webp` | 600×267 | [5, 225, 1443, 865] | 49,830 |
| `ChatGPT Image Oct 14, 2026, 11_57_54 PM-5.png` | `frontend/public/assets/components/social-workstation.webp` | 600×261 | [34, 285, 1414, 885] | 59,802 |
| `ChatGPT Image Oct 14, 2026, 11_56_34 PM-1.png` | `frontend/public/assets/components/sports-editor.webp` | 600×402 | [0, 117, 1448, 1086] | 133,076 |
| `ChatGPT Image Oct 14, 2026, 11_56_48 PM-1.png` | `frontend/public/assets/components/cinematic-editor.webp` | 514×600 | [0, 91, 1122, 1402] | 98,638 |
| `ChatGPT Image Oct 14, 2026, 11_54_16 PM-3.png` | `frontend/public/assets/components/cinematic-face.webp` | 600×450 | [0, 0, 1448, 1086] | 100,088 |

The gold frame, Persian title banner and segmented progress PNGs are visual references. `HudFrame`, real heading/paragraph elements and `SegmentedProgress` replace those UI layers. The education red frame, date chip, diamond and signature are SVG/CSS. The graduation icon and university illustration remain images. The grading workstation, scopes, wheel, badge, filmstrip and previews remain independently animated image layers.

Software logos are shared with About through `SoftwareIcon`. About story/captions, feature cards and work styles come from PageBlock records; biography comes from Profile. Hero text/artwork comes from HeroSection. Skills uses Skill records, and EducationCard uses the public Resume education DTO. Uploaded skill/education media is streamed only while its related record is visible, or to authenticated staff.
