from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from domains.media.models import MediaAsset


def is_referenced(asset):
    return any(getattr(asset, relation.get_accessor_name()).exists() for relation in asset._meta.related_objects)


def cleanup_managed_asset(pk):
    asset = MediaAsset.objects.filter(pk=pk, usage__in=["managed-project-video", "managed-resume"]).first()
    if asset and not is_referenced(asset):
        file = asset.file
        asset.delete()
        transaction.on_commit(lambda: file.delete(save=False), robust=True)


def cleanup_expired_uploads(limit=100):
    candidates = MediaAsset.objects.filter(
        usage__in=["managed-project-video", "managed-resume"],
        created_at__lt=timezone.now() - timedelta(hours=24),
    )
    for relation in MediaAsset._meta.related_objects:
        candidates = candidates.filter(**{f"{relation.name}__isnull": True})
    ids = list(candidates.order_by("created_at").values_list("pk", flat=True)[:limit])
    for pk in ids:
        cleanup_managed_asset(pk)
