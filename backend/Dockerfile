FROM python:3.12-slim AS deps
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /uvx /bin/
ENV UV_PROJECT_ENVIRONMENT=/opt/venv UV_LINK_MODE=copy
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

FROM python:3.12-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/opt/venv/bin:$PATH"
RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /app
COPY --from=deps /opt/venv /opt/venv
COPY backend .
RUN mkdir -p /app/uploads /app/staticfiles && chown -R app:app /app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health/',timeout=3)" || exit 1
CMD ["gunicorn","config.wsgi:application","--bind","0.0.0.0:8000","--workers","2","--timeout","3900","--access-logfile","-"]

FROM runner AS development
USER root
COPY --from=deps /bin/uv /bin/uvx /bin/
ENV UV_PROJECT_ENVIRONMENT=/opt/venv UV_LINK_MODE=copy
RUN uv sync --locked --no-install-project
USER app
CMD ["python","manage.py","runserver","0.0.0.0:8000"]

FROM runner AS production
