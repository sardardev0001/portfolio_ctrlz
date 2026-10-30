export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "richtext"
    | "number"
    | "checkbox"
    | "select"
    | "json"
    | "list"
    | "cards"
    | "links"
    | "date"
    | "url"
    | "email";
  options?: [string, string][];
  required?: boolean;
};
export type Resource = {
  label: string;
  endpoint: string;
  columns: string[];
  fields: Field[];
  ownerOnly?: boolean;
  readOnly?: boolean;
  singleton?: boolean;
  noCreate?: boolean;
};
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  required = false,
  options?: [string, string][],
): Field => ({ key, label, type, required, options });
const ordered = [
  f("order", "ترتیب نمایش", "number"),
  f("visible", "نمایش عمومی", "checkbox"),
];
const accents: [string, string][] = [
  ["blue", "آبی"],
  ["cyan", "فیروزه‌ای"],
  ["gold", "طلایی"],
  ["red", "قرمز"],
  ["purple", "بنفش"],
  ["orange", "نارنجی"],
];
export const resources: Record<string, Resource> = {
  blocks: {
    label: "بخش‌های صفحات",
    endpoint: "blocks",
    columns: ["key", "title"],
    fields: [
      f("key", "شناسه بخش", "text", true),
      f("title", "عنوان"),
      f("subtitle", "زیرعنوان"),
      f("body", "متن", "textarea"),
      f("image_asset", "تصویر اصلی آپلود شده", "select"),
      f("secondary_image_asset", "تصویر دوم آپلود شده", "select"),
      f("items", "کارت‌ها", "cards"),
      ...ordered,
    ],
  },
  portfolio: {
    label: "پروژه‌ها",
    endpoint: "projects",
    columns: ["title", "category_title", "status", "order"],
    fields: [
      f("title", "عنوان", "text", true),
      f("slug", "شناسه انگلیسی", "text", true),
      f("short_description", "توضیح کوتاه", "textarea"),
      f("description", "توضیح کامل", "richtext"),
      f("category", "دسته‌بندی", "select", true),
      f("thumbnail", "پوستر (مسیر /assets یا HTTPS)", "text"),
      f("thumbnail_asset", "پوستر آپلود شده", "select"),
      f("video_asset", "ویدیو آپلود شده", "select"),
      f("external_video_url", "آدرس ویدیو", "url"),
      f("duration", "مدت"),
      f("client", "مشتری"),
      f("year", "سال", "number"),
      f("tools", "ابزارها", "list"),
      f("tags", "برچسب‌ها", "list"),
      f("featured", "ویژه", "checkbox"),
      f("status", "وضعیت", "select", false, [
        ["draft", "پیش‌نویس"],
        ["published", "منتشرشده"],
      ]),
      ...ordered,
    ],
  },
  categories: {
    label: "دسته‌بندی پروژه‌ها",
    endpoint: "categories",
    columns: ["title", "slug", "order"],
    fields: [
      f("title", "عنوان", "text", true),
      f("slug", "شناسه انگلیسی", "text", true),
      ...ordered,
    ],
  },
  skills: {
    label: "مهارت‌ها",
    endpoint: "skills",
    columns: ["title", "kind", "level", "order"],
    fields: [
      f("title", "عنوان", "text", true),
      f("category", "دسته‌بندی", "select"),
      f("kind", "نوع", "select", false, [
        ["software", "نرم‌افزار"],
        ["creative", "خلاقانه"],
      ]),
      f("level", "سطح ۰ تا ۱۰۰", "number"),
      f("level_label", "برچسب سطح (اختیاری)"),
      f("description", "توضیح", "textarea"),
      f("icon", "نماد"),
      f("icon_image", "مسیر تصویر نماد"),
      f("icon_asset", "نماد آپلود شده", "select"),
      f("artwork", "تصویر"),
      f("artwork_asset", "تصویر آپلود شده", "select"),
      f("accent", "رنگ تأکیدی", "select", true, accents),
      f("variant", "نوع نمایش کارت", "select", true, [
        ["standard", "استاندارد"],
        ["color-grading", "اصلاح رنگ و گریدینگ"],
      ]),
      ...ordered,
    ],
  },
  "skill-categories": {
    label: "دسته‌بندی مهارت‌ها",
    endpoint: "skill-categories",
    columns: ["title", "slug"],
    fields: [
      f("title", "عنوان", "text", true),
      f("slug", "شناسه انگلیسی", "text", true),
      ...ordered,
    ],
  },
  experience: {
    label: "مدیریت تجربه‌های کاری",
    endpoint: "experience",
    columns: ["title", "company", "start", "end"],
    fields: [
      f("title", "عنوان", "text", true),
      f("company", "شرکت/مشتری"),
      f("employment_type", "نوع همکاری", "select", false, [
        ["full_time", "تمام‌وقت"],
        ["part_time", "پاره‌وقت"],
        ["contract", "قراردادی"],
        ["project", "پروژه‌ای"],
        ["freelance", "فریلنسری"],
        ["internship", "کارآموزی"],
        ["other", "سایر"],
      ]),
      f("workplace_type", "نوع محل کار", "select", false, [
        ["onsite", "حضوری"],
        ["remote", "دورکاری"],
        ["hybrid", "ترکیبی"],
      ]),
      f("location", "موقعیت جغرافیایی"),
      f("start", "شروع", "text", true),
      f("end", "پایان"),
      f("start_date", "تاریخ شروع دقیق", "date"),
      f("end_date", "تاریخ پایان دقیق", "date"),
      f("description", "توضیح", "richtext"),
      f("responsibilities", "مسئولیت‌ها", "list"),
      f("achievements", "دستاوردها", "list"),
      f("projects", "پروژه‌های انجام‌شده", "list"),
      f("technologies", "فناوری‌ها", "list"),
      f("links", "لینک‌های مرتبط", "links"),
      f("image", "تصویر"),
      f("image_asset", "تصویر آپلود شده", "select"),
      f("image_alt", "متن جایگزین تصویر"),
      f("is_current", "همکاری فعلی", "checkbox"),
      f(
        "accent",
        "رنگ تأکیدی",
        "select",
        false,
        accents.filter(([key]) =>
          ["blue", "cyan", "red", "gold"].includes(key),
        ),
      ),
      ...ordered,
    ],
  },
  education: {
    label: "تحصیلات",
    endpoint: "education",
    columns: ["degree", "institution", "years"],
    fields: [
      f("degree", "مدرک", "text", true),
      f("field", "رشته"),
      f("institution", "مؤسسه", "text", true),
      f("start_year", "سال شروع"),
      f("end_year", "سال پایان"),
      f("is_current", "در حال تحصیل", "checkbox"),
      f("years", "بازهٔ قدیمی (اختیاری)"),
      f("description", "توضیح", "textarea"),
      f("image", "مسیر تصویر دانشگاه"),
      f("image_asset", "تصویر دانشگاه آپلود شده", "select"),
      f("image_alt", "متن جایگزین تصویر"),
      f(
        "accent",
        "رنگ تأکیدی",
        "select",
        true,
        accents.filter(([key]) => ["red", "blue", "gold"].includes(key)),
      ),
      ...ordered,
    ],
  },
  certificates: {
    label: "دوره‌ها و گواهینامه‌ها",
    endpoint: "certificates",
    columns: ["title", "issuer", "year"],
    fields: [
      f("title", "عنوان", "text", true),
      f("issuer", "صادرکننده"),
      f("year", "سال"),
      f("url", "لینک", "url"),
      f("verification_url", "لینک اعتبارسنجی", "url"),
      f("icon", "نماد نرم‌افزار"),
      f("icon_asset", "تصویر نماد آپلود شده", "select"),
      f("certificate_asset", "فایل PDF گواهینامه", "select"),
      f("description", "توضیح", "textarea"),
      ...ordered,
    ],
  },
  achievements: {
    label: "دستاوردها",
    endpoint: "achievements",
    columns: ["title", "value"],
    fields: [
      f("title", "عنوان", "text", true),
      f("value", "مقدار", "text", true),
      f("numeric_value", "عدد برای شمارش (اختیاری)", "number"),
      f("prefix", "پیشوند"),
      f("suffix", "پسوند"),
      f("icon", "نماد (play/users/star)"),
      f("description", "توضیح", "textarea"),
      ...ordered,
    ],
  },
  "resume-files": {
    label: "فایل رزومه",
    endpoint: "resume-files",
    columns: ["title", "asset"],
    fields: [
      f("title", "عنوان", "text", true),
      f("asset", "فایل PDF", "select", true),
      ...ordered,
    ],
  },
  messages: {
    noCreate: true,
    label: "پیام‌ها",
    endpoint: "messages",
    columns: ["name", "email", "subject", "status", "created_at"],
    fields: [
      f("status", "وضعیت", "select", false, [
        ["unread", "خوانده‌نشده"],
        ["read", "خوانده‌شده"],
        ["archived", "بایگانی"],
      ]),
    ],
  },
  heroes: {
    label: "متن صفحات",
    endpoint: "heroes",
    columns: ["page", "title", "subtitle"],
    fields: [
      f("page", "صفحه", "text", true),
      f("title", "عنوان", "text", true),
      f("highlight", "کلمه برجسته"),
      f("subtitle", "زیرعنوان"),
      f("body", "متن اصلی", "richtext"),
      f("artwork", "تصویر"),
      f("typewriter_enabled", "انیمیشن تایپ عنوان صفحه اصلی", "checkbox"),
      f("typewriter_speed_ms", "سرعت تایپ (۲۰ تا ۵۰۰ میلی‌ثانیه)", "number"),
      f("typewriter_delete_ms", "سرعت حذف (۲۰ تا ۵۰۰ میلی‌ثانیه)", "number"),
      f(
        "typewriter_hold_ms",
        "مکث پس از تکمیل (پیش‌فرض ۵۰۰۰ میلی‌ثانیه)",
        "number",
      ),
      ...ordered,
    ],
  },
  stats: {
    label: "آمار",
    endpoint: "stats",
    columns: ["label", "value"],
    fields: [
      f("label", "برچسب", "text", true),
      f("value", "مقدار", "text", true),
      ...ordered,
    ],
  },
  socials: {
    label: "شبکه‌های اجتماعی",
    endpoint: "socials",
    columns: ["platform", "label", "handle", "url"],
    fields: [
      f("platform", "پلتفرم", "text", true),
      f("label", "عنوان", "text", true),
      f("url", "لینک حساب (برای ایمیل خالی بگذارید)", "text"),
      f("handle", "شناسه"),
      f("description", "توضیح"),
      ...ordered,
    ],
  },
  settings: {
    label: "تنظیمات سایت",
    endpoint: "settings",
    singleton: true,
    columns: ["brand", "tagline", "email", "site_url"],
    fields: [
      f("brand", "برند", "text", true),
      f("tagline", "شعار", "text", true),
      f("description", "توضیح", "textarea"),
      f("email", "ایمیل", "email"),
      f("site_url", "نشانی سایت", "url"),
      f("demo_mode", "محتوای نمایشی", "checkbox"),
    ],
  },
  profiles: {
    label: "پروفایل",
    endpoint: "profiles",
    singleton: true,
    columns: ["name", "role", "location", "start_year"],
    fields: [
      f("name", "نام", "text", true),
      f("role", "حوزه فعالیت"),
      f("location", "موقعیت"),
      f("start_year", "سال شروع", "number"),
      f("specialization", "تخصص"),
      f("bio", "بیوگرافی", "textarea"),
    ],
  },
  media: {
    label: "کتابخانه رسانه",
    endpoint: "media",
    columns: ["filename", "mime_type", "size", "created_at"],
    fields: [f("alt", "متن جایگزین"), f("usage", "کاربرد")],
  },
  gallery: {
    label: "گالری پروژه‌ها",
    endpoint: "gallery",
    columns: ["project", "asset", "caption", "order"],
    fields: [
      f("project", "پروژه", "select", true),
      f("asset", "تصویر", "select", true),
      f("caption", "توضیح"),
      ...ordered,
    ],
  },
  users: {
    label: "کاربران و دسترسی",
    endpoint: "users",
    columns: ["username", "role", "is_active"],
    fields: [
      f("username", "نام کاربری", "text", true),
      f("email", "ایمیل", "email"),
      f("first_name", "نام"),
      f("role", "نقش", "select", false, [
        ["owner", "مالک"],
        ["editor", "ویرایشگر"],
        ["viewer", "مشاهده‌گر"],
      ]),
      f("is_active", "فعال", "checkbox"),
      f("password", "رمز عبور (برای ویرایش اختیاری)"),
    ],
    ownerOnly: true,
  },
  audit: {
    label: "گزارش تغییرات",
    endpoint: "audit",
    columns: ["actor", "action", "entity", "entity_id", "created_at"],
    fields: [],
    readOnly: true,
  },
};
export const adminNav = [
  { label: "داشبورد", href: "/admin" },
  { label: "پروژه‌ها", href: "/admin/portfolio" },
  { label: "دسته‌بندی‌ها", href: "/admin/categories" },
  { label: "مهارت‌ها", href: "/admin/skills" },
  { label: "رزومه", href: "/admin/experience" },
  { label: "پیام‌ها", href: "/admin/messages" },
  { label: "رسانه‌ها", href: "/admin/media" },
  { label: "تحلیل", href: "/admin/analytics" },
  { label: "تنظیمات", href: "/admin/settings" },
];

// Content locale overrides remain editable through the existing resource editor.
for (const key of [
  "blocks",
  "portfolio",
  "categories",
  "skill-categories",
  "skills",
  "experience",
  "education",
  "certificates",
  "achievements",
  "resume-files",
  "heroes",
  "stats",
  "socials",
  "profiles",
  "settings",
  "gallery",
]) {
  if (resources[key])
    resources[key].fields.push(f("translations", "ترجمه‌ها", "json"));
}
resources.socials.fields.push(
  f("verified", "حساب واقعی تأیید شده توسط مالک", "checkbox"),
);
