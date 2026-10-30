#!/usr/bin/env bash
set -euo pipefail
set +x
exec 9>/srv/ctrlz/shared/certificate.lock
flock -n 9 || exit 0
docker run --rm --name ctrlz-certbot-renew \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot:latest renew --webroot -w /var/lib/letsencrypt "$@"
docker exec ctrlz-edge nginx -t
docker exec ctrlz-edge nginx -s reload
