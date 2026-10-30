# گزارش تحویل ارتقای CTRL.Z — ۲۶ مهر ۱۴۰۵ / ۱۸ اکتبر ۲۰۲۶

**وضعیت: PARTIAL.** نسخهٔ وب فارسی/انگلیسی و بک‌اند روی محیط محلی ساخته و آزمایش شده‌اند. انتشار عمومی هنوز به تکمیل محتوای واقعی، نشانی‌های اجتماعی تأییدشده، تنظیمات امن محیط تولید و بررسی استقرار با TLS و فضای کافی وابسته است. این گزارش میان نتیجهٔ آزمون و آمادگی انتشار تفاوت می‌گذارد.

## دامنهٔ تغییرات انجام‌شده

1. **زبان و جهت:** `frontend/src/i18n/` شامل فرهنگ متن UI و محتوای مرورشده، ترجیح زبان در کوکی، ترجمهٔ سمت سرور و ترجمهٔ پاسخ API است. `frontend/src/app/layout.tsx` در رندر اولیه `lang=fa/dir=rtl` و در حالت انگلیسی `lang=en/dir=ltr` تولید می‌کند. متن‌های CMS در فیلد `translations` قابل ویرایش‌اند و در غیاب ترجمه، متن اصلی نشان داده می‌شود. `category_translations` نیز عنوان دستهٔ تازه ویرایش‌شده را منتقل می‌کند. مسیر، شناسهٔ پروژه و query با تغییر زبان حفظ می‌شوند. عنوان/شرح/OG صفحه محلی شده و sitemap/robots/favicon آزمایش شده‌اند. چون URL جداگانه‌ای برای هر زبان وجود ندارد، `hreflang` جداگانه تعریف نشده است.
2. **کنترل زبان در ناوبری:** دکمهٔ زبان داخل navbar قرار دارد؛ در فارسی سمت راست و در انگلیسی سمت چپ است. کوکی یک‌ساله، وضعیت آشکار، focus، صفحه‌کلید و هدف لمسی حفظ شده‌اند. منطق و دکمهٔ تغییر تم حذف شده‌اند و سایت از سبک تیرهٔ ثابت استفاده می‌کند. `frontend/src/app/preferences.css` جهت و چیدمان صفحات را هماهنگ می‌کند.
3. **لوگو:** چهار خروجی WebP شفاف در `frontend/public/assets/brand/logo-clean-{blue,white,gold,brush}.webp` از فایل‌های `design/fix` تهیه شدند؛ تصویر منبع حذف نشده است. نسخهٔ آبی در navbar، Hero، ورود و پوستهٔ ادمین استفاده می‌شود. ابعاد، برش، alpha و حجم در `docs/asset-inspection/production-logos.json` ثبت شده‌اند. favicon تصویری جدید نیز اضافه شد. هیچ ارجاع فعال UI به تصویر لوگوی قدیمی دارای زیرنویس باقی نمانده است.
4. **سبک‌های درباره من:** کارت‌ها لینک معنایی به `/portfolio?category=<slug>` دارند. `category_slug` در آیتم‌های CMS ذخیره و هنگام ویرایش با دسته‌های واقعی اعتبارسنجی می‌شود. نگاشت: سینمایی → `cinematic`، تیزر/تبلیغاتی → `advertising`، انیمه → `anime`، ورزشی → `sports`، ولاگ → `vlog`. دستهٔ `anime` خالی است و empty state واقعی دارد؛ برای پرکردن آن پروژهٔ جعلی ساخته نشد. URL فیلتر پس از refresh، عقب/جلو و بازگشت از جزئیات حفظ می‌شود.
5. **کارت پروژه:** لینک تمام سطح کارت، hover/focus روی ریشه، tap مستقیم و بازگشت به فیلتر اعمال شد. لایه‌های تزئینی از گرفتن رویداد pointer منع شدند. `prefers-reduced-motion` نمایان‌بودن محتوا را حفظ می‌کند.
6. **مهارت‌ها:** هر نرم‌افزار و مهارت خلاق یک کارت مستقل است؛ grid به‌ترتیب ۳/۲/۱ ستون در دسکتاپ/تبلت/موبایل دارد و همهٔ آیتم‌ها حفظ شده‌اند.
7. **رزومه:** تجربه، هر تحصیل، گواهینامه، مهارت و دستاورد در section مستقل با heading و فاصلهٔ منظم نمایش داده می‌شوند. هیچ section بیش از دو باکس اصلی ندارد و دادهٔ پویا از CMS همچنان کار می‌کند.
8. **فوتر و اجتماعی:** متن نمایشی حذف شد. فقط `SocialLink` با `verified=true`، قابل‌نمایش و URL معتبر `http(s)` بدون placeholder یا credentials در فوتر نشان داده می‌شود؛ لینک‌ها `noopener noreferrer` دارند. بنا به درخواست بازگردانی صفحهٔ تماس به نسخهٔ ۱۵ اکتبر، چهار کارت آن صفحه دوباره طبق ترتیب و دادهٔ عمومی CMS نمایش داده می‌شوند؛ مقادیر فعلی نمایشی‌اند و مالک باید پیش از انتشار عمومی آن‌ها را جایگزین کند. فیلتر تأیید فوتر تغییری نکرده است.
9. **کیفیت، امنیت و اجرا:** ارتقای DRF به `3.17.2` و Vitest به `4.1.12`، به‌روزرسانی lockfileها، اعتبارسنجی فیلدهای ترجمه، کنترل secret قوی هنگام `DEBUG=false`، snapshot جدید OpenAPI، تست‌های API/مرورگر، تست lockfile، و اصلاح اسکریپت Playwright انجام شد. تنظیم timeout/تراکنش SQLite برای رقابت هم‌زمان بهتر شد. بکاپ اولیه در `.local/production-upgrade-before.zip`، `.local/production-upgrade-before.sqlite3` و `.local/production-upgrade-postgres.dump` است؛ این مسیرها نادیده‌گرفته‌شدهٔ Git هستند.
10. **مدیریت:** مسیر واقعی پنل `/admin/login` و نقش owner با ورود، ویرایش موقت ترجمه، بازگرداندن مقدار، خروج و پاسخ 401 مهمان آزمایش شد. فرمان `create_delivery_admin --username` حساب جدید را بدون بازنویسی حساب‌های موجود و بدون چاپ رمز می‌سازد. حساب `ctrlz-delivery` در محیط محلی تست شده است. روش تعیین رمز در بخش دسترسی آمده است.

