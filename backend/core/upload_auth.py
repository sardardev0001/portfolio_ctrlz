"""A bounded media-only grant for uploads outliving the 15 minute access JWT."""

import hashlib
import hmac

from django.contrib.auth import get_user_model
from django.core import signing
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import AuthenticationFailed

from core.auth import CookieJWTAuthentication

UPLOAD_TICKET_MAX_AGE = 3900
SALT = "ctrlz.media-upload.v1"


def fingerprint(value):
    return hashlib.sha256(value.encode()).hexdigest()


def issue_upload_ticket(user, access_cookie):
    return signing.dumps(
        {"user": user.pk, "password": fingerprint(user.password), "session": fingerprint(access_cookie)}, salt=SALT
    )


class MediaUploadAuthentication(CookieJWTAuthentication):
    def authenticate(self, request):
        ticket = request.headers.get("X-Ctrlz-Upload-Ticket")
        if request.method != "POST" or not ticket:
            return super().authenticate(request)
        try:
            grant = signing.loads(ticket, salt=SALT, max_age=UPLOAD_TICKET_MAX_AGE)
            user = get_user_model().objects.get(pk=grant["user"], is_active=True, is_staff=True)
            if (
                not hmac.compare_digest(grant["password"], fingerprint(user.password))
                or not hmac.compare_digest(grant["session"], fingerprint(request.COOKIES.get("ctrlz_access", "")))
                or (user.role not in ("owner", "editor") and not user.is_superuser)
            ):
                raise ValueError("Revoked upload grant")
        except (signing.BadSignature, KeyError, TypeError, ValueError, get_user_model().DoesNotExist) as exc:
            raise AuthenticationFailed("Upload authorization expired; sign in and retry.") from exc
        SessionAuthentication().enforce_csrf(request)
        return user, grant
