from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("site_content", "0002_pageblock")]

    operations = [
        migrations.AlterField(
            model_name="sociallink",
            name="url",
            field=models.CharField(blank=True, max_length=500),
        ),
    ]
