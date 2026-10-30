from datetime import timedelta

from django.db.models import Q, Sum
from django.utils import timezone

from domains.analytics.models import DailyMetric
from domains.contact.models import ContactMessage
from domains.portfolio.models import PortfolioProject


def project_listing(params, *, public=True):
    qs = PortfolioProject.objects.select_related("category", "thumbnail_asset", "video_asset").prefetch_related(
        "gallery__asset"
    )
    if public:
        qs = qs.filter(status="published", visible=True, category__visible=True)
    if params.get("category"):
        qs = qs.filter(category__slug=params["category"])
    if params.get("search"):
        term = params["search"][:160]
        qs = qs.filter(Q(title__icontains=term) | Q(description__icontains=term) | Q(short_description__icontains=term))
    if not public and params.get("status"):
        qs = qs.filter(status=params["status"])
    return qs


def dashboard_data():
    projects = PortfolioProject.objects.all()
    return {
        "projects": projects.count(),
        "published": projects.filter(status="published").count(),
        "drafts": projects.filter(status="draft").count(),
        "unread_messages": ContactMessage.objects.filter(status="unread").count(),
        "views": DailyMetric.objects.filter(kind="page").aggregate(total=Sum("count"))["total"] or 0,
        "project_views": DailyMetric.objects.filter(kind="project").aggregate(total=Sum("count"))["total"] or 0,
        "conversions": DailyMetric.objects.filter(kind="contact").aggregate(total=Sum("count"))["total"] or 0,
        "daily": list(
            DailyMetric.objects.filter(date__gte=timezone.localdate() - timedelta(days=29))
            .values("date")
            .annotate(count=Sum("count"))
            .order_by("date")
        ),
        "popular_pages": list(
            DailyMetric.objects.filter(kind="page").values("key").annotate(count=Sum("count")).order_by("-count")[:10]
        ),
        "popular_projects": list(
            DailyMetric.objects.filter(kind="project")
            .values("key")
            .annotate(count=Sum("count"))
            .order_by("-count")[:10]
        ),
    }
