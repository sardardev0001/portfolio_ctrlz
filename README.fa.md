# CTRL.Z Portfolio

[English](README.md) · **فارسی**

پورتفولیوی دوزبانهٔ تدوین و تولید محتوا با سایت عمومی، پنل مدیریت، API و بارگذاری رسانه. نمونهٔ فعال: [ctrtlzweb.ir](https://ctrtlzweb.ir). این مخزن شامل سورس و تنظیمات انتشار است؛ داده‌های کاربران، رمزها و فایل‌های بارگذاری‌شده در Git قرار نمی‌گیرند.

## امکانات

- شش صفحهٔ عمومی، جزئیات پروژه، رزومه، فرم تماس و سوییچ فارسی/انگلیسی با جهت درست.
- پنل مدیریت با نقش‌های مالک، ویرایشگر و مشاهده‌گر؛ ویرایش پروژه‌ها، رسانه‌ها، رزومه، تجربه‌های کاری و محتوای صفحات.
- تجربه‌های کاری با تاریخ، نوع همکاری، محل کار، دستاوردها، فناوری‌ها، لینک‌ها، تصویر، ترجمه، ترتیب و وضعیت انتشار.
- ویرایش فهرست‌ها و کارت‌ها در فرم بصری؛ جابه‌جایی با کشیدن یا کلیدهای دکمهٔ بالا/پایین.
- عنوان صفحهٔ اصلی با چرخهٔ تایپ و حذف؛ تنظیم سرعت و مکث از پنل، پشتیبانی از کاهش حرکت.
- نوار شناور شیشه‌ای موبایل با شش لینک و نشانگر صفحهٔ فعال؛ ناوبری دسکتاپ حفظ شده است.
- ویدیوهای MP4/WebM معتبر تا **۱٬۰۷۳٬۷۴۱٬۸۲۴ بایت** و **۱۲۰ ثانیه** برای هر فایل؛ بررسی واقعی با FFprobe/FFmpeg، انتقال جریانی، پیشرفت و لغو.

## فناوری و معماری

Next.js 16، React 19 و TypeScript در `frontend/`؛ Django 5.2 و DRF در `backend/`؛ PostgreSQL 17، Docker Compose و Nginx در Production. مرورگر از پراکسی هم‌مبدأ `/api/v1/` استفاده می‌کند. دیتابیس و رسانه در Volumeهای دائمی هستند. [معماری استقرار](docs/deployment/README_FA.md).

## راه‌اندازی توسعه

Python 3.12، uv، Node.js 22 و pnpm 11.25 لازم‌اند. فایل `.env.example` را به `.env` کپی کنید و فقط مقادیر توسعهٔ خودتان را وارد کنید. نمونه:

```powershell
uv sync --project backend --locked --python 3.12
pnpm --dir frontend install --frozen-lockfile
$env:POSTGRES_HOST = ''
$env:S3_ENDPOINT_URL = ''
uv run --project backend --locked python backend/manage.py migrate
uv run --project backend --locked python backend/manage.py runserver 127.0.0.1:8000
```

در ترمینال دوم `pnpm --dir frontend dev` را اجرا کنید و `http://127.0.0.1:3000` را باز کنید. برای محیط محلی کانتینری از `docker-compose.yml` استفاده کنید؛ داده‌های Production در این مسیر قرار ندارند.

## آزمون

```powershell
uv run --project backend --locked ruff check backend
uv run --project backend --locked pytest backend/tests -q
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir frontend test
pnpm --dir frontend build
```

تست مرورگر: `pnpm --dir frontend e2e` پس از اجرای Backend، Frontend و دادهٔ آزمایشی. گواهی HTTPS و بکاپ فقط در محیط استقرار واقعی آزمایش می‌شوند.

## انتشار

گردش‌کار `deploy-production.yml` برای هر Push به `main` ابتدا CI را اجرا می‌کند، سپس دو Image را در GitHub runner می‌سازد و با Ansible به VPS می‌فرستد. اسکریپت فعلی قبل از Migration بکاپ می‌گیرد، سرویس‌ها را به‌صورت کنترل‌شده جابه‌جا می‌کند و سلامت HTTPS را بررسی می‌کند. **فعال‌شدن این مسیر وابسته به ایجاد مخزن و تنظیم کلید خصوصی CI و اثرانگشت میزبان در GitHub Environment است**؛ تا آن زمان ادعای انتشار خودکار نداریم. راهنمای کامل: [GitHub Actions و Ansible](docs/deployment/GITHUB_ACTIONS_FA.md).

## امنیت و داده

فایل‌های `.env`، کلیدها، بکاپ‌ها، خروجی‌های محلی و Media در `.gitignore` هستند. هیچ حساب یا رمز پیش‌فرض Production در سورس وجود ندارد. برای تغییر Schema ناسازگار، ابتدا طرح Migration و بازیابی را مرور کنید. محدودیت دیسک VPS و وضعیت Ubuntu 20.04 در [گزارش تحویل](docs/deployment/DELIVERY_FA.md) ثبت شده‌اند.

## مسیرها

`frontend/src/features/` رابط عمومی و مدیریت؛ `backend/domains/` مدل‌های دامنه؛ `ops/deployment/` اسکریپت‌ها و Playbook؛ `.github/workflows/` CI/CD؛ `docs/deployment/` مستندات عملیاتی.

مجوز انتشار سورس و دارایی‌های بصری جداگانه تعیین می‌شود؛ انتشار عمومی مخزن به معنی اعطای مجوز استفادهٔ مجدد از عکس‌ها و محتوای شخصی نیست.
