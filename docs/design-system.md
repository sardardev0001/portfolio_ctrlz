# Design system

The six desktop reference images are mapped in [ASSET_MAPPING.md](ASSET_MAPPING.md). The UI follows their dark navy city, dominant anime hero figure, brush-style brand artwork, cyan edge lighting, golden active state, red alerts and cut corners. Graphics from `design/` are exported as optimized WebP; copy, frames, cards, navigation, controls and admin tables are authored in React/CSS.

CSS variables in `frontend/src/app/globals.css` define the palette: `--background-primary`, `--background-secondary`, `--surface`, `--surface-elevated`, `--neon-blue`, `--neon-cyan`, `--neon-yellow`, `--neon-red`, `--neon-magenta`, `--text-primary`, `--text-secondary`, and glow tokens. Vazirmatn is bundled for readable Persian RTL. English labels use wide tracking. Focus indicators use yellow, controls are semantic, and mobile cards/navigation reflow rather than scaling a desktop canvas.

Breakpoints: 1400 px, 1050 px, 760 px and 480 px. The portfolio grid changes from five to four, three, two and one columns across those widths. Images use Next Image responsive sizing and lazy load below the fold. The contact layout puts the form before social links on mobile.
