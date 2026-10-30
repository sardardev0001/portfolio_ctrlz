# استقرار واقعی Portfolio CTRL.Z

آخرین به‌روزرسانی: ۲۹ اکتبر ۲۰۲۶. سایت روی https://ctrtlzweb.ir آنلاین است. وضعیت تحویل تا پایان همهٔ بررسی‌ها **PARTIAL** است؛ موارد تأییدنشده در گزارش آزمون‌ها مشخص می‌شوند. گزارش قبلی در HISTORY_20261028_29_FA.md صرفاً تاریخچه است و وضعیت امروز را نشان نمی‌دهد.

گزارش تحویل و جدول نتایج واقعی در [DELIVERY_FA.md](DELIVERY_FA.md) است. فوتر «ساخته شده با ❤️» روی دامنهٔ عمومی بررسی و تأیید شد.

## معماری و دسترسی

- سایت: https://ctrtlzweb.ir ؛ پنل: https://ctrtlzweb.ir/admin/login ؛ سلامت: https://ctrtlzweb.ir/api/v1/health/
- دامنهٔ www و HTTP به HTTPS دامنهٔ اصلی هدایت می‌شوند. Nameserverها ns1.hostiran.net و ns2.hostiran.net هستند؛ A برابر 213.176.28.154 است. Cloudflare در مسیر نیست.
- VPS هاست‌ایران، سرویس 241681: Ubuntu 20.04.6، کرنل 5.4.0-216، یک CPU، رم حدود 965 MiB، swap حدود 1.9 GiB و دیسک 20 GiB. طبق درخواست نهایی کاربر سیستم‌عامل ارتقا یا نصب مجدد نشد؛ خریدی انجام نشد.
- Docker رسمی 29.9.2 به‌صورت static، containerd 2.4.2، runc 1.5.2، Compose 5.6.1 و Buildx 0.38.1. هیچ بستهٔ noble روی focal نصب نشد و libc تغییر نکرد.
- انتشار فعال: /srv/ctrlz/releases/20261029-footer ؛ لینک فعال: /srv/ctrlz/current.
- Django 5.2.18 / Python 3.12 و Next.js 16.4.0 / Node 22 از Imageهای ساخته و آزمایش‌شده روی کامپیوتر توسعه اجرا می‌شوند. PostgreSQL 17، Gunicorn یک worker با دو thread؛ Redis/Celery لازم نیست.
- پروژهٔ Compose برنامه ctrlz-production است. چهار سرویس postgres/backend/frontend/nginx دارد. ورودی برنامه فقط 127.0.0.1:8080 است. ورودی عمومی یک کانتینر مستقل Nginx جاری، ctrlz-edge، در شبکهٔ میزبان با پورت‌های 80/443 است. نیازی به Nginx قدیمیِ بستهٔ focal نیست.
- PostgreSQL، backend و frontend پورت عمومی ندارند. SSH روی 22 فقط با کلید کار می‌کند؛ ورود رمزی غیرفعال است. UFW فقط 22/80/443 را باز دارد. حساب ctrlz-deploy با کلید اختصاصی ساخته و اتصال آن آزمایش شد. sudo فقط فرمان Docker را اجازه می‌دهد؛ دسترسی Docker در عمل قدرت مدیریتی میزبان دارد و این حساب فقط برای مالک مورد اعتماد است. ورود root فقط با کلید برای بازیابی حفظ شده است. رمز افشاشدهٔ root تعویض و در فایل خصوصی .local/deployment/root-console.password به مالک تحویل شد.

## اطلاعات، رسانه و Secretها

داده‌های SQLite موجود از یک کپی مهاجرت‌یافته وارد PostgreSQL شدند؛ دیتابیس محلی و بکاپ اصلی تغییر نکردند. 12 پروژه، 2 رکورد رسانه و 17 فایل محلی حفظ شدند؛ دادهٔ seed جدید ساخته نشد. حساب ctrlz-admin رمز تصادفی جدید دارد. رمزهای حساب‌های منتقل‌شده قابل استفادهٔ مجدد نیستند و هیچ رمز Development به Production منتقل نشده است.

تنظیمات واقعی فقط در /srv/ctrlz/shared/.env.production با mode 600 قرار دارند. قالب غیرمحرمانه ops/deployment/.env.production.example است. رمز مدیر در فایل خصوصی .local/deployment/production-admin.password روی کامپیوتر مالک قرار دارد؛ این پوشه از Git و بستهٔ انتشار کنار گذاشته شده و ACL محدود دارد. مقدار رمز در گزارش یا فرمان چاپ نمی‌شود. پس از تحویل رمز را از پنل تغییر دهید.

