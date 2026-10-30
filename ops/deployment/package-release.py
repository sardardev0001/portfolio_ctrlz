"""Create a deployment archive from an explicit source allowlist; no secrets/data."""

import argparse
import hashlib
import re
import tarfile
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--release", required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,63}", args.release):
    parser.error("Use a safe release identifier")
root = Path(__file__).resolve().parents[2]
excluded = {
    "node_modules",
    "__pycache__",
    "uploads",
    "staticfiles",
    ".venv",
    ".local",
    "test-results",
    "playwright-report",
    "qa",
    "asset-inspection",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
}
allowed = [
    "backend",
    "frontend",
    "ops",
    "docs/deployment",
    "docs/openapi.yaml",
    "docs/VIDEO_UPLOAD_LIMITS_FA.md",
    "README.md",
    "docker-compose.prod.yml",
    ".dockerignore",
    "pytest.ini",
]


def include(info):
    parts = Path(info.name).parts
    filename = Path(info.name).name
    if (
        info.issym()
        or info.islnk()
        or excluded.intersection(parts)
        or any(part.startswith(".next") for part in parts)
        or (filename.startswith(".env") and info.name != "ops/deployment/.env.production.example")
        or filename.endswith((".sqlite3", ".pyc", ".log", ".tsbuildinfo"))
        or (info.name.startswith("docs/deployment/") and filename.lower().endswith((".jpg", ".jpeg", ".png")))
    ):
        return None
    info.uid = info.gid = 0
    info.uname = info.gname = ""
    info.mode = 0o755 if filename.endswith(".sh") or info.isdir() else 0o644
    return info


args.output.parent.mkdir(parents=True, exist_ok=True)
with tarfile.open(args.output, "x:gz") as archive:
    for name in allowed:
        archive.add(root / name, arcname=name, filter=include)
    import io

    release_data = (args.release + "\n").encode()
    entry = tarfile.TarInfo(".release-id")
    entry.size = len(release_data)
    entry.mode = 0o644
    archive.addfile(entry, io.BytesIO(release_data))
checksum = hashlib.sha256()
with args.output.open("rb") as source:
    while chunk := source.read(1024 * 1024):
        checksum.update(chunk)
args.output.with_suffix(args.output.suffix + ".sha256").write_text(
    f"{checksum.hexdigest()}  {args.output.name}\n", encoding="ascii", newline="\n"
)
print(
    f"Release archive created: {args.output.name}; secrets and persistent data excluded."
)
