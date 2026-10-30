import shutil
import subprocess
import tempfile
from datetime import timedelta
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APIClient

from core.serializers import ProjectSerializer
from domains.analytics.models import DailyMetric
from domains.media.models import MediaAsset
from domains.media.validation import MediaValidationError, probe_video, validate_video_limits
from domains.portfolio.models import PortfolioCategory, PortfolioProject
from domains.resume.models import ResumeFile


@pytest.fixture
def staff(db):
    user = get_user_model().objects.create_user(
        username="upgrade-test", password="Only-For-Tests-123!", role="owner", is_staff=True
    )
    client = APIClient()
    client.force_authenticate(user)
    return client


@pytest.fixture(scope="session")
def movies(tmp_path_factory):
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        pytest.skip("Real ffmpeg/ffprobe required; run this suite in the backend Docker image.")
    root = tmp_path_factory.mktemp("movies")
    for seconds in (0.1, 29, 30, 90, 120, 121):
        subprocess.run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-y",
                "-f",
                "lavfi",
                "-i",
                "color=c=blue:s=64x64:r=10",
                "-t",
                str(seconds),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                str(root / f"{seconds}.mp4"),
            ],
            check=True,
            timeout=30,
        )
    return root


@pytest.mark.parametrize(("size", "accepted"), [(1_073_741_824, True), (1_073_741_825, False)])
def test_exact_gib_video_size(size, accepted):
    if accepted:
        validate_video_limits(size, 30)
    else:
        with pytest.raises(MediaValidationError) as exc:
            validate_video_limits(size, 30)
        assert exc.value.status_code == 413
        assert exc.value.error_code == "VIDEO_TOO_LARGE"


@pytest.mark.parametrize(("seconds", "accepted"), [(0.1, True), (29, True), (30, True), (120, True), (121, False)])
def test_real_video_duration_and_temp_cleanup(movies, seconds, accepted, tmp_path, monkeypatch):
    monkeypatch.setattr(tempfile, "tempdir", str(tmp_path))
    content = (movies / f"{seconds}.mp4").read_bytes()
    video = SimpleUploadedFile("video.mp4", content, content_type="video/mp4")
    if accepted:
        assert probe_video(video, "video/mp4")[0] == seconds
    else:
        with pytest.raises(MediaValidationError) as exc:
            probe_video(video, "video/mp4")
        assert exc.value.error_code == "VIDEO_DURATION"
    assert list(tmp_path.iterdir()) == []
    assert video.tell() == 0


@pytest.mark.django_db
def test_spoofed_video_rejected_without_persistence(staff, tmp_path, monkeypatch):
    monkeypatch.setattr(tempfile, "tempdir", str(tmp_path))
    for content in [b"not video", b"\x00\x00\x00\x18ftypmp42" + b"spoof" * 200]:
        response = staff.post(
            "/api/v1/admin/media/",
            {"file": SimpleUploadedFile("fake.mp4", content, content_type="video/mp4")},
            format="multipart",
        )
        assert response.status_code == 422
        assert response.json()["error"]["code"] == "VIDEO_TYPE"
    assert not MediaAsset.objects.exists()
    assert list(tmp_path.iterdir()) == []


@pytest.mark.django_db
def test_direct_endpoint_auth_and_unverified_legacy_attachment(movies, staff):
    movie = (movies / "30.mp4").read_bytes()
    anon = APIClient()
    response = anon.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("valid.mp4", movie, content_type="video/mp4")},
        format="multipart",
    )
    assert response.status_code in (401, 403)
    assert not MediaAsset.objects.exists()
    asset = MediaAsset.objects.create(filename="legacy.mp4", mime_type="video/mp4", file="legacy.mp4", size=100)
    category = PortfolioCategory.objects.create(title="Test", slug="video-policy")
    serializer = ProjectSerializer(
        data={"title": "Test", "slug": "test", "category": category.pk, "video_asset": asset.pk}
    )
    with pytest.raises(MediaValidationError):
        serializer.is_valid(raise_exception=True)
    project = PortfolioProject.objects.create(title="Old", slug="old", category=category, video_asset=asset)
    unchanged = ProjectSerializer(project, data={"title": "Old revised", "video_asset": asset.pk}, partial=True)
    assert unchanged.is_valid(), unchanged.errors
    publishing = ProjectSerializer(project, data={"status": "published"}, partial=True)
    with pytest.raises(MediaValidationError):
        publishing.is_valid(raise_exception=True)


