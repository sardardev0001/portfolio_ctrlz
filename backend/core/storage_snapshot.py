"""Content-addressed media backup; manifests contain no storage credentials.

Run in a maintenance window with application writes stopped. Supports the
existing S3 and filesystem backends; restore refuses a nonempty destination.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import tempfile
from pathlib import Path

import django
from django.core.files import File
from django.core.files.storage import default_storage


def names(prefix=""):
    directories, files = default_storage.listdir(prefix)
    for filename in files:
        yield f"{prefix}/{filename}".lstrip("/")
    for directory in directories:
        yield from names(f"{prefix}/{directory}".lstrip("/"))


def digest_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def blob_path(root, digest):
    if not isinstance(digest, str) or not re.fullmatch(r"[a-f0-9]{64}", digest):
        raise ValueError("Invalid backup digest")
    return root / "objects" / digest[:2] / digest


def export_media(root, manifest):
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    entries = []
    for key in names():
        # Always hash the actual bytes, including preexisting mutable keys.
        # Only one object is staged at a time; duplicates share one final blob.
        descriptor, temporary = tempfile.mkstemp(prefix="media-", dir=root)
        try:
            digest = hashlib.sha256()
            size = 0
            with os.fdopen(descriptor, "wb") as target, default_storage.open(key, "rb") as source:
                while chunk := source.read(1024 * 1024):
                    if shutil.disk_usage(root).free - len(chunk) < 1_073_741_824:
                        raise OSError("Backup stopped to preserve 1 GiB of free system space")
                    target.write(chunk)
                    digest.update(chunk)
                    size += len(chunk)
                target.flush()
                os.fsync(target.fileno())
            checksum = digest.hexdigest()
            destination = blob_path(root, checksum)
            destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            if destination.exists():
                if destination.stat().st_size != size or digest_file(destination) != checksum:
                    raise ValueError("Existing backup blob failed integrity check")
            else:
                os.replace(temporary, destination)
            entries.append({"key": key, "sha256": checksum, "size": size})
        finally:
            Path(temporary).unlink(missing_ok=True)
    manifest.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    temporary_manifest = manifest.with_suffix(".pending")
    temporary_manifest.write_text(json.dumps({"version": 1, "files": entries}, indent=2), encoding="utf8")
    temporary_manifest.replace(manifest)
    print(f"Media snapshot: {len(entries)} files, {sum(entry['size'] for entry in entries)} bytes")


def verify_media(root, manifest):
    data = json.loads(manifest.read_text(encoding="utf8"))
    if data.get("version") != 1 or not isinstance(data.get("files"), list):
        raise ValueError("Unsupported media manifest")
    seen = set()
    for entry in data["files"]:
        key = entry["key"]
        if not isinstance(key, str) or key.startswith("/") or ".." in key.split("/") or key in seen:
            raise ValueError("Unsafe or duplicated media key")
        seen.add(key)
        path = blob_path(root, entry["sha256"])
        if path.stat().st_size != entry["size"] or digest_file(path) != entry["sha256"]:
            raise ValueError("Media snapshot failed integrity check")
    print(f"Media integrity verified: {len(seen)} files")
    return data["files"]


def restore_media(root, manifest):
    entries = verify_media(root, manifest)
    if next(names(), None) is not None:
        raise ValueError("Restore requires an EMPTY destination storage; existing files are never overwritten")
    for entry in entries:
        with blob_path(root, entry["sha256"]).open("rb") as source:
            saved = default_storage.save(entry["key"], File(source))
        if saved != entry["key"]:
            raise ValueError("Storage changed the destination key; restore stopped")
        with default_storage.open(saved, "rb") as restored:
            digest = hashlib.sha256()
            while chunk := restored.read(1024 * 1024):
                digest.update(chunk)
        if digest.hexdigest() != entry["sha256"]:
            raise ValueError("Restored object failed integrity verification")
    print(f"Media restored and verified: {len(entries)} files")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("export", "verify", "restore"))
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()
    {"export": export_media, "verify": verify_media, "restore": restore_media}[args.mode](args.root, args.manifest)


if __name__ == "__main__":
    main()
