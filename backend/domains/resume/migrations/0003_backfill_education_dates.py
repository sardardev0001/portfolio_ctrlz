import re

from django.db import migrations


def backfill(apps, schema_editor):
    Education = apps.get_model("resume", "Education")
    for row in Education.objects.filter(start_year="", end_year="").exclude(years="").iterator():
        parts = re.split(r"\s*[—–-]\s*", row.years, maxsplit=1)
        if len(parts) != 2:
            continue
        start, end = (part.strip() for part in parts)
        if len(start) <= 16 and len(end) <= 16:
            row.start_year = start
            row.is_current = end == "اکنون"
            row.end_year = "" if row.is_current else end
            row.save(update_fields=["start_year", "end_year", "is_current"])


class Migration(migrations.Migration):
    dependencies = [("resume", "0002_education_accent_education_end_year_education_field_and_more")]
    operations = [migrations.RunPython(backfill, migrations.RunPython.noop)]
