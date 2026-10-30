#!/usr/bin/env bash
# Deduplicated media blobs + dated DB/config manifests. Never removes a volume.
source "$(dirname "$(realpath "$0")")/common.sh"
[[ ${CTRLZ_LOCK_HELD:-0} == 1 ]] || lock_deployment
backup_root=${CTRLZ_BACKUP_ROOT:-$CTRLZ_ROOT/shared/backups}
mkdir -p "$backup_root"
chmod 700 "$backup_root"
[[ $(df -Pk "$backup_root" | awk 'NR==2 {print $4}') -ge 3145728 ]] || fail 'Backup needs at least 3 GiB free scratch space'
stamp=$(date -u +%Y%m%dT%H%M%SZ)
snapshot="$backup_root/$stamp"
mkdir -m 700 "$snapshot"
resume_services() { dc start backend frontend >/dev/null || true; }
trap resume_services EXIT
# Pause writes to keep database references and media consistent. MinIO remains
# private; no external writer may use this bucket during the maintenance window.
dc stop -t 3900 frontend backend
dc exec -T postgres sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$snapshot/database.dump"
dc run --rm --no-deps --user 0 --volume "$backup_root:/backup" --entrypoint python backend \
  -m core.storage_snapshot export --root /backup/media --manifest "/backup/$stamp/media.json"
tar -C "$CTRLZ_RELEASE_DIR" -czf "$snapshot/configuration.tar.gz" \
  docker-compose.prod.yml ops backend/config .release-id
# Restricted recovery copy; never part of the source/release archive.
install -m 600 "$CTRLZ_ENV_FILE" "$snapshot/environment.private"
# The live certificate/account keys are private recovery material, never part
# of a public source archive. Local QA without a real certificate skips this.
if [[ -d /etc/letsencrypt/live/ctrtlzweb.ir ]]; then
  tar -C /etc -czf "$snapshot/tls.private.tar.gz" letsencrypt
fi
printf '%s\n' "$CTRLZ_RELEASE_DIR" > "$snapshot/release-path"
(cd "$snapshot"
  files=(database.dump media.json configuration.tar.gz environment.private)
  [[ ! -f tls.private.tar.gz ]] || files+=(tls.private.tar.gz)
  sha256sum "${files[@]}" > SHA256SUMS
)
touch "$snapshot/COMPLETE"
ln -sfn "$stamp" "$backup_root/latest"
dc start backend frontend >/dev/null
trap - EXIT
printf 'Backup complete: %s\n' "$snapshot"
# Retention is deliberately not automatic until actual VPS capacity and an
# independent backup target have been audited. Blobs are deduplicated by SHA256.
