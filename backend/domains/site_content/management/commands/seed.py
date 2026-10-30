import os
import secrets

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from domains.accounts.models import User
from domains.media.models import MediaAsset
from domains.media.services import upload_media
from domains.portfolio.models import PortfolioCategory, PortfolioProject
from domains.resume.models import Achievement, Certificate, Education, Experience, ResumeFile
from domains.site_content.models import HeroSection, PageBlock, Profile, SiteSettings, SocialLink, Stat
from domains.site_content.reference_defaults import seed_reference_defaults
from domains.skills.models import Skill, SkillCategory


class Command(BaseCommand):
    help = "Create idempotent illustrative portfolio content and an owner account. Never overwrites editorial changes."

    @transaction.atomic
    def handle(self, *args, **options):
        username = os.getenv("SEED_ADMIN_USERNAME", "ctrlz-admin")
        if not User.objects.filter(username=username).exists():
            password = os.getenv("SEED_ADMIN_PASSWORD") or secrets.token_urlsafe(20)
            try:
                validate_password(password)
            except Exception as exc:
                raise CommandError("SEED_ADMIN_PASSWORD does not meet password policy") from exc
            User.objects.create_user(
                username=username, password=password, is_staff=True, is_superuser=True, role="owner"
            )
            if not os.getenv("SEED_ADMIN_PASSWORD"):
                self.stdout.write("Initial password was not logged. Set it securely with manage.py changepassword.")
            self.stdout.write(f"Admin username: {username}")
        SiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                "description": "پورتفولیوی تدوین، رنگ و داستان‌گویی بصری CTRL.Z",
                "email": "hello@example.com",
                "demo_mode": True,
            },
        )
        Profile.objects.get_or_create(
            pk=1,
            defaults={
                "location": "ایران · همکاری از راه دور",
                "specialization": "تدوین سینمایی و محتوای دیجیتال",
                "bio": (
                    "من CTRL.Z هستم؛ تدوینگر و روایت‌گر تصویر. برای من تدوین کنار هم چیدن فریم‌ها نیست؛ "
                    "پیدا کردن داستانی است که ارزش دیده شدن دارد. از اولین کات تا آخرین اصلاح رنگ، "
                    "جزئیات را با دقت و انرژی دنبال می‌کنم."
                ),
            },
        )
        heroes = [
            (
                "home",
                "ادیت فراتر از یک کات ساده",
                "فراتر",
                "CUT. COLOR. STORY.",
                "من CTRL.Z هستم، تدوینگر و ادیتور محتوای ویدیویی. سازندهٔ ادیت‌های سینمایی، "
                "تیزرها، ریلزها و روایت‌هایی که به برندها هویت بصری می‌دهند.",
            ),
            (
                "about",
                "درباره من",
                "من",
                "روایت من از دنیای تدوین و داستان‌ها",
                "هر فریم یک داستان است. من با ریتم، رنگ و صدا به آن جان می‌دهم؛ "
                "از ایده‌ای کوچک تا تصویری که در ذهن می‌ماند.",
            ),
            (
                "portfolio",
                "نمونه‌کارها",
                "نمونه",
                "هر ادیت، یک داستان جدید...",
                "مجموعه‌ای از پروژه‌های سینمایی، تبلیغاتی، موشن گرافیک، محتوای ورزشی و ویدیوهای یوتیوب. "
                "هر پروژه با دقت، خلاقیت و داستان خودش ساخته می‌شود.",
            ),
            (
                "skills",
                "مهارت‌های من",
                "مهارت",
                "ترکیب خلاقیت، تکنیک و داستان‌گویی در هر فریم",
                "از کات‌های دقیق و رنگ‌های سینمایی تا موشن و طراحی صدا؛ ابزارها در خدمت داستان‌اند.",
            ),
            (
                "resume",
                "رزومه",
                "رزومه",
                "مسیر رشد، تجربه‌ها و دستاوردها",
                "مسیر من از یک علاقه آغاز شد و با یادگیری، تجربه و همکاری‌های خلاق ادامه پیدا کرد.",
            ),
            (
                "contact",
                "تماس با من",
                "با من",
                "برای همکاری، سفارش پروژه یا گفتگو",
                "اگر ایده‌ای در ذهن دارید یا برای تدوین پروژه‌تان به همراهی نیاز دارید، خوشحال می‌شوم گفتگو کنیم. "
                "فرم را تکمیل کنید تا در ارتباط باشیم.",
            ),
        ]
        for i, (page, title, highlight, subtitle, body) in enumerate(heroes):
            HeroSection.objects.get_or_create(
                page=page,
                defaults={"title": title, "highlight": highlight, "subtitle": subtitle, "body": body, "order": i},
            )
        for i, (value, label) in enumerate(
            [("100+", "پروژه انجام‌شده"), ("50+", "همکاری خلاق"), ("3+", "سال تجربه"), ("∞", "علاقه به یادگیری")]
        ):
            Stat.objects.get_or_create(label=label, defaults={"value": value, "order": i})
        cats = []
        for i, (title, slug) in enumerate(
            [
                ("ادیت سینمایی", "cinematic"),
                ("ادیت تبلیغاتی", "advertising"),
                ("موشن گرافیک", "motion"),
                ("محتوای ورزشی", "sports"),
                ("ولاگ و یوتیوب", "vlog"),
            ]
        ):
            cat, _ = PortfolioCategory.objects.get_or_create(slug=slug, defaults={"title": title, "order": i})
            cats.append(cat)
        titles = [
            "سفر قهرمان",
            "فراتر از یک انتخاب",
            "معرفی برند",
            "روح بازی",
            "زندگی در مسیر",
            "سایه‌های درون",
            "قدرت در جزئیات",
            "شبکه‌های اجتماعی",
            "بدون محدودیت",
            "جاده‌های ناشناخته",
        ]
        durations = ["02:18", "01:05", "00:45", "01:32", "03:27", "02:50", "00:58", "01:20", "01:15", "04:12"]
        descriptions = [
            "روایتی احساسی با فضاسازی سینمایی",
            "تیزر محصول با انرژی و ریتم جسورانه",
            "موشن خلاق برای هویت یک برند",
            "لحظه‌های ماندگار یک بازی",
            "روایت سفر از زاویه‌ای تازه",
        ]
        demo_video = None
        video_path = settings.BASE_DIR / "seed_assets" / "demo-preview-30.webm"
        if video_path.exists():
            demo_video = MediaAsset.objects.filter(filename="demo-preview-30.webm").first()
            if demo_video is None:
                demo_video = upload_media(
                    SimpleUploadedFile("demo-preview-30.webm", video_path.read_bytes(), content_type="video/webm"),
                    alt="ویدیوی نمایشی امکانات پخش — نمونه‌کار واقعی نیست",
                    usage="video-demo",
                )
        for i, title in enumerate(titles):
            project, _ = PortfolioProject.objects.get_or_create(
                slug=f"project-{i + 1:02}",
                defaults={
                    "title": title,
                    "category": cats[i % 5],
                    "thumbnail": f"/assets/portfolio/project-{i + 1:02}.webp",
                    "video_asset": demo_video if i == 0 else None,
                    "duration": durations[i],
                    "short_description": descriptions[i % 5],
                    "description": (
                        "این پروژه، محتوای نمایشی اولیه برای معرفی امکانات سایت است. "
                        "با ریتم، اصلاح رنگ و طراحی صدا، روایت تصویری منسجمی شکل می‌گیرد. "
                        "ویدیو و جزئیات واقعی را از پنل مدیریت جایگزین کنید."
                    ),
                    "client": "پروژهٔ نمایشی",
                    "year": 2026,
                    "tools": ["Premiere Pro", "After Effects"],
                    "tags": ["تدوین", "نمایشی"],
                    "featured": i < 3,
                    "order": i,
                    "status": "published",
                },
            )
            reference_descriptions = {
                "سفر قهرمان": "یک ادیت سینمایی با روایت احساسی و فضاسازی حرفه‌ای",
                "فراتر از یک انتخاب": "تیزر تبلیغاتی محصول ورزشی با ادیت حرفه‌ای",
                "معرفی برند": "موشن گرافیک مدرن با ترکیب المان‌های سه‌بعدی",
                "روح بازی": "میکس احساسی از لحظات ماندگار فوتبال",
            }
            if title in reference_descriptions and project.short_description == descriptions[i % 5]:
                project.short_description = reference_descriptions[title]
                project.save(update_fields=["short_description"])
        sc, _ = SkillCategory.objects.get_or_create(slug="editing", defaults={"title": "تدوین و طراحی"})
        for i, (title, level, icon) in enumerate(
            [
                ("Premiere Pro", 95, "Pr"),
                ("After Effects", 90, "Ae"),
                ("Photoshop", 80, "Ps"),
                ("DaVinci Resolve", 85, "Da"),
                ("Illustrator", 70, "Ai"),
                ("Blender", 60, "Bl"),
            ]
        ):
            Skill.objects.get_or_create(
                title=title,
                defaults={
                    "level": level,
                    "icon": icon,
                    "category": sc,
                    "order": i,
                    "description": "ابزار خلاقیت در جریان تولید ویدیو",
                },
            )
        for i, title in enumerate(
            [
                "اصلاح رنگ و گریدینگ",
                "داستان‌گویی بصری",
                "موشن گرافیک",
                "تدوین شبکه‌های اجتماعی",
                "طراحی صدا و افکت",
                "ریتم و ضرباهنگ",
                "تدوین سینمایی",
            ]
        ):
            Skill.objects.get_or_create(
                title=title,
                defaults={
                    "kind": "creative",
                    "level": 90 - i * 3,
                    "category": sc,
                    "order": i + 10,
                    "description": "ترکیب تکنیک و خلاقیت برای ساختن تصویری که در ذهن می‌ماند.",
                    "artwork": f"/assets/portfolio/project-{i + 1:02}.webp",
                },
            )
        experiences = [
            ("ادیتور ارشد فریلنس", "همکاری مستقل", "۱۴۰۴", "اکنون"),
            ("همکاری با تیم‌های محتوایی", "تیم تولید محتوا", "۱۴۰۳", "۱۴۰۴"),
            ("ادمین و تدوینگر شبکه‌های اجتماعی", "محتوای دیجیتال", "۱۴۰۲", "۱۴۰۳"),
            ("شروع مسیر تدوین", "یادگیری و تمرین", "۱۴۰۱", "۱۴۰۲"),
        ]
        legacy_experience_titles = [
            "Senior Freelance Editor",
            "Content Team Collaboration",
            "Social Media Admin & Editor",
            "Start of Editing Journey",
        ]
        old_experience_description = (
            "نمونهٔ نمایشی سوابق: تدوین روایت‌های تصویری، هماهنگی با تیم خلاق و ساخت محتوای منسجم."
        )
        experience_descriptions = [
            "نمونهٔ نمایشی: همکاری با برندها و تولیدکنندگان محتوا در حوزه‌های گیمینگ و تبلیغات.",
            "نمونهٔ نمایشی: تولید و تدوین ویدیوهای یوتیوب و تیزرهای تبلیغاتی برای صفحه‌های مختلف.",
            "نمونهٔ نمایشی: مدیریت محتوای ویدیویی و افزایش تعامل در شبکه‌های اجتماعی.",
            "نمونهٔ نمایشی: یادگیری تدوین و ساخت پروژه‌های شخصی برای آغاز مسیر حرفه‌ای.",
        ]
        experience_images = ["experience-editor", "experience-city", "experience-red", "experience-start"]
        experience_accents = ["gold", "cyan", "red", "cyan"]
        for i, (title, company, start, end) in enumerate(experiences):
            legacy = Experience.objects.filter(title=legacy_experience_titles[i]).first()
            if legacy and (
                legacy.company != company
                or legacy.description != old_experience_description
                or legacy.start != start
                or legacy.end != end
                or legacy.image not in ("", f"/assets/components/{experience_images[i]}.webp")
                or legacy.image_asset_id
            ):
                continue
            Experience.objects.filter(
                title=legacy_experience_titles[i], company=company, description=old_experience_description
            ).update(title=title)
            experience, _ = Experience.objects.get_or_create(
                title=title,
                defaults={
                    "company": company,
                    "start": start,
                    "end": end,
                    "description": experience_descriptions[i],
                    "order": i,
                    "image": f"/assets/components/{experience_images[i]}.webp",
                    "image_alt": f"تصویر نمایشی {company}",
                    "accent": experience_accents[i],
                    "is_current": i == 0,
                },
            )
            if experience.description == old_experience_description:
                experience.description = experience_descriptions[i]
                experience.save(update_fields=["description"])
                if not experience.image and not experience.image_asset_id:
                    experience.image = f"/assets/components/{experience_images[i]}.webp"
                    experience.image_alt = f"تصویر نمایشی {company}"
                    experience.accent = experience_accents[i]
                    experience.is_current = i == 0
                    experience.save(update_fields=["image", "image_alt", "accent", "is_current"])
        Education.objects.get_or_create(
            degree="مطالعهٔ مستقل هنر و رسانه",
            defaults={
                "institution": "یادگیری مداوم · دادهٔ نمایشی",
                "years": "۱۴۰۱ — اکنون",
                "start_year": "۱۴۰۱",
                "is_current": True,
                "description": "تدوین، روایت، رنگ و زبان تصویر",
            },
        )
        demo_courses = [
            ("دوره تخصصی تدوین با Premiere Pro", "Premiere Pro", "۱۴۰۱", "Pr"),
            ("دوره اصلاح رنگ و کالرگریدینگ", "Color Grading", "۱۴۰۱", "Da"),
            ("دوره جلوه‌های ویژه با After Effects", "After Effects", "۱۴۰۲", "Ae"),
            ("دوره داستان‌گویی بصری و موشن گرافیک", "Motion Graphics", "۱۴۰۳", "Ae"),
        ]
        for i, (title, legacy_title, year, icon) in enumerate(demo_courses):
            legacy_certificate = Certificate.objects.filter(title=legacy_title).first()
            if legacy_certificate and (
                legacy_certificate.issuer != "دورهٔ نمایشی — قابل جایگزینی"
                or legacy_certificate.year != "۱۴۰۳"
                or legacy_certificate.url
                or legacy_certificate.description
                or legacy_certificate.certificate_asset_id
                or legacy_certificate.icon_asset_id
            ):
                continue
            Certificate.objects.filter(title=legacy_title, issuer="دورهٔ نمایشی — قابل جایگزینی", year="۱۴۰۳").update(
                title=title, year=year
            )
            Certificate.objects.get_or_create(
                title=title,
                defaults={
                    "issuer": "دورهٔ نمایشی — قابل جایگزینی",
                    "year": year,
                    "order": i,
                    "icon": icon,
                },
            )
            Certificate.objects.filter(title=title, issuer="دورهٔ نمایشی — قابل جایگزینی", icon="").update(icon=icon)
        for i, (value, title, numeric, suffix, icon, description) in enumerate(
            [
                ("50+", "پروژهٔ خلاق", 50, "", "play", "نمونهٔ نمایشی: همکاری موفق در بیش از ۵۰ پروژهٔ مختلف"),
                ("100K+", "بازدید ویدیوها", 100, "K", "users", "نمونهٔ نمایشی: مجموع بازدید ویدیوهای تدوین‌شده"),
                ("20+", "همکاری موفق", 20, "", "star", "نمونهٔ نمایشی: رضایت کارفرما و همکاری بلندمدت"),
            ]
        ):
            Achievement.objects.get_or_create(
                title=title,
                defaults={
                    "value": value,
                    "description": description,
                    "numeric_value": numeric,
                    "prefix": "+",
                    "suffix": suffix,
                    "icon": icon,
                    "order": i,
                },
            )
            Achievement.objects.filter(title=title, value=value, description="آمار نمایشی اولیه").update(
                numeric_value=numeric, prefix="+", suffix=suffix, icon=icon, order=i, description=description
            )
        resume_path = settings.BASE_DIR / "seed_assets" / "resume-demo.pdf"
        if resume_path.exists():
            asset = MediaAsset.objects.filter(filename="resume-demo.pdf").first()
            if asset is None:
                asset = upload_media(
                    SimpleUploadedFile("resume-demo.pdf", resume_path.read_bytes(), content_type="application/pdf"),
                    alt="رزومهٔ نمونهٔ CTRL.Z — محتوای نمایشی",
                    usage="resume-demo",
                )
            ResumeFile.objects.get_or_create(
                title="رزومهٔ نمونه (نمایشی)",
                defaults={"asset": asset, "order": 0, "visible": True},
            )
        for i, (platform, label, url, handle) in enumerate(
            [
                ("email", "ایمیل", "https://example.com/contact", "hello@example.com"),
                ("telegram", "تلگرام", "https://t.me/CTRLZ_Edits", "@CTRLZ_Edits"),
                ("instagram", "اینستاگرام", "https://instagram.com/ctrlz.edits", "@ctrlz.edits"),
                ("youtube", "یوتیوب", "https://youtube.com/@CTRLZ.Edits", "@CTRLZ.Edits"),
            ]
        ):
            SocialLink.objects.get_or_create(
                platform=platform,
                defaults={
                    "label": label,
                    "url": url,
                    "handle": handle,
                    "description": "لینک نمایشی — از پنل مدیریت جایگزین کنید",
                    "order": i,
                },
            )
        PageBlock.objects.get_or_create(
            key="about-cards",
            defaults={
                "title": "آنچه مرا پیش می‌برد",
                "items": [
                    {"title": "تجربه و تخصص", "text": "چندین سال فعالیت در زمینهٔ تدوین و تولید محتوا"},
                    {"title": "علاقه‌مندی", "text": "ادیت ویدیو، سینما، انیمه و داستان‌گویی بصری"},
                    {"title": "هدف", "text": "خلق محتوای ماندگار و الهام‌بخش"},
                ],
            },
        )
        PageBlock.objects.get_or_create(
            key="resume-about",
            defaults={
                "title": "درباره من",
                "subtitle": "داستان کوتاهی از مسیر من",
                "body": (
                    "من یک مسیر به نام CTRL.Z هستم: یک ادیتور و ویرایشگر دیجیتال عاشق داستان‌ها. "
                    "تجربه‌ها و ایده‌ها اینجا به هم می‌رسند. این متن نمایشی است و از پنل مدیریت قابل جایگزینی است."
                ),
                "items": [
                    {"title": "داستان کوتاهی از مسیر من"},
                    {"title": "تصویر پشت‌نما", "image": "/assets/components/resume-about-back.webp", "imageAlt": ""},
                    {"title": "تصویر چهره", "image": "/assets/components/resume-about-face.webp", "imageAlt": ""},
                ],
                "order": 80,
            },
        )
        for key, title, subtitle in [
            ("resume-experience", "تجربه‌های کاری", "مسیر حرفه‌ای من در دنیای تدوین و تولید محتوا"),
            ("resume-certificates", "دوره‌ها و گواهینامه‌ها", "مهارت‌های تخصصی و دوره‌های معتبر"),
            ("resume-achievements", "دستاوردها", "چند مورد از افتخارات و موفقیت‌های من"),
            ("resume-skills", "مهارت‌ها", "ابزارها و مهارت‌های تخصصی من"),
        ]:
            PageBlock.objects.get_or_create(key=key, defaults={"title": title, "body": subtitle, "order": 80})
        PageBlock.objects.get_or_create(
            key="about-styles",
            defaults={
                "title": "سبک کاری من",
                "items": [
                    {"title": "تدوین سینمایی"},
                    {"title": "تیزر و تبلیغات"},
                    {"title": "ادیت انیمه"},
                    {"title": "محتوای ورزشی"},
                    {"title": "ولاگ و ویدیوهای روزمره"},
                ],
            },
        )
        PageBlock.objects.get_or_create(
            key="home-next",
            defaults={
                "title": "هر فریم فرصتی برای روایت است",
                "body": "از ایده تا تصویر نهایی، با هر کات یک حس تازه می‌سازم.",
            },
        )
        seed_reference_defaults()
        self.stdout.write(
            self.style.SUCCESS("Seed complete. Demo content is clearly identified; existing edits preserved.")
        )
