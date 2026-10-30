from django.core.validators import MaxValueValidator
from django.db import models

from core.models import OrderedModel


class SkillCategory(OrderedModel):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)


class Skill(OrderedModel):
    title = models.CharField(max_length=120)
    category = models.ForeignKey(SkillCategory, null=True, blank=True, on_delete=models.SET_NULL)
    kind = models.CharField(
        max_length=12, choices=[("software", "Software"), ("creative", "Creative")], default="software"
    )
    level = models.PositiveIntegerField(default=80, validators=[MaxValueValidator(100)])
    level_label = models.CharField(max_length=40, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=12, blank=True)
    artwork = models.CharField(max_length=500, blank=True)
    icon_image = models.CharField(max_length=500, blank=True)
    icon_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.PROTECT, related_name="skill_icons"
    )
    artwork_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.PROTECT, related_name="skill_artworks"
    )
    accent = models.CharField(
        max_length=12,
        default="blue",
        choices=[
            ("blue", "Blue"),
            ("cyan", "Cyan"),
            ("gold", "Gold"),
            ("red", "Red"),
            ("purple", "Purple"),
            ("orange", "Orange"),
        ],
    )
    variant = models.CharField(
        max_length=24, default="standard", choices=[("standard", "Standard"), ("color-grading", "Color grading")]
    )
