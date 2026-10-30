from django.db import models


class DailyMetric(models.Model):
    date = models.DateField()
    kind = models.CharField(
        max_length=20,
        choices=[
            ("page", "Page"),
            ("project", "Project"),
            ("contact", "Contact"),
            ("resume", "Resume download"),
            ("social", "Social click"),
        ],
    )
    key = models.CharField(max_length=160)
    count = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["date", "kind", "key"], name="unique_daily_metric")]
        ordering = ["-date"]
