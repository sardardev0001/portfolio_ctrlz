from django.db import connection, transaction
from django.db.models import Q
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.auth import EditorialPermission, OwnerPermission
from core.selectors import dashboard_data, project_listing
from core.serializers import (
    ContactSerializer,
    MediaSerializer,
    ProjectSerializer,
    ResumeFileSerializer,
    UserSerializer,
    model_serializer,
)
from core.services import EditorialService, increment_metric
from core.throttling import SharedRateThrottle
from core.upload_auth import MediaUploadAuthentication
from domains.contact.models import ContactMessage
from domains.media.models import MediaAsset
from domains.media.services import upload_media
from domains.portfolio.models import PortfolioProject
from domains.resume.models import Achievement, Certificate, Education, Experience, ResumeFile
from domains.site_content.models import HeroSection, PageBlock, Profile, SiteSettings, SocialLink, Stat
from domains.skills.models import Skill


class EditorialViewSet(viewsets.ModelViewSet):
    permission_classes = [EditorialPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("search"):
            term = self.request.query_params["search"][:160]
            fields = [
                f.name
                for f in qs.model._meta.fields
                if f.name in ("title", "name", "subject", "platform", "label", "handle", "page", "degree")
            ]
            query = Q()
            for field in fields:
                query |= Q(**{f"{field}__icontains": term})
            qs = qs.filter(query)
        if self.request.query_params.get("status") and hasattr(qs.model, "status"):
            qs = qs.filter(status=self.request.query_params["status"])
        return qs

    def perform_create(self, serializer):
        EditorialService.save(serializer, self.request.user)

    def perform_update(self, serializer):
        EditorialService.save(serializer, self.request.user)

    def perform_destroy(self, instance):
        EditorialService.delete(instance, self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        model = self.get_queryset().model
        if not any(field.name == "order" for field in model._meta.fields):
            raise ValidationError({"order": "This resource cannot be reordered."})
        ids = request.data.get("ids")
        if (
            not isinstance(ids, list)
            or not ids
            or len(ids) > 100
            or any(type(pk) is not int or pk <= 0 for pk in ids)
            or len(ids) != len(set(ids))
        ):
            raise ValidationError({"ids": "Provide up to 100 distinct record IDs."})
        with transaction.atomic():
            rows = list(model.objects.select_for_update().order_by("order", "id"))
            existing = {row.pk for row in rows}
            if not set(ids).issubset(existing):
                raise ValidationError({"ids": "A record no longer exists."})
            positions = [i for i, row in enumerate(rows) if row.pk in ids]
            by_id = {row.pk: row for row in rows}
            for position, pk in zip(positions, ids, strict=True):
                rows[position] = by_id[pk]
            for index, row in enumerate(rows):
                row.order = index
            model.objects.bulk_update(rows, ["order"])
            from domains.audit.models import AdminAuditLog

            AdminAuditLog.objects.create(
                actor=request.user, action="update", entity=model._meta.label, entity_id="reorder"
            )
        return Response({"ids": ids})


class AdminProjectViewSet(EditorialViewSet):
    queryset = PortfolioProject.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return project_listing(self.request.query_params, public=False)


class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = []
    serializer_class = ProjectSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return project_listing(self.request.query_params)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        data = self.get_serializer(obj).data
        data["related"] = self.get_serializer(
            self.get_queryset().filter(category=obj.category).exclude(pk=obj.pk)[:3], many=True
        ).data
        return Response(data)


class ContentView(APIView):
    authentication_classes = []

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        result = {}
        for key, model in (("heroes", HeroSection), ("stats", Stat), ("socials", SocialLink), ("blocks", PageBlock)):
            result[key] = model_serializer(model)(model.objects.filter(visible=True), many=True).data
        for key, singleton_model in (("settings", SiteSettings), ("profile", Profile)):
            obj = singleton_model.objects.first()
            result[key] = model_serializer(singleton_model)(obj).data if obj else None
        from domains.portfolio.models import PortfolioCategory

        result["categories"] = model_serializer(PortfolioCategory)(
            PortfolioCategory.objects.filter(visible=True), many=True
        ).data
        return Response(result)


class SkillsView(APIView):
    authentication_classes = []

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        return Response(
            model_serializer(Skill)(Skill.objects.filter(visible=True).select_related("category"), many=True).data
        )


class ResumeView(APIView):
    authentication_classes = []

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        result = {}
        for key, model in (
            ("experience", Experience),
            ("education", Education),
            ("certificates", Certificate),
            ("achievements", Achievement),
        ):
            result[key] = model_serializer(model)(model.objects.filter(visible=True), many=True).data
        result["files"] = ResumeFileSerializer(
            ResumeFile.objects.filter(visible=True).exclude(language="").select_related("asset"), many=True
        ).data
        return Response(result)


class ContactView(APIView):
    authentication_classes = []
    throttle_classes = [SharedRateThrottle]
    throttle_scope = "contact"

    @extend_schema(request=ContactSerializer, responses=ContactSerializer)
    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        increment_metric("contact", "contact")
        return Response({"id": instance.pk, "received": True}, status=201)


class MediaViewSet(EditorialViewSet):
    authentication_classes = [MediaUploadAuthentication]
    queryset = MediaAsset.objects.all()
    serializer_class = MediaSerializer

    def create(self, request, *args, **kwargs):
        from domains.media.cleanup import cleanup_expired_uploads

        if "file" not in request.FILES:
            raise ValidationError({"file": "Choose a file."})
        cleanup_expired_uploads()
        asset = upload_media(
            request.FILES["file"],
            alt=str(request.data.get("alt", ""))[:240],
            usage=str(request.data.get("usage", ""))[:120],
        )
        from domains.audit.models import AdminAuditLog

        AdminAuditLog.objects.create(
            actor=request.user, action="upload", entity="media.MediaAsset", entity_id=str(asset.pk)
        )
        return Response(self.get_serializer(asset).data, status=201)

    def perform_update(self, serializer):
        if "file" in self.request.data:
            raise ValidationError({"file": "Upload a new asset instead of replacing file contents."})
        super().perform_update(serializer)

    def perform_destroy(self, instance):
        from domains.media.cleanup import is_referenced

        if is_referenced(instance):
            raise ValidationError({"file": "This media is in use. Remove its references first."})
        super().perform_destroy(instance)


class UsersViewSet(EditorialViewSet):
    from domains.accounts.models import User

    queryset = User.objects.filter(is_staff=True).order_by("id")
    serializer_class = UserSerializer
    permission_classes = [OwnerPermission]

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError("You cannot delete your own account.")
        super().perform_destroy(instance)


class DashboardView(APIView):
    permission_classes = [EditorialPermission]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        data = dashboard_data()
        data["recent_messages"] = model_serializer(ContactMessage)(ContactMessage.objects.all()[:5], many=True).data
        data["recent_projects"] = ProjectSerializer(
            PortfolioProject.objects.select_related("category").order_by("-updated_at")[:5], many=True
        ).data
        return Response(data)


class AnalyticsSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(choices=["page", "project", "social"], default="page")
    page = serializers.CharField(max_length=160)
    token = serializers.RegexField(r"^[a-zA-Z0-9-]{16,64}$")

    def validate(self, attrs):
        kind, key = attrs["kind"], attrs["page"]
        valid = (
            key in ["/", "/about", "/portfolio", "/skills", "/resume", "/contact"]
            if kind == "page"
            else (
                PortfolioProject.objects.filter(
                    slug=key, status="published", visible=True, category__visible=True
                ).exists()
                if kind == "project"
                else SocialLink.objects.filter(platform=key, visible=True, verified=True).exists()
            )
        )
        if not valid:
            raise ValidationError({"page": "Unknown event target."})
        return attrs


class AnalyticsView(APIView):
    authentication_classes = []
    throttle_classes = [SharedRateThrottle]
    throttle_scope = "analytics"

    @extend_schema(request=AnalyticsSerializer, responses=dict)
    def post(self, request):
        from rest_framework.authentication import SessionAuthentication

        from domains.analytics.services import record_event

        SessionAuthentication().enforce_csrf(request)
        if request.headers.get("DNT") == "1" or request.headers.get("Sec-GPC") == "1":
            return Response({"recorded": False})
        serializer = AnalyticsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        recorded = record_event(data["kind"], data["page"], data["token"])
        return Response({"recorded": recorded}, status=201)


class AnalyticsReportView(APIView):
    permission_classes = [EditorialPermission]

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        from datetime import date, timedelta

        from django.utils import timezone

        from domains.analytics.services import report

        try:
            end = date.fromisoformat(request.query_params.get("end", str(timezone.localdate())))
            days = int(request.query_params.get("days", 30))
            start = date.fromisoformat(request.query_params.get("start", str(end - timedelta(days=days - 1))))
            if not 1 <= (end - start).days + 1 <= 366 or end > timezone.localdate():
                raise ValueError
        except (ValueError, OverflowError) as exc:
            raise ValidationError({"range": "Choose a date range of 1–366 days ending no later than today."}) from exc
        return Response(report(start, end))


@extend_schema(responses={(200, "application/pdf"): OpenApiTypes.BINARY})
class ResumeDownloadView(APIView):
    authentication_classes = []

    def get(self, request, language):
        from django.http import FileResponse

        resume = ResumeFile.objects.filter(language=language, visible=True).select_related("asset").first()
        if not resume or language not in ("fa", "en"):
            raise NotFound()
        if request.method == "GET" and request.headers.get("DNT") != "1" and request.headers.get("Sec-GPC") != "1":
            increment_metric("resume", language)
        response = FileResponse(
            resume.asset.file.open("rb"),
            as_attachment=True,
            filename=f"CTRLZ-Resume-{language.upper()}.pdf",
            content_type="application/pdf",
        )
        response["X-Content-Type-Options"] = "nosniff"
        response["Cache-Control"] = "private, no-store"
        return response


class HealthView(APIView):
    authentication_classes = []
    throttle_classes = []

    @extend_schema(responses=OpenApiTypes.OBJECT)
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            return Response({"database": "unavailable"}, status=503)
        return Response({"status": "ok", "database": "ok"})


@extend_schema(responses={(200, "application/octet-stream"): OpenApiTypes.BINARY})
class MediaDownloadView(APIView):
    """Stream public editorial assets; unlinked uploads remain staff-only."""

    def get(self, request, pk):
        import re
        from urllib.parse import quote

        from django.db.models import Q
        from django.http import FileResponse, StreamingHttpResponse

        asset = MediaAsset.objects.filter(pk=pk).first()
        if not asset:
            raise NotFound()
        staff = request.user.is_authenticated and request.user.is_staff
        if not staff:
            published = (
                Q(thumbnails__status="published", thumbnails__visible=True, thumbnails__category__visible=True)
                | Q(videos__status="published", videos__visible=True, videos__category__visible=True)
                | Q(
                    portfoliomedia__project__status="published",
                    portfoliomedia__project__visible=True,
                    portfoliomedia__visible=True,
                    portfoliomedia__project__category__visible=True,
                )
                | Q(resumefile__visible=True)
                | Q(education_images__visible=True)
                | Q(experience_images__visible=True)
                | Q(certificate_icons__visible=True)
                | Q(certificates__visible=True)
                | Q(pageblock_primary_images__visible=True)
                | Q(pageblock_secondary_images__visible=True)
                | Q(skill_icons__visible=True)
                | Q(skill_artworks__visible=True)
            )
            if not MediaAsset.objects.filter(pk=pk).filter(published).exists():
                raise NotFound()
        byte_range = request.headers.get("Range", "")
        if byte_range and asset.mime_type.startswith("video/"):
            match = re.fullmatch(r"bytes=(\d{0,20})-(\d{0,20})", byte_range)
            if match:
                first, last = match.groups()
                if first or last:
                    if first:
                        start = int(first)
                        end = min(int(last), asset.size - 1) if last else asset.size - 1
                    else:
                        start = max(asset.size - int(last), 0)
                        end = asset.size - 1
                    if 0 <= start <= end < asset.size:
                        file = asset.file.open("rb")
                        file.seek(start)

                        def chunks():
                            remaining = end - start + 1
                            try:
                                while remaining:
                                    chunk = file.read(min(64 * 1024, remaining))
                                    if not chunk:
                                        break
                                    remaining -= len(chunk)
                                    yield chunk
                            finally:
                                file.close()

                        response = StreamingHttpResponse(chunks(), status=206, content_type=asset.mime_type)
                        response["Content-Range"] = f"bytes {start}-{end}/{asset.size}"
                        response["Content-Length"] = str(end - start + 1)
                    else:
                        response = StreamingHttpResponse(status=416, content_type=asset.mime_type)
                        response["Content-Range"] = f"bytes */{asset.size}"
                else:
                    response = StreamingHttpResponse(status=416, content_type=asset.mime_type)
                    response["Content-Range"] = f"bytes */{asset.size}"
            else:
                response = StreamingHttpResponse(status=416, content_type=asset.mime_type)
                response["Content-Range"] = f"bytes */{asset.size}"
        else:
            response = FileResponse(asset.file.open("rb"), content_type=asset.mime_type)
        if asset.mime_type.startswith("video/"):
            response["Accept-Ranges"] = "bytes"
        response["X-Content-Type-Options"] = "nosniff"
        response["Content-Disposition"] = f"inline; filename*=UTF-8''{quote(asset.filename)}"
        return response
