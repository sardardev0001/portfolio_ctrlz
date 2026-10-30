# CTRL.Z Portfolio

**English** · [فارسی](README.fa.md)

A bilingual portfolio and content management system for video editing and visual storytelling. The live site is [ctrtlzweb.ir](https://ctrtlzweb.ir). This public repository contains application and deployment source. Customer data, uploaded media, backups and credentials belong outside Git.

## Features

- Six public pages, project detail pages, a résumé, a contact form, and Persian/English presentation with RTL/LTR support.
- Role based editorial panel for projects, categories, skills, media, page content and work experience.
- Work experience records with employment and workplace types, dates, organization image, accomplishments, technologies, links, translations, visibility and persistent display order.
- Visual repeaters for cards and lists, drag sorting with keyboard accessible up/down controls, and media selection or upload.
- Home headline typewriter with editable timing and reduced motion support; a six item floating mobile navigation dock.
- Validated MP4/WebM uploads of at most **1,073,741,824 bytes** and **120 seconds per video**. The backend verifies actual media with FFprobe and FFmpeg; uploads are streamed to disk with progress and cancellation.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Motion, GSAP |
| Backend | Django 5.2, Django REST Framework, Python 3.12 |
| Data | PostgreSQL 17, persistent media volume |
| Edge | Docker Compose, Nginx, Let's Encrypt |
| Delivery | GitHub Actions, Ansible, immutable release archives |

The browser calls the same origin `/api/v1/` proxy. Django owns data validation, permissions and media access. Production runs from `/srv/ctrlz` with separate releases and persistent volumes. See the [deployment architecture and operations guide](docs/deployment/README_FA.md).

## Local development

Install Python 3.12, uv, Node.js 22 and pnpm 11.25. Copy `.env.example` to `.env` and fill in **development only** credentials. In one PowerShell terminal:

```powershell
uv sync --project backend --locked --python 3.12
pnpm --dir frontend install --frozen-lockfile
$env:POSTGRES_HOST = ''
$env:S3_ENDPOINT_URL = ''
uv run --project backend --locked python backend/manage.py migrate
uv run --project backend --locked python backend/manage.py runserver 127.0.0.1:8000
```

Run `pnpm --dir frontend dev` in a second terminal, then open `http://127.0.0.1:3000`. The local Compose alternative is in `docker-compose.yml`. Never point local development at the production database or upload volume.

## Checks

```powershell
uv run --project backend --locked ruff check backend
uv run --project backend --locked pytest backend/tests -q
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir frontend test
pnpm --dir frontend build
```

Browser tests run with `pnpm --dir frontend e2e` after starting an isolated backend/frontend with seeded test data. CI runs the checks before deployment.

## Deployment

The pipeline runs on every push to `main`: CI, prebuilt backend/frontend images, an allowlisted source package, Ansible transfer, an on-server backup, reviewed migrations and HTTPS health checks. Deployment scripts retain PostgreSQL and media volumes. The public repository and its encrypted `production` environment are configured; confirm the latest run in [GitHub Actions](https://github.com/sardardev0001/portfolio_ctrlz/actions) before treating a commit as deployed. Read [GitHub Actions and Ansible operations](docs/deployment/GITHUB_ACTIONS_FA.md) and the [delivery report](docs/deployment/DELIVERY_FA.md).

## Repository map

- `frontend/src/` — public UI, admin, localization and client tests.
- `frontend/e2e/` — browser flows.
- `backend/domains/` — application models and migrations.
- `backend/core/` — API, authentication, validation and services.
- `ops/deployment/` — release, backup, rollback, health and Ansible playbook.
- `.github/workflows/` — continuous integration and production delivery.
- `docs/deployment/` — operations records and instructions.

This repository does not grant an implied license to reuse personal content, media, brand assets or customer work. A source code license can be added separately by the owner.
