# تحویل اصلاح قاب‌ها، چیدمان دو زبانه و حرکت CTRL.Z

تاریخ: ۱۹ اکتبر ۲۰۲۶ — پروژه: `D:\MY_PROJECT\Portfolio_ctrlz`.

## تغییرات اجراشده

- سطح تیرهٔ قاب‌های HUD اکنون یک لایهٔ مستقل و Clip Path دارد که از همان مسیر SVG خطوط قاب ساخته می‌شود. مستطیل پس‌زمینه حذف شده، اما Glow و حلقهٔ فوکوس بیرون قاب آزاد هستند. گرادیان‌ها و رنگ‌های اصلی به متغیر سطح داخلی منتقل شده‌اند.
- همان راهکار برای سه هندسهٔ کارت تماس، فرم و دکمهٔ ارسال استفاده می‌شود. عمق بریدگی‌های HUD در پنل‌های بلند محدود شده تا خطوط قاب از روی عنوان‌ها عبور نکنند؛ ResizeObserver مسیر خط و سطح را هم‌زمان هماهنگ می‌کند.
- Padding و Gap مهارت‌ها، رزومه، درباره من و نمونه‌کارها تنظیم شد. فاصلهٔ افقی پنل‌های عریض تا ۳۲px افزایش می‌یابد، چون فرورفتگی SVG در این عرض‌ها حدود ۱۸px است؛ موبایل ۱۶px و کارت‌ها ۱۲–۱۴px هستند. مهارت‌ها حداکثر سه ستون دارند.
- چیدمان واقعی تماس با CSS Grid و جهت سند تغییر می‌کند: فارسی محتوا راست/کاراکتر چپ؛ انگلیسی محتوا چپ/کاراکتر راست. تصویر Mirror نشده است. موبایل یک ستون دارد. ایمیل در فارسی راست‌چین است و ترتیب حروف لاتین LTR باقی می‌ماند؛ متن کارت‌های درباره من و تیترهای پایین صفحه نیز جهت زبان را می‌گیرند.
- عنوان تحصیلات، جزئیات تحصیلات، متن تجربه/دوره‌ها و متن باکس پایانی رزومه در فارسی راست‌چین و در انگلیسی چپ‌چین است. عنوان و زیرعنوان پایانی در فضای کافی یک ردیف و در عرض کم با شکست طبیعی نمایش داده می‌شوند.
- ورود تدریجی پنل‌ها و Stagger کارت‌ها با Motion موجود، پاسخ ظریف آیکون‌ها، Hover و نورپردازی محدود اجرا شده است. سطح کلیک نمونه‌کار ثابت مانده و فقط محتوای داخلی آن کمی حرکت می‌کند تا لبهٔ پایین کارت قابل کلیک بماند.
- حرکت تزئینی قاب‌ها در موبایل، اشاره‌گر لمسی، تب پنهان و دستگاه با حداکثر ۴ هستهٔ منطقی محدود می‌شود. تنظیم reduced-motion هنگام بازبودن صفحه نیز بلافاصله اعمال می‌شود.
- فایل‌های HomeStory، هوک گردش بی‌نهایت، Home، هدر، لوگو، فوتر و تصاویر تغییر نکرده‌اند. تم تیرهٔ فعلی و حذف قبلی تاگل تم حفظ شده است.

## تست‌های انجام‌شده