@pytest.mark.django_db
def test_project_upload_replace_remove_and_cleanup(staff, movies, django_capture_on_commit_callbacks):
    def upload():
        response = staff.post(
            "/api/v1/admin/media/",
            {
                "file": SimpleUploadedFile("valid.mp4", (movies / "30.mp4").read_bytes(), content_type="video/mp4"),
                "usage": "managed-project-video",
            },
            format="multipart",
        )
        assert response.status_code == 201, response.content
        assert response.json()["data"]["video_validated"]
        return MediaAsset.objects.get(pk=response.json()["data"]["id"])

    first, second = upload(), upload()
    category = PortfolioCategory.objects.create(title="Test", slug="lifecycle")
    project = staff.post(
        "/api/v1/admin/projects/",
        {"title": "Test", "slug": "lifecycle", "category": category.pk, "video_asset": first.pk, "status": "published"},
        format="json",
    ).json()["data"]
    assert APIClient().get(f"/api/v1/media/{first.pk}/", HTTP_RANGE="bytes=0-15").status_code == 206
    assert staff.delete(f"/api/v1/admin/media/{first.pk}/").status_code == 400
    storage, key = first.file.storage, first.file.name
    with django_capture_on_commit_callbacks(execute=True):
        assert (
            staff.patch(
                f"/api/v1/admin/projects/{project['id']}/", {"video_asset": second.pk}, format="json"
            ).status_code
            == 200
        )
    assert not storage.exists(key)
    assert not MediaAsset.objects.filter(pk=first.pk).exists()
    with django_capture_on_commit_callbacks(execute=True):
        assert (
            staff.patch(f"/api/v1/admin/projects/{project['id']}/", {"video_asset": None}, format="json").status_code
            == 200
        )
    assert not MediaAsset.objects.filter(pk=second.pk).exists()


@pytest.mark.django_db
def test_two_resume_slots_and_unknown_legacy_preservation(staff):
    asset = MediaAsset.objects.create(
        filename="old.pdf", mime_type="application/pdf", file=SimpleUploadedFile("old.pdf", b"%PDF-1.4\nold"), size=12
    )
    legacy = ResumeFile.objects.create(title="Unknown", asset=asset)
    anon = APIClient()
    assert anon.get("/api/v1/resume/").json()["data"]["files"] == []
    assert anon.get("/api/v1/resume/fa/download/").status_code == 404
    assert anon.get("/api/v1/resume/en/download/").status_code == 404
    for lang in ["fa", "en"]:
        pdf = MediaAsset.objects.create(
            filename=f"{lang}.pdf",
            mime_type="application/pdf",
            file=SimpleUploadedFile(f"{lang}.pdf", b"%PDF-1.4\n" + lang.encode()),
            size=12,
        )
        response = staff.post(
            "/api/v1/admin/resume-files/", {"title": lang, "language": lang, "asset": pdf.pk}, format="json"
        )
        assert response.status_code == 201, response.content
        download = anon.get(f"/api/v1/resume/{lang}/download/")
        assert download["Content-Type"] == "application/pdf"
        assert f"{lang.upper()}.pdf" in download["Content-Disposition"]
        assert b"".join(download.streaming_content).endswith(lang.encode())
    duplicate = staff.post(
        "/api/v1/admin/resume-files/", {"title": "Duplicate", "language": "fa", "asset": asset.pk}, format="json"
    )
    assert duplicate.status_code == 400
    assert ResumeFile.objects.filter(pk=legacy.pk, language="").exists()
    assert set(DailyMetric.objects.filter(kind="resume").values_list("key", flat=True)) == {"fa", "en"}


