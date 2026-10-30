from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from domains.analytics.models import DailyMetric
from domains.audit.models import AdminAuditLog


class EditorialService:
    @staticmethod
    @transaction.atomic
    def save(serializer, actor):
        creating = serializer.instance is None
        previous = None
        if serializer.instance:
            previous = getattr(serializer.instance, "video_asset_id", None) or (
                getattr(serializer.instance, "asset_id", None)
                if serializer.instance._meta.label == "resume.ResumeFile"
                else None
            )
        instance = serializer.save()
        if previous and previous != (getattr(instance, "video_asset_id", None) or getattr(instance, "asset_id", None)):
            from domains.media.cleanup import cleanup_managed_asset

            transaction.on_commit(lambda: cleanup_managed_asset(previous), robust=True)
        AdminAuditLog.objects.create(
            actor=actor,
            action="create" if creating else "update",
            entity=instance._meta.label,
            entity_id=str(instance.pk),
        )
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance, actor):
        from django.db.models.deletion import ProtectedError

        label, pk = instance._meta.label, instance.pk
        previous = getattr(instance, "video_asset_id", None) or (
            getattr(instance, "asset_id", None) if label == "resume.ResumeFile" else None
        )
        file = instance.file if label == "media.MediaAsset" else None
        try:
            instance.delete()
        except ProtectedError as exc:
            raise ValidationError({"resource": "This record is in use. Remove references first."}) from exc
        if file:
            transaction.on_commit(lambda: file.delete(save=False), robust=True)
        if previous:
            from domains.media.cleanup import cleanup_managed_asset

            transaction.on_commit(lambda: cleanup_managed_asset(previous), robust=True)
        AdminAuditLog.objects.create(actor=actor, action="delete", entity=label, entity_id=str(pk))


def increment_metric(kind, key):
    metric, _ = DailyMetric.objects.get_or_create(date=timezone.localdate(), kind=kind, key=key)
    DailyMetric.objects.filter(pk=metric.pk).update(count=F("count") + 1)
