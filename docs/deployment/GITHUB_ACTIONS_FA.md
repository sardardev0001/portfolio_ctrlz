# انتشار خودکار با GitHub Actions و Ansible

## وضعیت و پیش‌نیاز

مخزن هدف: `sardardev0001/portfolio_ctrlz` با شاخهٔ `main`. تا زمانی که مخزن، Secrets و اولین اجرای موفق Workflow واقعاً تأیید نشده‌اند، انتشار خودکار فعال محسوب نمی‌شود. فایل Workflow و Playbook به‌تنهایی سرویس را به GitHub متصل نمی‌کنند.

Production موجود در `213.176.28.154` و دامنهٔ `ctrtlzweb.ir` با Volumeهای پایدار کار می‌کند. این Workflow روی هر Push به `main` اجرا می‌شود و پیش از Deploy، CI را به‌عنوان Job قابل استفادهٔ مجدد اجرا می‌کند.

## تنظیمات یک‌بارهٔ GitHub

1. مخزن عمومی با نام `portfolio_ctrlz` بسازید و سورس بررسی‌شده را در شاخهٔ `main` منتشر کنید. مطمئن شوید `.env`، `.local`، بکاپ‌ها، Media، کلیدها و داده‌های شخصی در Commit نیستند.
2. در Settings → Environments، محیط `production` را بسازید. در صورت تمایل، Branch policy را به `main` محدود کنید. برای انتشار کاملاً خودکار، Required reviewer قرار ندهید.
3. Environment variable با نام `DEPLOY_HOST` و مقدار IP فعلی VPS تنظیم کنید.
4. یک کلید SSH **مجزا و بدون Passphrase برای runner** بسازید، Public key آن را فقط برای حساب استقرار روی VPS ثبت و Private key را به‌صورت Secret با نام `DEPLOY_SSH_KEY` در Environment قرار دهید. کلید شخصی محلی یا رمز کنسول را در Actions نگذارید. این کلید فقط دسترسی لازم برای انتشار داشته باشد.
5. کلید میزبان SSH را از ارتباط مورد اعتماد تأیید کنید و خط کامل `known_hosts` را به‌صورت Secret با نام `DEPLOY_SSH_HOST_KEY` ثبت کنید. مقدار را از خروجی ناشناس `ssh-keyscan` بدون تطبیق مستقل نپذیرید.
6. اطمینان حاصل کنید `/srv/ctrlz/shared/.env.production` با مجوز `0600` روی VPS موجود است. هیچ Secret برنامه به Image یا مخزن اضافه نکنید.

## مسیر اجرا

`CI → Docker build → package-release.py → docker save → Ansible copy → docker load → deploy.sh → HTTPS health`

Playbook در `ops/deployment/ansible/deploy.yml` قرار دارد. هر Release با SHA همان Commit نام‌گذاری می‌شود. `deploy.sh` قفل استقرار، بررسی فضای دیسک، بکاپ قبل از تغییر، بررسی Migration، توقف نویسندگان، اجرای Migration، بالا آوردن سرویس‌ها و Health check محلی را انجام می‌دهد. Ansible سپس سلامت عمومی HTTPS را بررسی می‌کند. Volumeهای PostgreSQL و Media در این فرایند حذف نمی‌شوند.

## خطا و بازگشت

اگر CI یا ساخت Image شکست بخورد، هیچ تغییری روی VPS اعمال نمی‌شود. اگر Deploy بعد از شروع Migration شکست بخورد، اپراتور باید وضعیت دیتابیس و سرویس را بررسی کند؛ بازگشت خودکار Schema انجام نمی‌شود. برای نسخه‌های سازگار با Schema، دستور `rollback.sh --schema-compatible` موجود است. برای Migration ناسازگار، از بکاپ مستقل و برنامهٔ بازیابی استفاده کنید. گزارش [استقرار](README_FA.md) را ببینید.

## آزمون پذیرش

پس از اتصال حساب، یک Commit آزمایشی کوچک به `main` Push کنید، اجرای CI و Deploy را در Actions بررسی کنید و با `https://ctrtlzweb.ir/api/v1/health/`، صفحهٔ عمومی و پنل مدیریت صحت Release را تأیید کنید. تا زمانی که این آزمون واقعی انجام نشده، انتشار خودکار تأیید نشده است.
