"use client";

import { type ReactNode, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import clsx from "clsx";

import {
  type ExperienceDefinition,
  type ProfileHighlight,
  type ProjectDefinition,
  type SiteProfile,
  type SkillDefinition,
} from "@/lib/portfolio-types";
import { resolveReducedMotionPreference } from "@/src/lib/motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

type Props = {
  experiences: readonly ExperienceDefinition[];
  featuredProjects: readonly ProjectDefinition[];
  profileHighlights: readonly ProfileHighlight[];
  siteProfile: SiteProfile;
  skillDefinitions: readonly SkillDefinition[];
};

export default function HomePage({
  experiences,
  featuredProjects,
  profileHighlights,
  siteProfile,
  skillDefinitions,
}: Props) {
  const prefersReducedMotion =
    resolveReducedMotionPreference(useReducedMotion());
  const skillLabelById = useMemo(
    () =>
      Object.fromEntries(
        skillDefinitions.map((skill) => [skill.id, skill.label]),
      ) as Record<string, string>,
    [skillDefinitions],
  );

  const [primaryProject, ...secondaryProjects] = featuredProjects;
  const topSkills = skillDefinitions.slice(0, 14);

  function getSkillLabel(skillId: string) {
    return skillLabelById[skillId] ?? skillId;
  }

  const initial = prefersReducedMotion ? false : "hidden";
  const whileInView = prefersReducedMotion ? undefined : "visible";
  const viewport = prefersReducedMotion
    ? undefined
    : { once: true, amount: 0.3 };

  return (
    <main className="pb-4 pt-4">
      <section
        className="mx-auto flex min-h-[100svh] w-full max-w-[72rem] flex-col items-center justify-center px-4 pb-12 pt-24 text-center"
        id="home"
      >
        <motion.img
          alt={`${siteProfile.name} profile`}
          animate={{ opacity: 1, scale: 1 }}
          className="h-40 w-40 rounded-full border-[6px] border-white/95 object-cover shadow-[0_24px_70px_rgba(31,44,75,0.14)] sm:h-52 sm:w-52"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
          src={siteProfile.profileImageUrl ?? "/profile-pic.jpeg"}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 font-mono text-[0.76rem] font-medium uppercase tracking-[0.24em] text-slate-500 sm:text-[0.82rem]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          {siteProfile.title}
        </motion.p>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 max-w-[13ch] font-display text-5xl font-semibold leading-[1.06] tracking-[-0.06em] text-[#0e1528] sm:text-7xl"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {siteProfile.heroLabel}
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 max-w-[50rem] text-base leading-8 text-slate-600 sm:text-lg sm:leading-9"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 36 }}
          transition={{ duration: 0.5, delay: 0.14 }}
        >
          {siteProfile.recruiterPitch}
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <span className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Updated {siteProfile.lastUpdatedLabel}
          </span>
          <span className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Based in {siteProfile.location}
          </span>
          {siteProfile.currentFocusLabels.map((label) => (
            <span
              className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600"
              key={label}
            >
              {label}
            </span>
          ))}
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          transition={{ duration: 0.55, delay: 0.18 }}
        >
          <a
            className="group inline-flex items-center gap-2 rounded-full bg-[#11192c] px-7 py-4 text-base font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222]"
            href="#contact"
          >
            Connect with me
            <BsArrowRight className="transition group-hover:translate-x-1" />
          </a>

          <a
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-7 py-4 text-base font-semibold text-[#0e1528] shadow-[0_12px_30px_rgba(31,44,75,0.08)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            href="/resume"
          >
            View resume
            <HiDownload className="opacity-70 transition group-hover:translate-y-0.5" />
          </a>

          <a
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-7 py-4 text-base font-semibold text-[#0e1528] shadow-[0_12px_30px_rgba(31,44,75,0.08)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            href="/projects"
          >
            View projects
          </a>

          <div className="flex gap-3">
            <a
              aria-label="LinkedIn"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 shadow-[0_12px_30px_rgba(31,44,75,0.08)] transition hover:-translate-y-0.5 hover:text-[#0e1528]"
              href={siteProfile.linkedinUrl}
              rel="noreferrer"
              target="_blank"
            >
              <BsLinkedin className="text-xl" />
            </a>
            <a
              aria-label="GitHub"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 shadow-[0_12px_30px_rgba(31,44,75,0.08)] transition hover:-translate-y-0.5 hover:text-[#0e1528]"
              href={siteProfile.githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              <FaGithubSquare className="text-[1.35rem]" />
            </a>
          </div>
        </motion.div>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-sm leading-7 text-slate-500"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          transition={{ duration: 0.45, delay: 0.22 }}
        >
          Focused views:{" "}
          <a
            className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
            href="/resume?focus=flink"
          >
            Flink
          </a>
          ,{" "}
          <a
            className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
            href="/resume?focus=backend-engineering"
          >
            Backend
          </a>
          ,{" "}
          <a
            className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
            href="/resume?focus=platform-engineering"
          >
            Platform
          </a>{" "}
          or{" "}
          <a
            className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
            href="/resume?focus=ai"
          >
            AI
          </a>
        </motion.p>

        <motion.div
          animate={{ opacity: 1 }}
          className="mt-16 h-20 w-px rounded-full bg-gradient-to-b from-slate-200 via-slate-400/70 to-transparent"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          transition={{ duration: 0.65, delay: 0.28 }}
        />

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          transition={{ duration: 0.45, delay: 0.24 }}
        >
          {[
            { href: "#about", label: "About" },
            { href: "#projects", label: "Projects" },
            { href: "#skills", label: "Skills" },
            { href: "#experience", label: "Experience" },
            { href: "#contact", label: "Contact" },
          ].map((item) => (
            <a
              className="rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_10px_24px_rgba(31,44,75,0.05)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-[#0e1528]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      </section>

      <Section
        copy={siteProfile.overview}
        id="about"
        kicker="About me"
        narrow={true}
        prefersReducedMotion={prefersReducedMotion}
        title="About me"
      >
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {profileHighlights.slice(0, 3).map((highlight, index) => (
            <motion.article
              className="rounded-[1.9rem] border border-white/70 bg-white/75 px-6 py-6 text-left shadow-[0_18px_54px_rgba(31,44,75,0.06)] backdrop-blur-xl"
              custom={0.12 + index * 0.04}
              initial={initial}
              key={highlight.id}
              variants={fadeUp}
              viewport={viewport}
              whileInView={whileInView}
            >
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
                {highlight.label}
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-[#0e1528]">
                {highlight.value}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {highlight.detail}
              </p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section
        copy={[
          "A few of the projects I have worked on across telecom, retail, observability, and my own website.",
        ]}
        id="projects"
        kicker="Projects"
        prefersReducedMotion={prefersReducedMotion}
        title="Top projects"
        wide={true}
      >
        {primaryProject ? (
          <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <motion.article
              className="rounded-[2.3rem] border border-white/70 bg-white/82 px-6 py-8 shadow-[0_22px_70px_rgba(31,44,75,0.08)] backdrop-blur-xl sm:px-8"
              custom={0.08}
              initial={initial}
              variants={fadeUp}
              viewport={viewport}
              whileInView={whileInView}
            >
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
                Featured project
              </p>
              <h3 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#0e1528] sm:text-5xl">
                {primaryProject.title}
              </h3>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                {primaryProject.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {primaryProject.skillIds.map((skillId) => (
                  <span
                    className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600"
                    key={skillId}
                  >
                    {getSkillLabel(skillId)}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
                    Why it mattered
                  </p>
                  <p className="mt-3 text-base leading-8 text-slate-600">
                    {primaryProject.impact}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
                    What I built
                  </p>
                  <p className="mt-3 text-base leading-8 text-slate-600">
                    {primaryProject.detail}
                  </p>
                </div>
              </div>

              {primaryProject.proofLinks.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {primaryProject.proofLinks.map((link) => (
                    <a
                      className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-5 py-3 text-sm font-semibold text-[#0e1528] shadow-[0_10px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                      href={link.href}
                      key={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </motion.article>

            <div className="grid gap-4">
              {secondaryProjects.map((project, index) => (
                <motion.article
                  className="rounded-[2rem] border border-white/70 bg-white/75 px-6 py-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl"
                  custom={0.12 + index * 0.05}
                  initial={initial}
                  key={project.id}
                  variants={fadeUp}
                  viewport={viewport}
                  whileInView={whileInView}
                >
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
                    Project
                  </p>
                  <h3 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#0e1528]">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {project.summary}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {project.impact}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.skillIds.slice(0, 5).map((skillId) => (
                      <span
                        className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600"
                        key={skillId}
                      >
                        {getSkillLabel(skillId)}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        ) : null}

        <motion.div
          className="mt-8 text-center"
          custom={0.18}
          initial={initial}
          variants={fadeUp}
          viewport={viewport}
          whileInView={whileInView}
        >
          <a
            className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-5 py-3 text-sm font-semibold text-[#0e1528] shadow-[0_10px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            href="/projects"
          >
            Browse all projects
          </a>
        </motion.div>
      </Section>

      <Section
        copy={["Some of the tools and platforms I work with most often."]}
        id="skills"
        kicker="Skills"
        narrow={true}
        prefersReducedMotion={prefersReducedMotion}
        title="My skills"
      >
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-3"
          custom={0.1}
          initial={initial}
          variants={fadeUp}
          viewport={viewport}
          whileInView={whileInView}
        >
          {topSkills.map((skill) => (
            <span
              className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_10px_24px_rgba(31,44,75,0.05)]"
              key={skill.id}
            >
              {skill.label}
            </span>
          ))}
        </motion.div>
      </Section>

      <Section
        copy={[
          "I have worked across telecom, retail, analytics, and platform engineering, with most of the work centered on data systems and products.",
        ]}
        id="experience"
        medium={true}
        kicker="Experience"
        prefersReducedMotion={prefersReducedMotion}
        title="My experience"
      >
        <div className="mt-12 grid gap-4">
          {experiences.map((experience, index) => (
            <motion.article
              className="grid gap-5 rounded-[2rem] border border-white/70 bg-white/75 px-6 py-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:px-7"
              custom={0.08 + index * 0.04}
              initial={initial}
              key={experience.id}
              variants={fadeUp}
              viewport={viewport}
              whileInView={whileInView}
            >
              <img
                alt={experience.company}
                className="h-16 w-16 rounded-[1.25rem] object-cover shadow-[0_12px_28px_rgba(31,44,75,0.08)]"
                src={experience.icon}
              />
              <div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-[#0e1528]">
                      {experience.company}
                    </h3>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {experience.title}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">{experience.date}</p>
                </div>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  {experience.description}
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  {experience.bullets.slice(0, 2).map((bullet) => (
                    <li className="flex gap-3" key={bullet.id}>
                      <span className="mt-[0.6rem] h-2 w-2 rounded-full bg-[#1f3b73]" />
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section
        copy={[
          "I also write about systems, engineering, and related ideas from time to time.",
        ]}
        id="blog-bridge"
        medium={true}
        kicker="Blog"
        prefersReducedMotion={prefersReducedMotion}
        title="Blog"
      >
        <motion.div
          className="mt-10 rounded-[2.2rem] border border-white/70 bg-[radial-gradient(circle_at_12%_12%,rgba(176,177,255,0.18),transparent_22%),radial-gradient(circle_at_96%_0%,rgba(255,214,223,0.22),transparent_28%),rgba(255,255,255,0.82)] px-6 py-8 shadow-[0_18px_54px_rgba(31,44,75,0.06)] backdrop-blur-xl sm:px-10"
          custom={0.08}
          initial={initial}
          variants={fadeUp}
          viewport={viewport}
          whileInView={whileInView}
        >
          <a
            className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-5 py-3 text-sm font-semibold text-[#0e1528] shadow-[0_10px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            href="/blog"
          >
            Open the blog
          </a>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Posts are published on Wix and surfaced here so the writing stays
            easy to find from this site.
          </p>
        </motion.div>
      </Section>

      <Section
        copy={[
          `Please contact me directly at ${siteProfile.email} or through LinkedIn.`,
        ]}
        id="contact"
        kicker="Contact"
        narrow={true}
        prefersReducedMotion={prefersReducedMotion}
        title="Contact me"
      >
        <motion.div
          className="mt-10 rounded-[2.35rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(245,247,255,0.88))] px-6 py-8 shadow-[0_26px_70px_rgba(31,44,75,0.08)] backdrop-blur-xl sm:px-10 sm:py-10"
          custom={0.08}
          initial={initial}
          variants={fadeUp}
          viewport={viewport}
          whileInView={whileInView}
        >
          <div className="flex flex-wrap justify-center gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-[#11192c] px-7 py-4 text-base font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222]"
              href={`mailto:${siteProfile.email}`}
            >
              Email {siteProfile.name}
              <BsArrowRight className="transition group-hover:translate-x-1" />
            </a>
            <a
              className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-5 py-4 text-sm font-semibold text-[#0e1528] shadow-[0_10px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              href="/resume"
            >
              Open resume
            </a>
            <a
              className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-5 py-4 text-sm font-semibold text-[#0e1528] shadow-[0_10px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              href="/projects"
            >
              See projects
            </a>
          </div>
        </motion.div>
      </Section>
    </main>
  );
}

type SectionProps = {
  id: string;
  kicker: string;
  title: string;
  copy: readonly string[];
  children?: ReactNode;
  narrow?: boolean;
  medium?: boolean;
  wide?: boolean;
  prefersReducedMotion: boolean;
};

function Section({
  id,
  kicker,
  title,
  copy,
  children,
  narrow = false,
  medium = false,
  wide = false,
  prefersReducedMotion,
}: SectionProps) {
  const initial = prefersReducedMotion ? false : "hidden";
  const whileInView = prefersReducedMotion ? undefined : "visible";
  const viewport = prefersReducedMotion
    ? undefined
    : { once: true, amount: 0.24 };

  return (
    <motion.section
      className={clsx(
        "scroll-mt-28 px-4 text-center",
        narrow && "mx-auto w-full max-w-[52rem]",
        medium && "mx-auto w-full max-w-[64rem]",
        wide && "mx-auto w-full max-w-[74rem]",
      )}
      custom={0.04}
      id={id}
      initial={initial}
      variants={fadeUp}
      viewport={viewport}
      whileInView={whileInView}
    >
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
        {kicker}
      </p>
      <h2 className="mx-auto mt-4 max-w-[18ch] font-display text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#0e1528] sm:text-5xl">
        {title}
      </h2>
      <div className="mx-auto mt-5 max-w-[50rem] space-y-4 text-base leading-8 text-slate-600 sm:text-[1.04rem] sm:leading-9">
        {copy.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {children}
    </motion.section>
  );
}
