#!/usr/bin/env bash
# Explicit legacy-host path. No OS upgrade or cross-release Debian packages.
# Static Docker needs scheduled operator updates; it does not enable Ubuntu ESM.
set -euo pipefail
set +x
umask 077
[[ $EUID == 0 ]] || { echo 'Run as root'; exit 1; }
source /etc/os-release
[[ $ID == ubuntu && $VERSION_ID == 20.04 && $(uname -m) == x86_64 ]] || exit 1
[[ -z $(dpkg --audit) ]] || { echo 'Repair package state first'; exit 1; }
! command -v dockerd >/dev/null || { echo 'Existing Docker: review an update separately'; exit 1; }
version=29.9.2
compose_version=v5.6.1
buildx_version=v0.38.1
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl iptables apparmor xz-utils
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
curl -fSL --retry 3 "https://download.docker.com/linux/static/stable/x86_64/docker-$version.tgz" -o "$stage/docker.tgz"
tar -xzf "$stage/docker.tgz" -C "$stage"
install -d -m 0755 "/opt/ctrlz-docker/$version" /usr/local/lib/docker/cli-plugins
install -m 0755 "$stage"/docker/* "/opt/ctrlz-docker/$version/"
curl -fSL --retry 3 "https://github.com/docker/compose/releases/download/$compose_version/docker-compose-linux-x86_64" -o "$stage/docker-compose-linux-x86_64"
curl -fSL --retry 3 "https://github.com/docker/compose/releases/download/$compose_version/docker-compose-linux-x86_64.sha256" -o "$stage/compose.sha256"
(cd "$stage"; sha256sum --check compose.sha256)
install -m 0755 "$stage/docker-compose-linux-x86_64" /usr/local/lib/docker/cli-plugins/docker-compose
curl -fSL --retry 3 "https://github.com/docker/buildx/releases/download/$buildx_version/buildx-$buildx_version.linux-amd64" -o "$stage/buildx-$buildx_version.linux-amd64"
curl -fSL --retry 3 "https://github.com/docker/buildx/releases/download/$buildx_version/checksums.txt" -o "$stage/buildx-checksums.txt"
(cd "$stage"; grep " \*buildx-$buildx_version.linux-amd64$" buildx-checksums.txt | sha256sum --check)
install -m 0755 "$stage/buildx-$buildx_version.linux-amd64" /usr/local/lib/docker/cli-plugins/docker-buildx
for program in "$stage"/docker/*; do
  ln -s "/opt/ctrlz-docker/$version/$(basename "$program")" "/usr/local/bin/$(basename "$program")"
done
install -d -m 0755 /etc/docker
test ! -e /etc/docker/daemon.json
cat > /etc/docker/daemon.json <<'EOF'
{"storage-driver":"overlay2","features":{"containerd-snapshotter":false},"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"},"max-concurrent-downloads":1}
EOF
cat > /etc/systemd/system/docker.service <<'EOF'
[Unit]
Description=CTRLZ Docker Engine (official static distribution)
After=network-online.target
Wants=network-online.target
[Service]
Type=notify
Environment=PATH=/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/usr/local/bin/dockerd --host=unix:///var/run/docker.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutStartSec=120
TimeoutStopSec=120
Restart=on-failure
RestartSec=5
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
OOMScoreAdjust=-500
[Install]
WantedBy=multi-user.target
EOF
sha256sum "$stage/docker.tgz" "$stage/docker-compose-linux-x86_64" > /opt/ctrlz-docker/installed-downloads.sha256
(cd "/opt/ctrlz-docker/$version"; sha256sum *) > /opt/ctrlz-docker/installed-binaries.sha256
systemctl daemon-reload
systemctl enable --now docker
docker version
docker compose version
docker buildx version
runc --version
