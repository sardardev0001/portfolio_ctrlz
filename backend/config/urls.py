from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from core import views
from core.responses import not_found
from core.schema import CookieJWTScheme
from core.serializers import GallerySerializer, ResumeFileSerializer, model_serializer
from domains.accounts.views import (
    CsrfView,
    LoginChallengeView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    UploadTicketView,
)
from domains.audit.models import AdminAuditLog
from domains.contact.models import ContactMessage
from domains.portfolio.models import PortfolioCategory, PortfolioMedia
from domains.resume.models import Achievement, Certificate, Education, Experience, ResumeFile
from domains.site_content.models import HeroSection, PageBlock, Profile, SiteSettings, SocialLink, Stat
from domains.skills.models import Skill, SkillCategory

_auth_schema = CookieJWTScheme
public = DefaultRouter()
public.register("projects", views.PublicProjectViewSet, basename="project")
admin = DefaultRouter()
admin.register("projects", views.AdminProjectViewSet, basename="admin-project")
admin.register("media", views.MediaViewSet, basename="media")
admin.register("users", views.UsersViewSet, basename="users")
for name, model in (
    ("categories", PortfolioCategory),
    ("skill-categories", SkillCategory),
    ("skills", Skill),
    ("experience", Experience),
    ("education", Education),
    ("certificates", Certificate),
    ("achievements", Achievement),
    ("resume-files", ResumeFile),
    ("messages", ContactMessage),
    ("heroes", HeroSection),
    ("blocks", PageBlock),
    ("stats", Stat),
    ("socials", SocialLink),
    ("settings", SiteSettings),
    ("profiles", Profile),
    ("gallery", PortfolioMedia),
):
    serializer = (
        ResumeFileSerializer
        if model == ResumeFile
        else GallerySerializer
        if model == PortfolioMedia
        else model_serializer(model)
    )
    attrs = {"queryset": model.objects.all(), "serializer_class": serializer}
    if name in ("settings", "profiles"):
        attrs["http_method_names"] = ["get", "patch", "head", "options"]
    if name == "messages":
        attrs["http_method_names"] = ["get", "patch", "delete", "head", "options"]
    admin.register(name, type(f"{model.__name__}ViewSet", (views.EditorialViewSet,), attrs), basename=name)
audit_view = type(
    "AuditViewSet",
    (views.EditorialViewSet,),
    {
        "queryset": AdminAuditLog.objects.all(),
        "serializer_class": model_serializer(AdminAuditLog),
        "http_method_names": ["get", "head", "options"],
    },
)
admin.register("audit", audit_view, basename="audit")
urlpatterns = [
    path("api/v1/health/", views.HealthView.as_view()),
    path("api/v1/media/<int:pk>/", views.MediaDownloadView.as_view()),
    path("api/v1/content/", views.ContentView.as_view()),
    path("api/v1/skills/", views.SkillsView.as_view()),
    path("api/v1/resume/", views.ResumeView.as_view()),
    path("api/v1/resume/<str:language>/download/", views.ResumeDownloadView.as_view()),
    path("api/v1/contact/", views.ContactView.as_view()),
    path("api/v1/analytics/", views.AnalyticsView.as_view()),
    path("api/v1/auth/csrf/", CsrfView.as_view()),
    path("api/v1/auth/upload-ticket/", UploadTicketView.as_view()),
    path("api/v1/auth/challenge/", LoginChallengeView.as_view()),
    path("api/v1/auth/login/", LoginView.as_view()),
    path("api/v1/auth/refresh/", RefreshView.as_view()),
    path("api/v1/auth/me/", MeView.as_view()),
    path("api/v1/auth/logout/", LogoutView.as_view()),
    path("api/v1/admin/dashboard/", views.DashboardView.as_view()),
    path("api/v1/admin/analytics/", views.AnalyticsReportView.as_view()),
    path("api/v1/admin/", include(admin.urls)),
    path("api/v1/", include(public.urls)),
    path("api/v1/schema/", SpectacularAPIView.as_view()),
    path("api/v1/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
]
urlpatterns[-2] = path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema")
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [re_path(r"^.*$", not_found)]
handler404 = "core.responses.not_found"
