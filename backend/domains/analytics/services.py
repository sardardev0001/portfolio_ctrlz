import hashlib
import hmac
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from core.services import increment_metric
from domains.accounts.models import RequestWindow
from domains.analytics.models import DailyMetric


@transaction.atomic
def record_event(kind, key, token):
    now = timezone.now()
    RequestWindow.objects.filter(expires_at__lte=now).delete()
    # An expiring HMAC, never IP/email/browser fingerprint or long-lived visitor ID.
    digest = hmac.new(
        str(settings.SECRET_KEY).encode(), f"event:{token}:{kind}:{key}".encode(), hashlib.sha256
    ).hexdigest()
    _, created = RequestWindow.objects.get_or_create(key=digest, defaults={"expires_at": now + timedelta(seconds=30)})
    if created:
        increment_metric(kind, key)
    return created


def report(start, end):
    metrics = DailyMetric.objects.filter(date__range=(start, end))

    def total(kind):
        return metrics.filter(kind=kind).aggregate(total=Sum("count"))["total"] or 0

    def ranking(kind):
        return list(metrics.filter(kind=kind).values("key").annotate(count=Sum("count")).order_by("-count", "key")[:30])

    daily = list(metrics.filter(kind="page").values("date").annotate(count=Sum("count")).order_by("date"))
    return {
        "start": start,
        "end": end,
        "timezone": settings.TIME_ZONE,
        "views": total("page"),
        "project_views": total("project"),
        "conversions": total("contact"),
        "resume_downloads": total("resume"),
        "social_clicks": total("social"),
        "daily": daily,
        "popular_pages": ranking("page"),
        "popular_projects": ranking("project"),
        "resume_languages": ranking("resume"),
        "socials": ranking("social"),
        "has_data": metrics.exists(),
        "first_recorded": DailyMetric.objects.order_by("date").values_list("date", flat=True).first(),
    }
