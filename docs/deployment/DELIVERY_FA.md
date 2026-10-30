# گزارش تحویل Portfolio CTRL.Z — ۲۹ اکتبر ۲۰۲۶

وضعیت: **PARTIAL؛ سایت واقعاً آنلاین است.** دلیل اعلام‌نکردن PRODUCTION_READY، نبود پشتیبانی امنیتی فعال Ubuntu Pro/ESM، کامل‌نشدن آزمون مرورگر عمومی و نبود مقصد مستقل برای بکاپ خودکار روزانه است.

## استقرار واقعی

| مورد | نتیجه |
| --- | --- |
| سایت و پنل | https://ctrtlzweb.ir و https://ctrtlzweb.ir/admin/login |
| سلامت API | https://ctrtlzweb.ir/api/v1/health/، پاسخ 200 |
| VPS | 213.176.28.154، سرویس 241681 هاست‌ایران |
| سیستم | Ubuntu 20.04.6، کرنل 5.4.0-216-generic؛ طبق درخواست نهایی ارتقا یا نصب مجدد نشد |
| منابع | یک CPU، حدود 965 MiB RAM، 1.9 GiB swap، دیسک 20 GiB؛ خریدی انجام نشد |
| Docker | 29.9.2 رسمی static، containerd 2.4.2، runc 1.5.2، Compose 5.6.1، Buildx 0.38.1؛ hello-world واقعی موفق |
| برنامه | Django 5.2.18 / Python 3.12 / Gunicorn، Next.js 16.4.0 / Node 22، PostgreSQL 17؛ کانتینرها Healthy شدند |
| DNS | ns1.hostiran.net و ns2.hostiran.net؛ A برابر IP واقعی VPS؛ www به دامنهٔ اصلی می‌رسد. Cloudflare در مسیر نیست |
| HTTPS | گواهی معتبر Let's Encrypt برای دامنه و www؛ انقضای اولیه 2027-01-27؛ HTTP و www پاسخ 308 به دامنهٔ اصلی HTTPS می‌دهند |
| SSL خودکار | ctrlz-certificate.timer فعال، renew --dry-run موفق؛ اجرای واقعی سرویس با ExecMainStatus=0 |
| بکاپ | DB/Media/تنظیمات و SSL خصوصی؛ timer روزانه فعال و سرویس واقعاً موفق؛ یک نسخهٔ مستقل روی کامپیوتر مالک دریافت و بررسی شد |
| اطلاعات اصلی | 12 پروژه، 2 رکورد رسانه و 17 فایل با SHA-256 تطبیق داده شدند؛ فایل قبلی حذف نشد |
| نسخهٔ فعال | /srv/ctrlz/current → /srv/ctrlz/releases/20261029-footer |
| فوتر تازه | متن «ساخته شده با ❤️» واقعاً در فوتر پاسخ عمومی HTTPS تأیید شد؛ متن قبلی در فوتر نیست |

ورودی عمومی Nginx جاری در کانتینر ctrlz-edge است؛ ورودی برنامه فقط 127.0.0.1:8080 است. PostgreSQL، frontend و backend پورت عمومی ندارند. Volumeهای دیتابیس و Media دائمی‌اند؛ S3/MinIO اختیاری باقی ماند و در این VPS از فایل‌سیستم استفاده می‌شود. مسیرهای assets تغییر نکردند. هیچ بستهٔ noble یا libc ناسازگار نصب نشد.

رمز افشاشدهٔ root تعویض شد. SSH فقط با کلید است؛ حساب ctrlz-deploy ساخته و اتصال مستقل آن آزمون شد. sudo آن فقط Docker را اجازه می‌دهد؛ قدرت Docker در عمل مدیریتی است و این حساب برای مالک مورد اعتماد است. ورود root با کلید برای بازیابی حفظ شد. UFW فقط 22/80/443 را باز دارد. تنظیمات واقعی با mode 600 خارج سورس هستند. رمزهای Development به Production منتقل نشدند.

## ویدیو و رابط

| محدودیت | قبلی | جدید |
| --- | --- | --- |
| حجم هر ویدیو | 200000000 بایت | 1073741824 بایت، دقیقاً 1 GiB، شامل مرز |
| حداقل مدت | 30 ثانیه | حذف شد؛ وجود جریان و فریم سالم لازم است |
| حداکثر مدت | 120 ثانیه | 120 ثانیه، خود مرز پذیرفته می‌شود |
| بدنهٔ پراکسی | حدود 201000000 بایت | 1025m با سربار multipart |
| timeout | 180 ثانیه | 3900 ثانیه |

