# Animation system

GSAP drives hero figure entrance, staggered hero copy and scroll-linked hero motion. Each hero uses `gsap.context()` and reverts it on unmount, removing its ScrollTrigger. Motion for React animates the framework-owned public route template, navigation's shared active indicator and in-view cards. The persistent layout does not retain old router children during exit, so filters and forms cannot be reset by an outgoing route animation. CSS handles hover sweep, neon glow and progress fill.

`prefers-reduced-motion` is respected through MotionConfig, `useReducedMotion`, skipping GSAP setup, and a global CSS media query. Transform/opacity are used for major movement; background graphics remain a stable layer across pages. On mobile the layout reduces visual work by avoiding the desktop composition and keeping the character inside the content flow.

Skill progress bars observe their stable outer track with `useInView`; the animated inner fill starts at scale zero. Observing the fill itself would make an empty transformed element unreliable as an intersection target. Browser tests scroll through every bar and verify that its fill reaches scale one. Each progress bar exposes its skill title and numeric value to assistive technology.
