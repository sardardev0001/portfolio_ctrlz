from django.db import models

from core.models import OrderedModel


class Experience(OrderedModel):
    EMPLOYMENT_TYPES = [
        ("full_time", "Full time"),
        ("part_time", "Part time"),
        ("contract", "Contract"),
        ("project", "Project"),
        ("freelance", "Freelance"),
        ("internship", "Internship"),
        ("other", "Other"),
    ]
    WORKPLACE_TYPES = [("onsite", "On site"), ("remote", "Remote"), ("hybrid", "Hybrid")]
    title = models.CharField(max_length=160)
    company = models.CharField(max_length=160, blank=True)
    employment_type = models.CharField(max_length=16, choices=EMPLOYMENT_TYPES, blank=True)
    workplace_type = models.CharField(max_length=8, choices=WORKPLACE_TYPES, blank=True)
    location = models.CharField(max_length=160, blank=True)
    start = models.CharField(max_length=32)
    end = models.CharField(max_length=32, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    responsibilities = models.JSONField(default=list, blank=True)
    achievements = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    technologies = models.JSONField(default=list, blank=True)
    links = models.JSONField(default=list, blank=True)
    image = models.CharField(max_length=500, blank=True)
    image_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.PROTECT, related_name="experience_images"
    )
    image_alt = models.CharField(max_length=200, blank=True)
    is_current = models.BooleanField(default=False)
    accent = models.CharField(
        max_length=12, default="blue", choices=[("blue", "Blue"), ("cyan", "Cyan"), ("red", "Red"), ("gold", "Gold")]
    )


class Education(OrderedModel):
    degree = models.CharField(max_length=160)
    field = models.CharField(max_length=160, blank=True)
    institution = models.CharField(max_length=160)
    years = models.CharField(max_length=40, blank=True)
    start_year = models.CharField(max_length=16, blank=True)
    end_year = models.CharField(max_length=16, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)
    image_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.PROTECT, related_name="education_images"
    )
    image_alt = models.CharField(max_length=200, blank=True)
    accent = models.CharField(
        max_length=12, default="red", choices=[("red", "Red"), ("blue", "Blue"), ("gold", "Gold")]
    )


class Certificate(OrderedModel):
    title = models.CharField(max_length=160)
    issuer = models.CharField(max_length=160, blank=True)
    year = models.CharField(max_length=32, blank=True)
    url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=24, blank=True)
    icon_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.PROTECT, related_name="certificate_icons"
    )
    certificate_asset = models.ForeignKey(
        "media.MediaAsset", null=True, blank=True, on_delete=models.PROTECT, related_name="certificates"
    )
    verification_url = models.URLField(blank=True)


class Achievement(OrderedModel):
    title = models.CharField(max_length=160)
    value = models.CharField(max_length=40)
    description = models.TextField(blank=True)
    numeric_value = models.PositiveBigIntegerField(null=True, blank=True)
    prefix = models.CharField(max_length=12, blank=True)
    suffix = models.CharField(max_length=12, blank=True)
    icon = models.CharField(max_length=24, blank=True)


class ResumeFile(OrderedModel):
    language = models.CharField(max_length=2, blank=True, choices=[("fa", "Persian"), ("en", "English")])
    title = models.CharField(max_length=160, default="رزومه CTRL.Z")
    asset = models.ForeignKey("media.MediaAsset", on_delete=models.PROTECT)

    class Meta(OrderedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["language"], condition=~models.Q(language=""), name="one_resume_per_language"
            )
        ]
