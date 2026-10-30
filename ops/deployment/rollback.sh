#!/usr/bin/env bash
# No automatic database downgrade: old code must support the current schema.
source "$(dirname "$(realpath "$0")")/common.sh"
lock_deployment
[[ ${1:-} == --schema-compatible ]] || fail 'Review migration compatibility, then supply --schema-compatible'
previous=$(cat "$CTRLZ_ROOT/shared/previous-release")
[[ $previous == "$CTRLZ_ROOT"/releases/* && -d $previous ]] || fail 'Previous release is unavailable'
CTRLZ_RELEASE_DIR="$previous" CTRLZ_LOCK_HELD=1 bash "$previous/ops/deployment/backup.sh"
export CTRLZ_RELEASE_DIR="$previous"
export CTRLZ_RELEASE
CTRLZ_RELEASE=$(cat "$previous/.release-id")
dc run --rm --no-deps backend python manage.py migrate --check
dc up -d --no-build --wait --wait-timeout 240
dc exec -T nginx nginx -t
dc exec -T nginx nginx -s reload
bash "$previous/ops/deployment/healthcheck.sh" --local
ln -sfn "$previous" "$CTRLZ_ROOT/current.next"
mv -Tf "$CTRLZ_ROOT/current.next" "$CTRLZ_ROOT/current"
printf 'Code rolled back; database and media were preserved.\n'