Volumeهای ctrlz-production_postgres_prod و ctrlz-production_media_prod دائمی‌اند. هیچ آپدیت عادی نباید down -v یا حذف Volume اجرا کند. S3/MinIO اختیاری باقی است ولی در این VPS از فایل‌سیستم دائمی استفاده می‌شود؛ کلیدهای assets حفظ شدند.

هر ویدیو حداکثر 1073741824 بایت و 120 ثانیه است؛ حداقل مدت اضافه وجود ندارد. FFprobe و رمزگشایی FFmpeg در بک‌اند الزامی‌اند. Nginx بدنهٔ 1025m، مهلت 3900s و streaming دارد. پراکسی Next فایل را روی دیسک spool می‌کند؛ فایل 1 GiB در RAM بارگذاری نمی‌شود. قبل از دریافت، فضای کافی برای نسخه‌های موقت بررسی می‌شود. تصاویر/اسناد سقف قبلی 10000000 بایت دارند. رسانهٔ منتشرنشده فقط برای مدیر قابل دسترسی است؛ فایل عمومی ویدیو Range را پشتیبانی می‌کند.

دیسک 20 GiB برای آرشیو ویدیو محدود است؛ دریافت هر فایل بزرگ به فضای موقت و بکاپ مستقل همان فایل هم نیاز دارد. خطای 507 در کمبود فضا رفتار حفاظتی است. آزمایش یک فایل، ظرفیت نامحدود یا بار هم‌زمان چند مدیر را اثبات نمی‌کند. کرنل فعلی memory limit را اعمال می‌کند ولی swap limit کانتینرها در این cgroup فعال نیست.

## اجرای سرویس‌ها و سلامت

همهٔ فرمان‌های زیر روی VPS و با دسترسی مجاز مدیر اجرا می‌شوند:

```bash
source /srv/ctrlz/current/ops/deployment/common.sh
dc ps
dc logs --tail 100 backend frontend nginx
CTRLZ_PUBLIC_URL=https://ctrtlzweb.ir bash /srv/ctrlz/current/ops/deployment/healthcheck.sh
docker logs --tail 100 ctrlz-edge
docker stats --no-stream
df -h /
systemctl list-timers ctrlz-backup.timer ctrlz-certificate.timer
```

سقف حافظه: backend=384m، frontend=256m، postgres=192m، nginx داخلی=128m و edge=64m. لاگ کانتینرها json-file با 10m و 3 نسخه محدود است؛ لاگ edge به stdout/stderr می‌رود. به‌روزرسانی‌های امنیتی Ubuntu از قبل فعال بودند؛ این به معنی فعال‌بودن ESM نیست.

## SSL

گواهی معتبر Let's Encrypt برای دامنهٔ اصلی و www صادر شد؛ انقضای اولیه 2027-01-27 است. گواهی‌ها در /etc/letsencrypt و webroot در /var/lib/letsencrypt پایدارند. ctrlz-certificate.timer دو بار در روز تمدید را بررسی می‌کند. renew-certificate.sh از Certbot کانتینری استفاده می‌کند، پس وابسته به Certbot قدیمی focal نیست. آزمون renew --dry-run واقعاً موفق شد.

```bash
bash /srv/ctrlz/current/ops/deployment/renew-certificate.sh --dry-run
```

## انتشار بعدی و Rollback

1. تست و Build را روی کامپیوتر توسعه انجام دهید؛ روی VPS یک‌گیگابایتی Build سنگین انجام ندهید.
2. با package-release.py یک شناسهٔ جدید و آرشیو بدون Secret بسازید؛ آرشیو و Imageهای همان نسخه را از SSH انتقال دهید، checksum را تأیید و Imageها را با همان release tag ثبت کنید.
3. سورس را فقط در releases/<new-id> باز کنید؛ نسخهٔ فعال را درجا تغییر ندهید. .release-id باید با tag تطابق داشته باشد.
4. migrate --plan را بررسی و سازگاری دیتابیس را تأیید کنید. deploy.sh از نسخهٔ قبلی بکاپ می‌گیرد، سرویس‌های نویسنده را متوقف، Migration را اجرا و پس از سلامت لینک current را عوض می‌کند.

```bash
CTRLZ_RELEASE_DIR=/srv/ctrlz/releases/NEW_ID \
  bash /srv/ctrlz/releases/NEW_ID/ops/deployment/deploy.sh --migrations-reviewed --prebuilt
```