سقف برای هر فایل است. تصاویر/اسناد همان سقف 10000000 بایت را دارند. FFprobe و رمزگشایی FFmpeg در بک‌اند الزامی‌اند؛ به مدت اعلامی مرورگر اعتماد نمی‌شود. فایل بزرگ روی دیسک دریافت و جریانی ارسال می‌شود؛ در RAM جمع نمی‌شود. کمبود فضای آزاد پاسخ حفاظتی 507 دارد. رسانهٔ منتشرنشده خصوصی و ویدیوی عمومی دارای Range است.

VideoUpload مشترک ساخت/ویرایش، اعتبارسنجی پیش از ارسال، حجم، مدت، پیشرفت، لغو و پیام فارسی دارد. متن راهنمای درخواستی اعمال شده است. Navbar، Sidebar، طراحی و تم‌ها تغییر نکردند. تغییر جدید فوتر فقط «ساخته شده با ❤️» و متن انگلیسی متناظر «Made with ❤️» است.

## آزمون‌های واقعی

| آزمون / روش | نتیجه و شواهد |
| --- | --- |
| Backend محلی | 76 تست موفق و یک مورد ترجمه skipped به‌علت نبود frontend در تصویر؛ همان مورد جدا با mount خواندنی موفق؛ 77 سناریو بررسی شد |
| Frontend | 57 Vitest، TypeScript، ESLint و Build موفق؛ برای تغییر سادهٔ فوتر Build و TypeScript دوباره موفق شد |
| OpenAPI | spectacular --validate --fail-on-warn موفق |
| Django روی VPS | check بدون خطا؛ check --deploy بدون ERROR؛ سه هشدار W005/W008/W021 برای HSTS subdomain/preload و redirect در ingress ثبت شدند |
| Migration | migrate واقعی موفق؛ makemigrations --check --dry-run بدون تغییر، migrate --check و --plan بدون مورد باقی‌مانده |
| زیرساخت | Compose config، bash -n، nginx -t داخلی و edge و PostgreSQL pg_isready موفق |
| اینترنت بیرونی | صفحهٔ اصلی، about، portfolio، skills، resume، contact، admin/login و health پاسخ 200 با گواهی معتبر |
| مدیریت از اینترنت | ورود/خروج، Secure/HttpOnly Cookie، داشبورد، رد آپلود ناشناس، ایجاد/ویرایش/حذف پروژهٔ آزمایشی موفق |
| آپلود بیرونی | تصویر و نمایش عمومی پس از انتشار، ویدیوی 0.1 ثانیه‌ای موفق؛ فایل خراب و 121ثانیه‌ای رد شدند |
| 100000000 بایت / 30 ثانیه | قبول واقعی 201، حدود 6.57 ثانیه در تست VPS |
| 900000000 بایت / 90 ثانیه | قبول واقعی 201، حدود 75.26 ثانیه |
| دقیقاً 1073741824 بایت / 120 ثانیه | قبول واقعی 201، حدود 96.11 ثانیه؛ حجم، مدت، SHA-256 و ارتباط پروژه/فایل تأیید شد |
| 1073741825 بایت / 120 ثانیه | رد واقعی 413، حدود 80.47 ثانیه |
| لغو | قطع اتصال در multipart رکوردی نساخت؛ پوشه‌های موقت Next و فایل‌های upload جنگو پس از لغو خالی بودند |
| پخش و ویرایش | پروژهٔ ویدیویی آزمایشی از اینترنت دیده شد؛ Range 0-63 پاسخ 206 و 64 بایت داد؛ ویرایش ارتباط video_asset را حفظ کرد |
| Restart | هر چهار سرویس Restart شدند؛ SHA-256 فایل 1 GiB و رابطهٔ پروژه/رسانه پس از Restart صحیح بود |
| Restore | dump و 19 فایل شامل 1 GiB در ctrlz-restore-live-check با DB و Volume تازه بازیابی شدند؛ هش و رابطه‌ها صحیح، Production بازنویسی نشد |
| حفظ داده | تست‌ها پاک شدند؛ 12 پروژه، 2 رسانه و SHA-256 هر 17 فایل اصلی صحیح؛ هیچ Volume حذف نشد |
| انتشار و Rollback | انتشار focal2، rollback.sh --schema-compatible واقعی و انتشار دوباره موفق؛ DB و Media حفظ شدند |
| SSL | صدور واقعی، TLS بیرونی، renew --dry-run و اجرای systemd موفق |
| بکاپ مستقل | آرشیو خصوصی بیرون VPS دریافت شد؛ SHA، خواندن کامل gzip/tar، 21 عضو snapshot و 4 blob محتوایی بررسی شد؛ Secret چاپ نشد |
| ظاهر | مرورگر واقعی محلی در عرض 390 و 1440 بررسی شد؛ مرورگر عمومی این مرحله غیرفعال بود. HTML عمومی URL رسانه/script از نوع HTTP نداشت و 12 فایل Next از HTTPS دریافت شد |