مهاجرت‌های تازه: `backend/domains/portfolio/migrations/0002_portfoliocategory_translations_and_more.py`، `resume/migrations/0005_...`، `skills/migrations/0004_...`، `site_content/migrations/0005_...` و `0006_style_category_links.py`. مدل‌ها، serializerها، seed و فرم‌های مدیریتی متناظر به‌روزرسانی شده‌اند. تغییرات صفحات در `frontend/src/features/site/` و کامپوننت‌های مشترک ناوبری/کارت و فرم قرار دارند.

## نتیجهٔ اجرا و آزمون

| بررسی | نتیجهٔ واقعی |
|---|---|
| نصب `pnpm install --frozen-lockfile` و `pnpm --dir frontend install --frozen-lockfile` | PASS |
| `uv sync --locked` | PASS |
| ESLint، TypeScript و Prettier | PASS |
| ۲۶ تست واحد فرانت‌اند با Vitest 4 | PASS |
| ۳۳ تست بک‌اند، Ruff، MyPy، `makemigrations --check` | PASS |
| `pnpm --dir frontend build` و `pnpm --dir frontend start` | PASS، پاسخ ۲۰۰ در `http://127.0.0.1:3015` |
| ۷ تست مرورگر دسکتاپ، ۲ موبایل، ۳ تماس روی build تولیدی | PASS؛ جزئیات تعاملی، مدیریت، ذخیرهٔ واقعی فرم و دسترسی مهمان پوشش داده شد |
| ماتریس responsive جاری | ۶ صفحه × ۲ زبان × عرض‌های ۳۶۰، ۳۷۵، ۷۶۸، ۱۰۲۴، ۱۴۴۰ و ۱۹۲۰؛ ۷۲ ترکیب در هر پروژهٔ مرورگر، بدون overflow یا خطای console در اجرای کامل |
| ممیزی محتوای فارسی جاری SQLite و PostgreSQL | ۰ شکاف ثبت‌شده در `docs/qa/production-upgrade/translation-gaps*.json`؛ برای متن‌های آینده fallback وجود دارد |
| `pip-audit` تولید و توسعه / `pnpm audit --prod` | ۰ آسیب‌پذیری شناخته‌شده در بررسی جاری |
| Docker Desktop و Compose توسعه | پس از رفع اتصال معلق VHD در WSL، Docker بالا آمد؛ هر دو تصویر ساخته و چهار سرویس سالم شدند؛ migration/seed و health پاسخ درست دادند |
| تصاویر Compose تولیدی | هر دو تصویر `ctrlz-backend:production` و `ctrlz-frontend:production` ساخته شدند؛ فرانت‌اند تولیدی موقتاً روی پورت ۳۰۱۶ شروع شد، ده مسیر/asset و SSR انگلیسی پاسخ ۲۰۰ داد و تست تعاملی سبک‌ها گذشت؛ Gunicorn تولیدی نیز با secret موقت قوی روی پورت ۸۰۱۶ به health/content پاسخ ۲۰۰ داد؛ هر دو کانتینر موقت سپس جمع شدند |
| حساب تحویل Docker | `ctrlz-delivery` روی PostgreSQL محلی ایجاد شد؛ ورود، ویرایش موقت ترجمه و بازگرداندن آن، خروج و 401 مهمان در Playwright پاس شد |

