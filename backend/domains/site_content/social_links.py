"""Canonical public destinations for the four contact methods."""

import re
from urllib.parse import quote, urlparse

from django.core.exceptions import ValidationError
from django.core.validators import validate_email

SUPPORTED_SOCIALS = {"email", "telegram", "instagram", "youtube"}


def normalize_social(platform: str, value: str, display_hint: str = "") -> tuple[str, str]:
    """Return display text and a safe destination, or reject malformed input."""
    value = value.strip()
    display_hint = display_hint.strip()
    if platform == "email":
        address = value.removeprefix("mailto:").strip()
        try:
            validate_email(address)
        except ValidationError as exc:
            raise ValueError("Enter a valid email address.") from exc
        return address, f"mailto:{quote(address, safe='@.+-_')}"

    if platform not in SUPPORTED_SOCIALS:
        raise ValueError("Unsupported contact platform.")

    candidate = value
    parsed = urlparse(candidate)
    if parsed.scheme or candidate.startswith("//"):
        if parsed.scheme != "https" or parsed.username or parsed.password or parsed.port:
            raise ValueError("Use a secure profile URL.")
        host = (parsed.hostname or "").lower()
        allowed = {
            "telegram": {"t.me", "www.t.me"},
            "instagram": {"instagram.com", "www.instagram.com"},
            "youtube": {"youtube.com", "www.youtube.com", "m.youtube.com"},
        }[platform]
        if host not in allowed or parsed.query or parsed.fragment:
            raise ValueError("Use a profile URL on the selected platform.")
        path = parsed.path.strip("/")
        if platform == "youtube" and re.fullmatch(r"(?:channel|c|user)/[A-Za-z0-9_-]+", path):
            hint = display_hint.lstrip("@")
            if not re.fullmatch(r"[A-Za-z0-9._-]{3,40}", hint):
                raise ValueError("Enter a display handle for this channel URL.")
            return f"@{hint}", f"https://www.youtube.com/{path}"
        candidate = path
    else:
        candidate = candidate.lstrip("@")

    patterns = {
        "telegram": r"[A-Za-z0-9_]{5,32}",
        "instagram": r"[A-Za-z0-9._]{1,30}",
        "youtube": r"[A-Za-z0-9._-]{3,40}",
    }
    if platform == "youtube":
        candidate = candidate.lstrip("@")
    if not re.fullmatch(patterns[platform], candidate):
        raise ValueError("Enter a valid account handle or profile URL.")
    destinations = {
        "telegram": f"https://t.me/{candidate}",
        "instagram": f"https://www.instagram.com/{candidate}/",
        "youtube": f"https://www.youtube.com/@{candidate}",
    }
    return f"@{candidate}", destinations[platform]
