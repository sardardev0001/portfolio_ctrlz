# گزارش ارتقای مدیریت و چندزبانهٔ CTRL.Z

تاریخ: ۱۸ اکتبر ۲۰۲۶ — وضعیت پذیرش طبق تعریف سند: **PARTIAL**. پیاده‌سازی و آزمون‌های خودکار انجام شده‌اند؛ تست عملی با صفحه‌خوان و Firefox هنوز اجرا نشده است.

**به‌روزرسانی پس از تحویل اولیه:** بنا به درخواست بعدی کاربر، دکمهٔ تغییر تم و منطق تم روشن از سایت عمومی، ورود و پنل مدیریت حذف شد. ظاهر فعلی فقط تم تیره است. نتیجه‌ها و اسکرین‌شات‌های مربوط به دو تم در جدول و پوشهٔ QA پایین، سابقهٔ آزمون پیش از این تغییر هستند.

برای این تغییر، `ThemeToggle` از provider و چهار جایگاه هدر عمومی، نوار مدیریت، ورود و تنظیمات برداشته شد. خواندن/نوشتن `ctrlz-theme`، state تم، attribute مربوط در HTML، متن‌های ترجمهٔ دکمه و CSS روشن حذف شدند. گزینهٔ تغییر زبان همچنان کار می‌کند. بعد از اصلاح، `pnpm lint`، `pnpm typecheck`، `pnpm test` (**۴۱ آزمون**) و `pnpm build` موفق بودند؛ هر دو تصویر development و production frontend نیز ساخته شدند. smoke مرورگر روی **۱۶ حالت** مسیر عمومی/ورود، دو زبان و دو عرض صفحه موفق بود و cookie قدیمی روشن را بی‌اثر نشان داد. این نتیجه‌ها مربوط به نسخهٔ فعلی‌اند.

## محدوده و حفظ داده

ساختار Next.js 16 / React 19 و Django 5.2 / DRF حفظ شد. بررسی اولیهٔ مسیرها، مدل‌ها و لوگو در `docs/ADMIN_I18N_AUDIT.md` ثبت شده است. مخزن از ابتدا فایل‌های برنامه را untracked نشان می‌داد؛ هیچ reset، حذف محتوای قبلی یا commit انجام نشد. فایل‌های لوگوی اصلی و مرجع‌های `design/` تغییر نکردند.

آزمون‌های نوشتنی مرورگر در backend و PostgreSQL جداگانهٔ QA و با حساب موقت انجام شدند. پروژه، رزومه و تنظیمات آزمایشی وارد دیتابیس اصلی سایت نشدند. حساب‌های موقت اجرای E2E در پایان runner حذف می‌شوند.

## ۱. مودال‌های مدیریت

تمام ایجاد/ویرایش‌های مبتنی بر registry مشترک اکنون از `EditorDialog` مرکزی استفاده می‌کنند: پروژه، دسته‌بندی پروژه، دسته‌بندی مهارت، مهارت، سابقه، تحصیلات، گواهی، دستاورد، hero، بخش محتوا، آمار محتوایی، شبکه اجتماعی، رسانه، گالری و کاربر. تنظیمات/پروفایل singleton و فقط قابل ویرایش‌اند. برای پیام‌ها دکمهٔ افزودنِ ناسازگار با API حذف شد؛ audit فقط خواندنی است. رزومه‌ها مودال آپلود مستقل دارند.

Dialog بومی مرورگر با `showModal`، عنوان دسترس‌پذیر، `aria-modal`، focus trap و بازگرداندن focus استفاده می‌شود. اسکرول پس‌زمینه حتی در دیالوگ تودرتوی تأیید خروج قفل می‌شود؛ شمارندهٔ قفل از باقی‌ماندن اسکرول قفل‌شده پس از خروج جلوگیری می‌کند. Esc، backdrop و انصراف برای فرم تغییرکرده، هشدار خروج نمایش می‌دهند. هنگام ارسال، بستن فرم مسدود است. انیمیشن fade/scale کوتاه، reduced motion و اسکرول داخلی فرم طولانی لحاظ شده‌اند. حذف رکورد دیالوگ تأیید جدا دارد.

## ۲. ویدیوی پروژه