| بررسی | نتیجه |
|---|---|
| Build واقعی production و TypeScript داخل Next | موفق |
| Typecheck مستقل | موفق |
| ESLint کامل frontend | موفق |
| Vitest موجود | ۴۱ تست، ۸ فایل، موفق |
| تست‌های backend در Docker با ffprobe واقعی، دیتابیس تست و فایل‌های موقت جدا | ۵۱ موفق؛ ۱ skip مربوط به دیکشنری frontend که در Vitest بررسی می‌شود |
| آزمون جدید رابط | ۹ موفق، ۱ skip تکراری sweep تبلت در پروژهٔ mobile، بدون failure |
| ماتریس هندسه و جهت | ۵۰ بار بازبینی صفحه، فارسی/انگلیسی، عرض‌های ۳۲۰، ۳۹۳، ۷۶۸، ۱۰۲۴ و ۱۶۷۲؛ ۴۶۰ قاب و ۱۴۸٬۵۸۰ مقایسهٔ نقطهٔ Clip Path/SVG، بدون اختلاف |
| تست‌های قبلی مرتبط | ۲۸ موفق روی دسکتاپ و موبایل: صفحات و تصاویر، منو، فیلتر/جستجو/تاریخچه، تمام لبه‌های کارت، صفحه جزئیات، فوکوس، تغییر زبان، لینک‌های تماس، retry/rate-limit فرم، کنترل‌ها و دسته‌های carousel |
| تصاویر قبل و بعد | ۲۰ قبل + ۲۰ بعد؛ پنج صفحه، دو زبان، عرض‌های ۳۹۰ و ۱۴۴۰ |

گزارش‌های خام: [هندسه](qa/ui-frame-motion/geometry-summary.json)، [Playwright جدید](qa/ui-frame-motion/frame-results.json)، [رگرسیون](qa/ui-frame-motion/regression.txt)، [Vitest](qa/ui-frame-motion/unit.txt)، [backend](qa/ui-frame-motion/backend-tests.txt)، [Build](qa/ui-frame-motion/production-build.txt)، [Typecheck](qa/ui-frame-motion/typecheck.txt) و [ESLint](qa/ui-frame-motion/lint.txt).

## حفظ گردش بی‌نهایت خانه

تست موجودِ سه چرخهٔ واقعی مجدداً اجرا شد: فارسی و انگلیسی، موبایل ۳۹۰ و دسکتاپ ۱۴۴۰، در هر حالت ۱۸ جابه‌جایی واقعی و سه دور کامل. در هر چهار حالت، فریم‌های میانی حرکت وجود داشتند، پرش شناسایی نشد، قاب بیرونی ثابت ماند، مکث Hover و فوکوس و ادامهٔ حرکت و لینک فیلتر درست بودند و خطای کنسول ثبت نشد. زمان اجرای آزمون حدود ۲٫۹ دقیقه بود. [نتایج خام](qa/ui-frame-motion/carousel/three-cycle-results.json).

## اندازه‌گیری حرکت و عملکرد

در Chromium Headless همین میزبان ویندوز، برای هر پنج صفحه روی دسکتاپ ۱۴۴۰ و موبایل شبیه‌سازی‌شده ۳۹۰، پس از بارگذاری داده و فونت، چهار ثانیه اسکرول با انیمیشن فعال نمونه‌برداری شد:

- مجموع ۲٬۳۸۳ فریم نمونه‌برداری؛ میانگین حدود ۵۷٫۳ تا ۶۰ FPS در سناریوهای مختلف.
- صدک ۹۵ فاصلهٔ فریم‌ها حدود ۱۶٫۹ تا ۱۷٫۱ میلی‌ثانیه؛ دو فریم بالای ۵۰ms در کل نمونه‌ها.
- Long Task مشاهده نشد. CLS دسکتاپ صفر بود؛ بیشینهٔ موبایل حدود ۰٫۰۰۰۰۵۸ در صفحهٔ درباره من بود.
- غیرفعال‌بودن حرکت تزئینی قاب‌ها در موبایل و در دستگاه شبیه‌سازی‌شده با دو هستهٔ منطقی بررسی و تأیید شد.

این اعداد اندازه‌گیری همین محیط و بازهٔ کوتاه اسکرول هستند؛ تضمین FPS روی تمام سخت‌افزارها یا هنگام بارگذاری اولیه نیستند. [دادهٔ خام عملکرد](qa/ui-frame-motion/performance.json).

## تصاویر

[فهرست همه تصاویر قبل و بعد](qa/ui-frame-motion/README.md)

- [مقایسهٔ تماس فارسی روی دسکتاپ](qa/ui-frame-motion/comparison-contact-fa-desktop.png)
- [مقایسهٔ تماس انگلیسی روی دسکتاپ](qa/ui-frame-motion/comparison-contact-en-desktop.png)

## فایل‌های تغییرکرده