آزمون‌های بزرگ از VPS به نام عمومی دامنه و همان ورودی HTTPS واقعی انجام شدند؛ انتقال کامل 1 GiB از شبکهٔ بیرونی کاربر تأیید نشده است. از کامپیوتر بیرونی، آپلود کوچک، مدیریت، انتشار و Range بررسی شدند. ویدیوها H.264 سالم 64×64 با box استاندارد free برای رسیدن به حجم واقعی بودند؛ این تست، رمزگشایی 4K/8K یا بار هم‌زمان نیست. نمونه‌های مصرف حافظه frontend حدود 63–121 MiB، backend حدود 40–123 MiB و PostgreSQL حدود 18–45 MiB بودند؛ این‌ها بیشینهٔ مصرف نیستند. swap limit کانتینر در کرنل فعلی فعال نیست.

خطاهای اولیهٔ تست پنهان نشده‌اند: دریافت ناشناس تصویرِ منتشرنشده 404 داد که حفاظت صحیح بود؛ تست پس از انتشار موفق شد. خواندن fixture خصوصی ابتدا PermissionError داد؛ اجرای بررسی با مجوز مناسب موفق شد. نخستین اجرای پاک‌سازی موقت به‌علت قفل فعال انتشار متوقف شد و پس از پایان انتشار با وضعیت 0 موفق شد.

شواهد غیرمحرمانه در همین پوشه: public-runtime-results-20261029.json، external-upload-results-20261029.json، public-large-upload-results-20261029.json، final-public-results-20261029.json ، footer-public-verification-20261029.json و offsite-backup-verification-20261029.json. لاگ‌های اجرایی VPS در /srv/ctrlz/shared/ هستند. لاگ Rollback و انتشار دوباره به‌ترتیب rollback-test-20261029.log و redeploy-after-rollback-20261029.log هستند. فایل‌های خصوصی آزمون و بکاپ در .local/deployment/، خارج Git و بستهٔ انتشار، نگه‌داری می‌شوند.

## فایل‌های تغییرکرده و علت

فهرست ریز فایل‌های ویدیو و تست‌هایشان در ../VIDEO_UPLOAD_LIMITS_FA.md آمده است. دسته‌های تغییر این مأموریت:

- backend/domains/media/validation.py، backend/config/settings.py، backend/Dockerfile و backend/tests/test_admin_i18n_upgrade.py: مرزها، بررسی محتوا، streaming، timeout و آزمون‌ها.
- backend/core/upload_auth.py، core/views.py، core/schema.py، domains/accounts/views.py، config/urls.py و tests/test_upload_auth.py: مجوز محدود آپلود طولانی، CSRF، ابطال و قرارداد API.
- backend/core/storage_snapshot.py و tests/test_storage_snapshot.py: بکاپ محتوایی، کنترل فضا و بازیابی ایمن.
- frontend/src/lib/media-upload.ts و media-upload.test.ts، features/admin/VideoUpload.tsx و VideoUpload.test.tsx: قواعد فرم‌ها، نمایش وضعیت و لغو.
- frontend/src/lib/api.ts و api.test.ts، lib/server/upload-body.ts و upload-body.test.ts و api-proxy.test.ts، app/api/v1/[...path]/route.ts: جلوگیری از جمع‌شدن بدنه در RAM، فایل موقت خصوصی، اندازه‌گیری، احراز هویت و پاک‌سازی.
- frontend/src/i18n/messages.ts و frontend/src/features/site/PublicShell.tsx: پیام‌ها و کلید footer.credit، بدون تغییر چیدمان فوتر.
- docker-compose.prod.yml: Volumeهای دائمی، S3 اختیاری، پورت داخلی، restart/health/resource/log policy و جداسازی Migration.
- ops/nginx.conf، ops/nginx.tls.conf.example، ops/deployment/nginx.bootstrap.conf، nginx.public.conf و edge.compose.yml: SSL، مسیرها، streaming، headerها، timeout و لاگ محدود.
- ops/deployment/common.sh، deploy.sh، backup.sh، restore.sh، rollback.sh، healthcheck.sh و audit-server.sh: عملیات واقعی قابل تکرار.
- ops/deployment/install-docker.sh و install-docker-focal.sh: مسیرهای صریح سازگار با نسخهٔ سیستم؛ جلوگیری از مخزن اشتباه.
- ops/deployment/configure.py، package-release.py و .env.production.example: Secret تصادفی خصوصی و بستهٔ بدون Secret.
- ops/deployment/renew-certificate.sh، ctrlz-certificate.service و ctrlz-certificate.timer؛ ctrlz-backup.service و ctrlz-backup.timer: SSL و بکاپ خودکار.
- ops/deployment/cleanup-uploads.sh، ctrlz-upload-cleanup.service و timer: فقط فایل‌های موقت مشخصِ متروک؛ حذف Media دائمی زمان‌بندی نشد.
- ops/deployment/generate-upload-fixtures.py و verify-public-upload.py: آزمون واقعی HTTPS با دادهٔ موقت و رمز در فایل خصوصی.
- .dockerignore، .gitignore، .gitattributes، .env.example و README.md: حذف Secret/داده از Build و بسته، line ending و روش اجرا.
- docs/openapi.yaml، docs/VIDEO_UPLOAD_LIMITS_FA.md و docs/deployment/: API، گزارش، تاریخچه، روش عملیات و شواهد.

