# انتشار خودکار با GitHub Actions و Ansible

## وضعیت و پیش‌نیاز

مخزن عمومی موجود: [sardardev0001/portfolio_ctrlz](https://github.com/sardardev0001/portfolio_ctrlz) با شاخهٔ `main`. محیط `production`، متغیر میزبان، کلید SSH اختصاصی CI و کلید تأییدشدهٔ میزبان در GitHub تنظیم شده‌اند. موفقیت هر انتشار را از [Actions](https://github.com/sardardev0001/portfolio_ctrlz/actions) و شناسهٔ Release فعال روی VPS بررسی کنید.

Production موجود در `213.176.28.154` و دامنهٔ `ctrtlzweb.ir` با Volumeهای پایدار کار می‌کند. این Workflow روی هر Push به `main` اجرا می‌شود و پیش از Deploy، CI را به‌عنوان Job قابل استفادهٔ مجدد اجرا می‌کند.

## تنظیمات یک‌بارهٔ GitHub

1. سورس بررسی‌شده را در شاخهٔ `main` منتشر کنید. مطمئن شوید `.env`، `.local`، بکاپ‌ها، Media، کلیدها و داده‌های شخصی در Commit نیستند.
2. در Settings → Environments، محیط `production` را نگه دارید. برای انتشار کاملاً خودکار، Required reviewer قرار ندهید.
3. Environment variable با نام `DEPLOY_HOST` باید IP فعلی VPS باشد.
4. کلید SSH **مجزا و بدون Passphrase برای runner** در Secret با نام `DEPLOY_SSH_KEY` ثبت شده است. کلید عمومی با گزینهٔ `restrict` در حساب `root` فعلی VPS قرار دارد؛ Playbook برای مدیریت Release و Docker به این سطح دسترسی نیاز دارد. کلید شخصی محلی یا رمز کنسول را در Actions نگذارید.
5. کلید میزبان SSH از ارتباط مورد اعتماد تأیید و به‌صورت Secret با نام `DEPLOY_SSH_HOST_KEY` ثبت شده است. هنگام تعویض VPS یا کلید میزبان، آن را فقط پس از تأیید مستقل به‌روز کنید.
6. فایل `/srv/ctrlz/shared/.env.production` با مجوز `0600` روی VPS موجود است. هیچ Secret برنامه به Image یا مخزن اضافه نکنید.

## مسیر اجرا

`CI → Docker build → package-release.py → docker save → Ansible copy → docker load → deploy.sh → HTTPS health`

Playbook در `ops/deployment/ansible/deploy.yml` قرار دارد. هر Release با SHA همان Commit نام‌گذاری می‌شود. `deploy.sh` قفل استقرار، بررسی فضای دیسک، بکاپ قبل از تغییر، بررسی Migration، توقف نویسندگان، اجرای Migration، بالا آوردن سرویس‌ها و Health check محلی را انجام می‌دهد. Ansible سپس سلامت عمومی HTTPS را بررسی می‌کند. Volumeهای PostgreSQL و Media در این فرایند حذف نمی‌شوند.

## خطا و بازگشت

اگر CI یا ساخت Image شکست بخورد، هیچ تغییری روی VPS اعمال نمی‌شود. اگر Deploy بعد از شروع Migration شکست بخورد، اپراتور باید وضعیت دیتابیس و سرویس را بررسی کند؛ بازگشت خودکار Schema انجام نمی‌شود. برای نسخه‌های سازگار با Schema، دستور `rollback.sh --schema-compatible` موجود است. برای Migration ناسازگار، از بکاپ مستقل و برنامهٔ بازیابی استفاده کنید. گزارش [استقرار](README_FA.md) را ببینید.

## آزمون پذیرش

برای هر Commit جدید، اجرای CI و Deploy را در Actions بررسی کنید و با `https://ctrtlzweb.ir/api/v1/health/`، صفحهٔ عمومی و پنل مدیریت صحت Release را تأیید کنید. تنها اجرای موفقِ همان Commit، انتشار خودکار آن را تأیید می‌کند.
