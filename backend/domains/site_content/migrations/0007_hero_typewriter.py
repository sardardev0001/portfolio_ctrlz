from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("site_content", "0006_style_category_links")]
    operations = [
        migrations.AddField(model_name="herosection", name="typewriter_enabled", field=models.BooleanField(default=True)),
        migrations.AddField(model_name="herosection", name="typewriter_speed_ms", field=models.PositiveIntegerField(default=70, validators=[MinValueValidator(20), MaxValueValidator(500)])),
        migrations.AddField(model_name="herosection", name="typewriter_delete_ms", field=models.PositiveIntegerField(default=45, validators=[MinValueValidator(20), MaxValueValidator(500)])),
        migrations.AddField(model_name="herosection", name="typewriter_hold_ms", field=models.PositiveIntegerField(default=5000, validators=[MinValueValidator(0), MaxValueValidator(15000)])),
    ]
