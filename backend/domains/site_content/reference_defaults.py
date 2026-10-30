"""Add reference content without replacing editorial changes or user-owned assets."""

from typing import Any

from domains.resume.models import Education
from domains.site_content.models import PageBlock, SocialLink
from domains.skills.models import Skill


def seed_reference_defaults():
    blocks: dict[str, dict[str, Any]] = {
        "about-story": {
            "title": "روایت من",
            "body": "هر فریم\nیک داستان است...",
            "items": [{"title": "اتاق تدوین", "image": "/assets/decor/about-film-frame.webp"}],
        },
        "about-tools": {
            "title": "ابزارهای اصلی من",
            "body": "ویرایش فقط برش نیست...\nساختن یک احساس است.",
            "items": [],
        },
        "skills-story": {
            "title": "ابزار در خدمت داستان",
            "body": "هر مهارتی،\nیک ابزار برای روایت بهتر است...",
            "items": [{"title": "ایستگاه تدوین", "image": "/assets/components/skills-workstation.webp"}],
        },
        "skills-mastery": {
            "title": "تسلط بر نرم‌افزارها",
            "body": "ابزارهایی که ایده‌ها را به واقعیت تبدیل می‌کنند.",
            "items": [],
        },
        "skills-creative": {
            "title": "مهارت‌های تخصصی و خلاقانه",
            "body": "فراتر از نرم‌افزارها، مهارت‌هایی که به محتوا روح می‌دهند.",
            "items": [],
        },
        "contact-form": {
            "title": "ارسال پیام",
            "body": "فرم زیر را تکمیل کنید تا با شما در ارتباط باشم.",
            "items": [],
        },
    }
    for key, defaults in blocks.items():
        PageBlock.objects.get_or_create(key=key, defaults=defaults)
    social_descriptions = {
        "email": "ارسال درخواست همکاری و پروژه",
        "telegram": "پیام مستقیم و همکاری سریع",
        "instagram": "مشاهده آثار و ارتباط روزانه",
        "youtube": "ویدیوها و پشت صحنه‌ها",
    }
    for platform, description in social_descriptions.items():
        SocialLink.objects.filter(platform=platform, description="لینک نمایشی — از پنل مدیریت جایگزین کنید").update(
            description=description
        )
    feature = PageBlock.objects.filter(key="about-cards").first()
    if feature:
        changed = False
        for item, icon, accent in zip(
            feature.items, ["experience", "interests", "goal"], ["blue", "red", "gold"], strict=False
        ):
            if "icon" not in item:
                item["icon"] = icon
                changed = True
            if "accent" not in item:
                item["accent"] = accent
                changed = True
        if changed:
            feature.save(update_fields=["items"])
    styles = PageBlock.objects.filter(key="about-styles").first()
    if styles:
        from domains.portfolio.models import PortfolioCategory

        mapping = {
            "تدوین سینمایی": "cinematic",
            "تیزر و تبلیغات": "advertising",
            "ادیت انیمه": "anime",
            "محتوای ورزشی": "sports",
            "ولاگ و ویدیوهای روزمره": "vlog",
        }
        if any(item.get("title") == "ادیت انیمه" for item in styles.items):
            PortfolioCategory.objects.get_or_create(slug="anime", defaults={"title": "ادیت انیمه", "order": 5})
        for item in styles.items:
            if item.get("title") in mapping:
                item.setdefault("category_slug", mapping[item["title"]])
        captions = [
            "خلق حس و روایت قوی",
            "جذب مخاطب در چند ثانیه",
            "احساس و هیجان در هر فریم",
            "انرژی و هیجان بیشتر",
            "ساده، جذاب و داستانی",
        ]
        changed = False
        images = [
            "/assets/components/cinematic-face.webp",
            "/assets/components/grading-blue.webp",
            "/assets/portfolio/project-06.webp",
            "/assets/portfolio/project-04.webp",
            "/assets/components/grading-sunset.webp",
        ]
        for i, item in enumerate(styles.items):
            previous_default = f"/assets/portfolio/project-{i + 1:02}.webp"
            if "image" not in item or (
                item.get("image") == previous_default and item.get("text") == captions[i % len(captions)]
            ):
                item["image"] = images[i % len(images)]
                changed = True
            if "text" not in item:
                item["text"] = captions[i % len(captions)]
                changed = True
        styles.save(update_fields=["items"])
    software = [
        ("Pr", "purple", "تدوین حرفه‌ای و مونتاژ خلاقانه"),
        ("Ae", "purple", "موشن گرافیک و جلوه‌های بصری"),
        ("Ps", "blue", "طراحی کاور، تامبنیل و ادیت‌های گرافیکی"),
        ("Da", "cyan", "رنگ، اصلاح رنگ و گریدینگ سینمایی"),
        ("Ai", "orange", "طراحی عناصر بصری و آیکون‌ها"),
        ("Bl", "purple", "مدل‌سازی سه‌بعدی و المان‌های سه‌بعدی"),
    ]
    for icon, accent, description in software:
        Skill.objects.filter(icon=icon, kind="software", description="ابزار خلاقیت در جریان تولید ویدیو").update(
            accent=accent, description=description
        )
    specialties = [
        (
            "اصلاح رنگ و گریدینگ",
            "gold",
            "grading-workstation",
            "ایجاد حال و هوای سینمایی با رنگ و نور",
            "color-grading",
        ),
        ("داستان‌گویی بصری", "red", "grading-sunset", "تبدیل ایده‌ها به روایت جذاب و تأثیرگذار", "standard"),
        ("موشن گرافیک", "blue", "cinematic-editor", "طراحی موشن‌های خلاقانه و تایپوگرافی متحرک", "standard"),
        ("تدوین شبکه‌های اجتماعی", "purple", "social-workstation", "ساخت محتوا برای پلتفرم‌های مختلف", "standard"),
        ("طراحی صدا و افکت", "cyan", "sound-wave", "افزودن عمق احساسی با صدا و افکت‌های حرفه‌ای", "standard"),
        ("ریتم و ضرباهنگ", "orange", "sports-editor", "ایجاد ریتم پویا برای جذب بیشتر مخاطب", "standard"),
        ("تدوین سینمایی", "blue", "grading-blue", "ترکیب احساس، تکنیک و زیبایی بصری", "standard"),
    ]
    for title, accent, image, description, variant in specialties:
        Skill.objects.filter(
            title=title, kind="creative", description="ترکیب تکنیک و خلاقیت برای ساختن تصویری که در ذهن می‌ماند."
        ).update(accent=accent, artwork=f"/assets/components/{image}.webp", description=description, variant=variant)
        if image == "sound-wave":
            Skill.objects.filter(
                title=title, kind="creative", icon="", artwork=f"/assets/components/{image}.webp"
            ).update(icon="sound")
    Education.objects.filter(
        degree="مطالعهٔ مستقل هنر و رسانه", institution="یادگیری مداوم · دادهٔ نمایشی", image="", image_asset=None
    ).update(image="/assets/components/university.webp", image_alt="تصویر نمایشی محیط دانشگاه؛ سابقهٔ واقعی نیست")