فهرست زیر با SHA-256 پیش از تغییر مقایسه شده است؛ Git از ابتدا همهٔ فایل‌های برنامه را untracked نشان می‌داد. هیچ reset، clean یا commit انجام نشد و کار قبلی حفظ شد.

- [frontend/src/app/contact.css](../frontend/src/app/contact.css) — اصلاح‌شده
- [frontend/src/app/editorial.css](../frontend/src/app/editorial.css) — اصلاح‌شده
- [frontend/src/app/frame-surfaces.css](../frontend/src/app/frame-surfaces.css) — جدید
- [frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx) — اصلاح‌شده
- [frontend/src/app/resume-portfolio.css](../frontend/src/app/resume-portfolio.css) — اصلاح‌شده
- [frontend/src/components/hud/FrameBackplate.tsx](../frontend/src/components/hud/FrameBackplate.tsx) — جدید
- [frontend/src/components/hud/HudFrame.tsx](../frontend/src/components/hud/HudFrame.tsx) — اصلاح‌شده
- [frontend/src/components/hud/HudSection.tsx](../frontend/src/components/hud/HudSection.tsx) — جدید
- [frontend/src/components/hud/useHudMotion.ts](../frontend/src/components/hud/useHudMotion.ts) — اصلاح‌شده
- [frontend/src/components/motion/useReducedMotionPreference.ts](../frontend/src/components/motion/useReducedMotionPreference.ts) — جدید
- [frontend/src/features/contact/ContactHudFrame.tsx](../frontend/src/features/contact/ContactHudFrame.tsx) — اصلاح‌شده
- [frontend/src/features/contact/SocialContactCard.tsx](../frontend/src/features/contact/SocialContactCard.tsx) — اصلاح‌شده
- [frontend/src/features/site/About.tsx](../frontend/src/features/site/About.tsx) — اصلاح‌شده
- [frontend/src/features/site/components.tsx](../frontend/src/features/site/components.tsx) — اصلاح‌شده
- [frontend/src/features/site/Contact.tsx](../frontend/src/features/site/Contact.tsx) — اصلاح‌شده
- [frontend/src/features/site/Portfolio.tsx](../frontend/src/features/site/Portfolio.tsx) — اصلاح‌شده
- [frontend/src/features/site/Skills.tsx](../frontend/src/features/site/Skills.tsx) — اصلاح‌شده
- [frontend/src/features/skills/SpecialtyCard.tsx](../frontend/src/features/skills/SpecialtyCard.tsx) — اصلاح‌شده
- [frontend/e2e/frame-surfaces.spec.ts](../frontend/e2e/frame-surfaces.spec.ts) — تست جدید مرورگر.
- همین گزارش و فایل‌های `docs/qa/ui-frame-motion/` — شواهد تست و تصاویر.

## محدودهٔ اطمینان و محدودیت‌ها

- مرورگر واقعی آزمون Chromium بود؛ Safari، Firefox و سخت‌افزار موبایل واقعی بررسی نشده‌اند.
- طبق وضعیت قبلی، حالت روشن فعال نیست؛ ادعای تست حالت روشن نداریم.
- فرم در مرورگر از نظر اعتبارسنجی، کیبورد و خطا/تلاش مجدد تست شد؛ تست‌های backend ذخیرهٔ پیام و منطق API را در دیتابیس تست بررسی کردند. برای QA رابط، پیام واقعی در inbox اصلی ساخته نشد. CRUD مدیریتی در این تغییر اجرا نشد.
- نسخهٔ محلی توسعه روی `http://127.0.0.1:3000` اجرا می‌شود. نسخهٔ موقت production فقط برای QA بود و پس از تست جمع‌آوری می‌شود؛ انتشار عمومی انجام نشده است.
- اجرای اولیهٔ تست‌های ویندوز با خطای کش موقت Vitest و نبود ffprobe مواجه شد؛ اجرای مجدد Vitest و تست backend در محیط مناسب موفق بود. در اجرای هم‌زمان QA، dev server خطای داخلی Turbopack داد؛ آزمون‌های نهایی روی build production انجام شدند و dev server بازسازی و راه‌اندازی شد. کد backend برای عبور از تست تغییر نکرد.
