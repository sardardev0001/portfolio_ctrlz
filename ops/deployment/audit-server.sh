#!/usr/bin/env bash
# Read-only audit. Source-file output is limited to repository URLs/codenames;
# no environment files, private keys or credential-bearing service configs.
set -eu
cat /etc/os-release
uname -a
nproc
free -h
df -h
lsblk
ss -tulpn
systemctl list-units --type=service --state=running --no-pager
printf '\nAPT audit\n'
dpkg --audit
grep -RHnE '^(deb |URIs:|Suites:)' /etc/apt/sources.list /etc/apt/sources.list.d 2>/dev/null || true
printf '\nSSH policy\n'
sshd -T 2>/dev/null | grep -E '^(port|permitrootlogin|passwordauthentication|pubkeyauthentication) ' || true
ufw status verbose || true
if command -v docker >/dev/null; then
    docker version --format '{{.Server.Version}}'
    docker ps --format '{{.Names}} {{.Image}} {{.Ports}}'
    docker volume ls
    docker system df
fi
printf '\nNo changes were made. Provider snapshots and recovery access must be checked in the provider panel.\n'
