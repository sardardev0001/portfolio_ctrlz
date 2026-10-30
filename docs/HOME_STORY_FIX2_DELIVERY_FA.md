# تحویل بازطراحی محدود سکشن روایت خانه — fix2

وضعیت: اجرای محدودهٔ توافق‌شده تکمیل شد. شش دستهٔ واقعی طبق پاسخ صریح کاربر، بدون ساخت دستهٔ اضافی، نمایش داده می‌شوند.

## محدوده و تصمیم تأییدشده

سکشن «هر فریم فرصتی برای روایت است» در همان جای قبلی، بلافاصله بعد از `.hero-home` و قبل از footer، بازطراحی شد. چهار کارت هیروی اول، شخصیت قبلی، هدر، منو، سوییچ زبان و صفحات دیگر حفظ شدند. تم طبق درخواست قبلی کاربر تیره و ثابت است؛ قابلیت یا دکمهٔ تم روشن بازگردانده نشد.

دادهٔ واقعی فقط شش دسته دارد. پس از اعلام این موضوع، کاربر صریحاً **«فقط ۶ دستهٔ واقعی موجود»** را انتخاب کرد. بنابراین به‌جای ده جایگاه مرجع، شش دسته در دو ردیف سه‌تایی نمایش داده می‌شوند. هیچ دسته، slug، پروژه یا دادهٔ CMS ساخته نشد. دستهٔ انیمه با نام واقعی خودش حفظ شده است.

## بررسی اولیه

- مسیر خانه: `frontend/src/app/(public)/page.tsx` ← `PublicPage` ← `features/site/Home.tsx`؛ داده از `getContent()` و API فعلی می‌آید.
- بخش قبلی: `.below-hero`، عنوان/توضیح از بلوک CMS با کلید `home-next` و دو لینک پروژه‌ها/مهارت‌ها.
- i18n: provider موجود، cookie زبان و refresh سرور؛ محتوای CMS از قبل localize می‌شود.
- فیلتر موجود نمونه‌کارها: `/portfolio?category={slug}`؛ URL، refresh، دکمهٔ فیلتر و درخواست API از قبل همگام‌اند. هیچ تغییری در `Portfolio.tsx` یا API لازم نشد.
- از هر یازده فایل `design/fix2` پیش‌نمایش تهیه شد. ده فایل PNG دارایی، RGBA و دارای alpha واقعی ۰ تا ۲۵۵ هستند. فایل یازدهم، مرجع ترکیب‌بندی RGB است و به‌عنوان تصویر یکپارچهٔ سکشن استفاده نمی‌شود.
- وضعیت Git از ابتدا همهٔ برنامه را untracked نشان می‌داد. وضعیت و هش فایل‌ها قبل از ویرایش در `.local/home-story-fix2/` ثبت شدند؛ reset یا حذف فایل قبلی انجام نشد.
- تصاویر قبل از تغییر در ۳۹۰ و ۱۴۴۰ ثبت شده‌اند. سرویس‌های موجود Docker برای این کار با `docker compose start postgres minio backend frontend` راه افتادند.

## پیاده‌سازی

کاراکتر خندان با دست زیر چانه، شفاف و با `object-fit: contain` در چپ قرار دارد؛ صورت، انگشت و مو بریده نمی‌شوند. عنوان و توضیح همچنان متن واقعی و قابل انتخابِ CMS هستند و «فرصتی» / `chance` طلایی می‌شود. زمینهٔ شهریِ موجود پروژه فقط داخل همین سکشن با لایه‌های تیره/آبی استفاده شده است. تاج کوچک از favicon برند موجود می‌آید.

کپسول با HTML/CSS واقعی، outline آبی، قاب‌های مایل، سطح تیره، تصویر مستقل، نام و آیکون ساخته شده است. آیتم فعال طلایی است؛ hover آبی، focus سفید و outline مستقل دارد. همهٔ کارت‌ها `Link` واقعی و تمام‌سطح‌اند. دو CTA قبلی در پایین همین سکشن حفظ شده‌اند: `/portfolio` و `/skills`.

منطق فلش‌ها یک انتخاب حلقوی است؛ روی دسکتاپ هر شش کارت قابل دیدن‌اند و فلش، کارت فعال را عوض می‌کند. روی موبایل grid دو ردیفه به‌صورت افقی پیمایش می‌شود؛ تغییر انتخاب، فقط همان viewport را به اندازهٔ لازم اسکرول می‌کند. autoplay وجود ندارد. لمس، اسکرول بومی، Tab، ArrowLeft/ArrowRight، Home/End، Enter و Space پشتیبانی می‌شوند. جهت فلش و حرکت منطقی با RTL/LTR هماهنگ است. تغییر زبان، slug انتخاب‌شده را حفظ می‌کند.

