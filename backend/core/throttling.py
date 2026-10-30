"""Database-backed, process-shared request limits with expiring keyed hashes."""

import hashlib
import hmac
import os
import time
from datetime import UTC, datetime

from django.conf import settings
from django.db import transaction
from rest_framework.throttling import SimpleRateThrottle

from domains.accounts.models import RequestWindow


class SharedRateThrottle(SimpleRateThrottle):
    scope = "anon"

    def allow_request(self, request, view):
        self.scope = getattr(view, "throttle_scope", "anon")
        rate = self.get_rate()
        if not rate:
            return True
        limit, duration = self.parse_rate(rate)
        assert limit is not None and duration is not None
        now = time.time()
        boundary = (int(now) // duration + 1) * duration
        self.remaining_wait = boundary - now
        identity = request.META.get("REMOTE_ADDR", "unknown")
        proxy_token = os.getenv("API_PROXY_TOKEN")
        forwarded = request.META.get("HTTP_X_CTRLZ_CLIENT", "")[:64]
        signature = request.META.get("HTTP_X_CTRLZ_CLIENT_SIGNATURE", "")
        if (
            proxy_token
            and forwarded
            and hmac.compare_digest(
                hmac.new(proxy_token.encode(), forwarded.encode(), hashlib.sha256).hexdigest(), signature
            )
        ):
            identity = forwarded
        identities = [identity]
        if self.scope == "login" and request.data.get("username"):
            identities.append("account:" + str(request.data["username"]).lower()[:150])
        secret = settings.SECRET_KEY
        assert isinstance(secret, str)
        for identity in identities:
            raw = f"{self.scope}:{identity}:{boundary}".encode()
            key = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
            with transaction.atomic():
                RequestWindow.objects.filter(expires_at__lte=datetime.fromtimestamp(now, UTC)).delete()
                window, _ = RequestWindow.objects.get_or_create(
                    key=key, defaults={"expires_at": datetime.fromtimestamp(boundary, UTC)}
                )
                window = RequestWindow.objects.select_for_update().get(pk=window.pk)
                if window.count >= limit:
                    return False
                window.count += 1
                window.save(update_fields=["count"])
        return True

    def wait(self):
        return self.remaining_wait

    def get_cache_key(self, request, view):
        return None  # Database keys are produced with HMAC in allow_request.