بازبینی ۱۸ اکتبر پس از بازگردانی Contact: تصویر Docker فرانت‌اند دوباره ساخته شد؛ ۸ آزمون مرورگر دسکتاپ/موبایل شامل ماتریس شش صفحه، تغییر زبان، لینک‌ها، focus، reduced motion و خطای شبیه‌سازی‌شدهٔ فرم پاس شد. چهار کارت `/contact` در فارسی و انگلیسی نمایش داده شدند. اعتبارسنجی، موفقیت و reset فرم در هر دو زبان با POST رهگیری‌شده در مرورگر پاس شد؛ در این بازبینی پیام واقعی ارسال نشد. Docker یک بار در زمان آزمون خاموش شد؛ پس از اجرای مجدد Compose همین ۸ آزمون پاس شدند.

اسکرین‌شات‌های قدیمی ۴۸ حالت منتخب (شش صفحه، هر دو زبان/تم، عرض ۳۷۵ و ۱۴۴۰) در `docs/qa/production-upgrade/` برای ثبت تاریخچه هستند؛ حالت روشن آن‌ها دیگر در برنامه وجود ندارد. اسکرین‌شات‌های جاری با سبک تیرهٔ ثابت و دکمهٔ زبان در navbar با نام‌های `fa-fixed` و `en-fixed` ثبت شده‌اند. اندازه‌گیری محلی مرورگر پیش از حذف تم: LCP صفحهٔ خانه ۱۳۱۲ میلی‌ثانیه و CLS آن ۰٫۰۰۰۳ بود؛ برای سایر صفحات LCP از ۲۷۲ تا ۵۶۰ میلی‌ثانیه و CLS از ۰٫۰۰۴۶ تا ۰٫۰۷۶۹. این سنجش دسکتاپ بدون throttling است و امتیاز Lighthouse یا نتیجهٔ اینترنت عمومی محسوب نمی‌شود.

### ۱۳ معیار پذیرش

