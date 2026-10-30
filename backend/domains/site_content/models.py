from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.models import OrderedModel


class SiteSettings(models.Model):
    translations = models.JSONField(default=dict, blank=True)
    brand = models.CharField(max_length=80, default="CTRL.Z")
    tagline = models.CharField(max_length=120, default="EDITOR PORTFOLIO")
    description = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    site_url = models.URLField(default="http://localhost:3000")
    demo_mode = models.BooleanField(default=True)


class Profile(models.Model):
    translations = models.JSONField(default=dict, blank=True)
    name = models.CharField(max_length=100, default="CTRL.Z")
    role = models.CharField(max_length=120, default="Video Editor / Content Creator")
    location = models.CharField(max_length=100, blank=True)
    start_year = models.PositiveIntegerField(default=2023)
    specialization = models.CharField(max_length=160, blank=True)
    bio = models.TextField(blank=True)


class HeroSection(OrderedModel):
    page = models.SlugField(unique=True)
    title = models.CharField(max_length=160)
    highlight = models.CharField(max_length=80, blank=True)
    subtitle = models.CharField(max_length=240, blank=True)
    body = models.TextField(blank=True)
    artwork = models.CharField(max_length=500, blank=True)
    typewriter_enabled = models.BooleanField(default=True)
    typewriter_speed_ms = models.PositiveIntegerField(
        default=70, validators=[MinValueValidator(20), MaxValueValidator(500)]
    )
    typewriter_delete_ms = models.PositiveIntegerField(
        default=45, validators=[MinValueValidator(20), MaxValueValidator(500)]
    )
    typewriter_hold_ms = models.PositiveIntegerField(
        default=5000, validators=[MinValueValidator(0), MaxValueValidator(15000)]
    )


class Stat(OrderedModel):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=32)


class SocialLink(OrderedModel):
    platform = models.CharField(max_length=40)
    label = models.CharField(max_length=80)
    url = models.CharField(max_length=500, blank=True)
    handle = models.CharField(max_length=120, blank=True)
    description = models.CharField(max_length=180, blank=True)
    verified = models.BooleanField(default=False, help_text="Owner confirmed this is a real account")


class PageBlock(OrderedModel):
    key = models.SlugField(unique=True)
    title = models.CharField(max_length=160, blank=True)
    subtitle = models.CharField(max_length=240, blank=True)
    body = models.TextField(blank=True)
    image_asset = models.ForeignKey(
        "media.MediaAsset", on_delete=models.PROTECT, null=True, blank=True, related_name="pageblock_primary_images"
    )
    secondary_image_asset = models.ForeignKey(
        "media.MediaAsset", on_delete=models.PROTECT, null=True, blank=True, related_name="pageblock_secondary_images"
    )
    items = models.JSONField(default=list, blank=True)
