from django.db import migrations


def link_styles(apps, schema_editor):
    Block = apps.get_model("site_content", "PageBlock")
    Category = apps.get_model("portfolio", "PortfolioCategory")
    block = Block.objects.filter(key="about-styles").first()
    if not block:
        return
    mapping = {
        "تدوین سینمایی": "cinematic", "تیزر و تبلیغات": "advertising",
        "ادیت انیمه": "anime", "محتوای ورزشی": "sports", "ولاگ و ویدیوهای روزمره": "vlog",
    }
    # An existing style deserves an honest empty category, never fabricated work.
    if any(item.get("title") == "ادیت انیمه" for item in block.items):
        Category.objects.get_or_create(slug="anime", defaults={"title": "ادیت انیمه", "order": 5})
    changed = False
    for item in block.items:
        slug = mapping.get(item.get("title"))
        if slug and "category_slug" not in item:
            item["category_slug"] = slug
            changed = True
    if changed:
        block.save(update_fields=["items"])


class Migration(migrations.Migration):
    dependencies = [
        ("site_content", "0005_herosection_translations_pageblock_translations_and_more"),
        ("portfolio", "0002_portfoliocategory_translations_and_more"),
    ]
    operations = [migrations.RunPython(link_styles, migrations.RunPython.noop)]
