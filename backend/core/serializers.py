from urllib.parse import urlparse

from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from domains.accounts.models import User
from domains.contact.models import ContactMessage
from domains.media.models import MediaAsset
from domains.portfolio.models import PortfolioMedia, PortfolioProject
from domains.resume.models import Certificate, Education, Experience, ResumeFile
from domains.site_content.models import PageBlock, SiteSettings, SocialLink
from domains.site_content.social_links import SUPPORTED_SOCIALS, normalize_social
from domains.skills.models import Skill


class SafeModelSerializer(serializers.ModelSerializer):
    def validate_translations(self, value):
        allowed = {
            "title",
            "label",
            "description",
            "short_description",
            "body",
            "subtitle",
            "highlight",
            "name",
            "role",
            "location",
            "specialization",
            "bio",
            "tagline",
            "degree",
            "field",
            "institution",
            "company",
            "issuer",
            "image_alt",
            "caption",
            "level_label",
            "tags",
            "items",
            "client",
            "start",
            "end",
            "years",
            "value",
            "prefix",
            "suffix",
            "responsibilities",
            "achievements",
            "projects",
            "technologies",
        }
        if not isinstance(value, dict) or set(value) - {"fa", "en"}:
            raise serializers.ValidationError("Use fa/en locale objects.")
        for fields in value.values():
            if not isinstance(fields, dict) or set(fields) - allowed:
                raise serializers.ValidationError(
                    "Only editorial text can be translated; keep IDs, URLs and visibility unchanged."
                )
            for key, text in fields.items():
                if key in {"responsibilities", "achievements", "projects", "technologies"}:
                    if (
                        not isinstance(text, list)
                        or len(text) > 30
                        or any(not isinstance(item, str) or len(item) > 500 for item in text)
                    ):
                        raise serializers.ValidationError("Expected up to 30 translated short items.")
                elif key == "items":
                    if (
                        not isinstance(text, list)
                        or len(text) > 30
                        or any(
                            not isinstance(item, dict)
                            or set(item) - {"title", "text", "imageAlt"}
                            or any(not isinstance(part, str) or len(part) > 10000 for part in item.values())
                            for item in text
                        )
                    ):
                        raise serializers.ValidationError(
                            "Translated items contain only title/text/imageAlt, in original order."
                        )
                elif key == "tags":
                    if (
                        not isinstance(text, list)
                        or len(text) > 30
                        or any(not isinstance(tag, str) or len(tag) > 80 for tag in text)
                    ):
                        raise serializers.ValidationError("Expected short translated tags.")
                elif not isinstance(text, str) or len(text) > 20000:
                    raise serializers.ValidationError("Expected translated text up to 20000 characters.")
        return value

    def validate(self, attrs):
        for key in ("thumbnail", "artwork", "image", "icon_image"):
            value = attrs.get(key)
            if value and not (
                value.startswith("/assets/") or value.startswith("/uploads/") or urlparse(value).scheme == "https"
            ):
                raise serializers.ValidationError({key: "Use an asset path or HTTPS URL."})
        for key in ("image_asset", "secondary_image_asset", "icon_asset", "artwork_asset"):
            if attrs.get(key) and not attrs[key].mime_type.startswith("image/"):
                raise serializers.ValidationError({key: "Choose an image asset."})
        if self.Meta.model.__name__ == "PageBlock" and "items" in attrs:
            items = attrs["items"]
            if (
                not isinstance(items, list)
                or len(items) > 30
                or any(
                    not isinstance(item, dict)
                    or not isinstance(item.get("title"), str)
                    or len(item["title"]) > 160
                    or not isinstance(item.get("text", ""), str)
                    for item in items
                )
            ):
                raise serializers.ValidationError({"items": "Expected up to 30 cards with title and optional text."})
            for item in items:
                for key in ("image", "imageAlt", "icon", "accent"):
                    if key in item and (not isinstance(item[key], str) or len(item[key]) > 500):
                        raise serializers.ValidationError({"items": f"Invalid {key} in a page card."})
                image = item.get("image", "")
                if image and not (image.startswith("/assets/") or urlparse(image).scheme == "https"):
                    raise serializers.ValidationError({"items": "Card images require an asset path or HTTPS URL."})
            if attrs.get("key", getattr(self.instance, "key", "")) == "about-styles":
                from domains.portfolio.models import PortfolioCategory

                slugs = set(PortfolioCategory.objects.values_list("slug", flat=True))
                if any(item.get("category_slug") not in slugs for item in items):
                    raise serializers.ValidationError({"items": "Each editing style needs an existing category_slug."})
        for key in ("tools", "tags"):
            if key in attrs and (
                not isinstance(attrs[key], list)
                or len(attrs[key]) > 30
                or any(not isinstance(item, str) or len(item) > 80 for item in attrs[key])
            ):
                raise serializers.ValidationError({key: "Expected up to 30 short strings."})
        for key in ("url", "external_video_url", "site_url"):
            if attrs.get(key) and urlparse(attrs[key]).scheme not in ("https", "http"):
                raise serializers.ValidationError({key: "Only HTTP(S) URLs are allowed."})
        return attrs