@pytest.mark.django_db
def test_real_analytics_dedupe_privacy_dates_and_auth(staff):
    anon = APIClient(enforce_csrf_checks=True)
    assert anon.get("/api/v1/admin/analytics/").status_code in (401, 403)
    assert not staff.get("/api/v1/admin/analytics/").json()["data"]["has_data"]
    data = {"page": "/resume", "token": "ephemeral-session-token-12345"}
    assert anon.post("/api/v1/analytics/", data, format="json").status_code == 403
    csrf = anon.get("/api/v1/auth/csrf/").json()["data"]["csrf_token"]
    for _ in range(2):
        assert anon.post("/api/v1/analytics/", data, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 201
    assert DailyMetric.objects.get(kind="page").count == 1
    data["page"] = "/contact"
    assert not anon.post("/api/v1/analytics/", data, format="json", HTTP_X_CSRFTOKEN=csrf, HTTP_DNT="1").json()["data"][
        "recorded"
    ]
    today = timezone.localdate()
    DailyMetric.objects.create(date=today - timedelta(days=8), kind="page", key="/", count=20)
    report = staff.get("/api/v1/admin/analytics/?days=7").json()["data"]
    assert report["views"] == 1
    assert report["timezone"] == "Asia/Tehran"
    assert staff.get("/api/v1/admin/analytics/?start=bad").status_code == 400
    assert staff.get("/api/v1/admin/analytics/?days=367").status_code == 400
    # Merely requesting project content must never inflate analytics.
    assert not DailyMetric.objects.filter(kind="project").exists()


def test_upload_streaming_limit():
    from domains.media.upload_handlers import BoundedUploadHandler

    handler = BoundedUploadHandler()
    handler.bytes_received = 1_073_741_823
    assert handler.receive_data_chunk(b"x", 0) == b"x"
    with pytest.raises(MediaValidationError) as exc:
        handler.receive_data_chunk(b"x", 0)
    assert exc.value.status_code == 413


@pytest.mark.django_db
def test_interrupted_multipart_upload_removes_partial_disk_file(staff, settings, tmp_path, monkeypatch):
    import domains.media.upload_handlers as handlers

    settings.FILE_UPLOAD_MAX_MEMORY_SIZE = 1
    settings.FILE_UPLOAD_TEMP_DIR = str(tmp_path)
    monkeypatch.setattr(handlers, "VIDEO_MAX_BYTES", 100)
    response = staff.post(
        "/api/v1/admin/media/",
        {"file": SimpleUploadedFile("too-large.mp4", b"x" * 1000, content_type="video/mp4")},
        format="multipart",
    )
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "VIDEO_TOO_LARGE"
    assert not MediaAsset.objects.exists()
    assert list(tmp_path.iterdir()) == []


@pytest.mark.django_db
@pytest.mark.parametrize("seconds", [121])
def test_api_rejects_actual_out_of_range_video_without_storage(staff, movies, seconds, settings):
    response = staff.post(
        "/api/v1/admin/media/",
        {
            "file": SimpleUploadedFile(
                "duration.mp4", (movies / f"{seconds}.mp4").read_bytes(), content_type="video/mp4"
            )
        },
        format="multipart",
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VIDEO_DURATION"
    assert not MediaAsset.objects.exists()
    assert not Path(settings.MEDIA_ROOT).exists()


def test_incompatible_mp4_codec_rejected(movies, tmp_path):
    target = tmp_path / "mpeg4.mp4"
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=blue:s=64x64:r=10",
            "-t",
            "30",
            "-c:v",
            "mpeg4",
            str(target),
        ],
        check=True,
        timeout=30,
    )
    with pytest.raises(MediaValidationError) as exc:
        probe_video(SimpleUploadedFile("codec.mp4", target.read_bytes(), content_type="video/mp4"), "video/mp4")
    assert exc.value.error_code == "VIDEO_TYPE"