| شماره | وضعیت | شاهد/محدودیت |
|---|---|---|
| ۱ | PASS | HTML اولیهٔ فارسی/RTL، شش مسیر و محتوای محلی در ماتریس مرورگر |
| ۲ | PASS | تغییر انگلیسی در مسیر داخلی، حفظ URL/فیلتر و refresh |
| ۳ | PASS | بازگشت فارسی/RTL و متن‌های Bidi |
| ۴ | PASS | کنترل زبان داخل navbar، راست در فارسی و چپ در انگلیسی، در عرض‌های آزمایش‌شده |
| ۵ | PASS | منطق تغییر تم حذف شد؛ سبک تیرهٔ ثابت و hydration بدون خطای ثبت‌شده |
| ۶ | PASS | دارایی‌های لوگوی جدید و alpha ثبت‌شده؛ هیچ لوگوی فعال با زیرنویس قدیمی |
| ۷ | PASS | کلیک همهٔ سبک‌ها، deep link، empty state انیمه و حفظ فیلتر |
| ۸ | PASS | لبه/مرکز/متن/تصویر کارت، hover، keyboard، touch و بازگشت |
| ۹ | PASS | تمام ۶+۷ مهارت؛ ۳/۲/۱ ستون بدون overflow |
| ۱۰ | PASS | sectionهای جدا، حداکثر دو باکس اصلی |
| ۱۱ | PARTIAL پس از بازگردانی تماس | فوتر لینک تأییدنشده را پنهان می‌کند؛ چهار کارت تماسِ نسخهٔ ۱۵ اکتبر با مقدارهای نمایشی دوباره دیده می‌شوند و به دادهٔ واقعی مالک نیاز دارند |
| ۱۲ | PASS در محیط محلی | build و startup تولیدی Windows و تصویر Docker، مسیرها، PDF، API و ورود/خروج ادمین روی SQLite و PostgreSQL تست شد؛ انتشار عمومی بررسی نشده است |
| ۱۳ | BLOCKED | یک advisory سطح high فقط در زنجیرهٔ ابزار توسعه باقی است و نسخهٔ اصلاح‌شدهٔ `braces` منتشر نشده؛ استقرار عمومی نیز به کارهای مالک و زیرساخت وابسته است |

تست تعاملی کوتاهی که هم‌زمان با build پرمصرف Docker دوباره اجرا شد، یک بار به‌علت timeout اتصال API صفحهٔ خطا را دید. پس از پایان build همان سناریو روی preview ویندوز در ۳۸٫۱ ثانیه و تصویر تولیدی Docker در ۲۳٫۳ ثانیه **دوباره پاس شد**. شکست گذرا در `.local/upgrade-final-targeted-e2e.log` و تکرارهای موفق در `.local/upgrade-final-style-e2e.log` و `.local/upgrade-docker-production-style-e2e.log` ثبت شده است.

## امنیت، محتوا و موارد باقی‌مانده

