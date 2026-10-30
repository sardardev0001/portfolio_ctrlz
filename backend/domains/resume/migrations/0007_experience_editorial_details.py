from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("resume", "0006_resumefile_language_and_more")]

    operations = [
        migrations.AddField(model_name="experience", name="employment_type", field=models.CharField(blank=True, choices=[("full_time", "Full time"), ("part_time", "Part time"), ("contract", "Contract"), ("project", "Project"), ("freelance", "Freelance"), ("internship", "Internship"), ("other", "Other")], max_length=16)),
        migrations.AddField(model_name="experience", name="workplace_type", field=models.CharField(blank=True, choices=[("onsite", "On site"), ("remote", "Remote"), ("hybrid", "Hybrid")], max_length=8)),
        migrations.AddField(model_name="experience", name="location", field=models.CharField(blank=True, max_length=160)),
        migrations.AddField(model_name="experience", name="start_date", field=models.DateField(blank=True, null=True)),
        migrations.AddField(model_name="experience", name="end_date", field=models.DateField(blank=True, null=True)),
        migrations.AddField(model_name="experience", name="responsibilities", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="experience", name="achievements", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="experience", name="projects", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="experience", name="technologies", field=models.JSONField(blank=True, default=list)),
        migrations.AddField(model_name="experience", name="links", field=models.JSONField(blank=True, default=list)),
    ]
