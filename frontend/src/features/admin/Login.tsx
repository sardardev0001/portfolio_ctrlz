"use client";
import { LanguageToggle, usePreferences, useT } from "@/i18n/provider";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ApiFailure, api, errorText } from "@/lib/api";
import { useHydrated } from "@/lib/use-hydrated";

type LoginChallenge = {
  challenge_id: string;
  left: number;
  right: number;
  operator: "+" | "−";
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

export default function Login() {
  const t = useT();
  const { locale } = usePreferences();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(true);
  const router = useRouter();
  const initialized = useRef(false);
  const challengeSequence = useRef(0);

  const refreshChallenge = useCallback(async () => {
    const sequence = ++challengeSequence.current;
    setChallengeLoading(true);
    setChallenge(null);
    setChallengeAnswer("");
    try {
      const response = await api<LoginChallenge>("auth/challenge/");
      if (sequence !== challengeSequence.current) return;
      setChallenge(response.data);
      setError("");
    } catch (failure) {
      setError(errorText(failure, "fa"));
    } finally {
      setChallengeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void refreshChallenge();
  }, [refreshChallenge]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge || !/^(100|[1-9]?\d)$/.test(challengeAnswer)) {
      setError("پاسخ سؤال امنیتی باید عددی بین ۰ تا ۱۰۰ باشد.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api("auth/login/", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          challenge_id: challenge.challenge_id,
          challenge_answer: Number(challengeAnswer),
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["me"] });
      router.push("/admin");
      router.refresh();
    } catch (e) {
      const message =
        e instanceof ApiFailure && e.code === "VALIDATION_ERROR"
          ? "پاسخ سؤال امنیتی نادرست است یا زمان آن گذشته؛ سؤال تازه را پاسخ دهید."
          : errorText(e, "fa");
      await refreshChallenge();
      setError(message);
    } finally {
      setPassword("");
      setLoading(false);
    }
  }
  return (
    <main className="admin-login" dir={locale === "fa" ? "rtl" : "ltr"}>
      <div className="login-panel neon-panel">
        <div className="admin-preferences">
          <LanguageToggle />
        </div>
        <Image
          src="/assets/brand/logo-clean-blue.webp"
          width={220}
          height={97}
          alt="CTRL.Z"
          priority
        />
        <span className="eyebrow">{t("STUDIO CONTROL CENTER")}</span>
        <h1>{t("ورود به پنل مدیریت")}</h1>
        <p>{t("محتوا، پروژه‌ها و پیام‌ها را اینجا مدیریت کنید.")}</p>
        <form method="post" onSubmit={submit}>
          <label>
            {t("نام کاربری")}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            {t("رمز عبور")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <div className="login-challenge">
            <div className="login-challenge-heading">
              <span>{t("سؤال امنیتی")}</span>
              <button
                type="button"
                onClick={() => void refreshChallenge()}
                disabled={challengeLoading || loading}
                aria-label={t("سؤال امنیتی جدید")}
              >
                {t("سؤال جدید")}
              </button>
            </div>
            <label htmlFor="challenge-answer">
              <span
                className="login-challenge-question"
                dir="ltr"
                aria-live="polite"
              >
                {challenge
                  ? `${challenge.left} ${challenge.operator} ${challenge.right} = ?`
                  : challengeLoading
                    ? "در حال دریافت سؤال..."
                    : "سؤال در دسترس نیست؛ دوباره تلاش کنید."}
              </span>
              <input
                id="challenge-answer"
                name="challenge_answer"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                pattern="100|[1-9]?[0-9]"
                value={challengeAnswer}
                onChange={(event) =>
                  setChallengeAnswer(normalizeDigits(event.target.value))
                }
                placeholder={t("پاسخ (۰ تا ۱۰۰)")}
                required
                disabled={!challenge}
              />
            </label>
          </div>
          {error && (
            <p className="field-error" role="alert">
              {t(error)}
            </p>
          )}
          <button
            className="button"
            disabled={!hydrated || loading || !challenge}
          >
            {loading ? t("در حال ورود...") : t("ورود امن")}
          </button>
        </form>
      </div>
    </main>
  );
}