@pytest.mark.django_db
def test_expired_managed_orphans_cleanup_preserves_library_and_linked_files(django_capture_on_commit_callbacks):
    from domains.media.cleanup import cleanup_expired_uploads

    files = []
    for usage in ["managed-resume", "managed-project-video", "library"]:
        asset = MediaAsset.objects.create(
            filename="test.pdf",
            mime_type="application/pdf",
            file=SimpleUploadedFile("test.pdf", b"%PDF-1.4"),
            size=8,
            usage=usage,
        )
        files.append(asset)
    ResumeFile.objects.create(title="Linked", asset=files[1], language="fa")
    MediaAsset.objects.update(created_at=timezone.now() - timedelta(days=2))
    storage, key = files[0].file.storage, files[0].file.name
    with django_capture_on_commit_callbacks(execute=True):
        cleanup_expired_uploads()
    assert not MediaAsset.objects.filter(pk=files[0].pk).exists()
    assert not storage.exists(key)
    assert MediaAsset.objects.filter(pk__in=[files[1].pk, files[2].pk]).count() == 2


def test_error_identifiers_have_both_ui_languages():
    source = Path(__file__).resolve().parents[2] / "frontend/src/i18n/messages.ts"
    if not source.exists():
        pytest.skip("Frontend dictionary is verified by Vitest outside the backend image.")
    assert all(
        code in source.read_text(encoding="utf8") for code in ["VIDEO_DURATION", "VIDEO_TOO_LARGE", "VIDEO_TYPE"]
    )


@pytest.mark.parametrize(("size", "seconds"), [(100_000_000, 30), (900_000_000, 90), (1_073_741_824, 120), (100, 0)])
def test_requested_video_limit_combinations(size, seconds):
    validate_video_limits(size, seconds)


@pytest.mark.parametrize("seconds", [-1, float("nan"), float("inf"), 120.001])
def test_invalid_durations_fail_closed(seconds):
    with pytest.raises(MediaValidationError):
        validate_video_limits(100, seconds)


def test_probe_reuses_disk_upload_without_copy(movies, monkeypatch):
    from django.core.files.uploadedfile import TemporaryUploadedFile

    with TemporaryUploadedFile("disk.mp4", "video/mp4", 0, None) as video:
        video.write((movies / "0.1.mp4").read_bytes())
        video.size = video.tell()

        def no_copy(*args, **kwargs):
            pytest.fail("Disk uploads must not be copied to another temporary file")

        monkeypatch.setattr(tempfile, "NamedTemporaryFile", no_copy)
        assert probe_video(video, "video/mp4")[0] == 0.1
        assert Path(video.temporary_file_path()).exists()


def test_audio_only_and_corrupt_frames_rejected(movies, tmp_path):
    audio = tmp_path / "audio.mp4"
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=440",
            "-t",
            "1",
            "-c:a",
            "aac",
            str(audio),
        ],
        check=True,
        timeout=30,
    )
    # Keep the MP4 metadata intact while replacing encoded frame bytes.
    damaged = bytearray((movies / "30.mp4").read_bytes())
    mdat = damaged.index(b"mdat")
    box_size = int.from_bytes(damaged[mdat - 4 : mdat], "big")
    damaged[mdat + 4 : mdat - 4 + box_size] = b"\xff" * (box_size - 8)
    for content in (audio.read_bytes(), bytes(damaged)):
        with pytest.raises(MediaValidationError) as exc:
            probe_video(SimpleUploadedFile("bad.mp4", content, content_type="video/mp4"), "video/mp4")
        assert exc.value.error_code == "VIDEO_TYPE"


@pytest.mark.django_db
@pytest.mark.parametrize("seconds", [0.1, 29, 120])
def test_api_accepts_short_and_exact_maximum_video(staff, movies, seconds):
    response = staff.post(
        "/api/v1/admin/media/",
        {
            "file": SimpleUploadedFile("valid.mp4", (movies / f"{seconds}.mp4").read_bytes(), content_type="video/mp4"),
            "duration_seconds": 999,  # Client-supplied metadata has no authority.
        },
        format="multipart",
    )
    assert response.status_code == 201, response.content
    assert response.json()["data"]["duration_seconds"] == seconds
