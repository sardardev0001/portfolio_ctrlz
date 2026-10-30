#!/usr/bin/env bash
# Restore only into a fresh, explicitly named isolated Compose project/storage.
source "$(dirname "$(realpath "$0")")/common.sh"
lock_deployment
[[ $CTRLZ_PROJECT == ctrlz-restore-* ]] || fail 'Restore is restricted to ctrlz-restore-* isolated projects'
[[ $# == 1 ]] || fail 'Supply the absolute path to a complete snapshot'
snapshot=$(realpath "$1")
[[ -f $snapshot/COMPLETE ]] || fail 'Incomplete snapshot'
(cd "$snapshot" && sha256sum --check --quiet SHA256SUMS)
count=$(dc exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT count(*) FROM pg_tables WHERE schemaname=current_schema()"' 2>/dev/null || true)
[[ $count == 0 ]] || fail 'Destination database must be empty; no DROP/CLEAN is performed'
dc exec -T postgres sh -c 'exec pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error' < "$snapshot/database.dump"
backup_root=$(dirname "$snapshot")
dc run --rm --no-deps --user 0 --volume "$backup_root:/backup:ro" --entrypoint python backend \
  -m core.storage_snapshot restore --root /backup/media --manifest "/backup/$(basename "$snapshot")/media.json"
dc run --rm --no-deps --user 0 --entrypoint sh backend -c \
  'if [ -z "$S3_ENDPOINT_URL" ]; then chown -R app:app /app/uploads; fi'
dc run --rm --no-deps backend python manage.py migrate --check
printf 'Isolated restore complete. Verify project rows, media and HTTP before accepting recovery.\n'