انیمیشن idle به‌صورت تغییر بسیار آرام opacity نور پشت کاراکتر، فقط روی دسکتاپ و در حالت بدون reduced-motion اجرا می‌شود؛ خود تصویر جابه‌جا نمی‌شود. این کار علاوه بر حفظ ثبات چیدمان، اجازه می‌دهد ابزارهای خودکار و focus بدون انتظار برای توقف حرکت به تصویر برسند. در reduced-motion، انیمیشن و transition سکشن خاموش و پیمایش فوری است. اندازهٔ تصویرها مشخص، بارگیری lazy و `sizes` واکنش‌گراست. کتابخانه یا dependency جدیدی نصب نشد.

### نگاشت به فیلترهای واقعی

| دستهٔ موجود | slug | مقصد |
|---|---|---|
| ادیت سینمایی | cinematic | `/portfolio?category=cinematic` |
| ولاگ و یوتیوب | vlog | `/portfolio?category=vlog` |
| موشن گرافیک | motion | `/portfolio?category=motion` |
| ادیت تبلیغاتی | advertising | `/portfolio?category=advertising` |
| محتوای ورزشی | sports | `/portfolio?category=sports` |
| ادیت انیمه | anime | `/portfolio?category=anime` |

## فایل‌های تغییرکرده و افزوده‌شده

| فایل | نقش |
|---|---|
| `frontend/src/features/site/Home.tsx` | جایگزینی فقط بلوک `.below-hero` با `HomeStory` و import مربوط؛ JSX هیروی اصلی عیناً حفظ شد |
| `frontend/src/i18n/messages.ts` | فقط کلیدهای `story.*` برای عنوان fallback، کنترل‌ها، دسترس‌پذیری و alt همین سکشن |
| `frontend/src/features/site/HomeStory.tsx` | سکشن و کنترل‌های تعاملی، جهت، locale و لینک‌های واقعی |
| `frontend/src/features/site/HomeStory.module.css` | استایل محلی؛ کپسول، کاراکتر، کارت، responsive و reduced-motion |
| `frontend/src/features/site/home-story-data.ts` | نگاشت تصویر به slugهای موجود؛ دستهٔ ناشناختهٔ آینده آیکون/گرادیانت امن می‌گیرد |
| `frontend/public/assets/home-story/*.webp` | شش خروجی تازه: کاراکتر و پنج تصویر دسته؛ اصل PNGها حفظ شدند |
| `frontend/scripts/prepare-home-story-assets.mjs` | ساخت manifest پیش از خروجی و بهینه‌سازی با sharp موجود پروژه |
| `frontend/e2e/home-story.spec.ts` | آزمون عملی زبان/اندازه، لینک‌ها، فیلتر، refresh، history، keyboard و انتخاب فعال |
| `docs/HOME_STORY_FIX2_ASSETS.json` | manifest کامل منابع، ابعاد، alpha، استفاده/عدم استفاده و خروجی |
| `docs/qa/home-story-fix2/` | پیش‌نمایش منابع، اسکرین‌شات‌ها، نتیجهٔ مقایسهٔ سورس و تصویر |

هیچ migration، تغییر دیتابیس، تغییر backend، تغییر تنظیمات سراسری یا تغییر فایل صفحهٔ Contact/About/Skills/Resume/Admin انجام نشد.

## Manifest دارایی‌ها

جزئیات ماشینی در [HOME_STORY_FIX2_ASSETS.json](HOME_STORY_FIX2_ASSETS.json) و تعداد پیکسل‌های شفاف در [source-audit.json](qa/home-story-fix2/source-audit.json) ثبت شده‌اند. خروجی WebP با alpha حفظ‌شده، بدون تغییر ژست و بدون بازسازی تصویری تولید شده است.

