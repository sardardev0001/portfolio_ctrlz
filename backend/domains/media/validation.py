"""Fail-closed validation before a video can enter persistent media storage."""

import json
import math
import os
import subprocess
import tempfile
from pathlib import Path

from rest_framework.exceptions import APIException

VIDEO_MAX_BYTES = 1_073_741_824
VIDEO_MIN_DURATION = 0
VIDEO_MAX_DURATION = 120
DOCUMENT_MAX_BYTES = 10_000_000


class MediaValidationError(APIException):
    status_code = 422
    default_code = "MEDIA_INVALID"

    def __init__(self, code, *, status=422, field="file"):
        self.status_code = status
        self.error_code = code
        super().__init__({field: [code]})


def validate_video_limits(size, duration=None):
    if size > VIDEO_MAX_BYTES:
        raise MediaValidationError("VIDEO_TOO_LARGE", status=413)
    if size <= 0:
        raise MediaValidationError("MEDIA_INVALID")
    if duration is not None and (
        not math.isfinite(duration) or not VIDEO_MIN_DURATION <= duration <= VIDEO_MAX_DURATION
    ):
        raise MediaValidationError("VIDEO_DURATION")


def probe_video(file, mime):
    validate_video_limits(file.size)
    file.seek(0)
    header = file.read(16)
    file.seek(0)
    if (mime == "video/mp4" and header[4:8] != b"ftyp") or (
        mime == "video/webm" and not header.startswith(bytes.fromhex("1a45dfa3"))
    ):
        raise MediaValidationError("VIDEO_TYPE")
    # Reuse Django's disk upload for large files; never copy a GiB into RAM.
    name = ""
    try:
        if hasattr(file, "temporary_file_path"):
            source = file.temporary_file_path()
            size = Path(source).stat().st_size
            validate_video_limits(size)
        else:
            with tempfile.NamedTemporaryFile(suffix=Path(file.name).suffix, delete=False) as temp:
                name = source = temp.name
                size = 0
                for chunk in file.chunks():
                    size += len(chunk)
                    validate_video_limits(size)
                    temp.write(chunk)
        result = subprocess.run(
            [
                os.getenv("FFPROBE_BINARY", "ffprobe"),
                "-v",
                "error",
                "-protocol_whitelist",
                "file,pipe",
                "-show_entries",
                "format=duration,format_name:stream=codec_type,codec_name,pix_fmt,width,height,duration:stream_disposition=attached_pic",
                "-of",
                "json",
                source,
            ],
            capture_output=True,
            timeout=45,
            check=False,
        )
        if result.returncode or result.stderr:
            raise MediaValidationError("VIDEO_TYPE")
        data = json.loads(result.stdout)
        streams = data.get("streams", [])
        videos = [
            s for s in streams if s.get("codec_type") == "video" and not s.get("disposition", {}).get("attached_pic")
        ]
        audio = [s for s in streams if s.get("codec_type") == "audio"]
        container = data.get("format", {}).get("format_name", "")
        if len(videos) != 1:
            raise MediaValidationError("VIDEO_TYPE")
        video = videos[0]
        if mime == "video/mp4":
            valid = "mp4" in container and video.get("codec_name") == "h264" and video.get("pix_fmt") == "yuv420p"
            valid = valid and all(s.get("codec_name") == "aac" for s in audio)
        else:
            valid = "webm" in container and video.get("codec_name") in ("vp8", "vp9")
            valid = valid and all(s.get("codec_name") in ("opus", "vorbis") for s in audio)
        if not valid or not video.get("width") or not video.get("height"):
            raise MediaValidationError("VIDEO_TYPE")
        durations = [float(data.get("format", {}).get("duration", "nan"))]
        durations += [float(s["duration"]) for s in videos if "duration" in s]
        for duration in durations:
            validate_video_limits(size, duration)
        # A valid container header alone doesn't prove its frames are playable.
        # Decode all video/audio without producing a second media file. Progress
        # proves at least one frame exists, even for a declared zero duration.
        decoded = subprocess.run(
            [
                os.getenv("FFMPEG_BINARY", "ffmpeg"),
                "-v",
                "error",
                "-nostdin",
                "-xerror",
                "-protocol_whitelist",
                "file,pipe",
                "-err_detect",
                "explode",
                "-threads",
                "2",
                "-i",
                source,
                "-map",
                "0:v:0",
                "-map",
                "0:a?",
                "-t",
                str(VIDEO_MAX_DURATION + 1),
                "-threads",
                "2",
                "-progress",
                "pipe:1",
                "-nostats",
                "-f",
                "null",
                "-",
            ],
            capture_output=True,
            timeout=600,
            check=False,
        )
        if decoded.returncode or decoded.stderr:
            raise MediaValidationError("VIDEO_TYPE")
        frames = [
            int(line.split("=", 1)[1]) for line in decoded.stdout.decode().splitlines() if line.startswith("frame=")
        ]
        if not frames or max(frames) == 0:
            raise MediaValidationError("VIDEO_TYPE")
        # Check decoded timestamps too, so understated container metadata cannot
        # bypass the duration limit. No tolerance above the inclusive 120s cap.
        for line in decoded.stdout.decode().splitlines():
            if line.startswith("out_time_us=") and line.split("=", 1)[1] != "N/A":
                validate_video_limits(size, int(line.split("=", 1)[1]) / 1_000_000)
        return durations[0], video["width"], video["height"]
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise MediaValidationError("VIDEO_PROBE_UNAVAILABLE", status=503) from exc
    except (ValueError, KeyError, TypeError) as exc:
        raise MediaValidationError("VIDEO_TYPE") from exc
    finally:
        file.seek(0)
        if name:
            Path(name).unlink(missing_ok=True)