- audit نهایی فرانت‌اند با تمام dependencyها **یک high در dependency توسعه** نشان می‌دهد: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces@3.0.3`، شناسهٔ [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). advisory فعلاً نسخهٔ patch ندارد. اجرای lint فقط روی الگوهای ثابت و مخزن مورد اعتماد انجام شود؛ پس از انتشار نسخهٔ رسمی، lockfile به‌روز و audit تکرار شود. بسته‌های runtime در audit صفر مورد دارند. DRF و Vitest آسیب‌پذیر اصلاح شدند.
- `.env` فعلی برای توسعه است و secret آن برای `DEBUG=false` پذیرفته نمی‌شود. پیش از استقرار عمومی، secret تصادفی قوی، `ALLOWED_HOSTS` و originهای واقعی، HTTPS/TLS، cookieهای امن، S3 پشتیبانی‌شده و نسخهٔ پشتیبان/بازیابی عملیاتی تنظیم شوند. `python backend/manage.py check --deploy` با secret موقت قوی و تنظیمات HTTPS، بدون هشدار گذشت؛ این جای آزمون TLS واقعی را نمی‌گیرد.
- رکوردهای seed شامل داده، ایمیل، معیار، ویدئو و PDF نمایشی‌اند؛ مالک باید آنها را از پنل با اطلاعات واقعی جایگزین و `demo_mode` را خاموش کند. **هیچ آدرس موجود تأیید نشده است**؛ مالک باید ایمیل و URLهای واقعی تلگرام، اینستاگرام و یوتیوب را در `/admin/socials` بازبینی، اصلاح و `verified` کند. تا آن زمان بخش خالی در سایت عمومی نمایش داده نمی‌شود.
- ساخت تمیز MinIO از source در این ماشین به‌دلیل دریافت ماژول‌های upstream تأیید نشده است. Docker توسعه از تصویر موجود `linepack/minio:RELEASE.2025-10-15T17-29-55Z` استفاده می‌کند؛ منشأ آن و جایگزین S3 برای Production باید توسط مالک بررسی شود. Compose تولیدی پشت Nginx/TLS و اتصال واقعی storage هنوز آزمون انتهابه‌انتها نشده است.
- در پایان آزمون فقط حدود **۰٫۴۹ گیگابایت** فضای آزاد درایو D باقی بود. با وجود موفقیت buildها، پیش از build بعدی یا نگهداری پایگاه داده باید فضای بیشتری فراهم شود. کش بلااستفادهٔ Docker پاک شد؛ volumeها و داده‌های پروژه‌های دیگر دست‌نخورده ماندند.
- مخزن هنگام شروع این کار فایل‌های untracked داشت. این تغییرات commit/push یا روی اینترنت deploy نشده‌اند. تصاویر و داده‌های اصلی پاک نشدند. `.local/` و داده‌های حساس خارج از نسخه‌بندی‌اند.

## فرمان‌های اجرا، مهاجرت و بازیابی

در PowerShell داخل ریشهٔ مخزن، برای توسعهٔ مستقل از Docker:

```powershell
pnpm install --frozen-lockfile
pnpm --dir frontend install --frozen-lockfile
uv sync --project backend --locked --python 3.12
$env:POSTGRES_HOST = ''
$env:S3_ENDPOINT_URL = ''
uv run --project backend --locked python backend/manage.py migrate
uv run --project backend --locked python backend/manage.py runserver 127.0.0.1:8000
```

در پنجرهٔ دوم `pnpm --dir frontend dev` و سپس `http://127.0.0.1:3000`. برای build تولیدی مستقل: `pnpm --dir frontend build` و `pnpm --dir frontend start`. در این تحویل preview تولیدی با API روی `127.0.0.1:8015` و وب روی `127.0.0.1:3015` اجرا و تأیید شد. کش موقت `.next` به یک junction در ریشهٔ visualizations درایو C منتقل شده تا فشار درایو D کاهش یابد؛ هنگام build روی همین checkout مقدار `NODE_PATH=D:\MY_PROJECT\Portfolio_ctrlz\frontend\node_modules` لازم است. checkout تازه این تنظیم ویژه را نمی‌خواهد.

برای Compose توسعه: `docker compose build backend frontend` و `docker compose up -d --no-build`. این چهار سرویس در تحویل سالم‌اند. health بک‌اند: `http://127.0.0.1:8000/api/v1/health/`؛ وب: `http://127.0.0.1:3000`؛ کنسول MinIO فقط لوکال: `http://127.0.0.1:9001`. برای profile تولیدی پس از تنظیم secret و TLS/storage: `docker compose -f docker-compose.prod.yml build backend frontend` و سپس `docker compose -f docker-compose.prod.yml up -d --no-build`. build هر دو تصویر انجام شد؛ فرانت‌اند تولیدی موقتاً روی پورت ۳۰۱۶ و Gunicorn تولیدی روی ۸۰۱۶ شروع و تست شدند. Nginx نمونه روی `127.0.0.1:8080` است؛ **کل profile با TLS و storage تولیدی هنوز تأیید نشده است.**

