from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.models import OrderedModel


class PortfolioCategory(OrderedModel):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)


class PortfolioProject(OrderedModel):
    title = models.CharField(max_length=160)
    slug = models.SlugField(unique=True)
    short_description = models.CharField(max_length=240, blank=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(PortfolioCategory, on_delete=models.PROTECT, related_name="projects")
    thumbnail = models.CharField(max_length=500, blank=True)
    thumbnail_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.SET_NULL, related_name="thumbnails"
    )
    video_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.SET_NULL, related_name="videos"
    )
    external_video_url = models.URLField(max_length=500, blank=True)
    duration = models.CharField(max_length=20, blank=True)
    client = models.CharField(max_length=120, blank=True)
    year = models.PositiveIntegerField(default=2026, validators=[MinValueValidator(1900), MaxValueValidator(2100)])
    tools = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=12, choices=[("draft", "Draft"), ("published", "Published")], default="draft")


class PortfolioMedia(OrderedModel):
    project = models.ForeignKey(PortfolioProject, on_delete=models.CASCADE, related_name="gallery")
    asset = models.ForeignKey("media.MediaAsset", on_delete=models.PROTECT)
    caption = models.CharField(max_length=240, blank=True)
