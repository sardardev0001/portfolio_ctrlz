from pathlib import Path

from PIL import Image, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

from domains.media.models import MediaAsset
from domains.media.validation import DOCUMENT_MAX_BYTES, MediaValidationError, probe_video


def upload_media(file, *, alt="", usage=""):
    extension = Path(file.name).suffix.lower()
    allowed = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
    }
    mime = allowed.get(extension)
    if not mime or file.content_type != mime:
        raise MediaValidationError("VIDEO_TYPE" if extension in (".mp4", ".webm") else "MEDIA_INVALID", status=400)
    if not mime.startswith("video/") and (file.size > DOCUMENT_MAX_BYTES or file.size == 0):
        raise MediaValidationError("DOCUMENT_SIZE", status=413)
    width = height = None
    duration = None
    header = file.read(16)
    file.seek(0)
    if mime.startswith("image/"):
        try:
            image = Image.open(file)
            width, height = image.size
            if width * height > 24_000_000 or image.format not in ("PNG", "JPEG", "WEBP"):
                raise ValueError("Invalid image")
            expected = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp"}
            if expected[image.format] != mime:
                raise ValueError("MIME mismatch")
            image.verify()
        except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
            raise ValidationError({"file": "Invalid image content."}) from exc
    elif mime == "application/pdf" and not header.startswith(b"%PDF-"):
        raise ValidationError({"file": "Invalid PDF header."})
    elif mime.startswith("video/"):
        duration, width, height = probe_video(file, mime)
    file.seek(0)
    asset = MediaAsset(
        file=file,
        filename=Path(file.name).name[:255],
        mime_type=mime,
        size=file.size,
        duration_seconds=duration,
        video_validated=duration is not None,
        width=width,
        height=height,
        alt=alt,
        usage=usage,
    )
    try:
        asset.save()
    except Exception:
        if asset.file.name:
            asset.file.delete(save=False)
        raise
    return asset
