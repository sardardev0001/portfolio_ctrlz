#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077

CTRLZ_ROOT=${CTRLZ_ROOT:-/srv/ctrlz}
CTRLZ_PROJECT=${CTRLZ_PROJECT:-ctrlz-production}
CTRLZ_ENV_FILE=${CTRLZ_ENV_FILE:-$CTRLZ_ROOT/shared/.env.production}
CTRLZ_RELEASE_DIR=${CTRLZ_RELEASE_DIR:-$CTRLZ_ROOT/current}
export CTRLZ_ENV_FILE

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $CTRLZ_PROJECT =~ ^[a-z0-9][a-z0-9_-]*$ ]] || fail 'Invalid Compose project name'
[[ -f $CTRLZ_ENV_FILE ]] || fail 'Production environment file is missing'
[[ -f $CTRLZ_RELEASE_DIR/docker-compose.prod.yml ]] || fail 'Release directory is missing'
[[ $(stat -c '%a' "$CTRLZ_ENV_FILE") == 600 ]] || fail 'Production environment must have mode 600'
CTRLZ_RELEASE_DIR=$(realpath "$CTRLZ_RELEASE_DIR")
CTRLZ_RELEASE=$(cat "$CTRLZ_RELEASE_DIR/.release-id" 2>/dev/null || printf production)
export CTRLZ_RELEASE
dc() {
  docker compose --project-name "$CTRLZ_PROJECT" --project-directory "$CTRLZ_RELEASE_DIR" \
    --env-file "$CTRLZ_ENV_FILE" -f "$CTRLZ_RELEASE_DIR/docker-compose.prod.yml" "$@"
}
lock_deployment() {
  mkdir -p "$CTRLZ_ROOT/shared"
  exec 9>"$CTRLZ_ROOT/shared/deployment.lock"
  flock -n 9 || fail 'Another deployment or backup is in progress'
}
