from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):
    dependencies = [("contact", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="contactmessage",
            name="updated_at",
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
    ]
