import json

import pytest
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from core.storage_snapshot import export_media, restore_media, verify_media


def test_media_snapshot_deduplicates_and_restores_exact_keys(tmp_path):
    default_storage.save("assets/one.mp4", ContentFile(b"video-test-bytes"))
    default_storage.save("assets/two.mp4", ContentFile(b"video-test-bytes"))
    backup = tmp_path / "backup"
    manifest = backup / "snapshot.json"
    export_media(backup, manifest)
    entries = verify_media(backup, manifest)
    assert len(entries) == 2
    assert entries[0]["sha256"] == entries[1]["sha256"]
    assert len(list((backup / "objects").glob("*/*"))) == 1
    # This is the test's isolated storage, never the developer's media.
    for entry in entries:
        default_storage.delete(entry["key"])
    restore_media(backup, manifest)
    for entry in entries:
        with default_storage.open(entry["key"]) as restored:
            assert restored.read() == b"video-test-bytes"


def test_restore_refuses_nonempty_storage(tmp_path):
    default_storage.save("existing.pdf", ContentFile(b"existing"))
    manifest = tmp_path / "media.json"
    export_media(tmp_path, manifest)
    with pytest.raises(ValueError, match="EMPTY"):
        restore_media(tmp_path, manifest)
    with default_storage.open("existing.pdf") as existing:
        assert existing.read() == b"existing"


def test_corrupt_backup_rejected_before_restore(tmp_path):
    default_storage.save("asset.mp4", ContentFile(b"good"))
    manifest = tmp_path / "media.json"
    export_media(tmp_path, manifest)
    blob = next((tmp_path / "objects").glob("*/*"))
    blob.write_bytes(b"evil")
    with pytest.raises(ValueError, match="integrity"):
        verify_media(tmp_path, manifest)


def test_manifest_path_traversal_rejected(tmp_path):
    manifest = tmp_path / "media.json"
    manifest.write_text(json.dumps({"version": 1, "files": [{"key": "../escape", "sha256": "x", "size": 0}]}))
    with pytest.raises(ValueError, match="Unsafe"):
        verify_media(tmp_path, manifest)


def test_export_stops_safely_before_exhausting_disk(tmp_path, monkeypatch):
    from collections import namedtuple

    import core.storage_snapshot as snapshot

    default_storage.save("asset.mp4", ContentFile(b"keep-original"))
    usage = namedtuple("Usage", "total used free")
    monkeypatch.setattr(snapshot.shutil, "disk_usage", lambda path: usage(100, 99, 1))
    manifest = tmp_path / "backup" / "media.json"
    with pytest.raises(OSError, match="free system space"):
        export_media(manifest.parent, manifest)
    assert not manifest.exists()
    assert not list(manifest.parent.glob("media-*"))
    with default_storage.open("asset.mp4") as original:
        assert original.read() == b"keep-original"
