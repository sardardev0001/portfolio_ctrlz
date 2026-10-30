"use client";
import dynamic from "next/dynamic";
import type { Content } from "@/types/api";
const Home = dynamic(() => import("./Home"));
const About = dynamic(() => import("./About"));
const Portfolio = dynamic(() => import("./Portfolio"));
const Skills = dynamic(() => import("./Skills"));
const ResumePage = dynamic(() => import("./ResumePage"));
const Contact = dynamic(() => import("./Contact"));
export default function PublicPage({
  page,
  content,
}: {
  page: string;
  content: Content;
}) {
  const Component =
    (
      {
        home: Home,
        about: About,
        portfolio: Portfolio,
        skills: Skills,
        resume: ResumePage,
        contact: Contact,
      } as const
    )[page as "home"] || Home;
  return (
    <main id="main" className={`page-${page}`}>
      <Component content={content} />
    </main>
  );
}