سرویس Docker میزبان، UFW، SSH، کاربر Deployment، sudoers و timerها نیز واقعاً تنظیم شدند. سورس پروژه‌های دیگر تغییر نکرد و Secret وارد Commit نشد.

## دسترسی و محدودیت‌های باقی‌مانده

مدیر: **ctrlz-admin**. رمز جدید در فایل خصوصی .local/deployment/production-admin.password و رمز جدید کنسول root در .local/deployment/root-console.password روی کامپیوتر مالک است. مقدارها در گزارش/فرمان چاپ نشده‌اند و پوشه ACL محدود دارد. رمزهای ایرنیک/هاست‌ایران که در چت افشا شده‌اند باید توسط مالک در همان پنل‌ها عوض شوند.

1. پشتیبانی استاندارد Ubuntu 20.04 در مه 2025 تمام شده و این VPS به Pro/ESM متصل نیست. برای امنیت بلندمدت، فعال‌سازی Pro/ESM روی همین سیستم یا ارتقای آینده لازم است. حساب/دسترسی امن Ubuntu در اختیار نیست؛ خریدی انجام نشده است.
2. Docker static از APT به‌روز نمی‌شود؛ نسخهٔ جاری نصب و بررسی شده ولی نگهداری دوره‌ای runtime لازم است. نصب Docker جدید پشتیبانی امنیتی کرنل focal را ایجاد نمی‌کند.
3. بکاپ روزانه روی VPS فعال و یک نسخهٔ مستقل اکنون روی کامپیوتر مالک موجود است. برای انتقال خودکار روزانه به مقصد مستقل، مقصد و دسترسی امنی داده نشده است. حذف خودکار بکاپ فعال نشده؛ dedup و کنترل فضا از تکثیر روزانهٔ Media جلوگیری می‌کند.
4. دیسک 20 GiB برای آرشیو چندین ویدیوی 1 GiB محدود است. منابع اضافه خریداری نشدند؛ برای آرشیو یا بار سنگین، ظرفیت بیشتر باید توسط مالک انتخاب شود. کمبود فضا با 507 مدیریت می‌شود.
5. مرورگر Work غیرفعال بود؛ همهٔ صفحات/تم‌ها و پخش بومی نهایی در مرورگر عمومی آزمون نشدند. محدودیت دور زده نشد. آزمون شبکهٔ یک‌ساعته، چند آپلود هم‌زمان و ویدیوی 4K/8K انجام نشده است.
6. بررسی خودکار مجوز، نسخهٔ اولیهٔ timer حذف رسانه‌های بدون اتصال را به‌علت نبود مجوز مشخص سیاست حذف رد کرد؛ آن عملیات اجرا نشد. نسخهٔ محدودتر فقط فایل‌های موقت شناخته‌شدهٔ قدیمی‌تر از دو ساعت را پاک می‌کند و واقعاً موفق اجرا شد. لغو پس از تکمیل دریافت ممکن است رسانهٔ بدون اتصال باقی بگذارد؛ رفتار cleanup_uploads و مهلت 24ساعته در کد موجود است، ولی زمان‌بندی تازهٔ حذف دائمی فعال نشد.
7. کنسول هاست‌ایران قبلاً سیاه بود و رفع آن تأیید نشده است. راه‌اندازی روی 20.04 به reboot یا نصب مجدد نیاز نداشت. بازیابی بوت VM از بکاپ فایل یا Snapshot آزمون نشده است.

دستورات دقیق سلامت، انتشار، لاگ، بکاپ، بازیابی، Rollback، Media و SSL در README_FA.md هستند. HISTORY_20261028_29_FA.md و گزارش ویدیو، تاریخچه‌اند و وضعیت فعلی این گزارش را نقض نمی‌کنند.

منابع رسمی: [Docker static](https://docs.docker.com/engine/install/binaries/)، [Docker 29](https://docs.docker.com/engine/release-notes/29/)، [پشتیبانی Ubuntu 20.04](https://ubuntu.com/20-04).