پیش از هر rollback، سرویس‌های همین پروژه را متوقف و از دادهٔ فعلی نسخهٔ تازه تهیه کنید. بکاپ‌های قبل از تغییر در `.local/` ذکر شده‌اند؛ بازگرداندن `pg_restore --clean` یا فایل SQLite دادهٔ فعلی را جایگزین می‌کند و فقط باید با تصمیم آگاهانهٔ مالک اجرا شود. فایل‌های S3/MinIO به بکاپ جدا نیاز دارند. برای عیب‌یابی: `docker compose ps`، `docker compose logs --tail 100 backend frontend`، `docker compose exec backend python manage.py showmigrations` و آزمون health بالا. اگر Docker خطای اتصال ماندهٔ VHD داد، ابتدا از خروج امن Docker و `wsl --shutdown` پس از بسته‌شدن آن استفاده کنید؛ volumeها را حذف نکنید.

## دسترسی تحویل

به‌روزرسانی ۱۸ اکتبر برای Hero و ورود: کاراکترهای درباره من و مهارت‌ها با عرض داخل ستون و `object-fit: contain` نمایش داده می‌شوند؛ هر دو زبان در عرض‌های ۳۹۰، ۱۰۲۴ و ۱۴۴۰ بدون overflow بررسی شدند. ورود اکنون سؤال تصادفی جمع/تفریق با جواب ۰ تا ۱۰۰ دارد؛ سؤال در پایگاه داده نگهداری می‌شود، پنج دقیقه اعتبار دارد، فقط یک بار قابل استفاده است و پس از تلاش ناموفق عوض می‌شود. ارقام فارسی/عربی نیز پذیرفته می‌شوند. migration جدید `accounts/0003_loginchallenge.py` و snapshot OpenAPI اعمال شدند.

اعتبارسنجی این تغییر: ۳۴ تست بک‌اند، ۲۶ تست فرانت‌اند، ESLint، TypeScript، Prettier، Ruff، MyPy، بررسی migration و build تولیدی پاس شدند. دو تست مرورگر سؤال امنیتی روی موبایل/دسکتاپ و ورود/خروج واقعی حساب تحویل روی PostgreSQL Docker پاس شدند. سرویس‌های Compose محلی سالم‌اند. رمز حساب `ctrlz-delivery` در Docker برای تحویل مجدد تعیین و فقط در گفت‌وگو ارائه شد؛ رمز در فایل پروژه ذخیره نشده است. رمز SQLite مستقل است. preview قبلی پورت ۳۰۱۵ برای رفع قفل build متوقف شد؛ نشانی فعال فعلی پورت ۳۰۰۰ است.

- **Public / Local Site URL:** `http://127.0.0.1:3000/` (Compose محلیِ فعال و سالم)؛ preview build تولیدی مستقل: `http://127.0.0.1:3015/`.
- **Admin Panel URL:** `http://127.0.0.1:3000/admin/login`؛ preview مستقل: `http://127.0.0.1:3015/admin/login`.
- **Admin Username:** `ctrlz-delivery` در هر دو محیط محلی SQLite و PostgreSQL Docker. حساب قدیمی `ctrlz-admin` دست‌نخورده مانده است.
- **Admin Password:** رمز تازهٔ حساب Docker در گفت‌وگوی تحویل داده شد و در فایل‌ها ذخیره نشده است. برای تعیین رمز دلخواه در SQLite محلی: `$env:POSTGRES_HOST=''; $env:S3_ENDPOINT_URL=''; .\.venv\Scripts\python.exe backend\manage.py changepassword ctrlz-delivery`. برای حساب Compose: `docker compose exec backend python manage.py changepassword ctrlz-delivery`. این فرمان‌ها رمز را با ورودی پنهان می‌گیرند.
- **Production Readiness:** `PARTIAL` تا تکمیل کارهای امنیت، محتوا، اجتماع و استقرار واقعی بالا.
