# Audit — 2026-10-18

Existing stack: Next 16 / React 19, Django 5.2 / DRF, SQLite locally and PostgreSQL + S3 in Compose. No architecture replacement.

Public routes: /, /about, /portfolio, /portfolio/[slug], /skills, /resume, /contact. Admin catch-all: dashboard, login, portfolio, categories, skill-categories, skills, experience, education, certificates, achievements, resume-files, messages, heroes, blocks, stats, socials, settings, profiles, media, gallery, users, audit, analytics. Resource registry owns all create/edit forms; EditorDialog is native dialog but styled as a side sheet. Settings/profile are singleton PATCH resources, messages have no create API, audit is read only.

Project already has video_asset and gallery; media signature validation lacks duration/codec probing. ResumeFile has no locale. Ordered editorial models and Settings/Profile already store fa/en JSON translations. Public rendering uses locale cookie and reviewed dictionary; admin is hardcoded Persian. Analytics stores daily page/project/contact totals, and project reads increment counts (including SSR/prefetch). Settings supports brand/tagline/description/email/site_url/demo_mode and no unsupported integrations. Sidebar lives inside catch-all page and may remount on navigation.

Brand reference: design/fix/ChatGPT Image Oct 18, 2026, 06_26_27 AM-2.png and production-logos.json; runtime gold logo is frontend/public/assets/brand/logo-clean-gold.webp. Original brand assets must remain intact.

Repository initially reports the application as untracked. Existing files and real database/media must be preserved; no reset, seed overwrite or commit is part of this change.
