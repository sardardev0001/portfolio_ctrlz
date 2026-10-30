# اصلاح زمینه و گردش حلقوی کارت‌های سکشن روایت

وضعیت: پیاده‌سازی و بررسی موارد درخواستی تکمیل شد. سرویس اصلی محلی با نسخهٔ اصلاح‌شده در حال اجراست.

## تغییرات

فقط سکشن «هر فریم فرصتی برای روایت است» اصلاح شده است. پس‌زمینهٔ رنگی خود سکشن، تصویر و گرادیان لایهٔ `backdrop`، خطوط کناری و مرزهای بالا/پایین حذف شدند. سکشن اکنون `background: transparent` دارد؛ پس‌زمینهٔ اصلی خانه در پشت آن ادامه پیدا می‌کند. زمینه و نور داخلی کپسول، کارت‌ها، کاراکتر، عنوان و CTAها حفظ شده‌اند.

هر شش کارت واقعی با GSAP نصب‌شدهٔ پروژه روی یک مسیر بسته حرکت می‌کنند. مسیر، ردیف بالا را در جهت خواندن صفحه طی می‌کند و از ردیف پایین به ابتدای حلقه برمی‌گردد. کارت آخر و اول دو جایگاه مجاور در حلقه‌اند؛ هیچ کارت clone یا تصویر جایگزین‌شونده‌ای وجود ندارد. خود شش `Link` و wrapperهایشان با `translate` حرکت می‌کنند؛ قاب، ارتفاع و عرض آن ثابت‌اند.

فاصلهٔ شروع حرکت‌ها ۴ ثانیه، زمان هر حرکت ۱ ثانیه و easing برابر `power2.inOut` است. نخستین حرکت پس از ۳ ثانیه مکث شروع می‌شود و یک ثانیه بعد پایان می‌یابد؛ هر دور شش‌مرحله‌ای ۲۴ ثانیه طول می‌کشد. timeline با `repeat: -1` تکرار می‌شود و در مرز دورها کارت‌ها دقیقاً به همان مختصات اولیه می‌رسند.

## تعامل و دسترس‌پذیری

- Hover ماوس، فوکوس داخل کپسول، فشار pointer و پیمایش لمسی، گردش خودکار را متوقف می‌کنند. پس از پایان همهٔ علت‌های توقف، حرکت از همان playhead ادامه پیدا می‌کند.
- خارج‌شدن کپسول از viewport و مخفی‌شدن تب نیز timeline را pause می‌کند تا کار بیهوده انجام نشود.
- در reduced-motion، حرکت خودکار خاموش و تغییر دستی بدون انیمیشن است.
- فلش‌ها هم کارت فعال را عوض می‌کنند و هم حلقه را واقعاً یک جایگاه جابه‌جا می‌کنند. لینک‌ها، Tab، کلیدهای جهت، Home/End و Enter/Space حفظ شده‌اند.
- مسیر از موقعیت واقعی grid محاسبه می‌شود؛ ترتیب فارسی RTL و انگلیسی LTR و grid ستونی موبایل پشتیبانی می‌شوند. در تغییر اندازه، مختصات بازسنجی و جایگاه فعلی حلقه حفظ می‌شود.
- `scroll-snap` قبلی موبایل حذف و scroll anchoring خاموش شده است؛ وگرنه مرورگر، کارتِ در حال حرکت را دنبال می‌کرد و رویداد scroll باعث توقف مجدد timeline می‌شد. پیمایش افقی بومی و توقف هنگام پیمایش واقعی کاربر حفظ شده‌اند.
- timer تکرارشوندهٔ React یا re-render در هر frame وجود ندارد. timeline، observerها، listenerها و tweenها هنگام خروج پاک می‌شوند.

## فایل‌ها

| فایل | تغییر |
|---|---|
| `frontend/src/features/site/HomeStory.tsx` | حذف لایهٔ backdrop، اتصال ref و رویدادهای همین کپسول به carousel، حرکت واقعی با فلش‌ها |
| `frontend/src/features/site/HomeStory.module.css` | شفاف‌شدن سکشن و حذف مرز/لایهٔ زمینه؛ آماده‌سازی wrapper کارت‌ها برای transform؛ حذف تداخل snap/scroll anchoring موبایل |
| `frontend/src/features/site/useStoryCarousel.ts` | hook جدید برای مسیر بسته، timeline تکراری، pause/resume، reduced-motion، resize و cleanup |
| `frontend/e2e/home-story-carousel.spec.ts` | آزمون سه دور کاملِ زمان واقعی در چهار حالت زبان/اندازه، حرکت میان‌جایگاهی و توقف/ادامه |
| `docs/qa/home-story-carousel/` | شواهد تصویری و خروجی آزمون‌ها |