def model_serializer(model):
    if model is PageBlock:
        return PageBlockSerializer
    if model is Experience:
        return ExperienceSerializer
    if model is Education:
        return EducationSerializer
    if model is Certificate:
        return CertificateSerializer
    if model is Skill:
        return SkillSerializer
    if model is SocialLink:
        return SocialLinkSerializer
    meta = type("Meta", (), {"model": model, "fields": "__all__", "read_only_fields": ("created_at", "updated_at")})
    return type(f"{model.__name__}Serializer", (SafeModelSerializer,), {"Meta": meta})


class PageBlockSerializer(SafeModelSerializer):
    image_url = serializers.SerializerMethodField()
    secondary_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PageBlock
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_image_url(self, obj) -> str:
        return f"/api/v1/media/{obj.image_asset_id}/" if obj.image_asset_id else ""

    def get_secondary_image_url(self, obj) -> str:
        return f"/api/v1/media/{obj.secondary_image_asset_id}/" if obj.secondary_image_asset_id else ""


class ExperienceSerializer(SafeModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_image_url(self, obj) -> str:
        return f"/api/v1/media/{obj.image_asset_id}/" if obj.image_asset_id else obj.image

    def validate(self, attrs):
        attrs = super().validate(attrs)
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        current = attrs.get("is_current", getattr(self.instance, "is_current", False))
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date cannot precede start date."})
        if current and end:
            raise serializers.ValidationError({"end_date": "Current work cannot have an end date."})
        for key in ("responsibilities", "achievements", "projects", "technologies"):
            values = attrs.get(key)
            if values is not None and (
                not isinstance(values, list)
                or len(values) > 30
                or any(not isinstance(item, str) or not item.strip() or len(item) > 500 for item in values)
            ):
                raise serializers.ValidationError({key: "Expected up to 30 non-empty short items."})
        links = attrs.get("links")
        if links is not None and (
            not isinstance(links, list)
            or len(links) > 20
            or any(
                not isinstance(item, dict)
                or set(item) != {"label", "url"}
                or not isinstance(item["label"], str)
                or len(item["label"]) > 120
                or not isinstance(item["url"], str)
                or urlparse(item["url"]).scheme != "https"
                or not urlparse(item["url"]).netloc
                for item in links
            )
        ):
            raise serializers.ValidationError({"links": "Use labeled HTTPS links."})
        return attrs


class CertificateSerializer(SafeModelSerializer):
    icon_url = serializers.SerializerMethodField()
    certificate_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_icon_url(self, obj) -> str:
        return f"/api/v1/media/{obj.icon_asset_id}/" if obj.icon_asset_id else ""

    def get_certificate_url(self, obj) -> str:
        return f"/api/v1/media/{obj.certificate_asset_id}/" if obj.certificate_asset_id else obj.url

    def validate_certificate_asset(self, value):
        if value is not None and value.mime_type != "application/pdf":
            raise serializers.ValidationError("A PDF certificate is required.")
        return value


class EducationSerializer(SafeModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_image_url(self, obj) -> str:
        return f"/api/v1/media/{obj.image_asset_id}/" if obj.image_asset_id else obj.image

    def validate(self, attrs):
        attrs = super().validate(attrs)
        current = attrs.get("is_current", getattr(self.instance, "is_current", False))
        start = attrs.get("start_year", getattr(self.instance, "start_year", ""))
        end = attrs.get("end_year", getattr(self.instance, "end_year", ""))
        if start and end and start.isdecimal() and end.isdecimal() and not current and int(end) < int(start):
            raise serializers.ValidationError({"end_year": "End year cannot precede start year."})
        return attrs


class SkillSerializer(SafeModelSerializer):
    icon_url = serializers.SerializerMethodField()
    artwork_url = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_icon_url(self, obj) -> str:
        return f"/api/v1/media/{obj.icon_asset_id}/" if obj.icon_asset_id else obj.icon_image

    def get_artwork_url(self, obj) -> str:
        return f"/api/v1/media/{obj.artwork_asset_id}/" if obj.artwork_asset_id else obj.artwork


class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = "__all__"
        read_only_fields = (
            "file",
            "filename",
            "mime_type",
            "size",
            "width",
            "height",
            "created_at",
            "duration_seconds",
            "video_validated",
        )

    def get_url(self, obj) -> str:
        return f"/api/v1/media/{obj.pk}/"


class GallerySerializer(SafeModelSerializer):
    def validate_asset(self, asset):
        if not asset.mime_type.startswith("image/"):
            raise serializers.ValidationError("Choose an image for the gallery.")
        return asset

    url = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioMedia
        fields = "__all__"

    def get_url(self, obj) -> str:
        return f"/api/v1/media/{obj.asset_id}/"


class ProjectSerializer(SafeModelSerializer):
    category_title = serializers.CharField(source="category.title", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    category_translations = serializers.JSONField(source="category.translations", read_only=True)
    poster_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    gallery = serializers.SerializerMethodField()

    @extend_schema_field(GallerySerializer(many=True))
    def get_gallery(self, obj):
        return GallerySerializer([item for item in obj.gallery.all() if item.visible], many=True).data

    class Meta:
        model = PortfolioProject
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def get_poster_url(self, obj) -> str:
        return (
            f"/api/v1/media/{obj.thumbnail_asset_id}/"
            if obj.thumbnail_asset
            else obj.thumbnail or "/assets/backgrounds/city-background.webp"
        )

    def get_video_url(self, obj) -> str:
        return f"/api/v1/media/{obj.video_asset_id}/" if obj.video_asset else obj.external_video_url

    def validate(self, attrs):
        attrs = super().validate(attrs)
        for key, prefix in (("thumbnail_asset", "image/"), ("video_asset", "video/")):
            if attrs.get(key) and not attrs[key].mime_type.startswith(prefix):
                raise serializers.ValidationError({key: "Incorrect media type."})
        asset = attrs.get("video_asset", getattr(self.instance, "video_asset", None))
        publishing = bool(self.instance and self.instance.status != "published" and attrs.get("status") == "published")
        if asset and (not self.instance or asset.pk != self.instance.video_asset_id or publishing):
            from domains.media.validation import MediaValidationError, validate_video_limits

            if not asset.video_validated or asset.duration_seconds is None:
                raise MediaValidationError("VIDEO_UNVERIFIED", field="video_asset")
            validate_video_limits(asset.size, asset.duration_seconds)
        return attrs


class ContactSerializer(serializers.ModelSerializer):
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "website", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate(self, attrs):
        if attrs.pop("website", ""):
            raise serializers.ValidationError({"website": "Submission rejected."})
        for field in ("name", "subject", "message"):
            attrs[field] = attrs[field].strip()
            if len(attrs[field]) < (10 if field == "message" else 3 if field == "subject" else 2):
                raise serializers.ValidationError({field: "Please enter more detail."})
        return attrs


class SocialLinkSerializer(SafeModelSerializer):
    display_value = serializers.SerializerMethodField()
    href = serializers.SerializerMethodField()

    class Meta:
        model = SocialLink
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def _public_destination(self, obj):
        if obj.platform not in SUPPORTED_SOCIALS:
            return obj.handle, obj.url
        try:
            value = obj.url
            if obj.platform == "email":
                settings = SiteSettings.objects.first() if not obj.handle else None
                value = obj.handle or (settings.email if settings else "")
            return normalize_social(obj.platform, value, obj.handle)
        except ValueError:
            return "", ""

    def get_display_value(self, obj) -> str:
        return self._public_destination(obj)[0]

    def get_href(self, obj) -> str:
        return self._public_destination(obj)[1]

    def validate(self, attrs):
        platform = attrs.get("platform", getattr(self.instance, "platform", ""))
        if platform not in SUPPORTED_SOCIALS:
            return super().validate(attrs)
        current_handle = getattr(self.instance, "handle", "")
        current_url = getattr(self.instance, "url", "")
        handle = attrs.get("handle", current_handle).strip()
        url = attrs.get("url", current_url).strip()
        if platform == "email":
            try:
                attrs["handle"], _ = normalize_social("email", handle)
            except ValueError as exc:
                raise serializers.ValidationError({"handle": str(exc)}) from exc
            attrs["url"] = ""
            return super().validate(attrs)
        handle_changed = handle != current_handle
        url_changed = url != current_url
        source = handle if handle_changed and not url_changed else url or handle
        if platform == "youtube" and not url_changed and urlparse(url).path.startswith(("/channel/", "/c/", "/user/")):
            source = url
        try:
            attrs["handle"], attrs["url"] = normalize_social(platform, source, handle)
        except ValueError as exc:
            raise serializers.ValidationError({"url": str(exc)}) from exc
        return super().validate(attrs)


class ResumeFileSerializer(SafeModelSerializer):
    url = serializers.SerializerMethodField()
    filename = serializers.CharField(source="asset.filename", read_only=True)
    size = serializers.IntegerField(source="asset.size", read_only=True)

    class Meta:
        model = ResumeFile
        fields = "__all__"

    def get_url(self, obj) -> str:
        return f"/api/v1/resume/{obj.language}/download/" if obj.language else f"/api/v1/media/{obj.asset_id}/"

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if not attrs.get("language", getattr(self.instance, "language", "")):
            raise serializers.ValidationError({"language": "Choose fa or en for this resume."})
        return attrs

    def validate_asset(self, value):
        if value.mime_type != "application/pdf":
            raise serializers.ValidationError("A PDF is required.")
        return value


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "role", "is_active", "password"]

    def validate_password(self, value):
        validate_password(value, self.instance)
        return value

    def validate(self, attrs):
        if not self.instance and not attrs.get("password"):
            raise serializers.ValidationError({"password": "A password is required."})
        actor = self.context["request"].user
        if (
            self.instance
            and self.instance.pk == actor.pk
            and (attrs.get("is_active") is False or attrs.get("role", actor.role) != actor.role)
        ):
            raise serializers.ValidationError("You cannot deactivate or demote yourself.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, is_staff=True, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])
        return instance
