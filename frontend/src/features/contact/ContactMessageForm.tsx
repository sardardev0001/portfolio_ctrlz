"use client";
import { usePreferences, useT } from "@/i18n/provider";

import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  FileText,
  LoaderCircle,
  Mail,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";
import { useHudMotion } from "@/components/hud/useHudMotion";
import { api, errorText } from "@/lib/api";
import { useHydrated } from "@/lib/use-hydrated";
import ContactHudFrame from "./ContactHudFrame";

export const createContactSchema = (t: (text: string) => string) =>
  z.object({
    name: z.string().trim().min(2, t("نام خود را کامل وارد کنید.")).max(100),
    email: z
      .string()
      .trim()
      .pipe(z.email(t("ایمیل معتبر وارد کنید.")).max(254)),
    subject: z
      .string()
      .trim()
      .min(3, t("موضوع را کامل‌تر وارد کنید."))
      .max(160),
    message: z.string().trim().min(10, t("پیام را کامل‌تر بنویسید.")).max(5000),
    website: z.string().optional(),
  });
export const contactSchema = createContactSchema((text) => text);
type FormValues = z.infer<typeof contactSchema>;

export default function ContactMessageForm({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const t = useT();
  const { locale } = usePreferences();
  const hydrated = useHydrated();
  const { ref, entered, interaction } = useHudMotion<HTMLElement>();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const sending = useRef(false);
  const [requestPending, setRequestPending] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(createContactSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  });
  const message = useWatch({ control, name: "message" }) || "";

  async function submit(values: FormValues) {
    if (sending.current) return;
    sending.current = true;
    setRequestPending(true);
    setServerError("");
    try {
      await api("contact/", { method: "POST", body: JSON.stringify(values) });
      setSuccess(true);
      reset();
    } catch (error) {
      setServerError(t(errorText(error)));
    } finally {
      sending.current = false;
      setRequestPending(false);
    }
  }

  return (
    <section
      ref={ref}
      {...interaction}
      className="contact-message-panel"
      data-entered={entered}
      aria-labelledby="contact-form-heading"
    >
      <span className="contact-form-texture" aria-hidden="true" />
      <span
        className="contact-method-ambient contact-form-ambient"
        aria-hidden="true"
      />
      <ContactHudFrame mode="form" />
      <header className="contact-form-heading">
        <Clapperboard className="contact-clapper" aria-hidden="true" />
        <div>
          <h2 id="contact-form-heading">{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {success ? (
        <div className="contact-success" role="status" aria-live="polite">
          <CheckCircle2 aria-hidden="true" />
          <h3>{t("پیام شما با موفقیت ارسال شد.")}</h3>
          <p>{t("به‌زودی پاسخ می‌دهم.")}</p>
          <button type="button" onClick={() => setSuccess(false)}>
            {t("پیام جدید")}
          </button>
        </div>
      ) : (
        <form
          method="post"
          onSubmit={(event) => void handleSubmit(submit)(event)}
          noValidate
        >
          <div className="contact-form-identity">
            <label
              className="contact-field"
              data-invalid={Boolean(errors.name)}
            >
              <span className="contact-field-label" id="contact-name-label">
                <UserRound aria-hidden="true" /> {t("نام و نام خانوادگی")}
              </span>
              <input
                {...register("name")}
                aria-labelledby="contact-name-label"
                autoComplete="name"
                placeholder={t("نام شما")}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "contact-name-error" : undefined
                }
              />
              {errors.name && (
                <small id="contact-name-error" role="alert">
                  {errors.name.message}
                </small>
              )}
            </label>
            <label
              className="contact-field"
              data-invalid={Boolean(errors.email)}
            >
              <span className="contact-field-label" id="contact-email-label">
                <Mail aria-hidden="true" /> {t("ایمیل")}
              </span>
              <input
                {...register("email")}
                aria-labelledby="contact-email-label"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={t("name@example.com")}
                dir="ltr"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
              />
              {errors.email && (
                <small id="contact-email-error" role="alert">
                  {errors.email.message}
                </small>
              )}
            </label>
          </div>
          <label
            className="contact-field"
            data-invalid={Boolean(errors.subject)}
          >
            <span className="contact-field-label" id="contact-subject-label">
              <FileText aria-hidden="true" /> {t("موضوع")}
            </span>
            <input
              {...register("subject")}
              aria-labelledby="contact-subject-label"
              placeholder={t("همکاری، سفارش پروژه...")}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "contact-subject-error" : undefined
              }
            />
            {errors.subject && (
              <small id="contact-subject-error" role="alert">
                {errors.subject.message}
              </small>
            )}
          </label>
          <label
            className="contact-field contact-message-field"
            data-invalid={Boolean(errors.message)}
          >
            <span className="contact-field-label" id="contact-message-label">
              <MessageCircle aria-hidden="true" /> {t("پیام شما")}
            </span>
            <textarea
              {...register("message")}
              aria-labelledby="contact-message-label"
              rows={5}
              placeholder={t("ایده یا پروژه‌تان را اینجا بنویسید...")}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message
                  ? "contact-message-error"
                  : message.length
                    ? "contact-message-count"
                    : undefined
              }
            />
            {errors.message && (
              <small id="contact-message-error" role="alert">
                {errors.message.message}
              </small>
            )}
            {message.length > 0 && (
              <span
                id="contact-message-count"
                className="contact-character-count"
                aria-live="off"
                dir="ltr"
              >
                {new Intl.NumberFormat(locale).format(message.length)} /{" "}
                {new Intl.NumberFormat(locale).format(5000)}
              </span>
            )}
          </label>
          <input
            {...register("website")}
            tabIndex={-1}
            autoComplete="off"
            className="honeypot"
            aria-hidden="true"
          />
          {serverError && (
            <p className="contact-submit-error" role="alert">
              {serverError}
            </p>
          )}
          <button
            type="submit"
            className="contact-send-button"
            disabled={!hydrated || isSubmitting || requestPending}
            aria-busy={isSubmitting || requestPending}
          >
            <ContactHudFrame mode="button" />
            <Send className="contact-send-icon" aria-hidden="true" />
            <span>
              {isSubmitting || requestPending
                ? t("در حال ارسال...")
                : t("ارسال پیام")}
            </span>
            <span className="contact-send-arrow" aria-hidden="true">
              {isSubmitting || requestPending ? (
                <LoaderCircle className="contact-spinner" />
              ) : (
                <ChevronRight />
              )}
            </span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {isSubmitting || requestPending ? t("در حال ارسال پیام") : ""}
          </span>
        </form>
      )}
    </section>
  );
}