فایل هدر، هیروی اصلی، لوگو، تصاویر کاراکتر، footer، سایر سکشن‌ها، API، داده‌ها و dependencyها تغییر نکرده‌اند. [تطبیق هش سورس](qa/home-story-carousel/source-changes.json) فقط دو فایل موجودِ همین سکشن را نشان می‌دهد. [بررسی محدوده](qa/home-story-carousel/scope-verification.txt) یکسان‌بودن JSX و سه rule مربوط به تصویر و نور کاراکتر را نیز تأیید می‌کند.

## آزمون‌ها

نتیجه‌های مشاهده‌شده تا این مرحله:

| بررسی | نتیجه |
|---|---|
| `pnpm --dir frontend typecheck` | PASS؛ `tsc --noEmit` بدون خطا |
| `pnpm --dir frontend test` | PASS؛ ۴۱ آزمون در ۸ فایل |
| ESLint فایل‌های تغییرکرده و آزمون جدید | PASS؛ خروج صفر |
| `docker compose build frontend` و راه‌اندازی frontend | PASS |
| `docker compose -f docker-compose.prod.yml build frontend` | PASS؛ ساخت واقعی Next، TypeScript و image production |
| سه دور کاملِ زمان واقعی | **PASS — 1 passed (2.9m)**؛ این یک آزمون، هر چهار حالت FA/EN و ۳۹۰/۱۴۴۰ را با سه دور کامل پوشش می‌دهد |
| Responsive، reduced-motion، حرکت دستی، کنترل‌های قبلی، لینک و فیلتر شش کارت | **PASS — 8 passed (39.4s)** روی Chromium دسکتاپ و touch موبایل؛ عرض‌های ۳۹۰/۷۶۸/۱۰۲۴/۱۴۴۰/۱۹۲۰، هر دو زبان، refresh و history؛ [لاگ](qa/home-story-carousel/regression.log) |

آزمون سه دور، زمان مرورگر را جلو نمی‌برد: در هر یک از حالت‌های FA/EN و عرض‌های ۳۹۰/۱۴۴۰، ۱۸ حرکت واقعی را انتظار می‌کشد. مختصات هر شش کارت پس از هر حرکت با جایگاه بعدی مقایسه می‌شوند. مختصات میان‌حرکت و frameها نیز ثبت می‌شوند تا تعویض ناگهانی محتوا یا پرش در مرز حلقه قابل شناسایی باشد. سپس توقف ۴٫۳ثانیه‌ای با hover، ادامهٔ حرکت، توقف با focus و بازشدن مقصد واقعی یک کارت بررسی می‌شود.

نتیجهٔ ماشینی: [three-cycle-results.json](qa/home-story-carousel/three-cycle-results.json).

| حالت | جابه‌جایی کامل | frameهای ثبت‌شده | موقعیت‌های میان‌حرکت | پرش شناسایی‌شده | خطای مرورگر |
|---|---:|---:|---:|---:|---:|
| فارسی، موبایل ۳۹۰ | ۱۸ / سه دور | ۴۳۰۷ | ۷۸۳ | ۰ | ۰ |
| انگلیسی، موبایل ۳۹۰ | ۱۸ / سه دور | ۴۳۰۵ | ۷۸۳ | ۰ | ۰ |
| فارسی، دسکتاپ ۱۴۴۰ | ۱۸ / سه دور | ۴۳۱۱ | ۸۲۸ | ۰ | ۰ |
| انگلیسی، دسکتاپ ۱۴۴۰ | ۱۸ / سه دور | ۴۲۷۹ | ۸۲۹ | ۰ | ۰ |

«پرش» در این آزمون یعنی جابه‌جایی ناگهانی بیش از ۱۴۰ پیکسل بین دو frame با فاصلهٔ کمتر از ۶۰ms؛ علاوه بر آن، مختصات همهٔ کارت‌ها پس از تک‌تک ۱۸ حرکت با جایگاه‌های مورد انتظار، با تلورانس ۱٫۵ پیکسل، تطبیق داده شده‌اند. این اندازه‌گیری جایگزین ادعای مطلق ۶۰FPS روی همهٔ دستگاه‌ها نیست.