در `/admin/portfolio`، افزودن یا ویرایش پروژه را باز کنید؛ بخش «آپلود ویدیوی پروژه» انتخاب فایل، بررسی metadata، پیش‌نمایش، درصد پیشرفت، تعویض و حذف دارد. پس از تأیید فایل توسط سرور، ذخیرهٔ فرم، شناسهٔ ویدیوی معتبر را به همان پروژه متصل می‌کند.

محدودیت قطعی:

| مورد | سیاست |
|---|---|
| حجم ویدیو | از ۱ تا **۲۰۰٬۰۰۰٬۰۰۰ بایت**؛ MB ده‌دهی |
| مدت | **۳۰ تا ۱۲۰ ثانیه، شامل هر دو مرز** |
| MP4 | امضای MP4، container معتبر، H.264 با `yuv420p`؛ صدای اختیاری AAC |
| WebM | امضای EBML، container معتبر، VP8/VP9؛ صدای اختیاری Opus/Vorbis |
| پاسخ اندازهٔ نامعتبر | `413` و `VIDEO_TOO_LARGE` |
| پاسخ مدت/نوع نامعتبر | `422` و `VIDEO_DURATION` / `VIDEO_TYPE` |
| نبود ابزار بررسی | `503`؛ آپلود پذیرفته نمی‌شود |

