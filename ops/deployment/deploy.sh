#!/usr/bin/env bash
# Usage: CTRLZ_RELEASE_DIR=/srv/ctrlz/releases/<id> ./ops/deployment/deploy.sh
source "$(dirname "$(realpath "$0")")/common.sh"
lock_deployment
[[ ${1:-} == --migrations-reviewed ]] || fail 'Review the migration plan and compatibility, then supply --migrations-reviewed'
[[ $# == 1 || ( $# == 2 && ${2:-} == --prebuilt ) ]] || fail 'Usage: deploy.sh --migrations-reviewed [--prebuilt]'
[[ -f $CTRLZ_RELEASE_DIR/.release-id ]] || fail 'A unique release ID is required'
[[ $CTRLZ_RELEASE_DIR == "$CTRLZ_ROOT"/releases/* ]] || fail 'Release must be under CTRLZ_ROOT/releases'
if [[ -d $CTRLZ_RELEASE_DIR/.git ]]; then
  [[ -z $(git -C "$CTRLZ_RELEASE_DIR" status --porcelain) ]] || fail 'Release checkout has uncommitted changes'
fi
[[ $(df -Pk "$CTRLZ_ROOT" | awk 'NR==2 {print $4}') -ge ${CTRLZ_MIN_FREE_KIB:-12582912} ]] || fail "Deployment needs at least $(( ${CTRLZ_MIN_FREE_KIB:-12582912} / 1024 )) MiB free space"
dc config --quiet
if [[ ${2:-} == --prebuilt ]]; then
  # Import release-tagged images built/tested on the development machine first.
  # Never silently build on a memory-constrained production server.
  docker image inspect "ctrlz-backend:$CTRLZ_RELEASE" "ctrlz-frontend:$CTRLZ_RELEASE" >/dev/null
else
  dc build backend frontend
  if grep -qE '^S3_ENDPOINT_URL=.+$' "$CTRLZ_ENV_FILE"; then
    dc --profile s3 build minio
  fi
fi
previous=$(realpath "$CTRLZ_ROOT/current" 2>/dev/null || true)
if [[ -n $previous && -f $previous/ops/deployment/backup.sh ]]; then
  CTRLZ_RELEASE_DIR="$previous" CTRLZ_LOCK_HELD=1 bash "$previous/ops/deployment/backup.sh"
fi
dc up -d --no-build --wait --wait-timeout 120 postgres
if grep -qE '^S3_ENDPOINT_URL=.+$' "$CTRLZ_ENV_FILE"; then
  dc --profile s3 up -d --no-build --wait --wait-timeout 120 minio minio-init
fi
dc run --rm --no-deps backend python manage.py check --deploy --fail-level ERROR
dc run --rm --no-deps backend python manage.py makemigrations --check --dry-run
dc run --rm --no-deps backend python manage.py migrate --plan
# A maintenance window prevents old application workers writing during schema
# changes. A failed migration stops deployment for operator review; no automatic
# downgrade or data restore is attempted.
dc stop -t 3900 frontend backend
dc run --rm --no-deps backend python manage.py migrate --noinput
dc up -d --no-build --wait --wait-timeout 240
dc exec -T nginx nginx -t
dc exec -T nginx nginx -s reload
bash "$CTRLZ_RELEASE_DIR/ops/deployment/healthcheck.sh" --local
if [[ -n $previous ]]; then printf '%s\n' "$previous" > "$CTRLZ_ROOT/shared/previous-release"; fi
ln -sfn "$CTRLZ_RELEASE_DIR" "$CTRLZ_ROOT/current.next"
mv -Tf "$CTRLZ_ROOT/current.next" "$CTRLZ_ROOT/current"
printf 'Release deployed locally: %s. Public HTTPS verification is still required.\n' "$CTRLZ_RELEASE"