در هر چهار حالت، hover حرکت را دست‌کم ۴٫۳ ثانیه کاملاً ثابت نگه داشت؛ پس از خروج pointer، گردش ادامه یافت. با فوکوس نیز transformها ثابت ماندند و Enter مقصد واقعی `/portfolio?category=cinematic` را باز کرد. عرض و ارتفاع قاب ثابت ماند. برای زمینه، مرورگر دقیقاً `rgba(0, 0, 0, 0)`، `background-image: none`، border صفر و نبود لایهٔ `::after` را گزارش داد.

برای تکرار روی تصویر ساخته‌شده:

```powershell
docker compose -f docker-compose.prod.yml run --no-deps -d --name ctrlz-story-carousel-qa -p 127.0.0.1:3034:3000 frontend
$env:BASE_URL='http://127.0.0.1:3034'
# PLAYWRIGHT_EXECUTABLE_PATH به Chromium نصب‌شده اشاره داشت.
# از پوشهٔ frontend، مستقیم از CLI نصب‌شده استفاده شد:
node node_modules/@playwright/test/cli.js test home-story-carousel.spec.ts --project=chromium --reporter=line
# بررسی کوتاه نهایی (از frontend):
node node_modules/@playwright/test/cli.js test home-story.spec.ts home-story-carousel.spec.ts --grep 'story controls|every story category|carousel responsive' --project=chromium --project=mobile --reporter=line
```

سایت اصلی روی `http://127.0.0.1:3000/` قابل مشاهده است. کپسولِ موردنظر در سکشن زیر هیروی اصلی قرار دارد. [لاگ سه دور](qa/home-story-carousel/three-cycles.log)، [خلاصهٔ build](qa/home-story-carousel/build-excerpt.txt) و نتایج عددی در پوشهٔ QA هستند.

## تصاویر نهایی

- سکشن دسکتاپ: [قبل](qa/home-story-carousel/before-fa-1440-section.png) / [بعد](qa/home-story-carousel/after-fa-1440-section.png)
- سکشن موبایل: [قبل](qa/home-story-carousel/before-fa-390-section.png) / [بعد](qa/home-story-carousel/after-fa-390-section.png)
- نسخهٔ انگلیسی: [دسکتاپ](qa/home-story-carousel/after-en-1440-section.png) / [موبایل](qa/home-story-carousel/after-en-390-section.png)
- برای هدر و هیروی اصلی نیز تصاویر `before/after-{locale}-{width}-header/hero.png` در همین پوشه ثبت شده‌اند؛ فایل‌های سورس این بخش‌ها عیناً حفظ شده‌اند.

## مشکلات و محدودیت‌ها

مشکل عملکردی حل‌نشده‌ای در حالت‌های بررسی‌شده باقی نمانده است. بررسی روی Chromium و نمای لمسی موبایل انجام شد؛ Firefox، Safari و دستگاه فیزیکی جداگانه آزمایش نشدند. در حالت reduced-motion، hover، فوکوس یا مخفی‌بودن تب، توقف خودکار عمدی است. برای دیدن گردش خودکار، pointer و فوکوس را از کپسول خارج کنید و reduced-motion را غیرفعال بگذارید.

در شروع ادامهٔ کار، سرویس‌های اصلی متوقف بودند و صفحهٔ خطای قطع ارتباط نمایش داده می‌شد؛ آن اجرا PASS نبود. همان containerهای PostgreSQL/MinIO/backend/frontend مجدداً راه افتادند و رندر سکشن و API شش دسته تأیید شد. CLI محلی Playwright مستقیم اجرا شد تا وابستگی به دریافت metadata از registry نداشته باشد. محدودیت اجرای Chromium در sandbox نیز با دسترسی لازم برای آزمون محلی برطرف شد؛ تنظیمات برنامه برای این موارد تغییر نکردند.

تداخل واقعی scroll-snap موبایل در آزمون کشف و در همین سکشن اصلاح شد؛ نتیجهٔ PASS بالا پس از این اصلاح است. اجرای هم‌زمان چهار context به خطای منابع مرورگر `ERR_NO_BUFFER_SPACE` در یک مقصد انجامید؛ اجرای نهایی با دو context در هر نوبت، بدون حذف کنترل خطا و بدون تندکردن زمان، موفق شد. لاگ‌های ناموفق در `.local/home-story-carousel/` جدا از لاگ موفق حفظ شده‌اند.