| فایل منبع در `design/fix2` | ابعاد / نوع | نقش و خروجی |
|---|---|---|
| `ChatGPT Image Oct 18, 2026, 08_33_11 PM-1.png` | ۱۰۸۶×۱۴۴۸ RGBA، شفاف | `character.webp`، ۸۷۰×۱۱۶۰ |
| `…08_33_12 PM-2.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | سینمایی، `cinematic.webp`، ۷۲۰×۵۴۰ |
| `…08_33_13 PM-3.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | ولاگ، `vlog.webp`، ۷۲۰×۵۴۰ |
| `…08_33_14 PM-4.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | سفر؛ استفاده نشد، دستهٔ واقعی ندارد |
| `…08_33_15 PM-5.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | موشن، `motion.webp`، ۷۲۰×۵۴۰ |
| `…08_33_16 PM-6.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | تبلیغات، `advertising.webp`، ۷۲۰×۵۴۰ |
| `…08_33_17 PM-7.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | ورزشی، `sports.webp`، ۷۲۰×۵۴۰ |
| `…08_33_18 PM-8.png` | ۱۲۵۴×۱۲۵۴ RGBA، شفاف | گیمینگ؛ استفاده نشد، دستهٔ واقعی ندارد |
| `…08_33_19 PM-9.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | هوایی؛ استفاده نشد، دستهٔ واقعی ندارد |
| `…08_33_20 PM-10.png` | ۱۴۴۸×۱۰۸۶ RGBA، شفاف | مستند؛ استفاده نشد، دستهٔ واقعی ندارد |
| `Neon Cyberpunk Hero and Persian UI (1).png` | ۱۶۷۲×۹۴۱ RGB | فقط مرجع بصری؛ به صفحه تزریق نشد |

تصویر کارت ششم، `/assets/portfolio/project-01.webp` (۶۳۰×۴۲۰)، تصویر انیمهٔ موجود در خود سایت است. تصویر کم‌وضوح `project-06.webp` کنار گذاشته شد؛ فایل قبلی حذف یا تغییر نکرد. پس‌زمینه نیز `/assets/backgrounds/city-background-small.webp` موجود است. از منبع ثالث استفاده نشد. چهار فایل موضوعِ فاقد دسته صرفاً بررسی شدند و به صفحه تحمیل نشدند.

## تصاویر و کنترل محدوده

- [قبل، دسکتاپ](qa/home-story-fix2/before-1440-section.png) / [بعد، دسکتاپ](qa/home-story-fix2/after-1440-section.png)
- [قبل، موبایل](qa/home-story-fix2/before-390-section.png) / [بعد، موبایل](qa/home-story-fix2/after-390-section.png)
- هدر [قبل](qa/home-story-fix2/before-1440-header.png) / [بعد](qa/home-story-fix2/after-1440-header.png)
- هیروی اصلی [قبل](qa/home-story-fix2/before-1440-hero.png) / [بعد](qa/home-story-fix2/after-1440-hero.png)
- [پیش‌نمایش همهٔ منابع](qa/home-story-fix2/asset-contact-sheet.jpg)
- ماتریس نهایی با نام `verified-{project}-{locale}-{width}.png` در همان پوشه ثبت می‌شود.

مقایسهٔ هش سورسِ پیش/پس فقط `Home.tsx` و `i18n/messages.ts` را به‌عنوان فایل موجودِ تغییرکرده نشان می‌دهد؛ فایل‌های تازه در جدول بالا هستند. JSX هیروی اول byte-identical است. شواهد: [source-changes.json](qa/home-story-fix2/source-changes.json) و [scope-verification.txt](qa/home-story-fix2/scope-verification.txt).

اسکرین‌شات هدر در هر دو عرض تفاوت قابل رؤیتی ندارد. در مقایسهٔ نهایی، تفاوت هیروی اول فقط ردیف آخر تصویر، یعنی مرز با سکشن جدید است؛ خارج از آن خط، تصویر هیرو در **هر دو عرض pixel-identical** است. اندازه و محتوای هیرو ثابت‌اند. برخی snapshotهای اولیهٔ صفحات About/Portfolio در مرحله‌های مختلف بارگیری داده/تصویر ثبت شده بودند؛ اختلاف آن‌ها به‌عنوان pixel-identical گزارش نشده است. فایل‌های این صفحات و استایل‌های سراسری طبق هش اصلاً تغییر نکرده‌اند. footer نیز به‌دلیل ارتفاع جدید سکشن در موقعیت اسکرول متفاوت ثبت شده، اما سورس/ابعاد آن ثابت است.

## نتایج آزمون

دستورهای توسعه و بررسی، از ریشهٔ پروژه مگر جایی که `--dir frontend` مشخص شده است:

```powershell
node frontend/scripts/prepare-home-story-assets.mjs
docker compose build frontend
docker compose up -d --no-deps frontend
pnpm --dir frontend lint
pnpm --dir frontend typecheck
pnpm --dir frontend test
docker compose -f docker-compose.prod.yml build frontend

# نسخهٔ production ساخته‌شده روی پورت موقت 3034 اجرا شد.
# PLAYWRIGHT_EXECUTABLE_PATH به Chromium نصب‌شدهٔ محلی اشاره داشت.
# دستور زیر از پوشهٔ frontend اجرا شد:
$env:BASE_URL='http://127.0.0.1:3034'
pnpm exec playwright test home-story.spec.ts --project=chromium --project=mobile --reporter=line