اسکریپت به‌صورت پیش‌فرض 12 GiB فضای آزاد لازم دارد. برای انتشار نخست این VPS، پس از محاسبهٔ داده و فضای موقت از CTRLZ_MIN_FREE_KIB=8388608 استفاده شد. برای انتشار بعدی ابتدا ظرفیت واقعی را دوباره بررسی کنید.

rollback.sh فقط با --schema-compatible اجازهٔ بازگشت کد می‌دهد؛ هیچ downgrade خودکار یا بازنویسی دیتابیس انجام نمی‌شود. Migration ناسازگار به برنامهٔ بازیابی و پنجرهٔ نگهداری نیاز دارد. Volumeها حفظ می‌شوند.

## بکاپ و بازیابی

ctrlz-backup.timer روزانه حدود 03:30 تهران اجرا می‌شود. backup.sh نوشتن برنامه را موقتاً متوقف می‌کند، PostgreSQL dump، manifest رسانه و تنظیمات خصوصی با mode محدود می‌سازد و سپس برنامه را دوباره راه می‌اندازد. فایل‌های رسانه با SHA-256 مشترک ذخیره می‌شوند تا هر روز ویدیوها تکثیر نشوند. نسخهٔ خصوصی تنظیمات و کلیدهای SSL هم در بکاپ جدید ذخیره می‌شود و عمومی نیست. snapshotهای کامل در /srv/ctrlz/shared/backups و latest قرار دارند. هیچ پاک‌سازی خودکار نسخه‌ها تا تعیین مقصد مستقل و سیاست نگهداری فعال نیست؛ کنترل فضای آزاد مانع ادامهٔ بکاپِ پرکنندهٔ دیسک می‌شود.

```bash
bash /srv/ctrlz/current/ops/deployment/backup.sh
```

restore.sh فقط پروژه‌های جداگانه با نام ctrlz-restore-*، دیتابیس خالی و فضای رسانهٔ خالی را قبول می‌کند؛ به Production بازنویسی نمی‌کند. checksum قبل از بازیابی بررسی می‌شود. فرمان نمونه:

```bash
CTRLZ_PROJECT=ctrlz-restore-check CTRLZ_ENV_FILE=/srv/ctrlz/shared/restore.env \
  bash /srv/ctrlz/current/ops/deployment/restore.sh /srv/ctrlz/shared/backups/TIMESTAMP
```

اول PostgreSQL همان پروژهٔ ایزوله را ایجاد کنید. پس از بازیابی تعداد رکوردها، ارتباط‌ها و SHA-256 فایل‌ها را بررسی کنید. مقصد مستقل خودکار برای بکاپ در اختیار نیست؛ بکاپ روزانهٔ همان VPS جایگزین بکاپ خارج سرور نیست.

## محدودیت امنیتی Ubuntu 20.04

پشتیبانی استاندارد 20.04 در مه 2025 پایان یافته است و این سرور به Ubuntu Pro متصل نیست. نصب Docker جدید مشکل پشتیبانی امنیتی کرنل و بسته‌های میزبان را حل نمی‌کند. برای پشتیبانی بلندمدت، فعال‌کردن Ubuntu Pro/ESM روی همین سیستم یا ارتقای آینده لازم است. هیچ حساب یا اشتراک پولی بدون اجازه ساخته نشده است.

Docker static از APT به‌روز نمی‌شود. نسخه، checksum و service اختصاصی در /opt/ctrlz-docker و /etc/systemd/system/docker.service ثبت شده‌اند؛ مدیر باید انتشارهای امنیتی رسمی Docker را پیگیری و در پنجرهٔ نگهداری runtime را به‌روز کند. نصب‌کنندهٔ install-docker-focal.sh فقط برای نصب نخست همین سیستم است و عمداً Docker موجود را بازنویسی نمی‌کند. نصب‌کنندهٔ install-docker.sh برای مسیر Ubuntu 24.04 باقی است.

منابع: [Docker static](https://docs.docker.com/engine/install/binaries/)، [نسخه‌های Docker](https://docs.docker.com/engine/release-notes/29/)، [پشتیبانی Ubuntu 20.04](https://ubuntu.com/20-04).




پاک‌سازی دوره‌ای فقط فایل‌های موقت شناسایی‌شدهٔ آپلود در /tmp را پس از دو ساعت جمع می‌کند. timer ساعتی ctrlz-upload-cleanup.timer و اسکریپت نصب‌شدهٔ /usr/local/sbin/ctrlz-cleanup-uploads با قفل مشترک انتشار کار می‌کنند. هیچ زمان‌بندی تازه‌ای برای حذف Media دائمی فعال نشده است.