مرورگر نوع، حجم و مدت را پیش از ارسال بررسی می‌کند. سرور مستقل از مرورگر با `ffprobe` امضا، container، codec، ابعاد و مدت را بررسی می‌کند. پسوند یا MIME اعلام‌شده به‌تنهایی ملاک پذیرش نیست. [مستندات رسمی ابزار](https://ffmpeg.org/ffprobe.html) مبنای خواندن اطلاعات container و stream بوده است.

فایل ابتدا در فایل موقت سیستم بررسی و در `finally` حذف می‌شود. handler جریان آپلود، عبور از حد را مستقل از Content-Length متوقف و فایل نیمه‌کارهٔ handler بعدی را فوراً پاک می‌کند. تنها فایل پذیرفته‌شده وارد storage و `MediaAsset` می‌شود. flag اعتبارسنجی و مدت از API مدیریت قابل جعل نیستند؛ اتصال ویدیوی قدیمیِ بررسی‌نشده به پروژهٔ جدید رد می‌شود. رسانهٔ قبلیِ متصل به پروژهٔ موجود حذف یا قطع نمی‌شود؛ برای استفادهٔ جدید باید دوباره آپلود شود.

سقف کل درخواست در Next proxy و Nginx برابر ۲۰۱٬۰۰۰٬۰۰۰ بایت است تا سربار multipart جا داشته باشد؛ حد خود فایل همچنان ۲۰۰٬۰۰۰٬۰۰۰ بایت است. timeoutهای proxy، Nginx و Gunicorn برای مسیر آپلود هماهنگ شده‌اند.

ویدیو در `/portfolio/{slug}` با `controls`، `playsInline`، poster و بدون autoplay نمایش داده می‌شود. رسانهٔ واقعی پروژه و range response استفاده می‌شود؛ حذف ویدیو، بخش player را حذف می‌کند و خطای پخش پیام ترجمه‌شده دارد.

## ۳. نگهداری رسانه

در توسعهٔ مستقیم، فایل نهایی زیر `backend/uploads/assets/` با نام UUID ذخیره می‌شود. در Compose، storage موجود S3/MinIO و کلید `assets/{uuid}.{extension}` استفاده می‌شود. هیچ کلید دسترسی در فرانت‌اند ذخیره نشده است.

ویدیوی جایگزین/رزومهٔ آپلودشده توسط فرم مشترک، usage داخلی `managed-project-video` / `managed-resume` دارد. فایل قبلی پس از commit، فقط در صورت نداشتن مرجع دیگر پاک می‌شود. بستن فرم، آپلود جدید استفاده‌نشده را پاک می‌کند. باقی‌ماندهٔ ناشی از بسته‌شدن مرورگر پس از ۲۴ ساعت، هنگام آپلود بعدی پاک‌سازی می‌شود؛ فرمان زیر نیز پاک‌سازی دسته‌ای دارد:

```powershell
docker compose exec -T backend python manage.py cleanup_uploads
```

رسانه‌های قدیمی/کتابخانه و فایل‌های دارای مرجع از این پاک‌سازی خودکار مستثنا هستند. حذف مستقیم رسانهٔ در حال استفاده رد می‌شود. آپلود مدیریتی احراز هویت، نقش مناسب و CSRF می‌خواهد؛ رسانهٔ آپلودشدهٔ بدون مرجع، عمومی نیست.

## ۴. زبان، محتوا و جهت

زبان سایت و پنل مشترک است و در cookie سالانهٔ `ctrlz-locale` ذخیره می‌شود. انتخاب از هدر سایت، هدر پنل، صفحهٔ ورود یا داخل مودال ممکن است. refresh سروری، URL، احراز هویت، cache و state فرم باز را حفظ می‌کند. `lang` و `dir` در HTML اولیه تعیین می‌شوند. سایدبار فارسی راست و انگلیسی چپ است؛ جداول، فرم‌ها، مودال، آیکون جهت‌دار و alignment با زبان هماهنگ می‌شوند.

مدل‌های محتوایی قبلاً JSON ترجمه داشتند؛ همان مدل سازگار حفظ و فرم‌های FA/EN قابل‌ویرایش برای متن‌ها، کارت‌های محتوا و برچسب‌ها اضافه شد. فیلد خالی از متن اصلی استفاده می‌کند؛ تعداد فیلدهای ترجمه‌نشده در accordion مشخص است. محتوای اختصاصی کاربر خودکار ترجمه نمی‌شود. ترجمه‌های موجود و متن‌های اصلی حفظ شده‌اند. شناسه‌ها، URLها، وضعیت‌ها و نوع مهارت هنگام localize تغییر نمی‌کنند؛ وضعیت‌ها فقط در UI ترجمه می‌شوند.

پیام‌های جدید در `i18n/messages.ts` کلیدهای معنایی دارند؛ dictionaryهای قبلی برای سازگاری حفظ شده‌اند. نام فیلدها/ستون‌ها و enumهای پنل هم ترجمه دارند. کلید ناموجود ثبت می‌شود و در development هشدار می‌دهد. قاعدهٔ lint `ctrlz/localized-jsx` از متن ثابت جدید در JSX و placeholder/aria-label جلوگیری می‌کند؛ تست registry پوشش همهٔ labelها و optionها را بررسی می‌کند.

اعداد مهم، درصدها، حجم و تاریخ با locale نمایش داده می‌شوند. ایمیل، URL، نام فایل و داده‌های دو جهتی isolation یا جهت مناسب دارند. تم فعلی ثابت و تیره است؛ cookie قدیمی تم خوانده نمی‌شود.

## ۵. اسکرول‌بار و سایدبار

قواعد سراسری WebKit/Chromium و Firefox برای root، جدول، sidebar و dialog اعمال شده‌اند؛ thumb گرد، hover، کنتراست تم تیره و fallback طبیعی دارند. scrollbar پنهان نشده است. `scrollbar-gutter` جابه‌جایی عرض را محدود می‌کند.

اسکرول مستقل سایدبار در `sessionStorage` نگهداری و پس از remount بازیابی می‌شود. active و `aria-current="page"` برای زیرمسیرها و aliasهای موجود لحاظ شده‌اند. آیتم خارج viewport فقط به حد لازم آشکار می‌شود. sidebar در موبایل به ناوبری بالای صفحه با ارتفاع محدود و اسکرول مستقل تبدیل می‌شود. پروژه از قبل حالت collapse قابل تنظیم نداشت؛ گزینهٔ نمایشیِ بی‌عمل اضافه نشده است.

## ۶. آمار واقعی

`POST /api/v1/analytics/` رویداد صفحه، پروژه و شبکهٔ اجتماعیِ منتشرشده/تأییدشده را می‌گیرد. شمارش پروژه از GET محتوا حذف شد تا SSR/prefetch آمار نسازد. دانلود رزومه در endpoint واقعی و جداگانهٔ هر زبان و ثبت فرم تماس در سرور شمارش می‌شود. HEAD دانلود شمرده نمی‌شود.

دادهٔ ذخیره‌شده، شمارش روزانه بر حسب نوع/کلید است. بازدیدکنندهٔ یکتا ادعا یا نمایش داده نمی‌شود. دادهٔ شخصی، ایمیل یا fingerprint برای تحلیل ذخیره نمی‌شود. توکن نشست مرورگر فقط در `sessionStorage` است؛ در backend فقط HMAC کوتاه‌عمر برای حذف تکرار ۳۰ثانیه‌ای ثبت می‌شود. DNT/GPC رعایت و رفتار در footer توضیح داده شده است. CSRF، محدودسازی نرخ و اعتبارسنجی مقصد از ثبت دلخواه جلوگیری می‌کنند.

`GET /api/v1/admin/analytics/` فقط برای staff مجاز است. فیلتر ۷/۳۰/۹۰ روز، بازهٔ سفارشی ۱ تا ۳۶۶ روز، reset، KPI، نمودار با مقدار واقعی و گزارش صفحه/پروژه/رزومه/شبکه دارد. timezone، `Asia/Tehran` و مرز روزها inclusive است. دادهٔ تاریخی ثبت‌نشده بازسازی یا جعل نمی‌شود؛ empty state ترجمه‌شده نمایش داده می‌شود. شمارش‌های قدیمی موجود حفظ شده‌اند و روش ثبت جدید، آن‌ها را بازنویسی نمی‌کند.

## ۷. تنظیمات

`/admin/settings` بخش عمومی و سئو، ترجیحات نمایش و حساب/امنیت دارد. ویرایش برند، شعار، توضیح، ایمیل، URL و demo mode به singleton PATCH واقعی متصل است. مقادیر پس از refresh باقی می‌مانند؛ description در metadata عمومی و ایمیل در محتوای سایت منعکس می‌شود. کنترل زبان persistence واقعی دارد. مدیریت حساب و رمز به بخش موجود کاربران با مجوز owner متصل شده است. integration، upload لوگوی نمایشی یا تنظیم امنیتی بدون backend اضافه نشده است.

## ۸. دو رزومه

در `/admin/resume-files` دو کارت مستقل FA و EN وجود دارد. هرکدام نام، حجم، تاریخ، وضعیت، پیش‌نمایش مدیریتی، جایگزینی و حذف خود را دارند. **فقط PDF غیرخالی تا ۱۰٬۰۰۰٬۰۰۰ بایت** مجاز است؛ حد ویدیو به رزومه اعمال نمی‌شود.

Migration، فایل قبلی را با زبان خالی حفظ می‌کند. این موارد در فهرست جداگانهٔ «زبان نامشخص» قابل پیش‌نمایش و تخصیص صریح زبان‌اند؛ خودکار به دو جایگاه کپی نشده‌اند. constraint دیتابیس فقط یک فایل برای هر زبان اجازه می‌دهد.

صفحهٔ عمومی `/resume` فقط فایل زبان فعال را انتخاب می‌کند. endpointهای `/api/v1/resume/fa/download/` و `/api/v1/resume/en/download/` نام و MIME دانلود درست دارند. نبود فایل همان زبان، پیام روشن و 404 دارد و هیچ fallback به زبان دیگر انجام نمی‌شود.

## ۹. favicon

مرجع تاج همان لوگوی طلایی موجود است؛ outline برداری از همان فرم تاج بازسازی شد. لوگوی اصلی عوض نشد. `favicon.svg` و اندازهٔ ۱۸۰ دارای تاج غالب و «کنترل زد» هستند. نسخهٔ ۳۲ نیز همین ترکیب را دارد؛ نسخهٔ ۱۶ به دلیل ناخوانایی نوشته، فقط همان تاج را نشان می‌دهد. خروجی PNG، SVG، apple-touch و manifest به metadata متصل‌اند. iconهای قدیمی framework جایگزین شده‌اند و URLها نسخهٔ cache دارند. اسکریپت بازتولید `frontend/scripts/generate-brand-favicon.mjs` است.

## فایل‌ها و migrationهای اصلی

| بخش | مسیرها |
|---|---|
| مودال/پنل | `frontend/src/components/ui/EditorDialog.tsx`؛ `features/admin/{AdminApp,ResourcePage,FieldInput,TranslationsEditor,VideoUpload,ResumeFiles,Settings,Analytics,Dashboard,Login}.tsx` و `resources.ts` |
| i18n و UI | `frontend/src/i18n/{core,provider,server,messages}.ts*`، `admin.json`، `columns.json`؛ `src/app/admin-upgrade.css` و `layout.tsx` |
| سایت | `Nav.tsx`، `Counter.tsx`، `PublicShell.tsx`، `ProjectVideo.tsx`، صفحهٔ جزئیات پروژه، `ResumePage.tsx`، `Skills.tsx`، `ResumePanels.tsx`، `Home.tsx`، `Portfolio.tsx`، `Contact.tsx`، `ContactMessageForm.tsx` و `SocialContactCard.tsx` |
| API فرانت | `src/lib/{api,media-upload,analytics}.ts`؛ `src/app/api/v1/[...path]/route.ts` و `src/types/api.ts` |
| سرور | `backend/core/{views,serializers,services,responses}.py`؛ `config/{settings,urls}.py`؛ `domains/media/{models,services,validation,upload_handlers,cleanup}.py` و فرمان `cleanup_uploads`؛ `domains/analytics/{models,services}.py`؛ `domains/resume/models.py` |
| Migration | `media/0002_mediaasset_duration_seconds_and_more.py`؛ `resume/0006_resumefile_language_and_more.py`؛ `analytics/0002_alter_dailymetric_kind.py` |
| زیرساخت/ابزار | `backend/Dockerfile`، `docker-compose.prod.yml`، دو فایل Nginx، `next.config.ts`، `scripts/start.mjs`، ESLint rule/config، ignoreها و README |
| تست | `backend/tests/test_admin_i18n_upgrade.py` و اصلاح قراردادهای تست قبلی؛ `media-upload.test.ts`، `resources.test.ts`، تست i18n؛ `e2e/admin-upgrade.spec.ts` و runner `scripts/verify-admin-upgrade.mjs` |
| دادهٔ نمایشی | `demo-preview-30.webm` جدا از فایل نمایشی کوتاه قبلی؛ seed جدید فقط از نسخهٔ معتبر استفاده می‌کند |

## اجرای محلی و صفحات

در مسیر `D:\MY_PROJECT\Portfolio_ctrlz`:

```powershell
docker compose build backend frontend
docker compose up -d --no-deps backend frontend
docker compose exec -T backend python manage.py migrate
```

این فرمان از سرویس‌های موجود PostgreSQL/MinIO استفاده می‌کند. برای نصب تازه، روش کامل README شامل آماده‌سازی storage لازم است. برای توسعهٔ مستقیم، `ffprobe` باید روی PATH باشد یا `FFPROBE_BINARY` به فایل اجرایی آن اشاره کند. Docker آن را نصب می‌کند. اگر پوشهٔ `.next` محلی junction قدیمی است، `NEXT_BUILD_DIR` یک پوشهٔ خروجی مستقل در frontend تعیین می‌کند؛ build و start هر دو این متغیر را پشتیبانی می‌کنند.

صفحات آزمایش: `http://127.0.0.1:3000/`، `/admin/portfolio`، `/admin/resume-files`، `/admin/analytics`، `/admin/settings` و `/portfolio/{slug}`. از حساب مدیریت فعلی استفاده کنید؛ رمز حساب موجود تغییر نکرده است.

## نتایج واقعی و محدودیت‌ها

| بررسی | نتیجهٔ نهایی | شاهد |
|---|---|---|
| Django/DRF و قراردادهای جدید | **PASS:** ۵۱ آزمون؛ ۱ skip مربوط به نبود مسیر frontend در image مستقل backend | `.local/admin-upgrade-backend-post-deploy-tests.log`؛ همان قرارداد ترجمه در آزمون‌های frontend پوشش داده شده است |
| Frontend unit/i18n | **PASS:** ۴۱ آزمون در ۸ فایل | `.local/admin-upgrade-unit-final.log` |
| Playwright قابلیت‌های جدید، دسکتاپ | **PASS:** ۶ آزمون | `.local/admin-upgrade-e2e-final-desktop.log` |
| Playwright قابلیت‌های جدید، موبایل | **PASS:** ۶ آزمون | `.local/admin-upgrade-e2e-final-mobile.log` |
| اصلاح آخر مسیر `/admin/portfolio/new` | **PASS:** ۲ آزمون دسکتاپ/موبایل روی image نهایی production | `.local/admin-upgrade-e2e-final-flash.log` |
| Playwright مسیرهای قدیمی سایت | **PASS:** ۱۲ آزمون | `.local/admin-upgrade-legacy-public-final-e2e.log` |
| TypeScript / ESLint / Ruff / mypy | **PASS:** بدون خطا؛ mypy روی ۸۹ فایل | `.local/admin-upgrade-typecheck-final.log`، `admin-upgrade-final-lint.log`، `admin-upgrade-ruff-final.log`، `admin-upgrade-mypy-final.log` |
| ساخت Docker development و production | **PASS:** backend و frontend؛ دستور اجرای Next در تصویر development بدون وابستگی به دانلود زمان اجرا اصلاح و دوباره ساخته شد | `.local/admin-upgrade-backend-final-build.log`، `admin-upgrade-frontend-dev-start-fix-build.log`، `admin-upgrade-production-frontend-dockerfile-final.log` |
| migration و OpenAPI | **PASS:** `makemigrations --check --dry-run` بدون تغییر؛ schema بدون هشدار | `.local/admin-upgrade-migration-check.log`، `admin-upgrade-schema.log` |
| Nginx و مرز آپلود | **PASS:** `nginx -t`؛ پاسخ ۴۱۳ ساخت‌یافته از proxy و Next؛ range ویدیوی قبلی ۲۰۶ | `.local/admin-upgrade-nginx-check.log`، `admin-upgrade-edge-smoke.log` |
| Smoke استک محلی پس از اعمال تصویرها | **PASS:** مسیرهای عمومی FA/EN، مدیریت، favicon، manifest و health بدون خطای صفحه | `.local/admin-upgrade-main-smoke-final.log` |
| بررسی واقعی صفحه‌خوان | **NOT RUN:** صفحه‌خوان قابل کنترل در این محیط در دسترس نبود | ساختار ARIA و ناوبری صفحه‌کلید در تست مرورگری بررسی شده‌اند |
| بررسی واقعی Firefox | **NOT RUN:** مرورگر Firefox این محیط در دسترس نبود | قواعد CSS آن پیاده شده، ولی رندر واقعی تایید نشده است |

آزمون‌های نوشتنی Playwright روی PostgreSQL و backend جداگانهٔ QA انجام شدند؛ لاگ‌های بالا حساب و دادهٔ واقعی سایت را به عنوان fixture تغییر نداده‌اند. اسکرین‌شات‌های حالت‌های ۳۹۰، ۷۶۸ و ۱۴۴۰ پیکسل، دو تم و دو زبان در `docs/qa/admin-i18n-upgrade/` ثبت شده‌اند. نخستین اجراهای ناموفقِ هنگام توسعه در `.local` نگه داشته شده‌اند؛ جدول فقط نتیجهٔ اجرای موفق پس از اصلاح را نشان می‌دهد.

دستورهای اجراشده برای نتیجه‌های اصلی:

```powershell
docker compose build backend frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose up -d --no-deps backend frontend
docker compose exec -T backend python -m pytest -q
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir frontend test
# QA_CONTAINER و BASE_URL به backend و frontend جداگانهٔ QA اشاره داشتند.
node frontend/scripts/verify-admin-upgrade.mjs --project=chromium
node frontend/scripts/verify-admin-upgrade.mjs --project=mobile
node frontend/scripts/verify-admin-upgrade.mjs --project=chromium --project=mobile -g 'dashboard create route'
```

خروجی‌های شاخص: `51 passed, 1 skipped` برای backend نهایی؛ `41 passed` برای Vitest؛ `6 passed` برای هرکدام از desktop/mobile؛ `2 passed` برای اصلاح آخر مسیر ساخت. دستور `pnpm --dir frontend lint` و `typecheck` با exit code صفر و بدون خطا تمام شدند. imageهای Docker ساخته شدند و backend/frontend اصلی هر دو healthy هستند. QA شامل سه container و پایگاه اختصاصی بود که پس از آزمون حذف شد؛ شمار حساب‌های موقت QA در پایگاه اصلی صفر است.

**موارد باقی‌مانده برای COMPLETE:** یک نفر باید dialog ایجاد/ویرایش، تأیید خروج و خطاهای فیلدی را با صفحه‌خوان واقعی (مانند NVDA) در فارسی و انگلیسی بررسی کند؛ سپس اسکرول‌بارهای root، sidebar، جدول و dialog را در Firefox، تم تیرهٔ ثابت و RTL/LTR ببیند. من نتیجهٔ این دو بررسی را PASS اعلام نکرده‌ام. دادهٔ آماری گذشته که قبلاً ثبت نشده، قابل بازیابی نیست و پنل در آن بخش empty state نشان می‌دهد.