# آزمون موجود روی استک رسمی محلی 3000، از ریشه:
$env:BASE_URL='http://127.0.0.1:3000'
pnpm --dir frontend exec playwright test flows.spec.ts --grep 'public route' --project=chromium --project=mobile --reporter=line
```

| بررسی | نتیجه |
|---|---|
| Lint کامل | **PASS**، خروج صفر، بدون خطا؛ lint فایل‌های نهایی نیز جداگانه موفق بود |
| TypeScript | **PASS**، `tsc --noEmit`، خروج صفر |
| Unit موجود | **PASS**، `Test Files 8 passed` و `Tests 41 passed` |
| Next.js build در image production نهایی | **PASS**، `Compiled successfully`، TypeScript، تولید صفحات و `Image ctrlz-frontend:production Built` |
| ساخت/اجرای development رسمی | **PASS**، build و recreate سرویس frontend |
| alpha خروجی‌ها | **PASS**، شش WebP دارای alpha واقعی؛ مجموع ۷۱۴٬۸۶۲ بایت |
| ثبات تصویر در idle عادی | **PASS**، پس از تبدیل حرکت تصویر به نور opacity، `scrollIntoViewIfNeeded` بدون timeout تمام شد |
| تطبیق هیروی اصلی | **PASS**، JSX عیناً یکسان؛ تصویر خارج از ردیف مرزی در هر دو عرض pixel-identical؛ [جزئیات](qa/home-story-fix2/hero-comparison.json) |

| مجموعهٔ نهایی مرورگر | نتیجه و شاهد |
|---|---|
| سکشن fix2، Chromium دسکتاپ و touch موبایل | **PASS — 10 passed (2.6m)**؛ پنج عرض، دو زبان، تصویرها، نبود overflow/خطای صفحه و console، فلش، keyboard، حفظ انتخاب هنگام تغییر زبان، لینک تمام‌سطح، tap، فیلتر هر شش دسته، empty state، refresh و history؛ [لاگ](qa/home-story-fix2/e2e-production.log) |
| مجموعهٔ موجود صفحات عمومی، دسکتاپ و موبایل | **PASS — 12 passed (2.2m)**؛ خانه، About، Portfolio، Skills، Resume و Contact، تصویرها و خطاهای مرورگر؛ [لاگ](qa/home-story-fix2/public-regression.log) |

لاگ ساخت در `.local/home-story-fix2/production-final-build.log` و لاگ‌های خام در همان پوشه‌اند. آزمایش مرورگر از API و دادهٔ واقعی استفاده می‌کند و پروژه/دستهٔ آزمایشی ایجاد نمی‌کند. در مجموعهٔ جدید DNT مرورگر و هدر فعال‌اند تا بازدید تست در آمار ذخیره نشود.

اجراهای اولیه صادقانه از PASS نهایی جدا هستند: قطع اتصال یک درخواست هنگام build هم‌زمان؛ ردشدن ثبت آمار از پورت موقت که با فعال‌کردن DNT در مرورگر آزمون رفع شد؛ و ناپایداری bounding box تصویر متحرک که با انتقال idle به نور ثابت‌چیدمان اصلاح شد. تست‌ها پس از هر اصلاح مرتبط دوباره اجرا شدند. هشدار ترمینال `NO_COLOR`/`FORCE_COLOR` فقط به رنگ خروجی runner مربوط است.

آزمون با نرم‌افزار صفحه‌خوان واقعی، Firefox و Safari اجرا نشد (**NOT RUN**)؛ role، نام دسترس‌پذیر، alt، keyboard، RTL/LTR و reduced-motion در Chromium دسکتاپ و نمای touch موبایل بررسی شدند. تم روشن طبق درخواست قبلی کاربر حذف شده و برای این تسک **N/A** است؛ تم تیرهٔ فعلی حفظ شد.

## مشاهده و بازتولید

سایت محلی: `http://127.0.0.1:3000/`؛ سکشن زیر هیروی اول است. نمونهٔ مقصد واقعی: `http://127.0.0.1:3000/portfolio?category=cinematic`. برای بازتولید دارایی‌ها، از ریشه `node frontend/scripts/prepare-home-story-assets.mjs` اجرا شود. داده/عکس شش کارت از دسته‌های واقعی و منابع موجود انتخاب می‌شود؛ افزودن دسته‌های سفر، گیمینگ، هوایی یا مستند به دیتابیس جزو این تغییر نبود.
