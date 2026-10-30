#!/usr/bin/env bash
source "$(dirname "$(realpath "$0")")/common.sh"
dc ps
dc exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
dc exec -T backend python manage.py check
dc exec -T backend python manage.py migrate --check
dc exec -T nginx nginx -t
curl --fail --silent --show-error --max-time 30 http://127.0.0.1:8080/api/v1/health/ >/dev/null
if [[ ${1:-} != --local ]]; then
  [[ ${CTRLZ_PUBLIC_URL:-} =~ ^https://[a-zA-Z0-9.-]+$ ]] || fail 'Set CTRLZ_PUBLIC_URL to the real HTTPS origin'
  for path in / /portfolio /about /skills /resume /contact /admin/login /api/v1/health/; do
    curl --fail --silent --show-error --max-time 45 "$CTRLZ_PUBLIC_URL$path" >/dev/null
  done
  http_origin="http://${CTRLZ_PUBLIC_URL#https://}"
  status=$(curl --silent --show-error --max-time 20 --output /dev/null --write-out '%{http_code}' "$http_origin/")
  [[ $status == 301 || $status == 308 ]] || fail 'HTTP is not redirected to HTTPS'
fi
printf 'Health checks passed\n'
