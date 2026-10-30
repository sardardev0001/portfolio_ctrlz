import uuid
from pathlib import Path

from django.db import models


def asset_path(instance, filename):
    return f"assets/{uuid.uuid4().hex}{Path(filename).suffix.lower()}"


class MediaAsset(models.Model):
    file = models.FileField(upload_to=asset_path)
    filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=80)
    size = models.PositiveBigIntegerField()
    duration_seconds = models.FloatField(null=True, blank=True)
    video_validated = models.BooleanField(default=False)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    alt = models.CharField(max_length=240, blank=True)
    usage = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
