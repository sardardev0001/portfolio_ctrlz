# Architecture

The public Next App Router pages are server-rendered with content from Django, then interactive components query the versioned API through a same-origin `/api/v1/` route handler. It forwards cookies, CSRF headers and binary responses to Django. Persistent layout holds the navigation and background. The admin catch-all route uses the same central API client and a resource registry to render business-specific forms and tables.

Django domains: `accounts` (staff and roles), `site_content` (hero, profile, settings, socials, stats), `portfolio` (categories, projects and gallery), `skills`, `resume`, `contact`, `media`, `analytics` (daily aggregate counts only), and `audit` (staff actions without request bodies). `core` centralizes auth, selectors, write services, response shape, pagination and request IDs.

The public API reads only visible/published records. Staff resources require authentication; owners can manage users, editors can write editorial data, and viewers read. JWT access/refresh cookies are HttpOnly and CSRF is enforced for state-changing requests. Contact and analytics endpoints have separate throttles. Uploads validate content and metadata before storage, and unlinked assets require staff authentication to stream.

Direct local development uses SQLite and filesystem storage. Docker uses PostgreSQL and MinIO. Production can replace MinIO with S3/R2-compatible storage by setting endpoint and credentials. Migrations are committed. The `seed` command is idempotent and distinguishes demo content from real editorial data. Its sample PDF is generated from `backend/scripts/generate_demo_resume.py` and can be replaced through admin.


Frontend dependencies are locked by pnpm; backend runtime and development groups are locked by uv. Native dependency build scripts are explicitly allowlisted. Development and production container targets use different dependency sets. Production uses Gunicorn, Next standalone output and Nginx; `ops/nginx.tls.conf.example` supplies a TLS edge template.

API errors use stable identifiers from `core/error_codes.py`. Request logs are JSON, correlated by a server-generated request ID, and omit cookies, request bodies and contact details. Login and refresh have separate database-backed rate windows. File deletion is deferred until the database transaction commits. Public video streams support byte ranges, and empty project posters use a safe static fallback.
