from django.core.validators import MinValueValidator
from django.db import models


class OrderedModel(models.Model):
    translations = models.JSONField(
        default=dict, blank=True, help_text='Locale overrides, e.g. {"en": {"title": "Title"}}'
    )
    order = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["order", "id"]
