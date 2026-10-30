"use client";
import { usePreferences, useT } from "@/i18n/provider";
import { useRef } from "react";
import { useSiteQuery as useQuery } from "@/i18n/provider";
import { Download } from "lucide-react";
import { api, errorText } from "@/lib/api";
import EducationCard from "@/features/resume/EducationCard";
import {
  AchievementsPanel,
  CoursesCertificatesPanel,
  ResumeAboutPanel,
  ResumeSkillsPanel,
  WorkExperiencePanel,
} from "@/features/resume/ResumePanels";
import { getHero } from "./constants";
import type { Content, Resume, Skill } from "@/types/api";
import { Title, useEntrance, HeroVisual } from "./components";

export default function ResumePage({ content }: { content: Content }) {
  const t = useT();
  const { locale } = usePreferences();
  const hero = getHero(content, "resume");
  const ref = useRef<HTMLElement>(null);
  useEntrance(ref);
  const resume = useQuery({
    queryKey: ["resume"],
    queryFn: () => api<Resume>("resume/"),
  });
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: () => api<Skill[]>("skills/"),
  });
  const profile = content.profile;
  const resumeFile = resume.data?.data.files.find(
    (file) => file.language === locale,
  );
  const block = (key: string) =>
    content.blocks?.find((item) => item.key === key);
  return (
    <>
      <section className="hero hero-inner hero-resume" ref={ref}>
        <div className="hero-copy">
          <span className="eyebrow">{t("THE JOURNEY SO FAR")}</span>
          <Title hero={hero} />
        </div>
        <HeroVisual page="resume" artwork={hero.artwork} />
      </section>
      <section className="profile-strip neon-panel">
        {[
          [t("نام و برند"), profile.name],
          [t("حوزه فعالیت"), profile.role],
          [t("موقعیت"), profile.location],
          [t("شروع فعالیت"), String(profile.start_year)],
          [t("تخصص اصلی"), profile.specialization],
        ].map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      {resume.isLoading ? (
        <p className="feedback">{t("در حال دریافت رزومه...")}</p>
      ) : resume.isError ? (
        <p className="feedback error">{t(errorText(resume.error))}</p>
      ) : (
        resume.data && (
          <>
            <div className="resume-sections">
              <section
                id="experience"
                className="resume-section"
                aria-label={t("تجربه‌های کاری")}
              >
                <WorkExperiencePanel
                  items={resume.data.data.experience}
                  heading={block("resume-experience")}
                />
              </section>
              {resume.data.data.education.map((item) => (
                <section
                  key={item.id}
                  id={`education-${item.id}`}
                  className="resume-section"
                  aria-label={t("تحصیلات")}
                >
                  <EducationCard education={item} />
                </section>
              ))}
              <section
                id="certificates"
                className="resume-section"
                aria-label={t("دوره‌ها و گواهینامه‌ها")}
              >
                <CoursesCertificatesPanel
                  items={resume.data.data.certificates}
                  heading={block("resume-certificates")}
                />
              </section>
              <section
                id="resume-skills"
                className="resume-section"
                aria-label={t("مهارت‌ها")}
              >
                {skills.isError ? (
                  <p className="feedback error">{t(errorText(skills.error))}</p>
                ) : (
                  <ResumeSkillsPanel
                    items={(skills.data?.data || []).filter(
                      (item) => item.kind === "software",
                    )}
                    heading={block("resume-skills")}
                  />
                )}
              </section>
              <section
                id="achievements"
                className="resume-section"
                aria-label={t("دستاوردها")}
              >
                <AchievementsPanel
                  items={resume.data.data.achievements}
                  heading={block("resume-achievements")}
                />
              </section>
            </div>
            {resumeFile ? (
              <div className="resume-file-action">
                <a
                  className="button download-button"
                  href={resumeFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download aria-hidden="true" /> {t("دریافت رزومه PDF")}
                </a>
              </div>
            ) : (
              <p className="feedback" role="status">
                {t("resume.missing")}
              </p>
            )}
            <ResumeAboutPanel block={block("resume-about")} bio={profile.bio} />
          </>
        )
      )}
    </>
  );
}
