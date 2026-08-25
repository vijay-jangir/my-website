"use client";

import { type ReactNode, useMemo } from "react";
import { MotionConfig, motion, type Variants } from "framer-motion";

import {
  type ExperienceDefinition,
  type ProfileHighlight,
  type ProjectDefinition,
  type SiteProfile,
  type SkillDefinition,
} from "@/lib/portfolio-types";
import SystemsBackdrop from "@/src/components/home/SystemsBackdrop";

type Props = {
  experiences: readonly ExperienceDefinition[];
  featuredProjects: readonly ProjectDefinition[];
  profileHighlights: readonly ProfileHighlight[];
  siteProfile: SiteProfile;
  skillDefinitions: readonly SkillDefinition[];
};

const entranceEase = [0.22, 1, 0.36, 1] as const;

const heroContainerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.08,
    },
  },
};

const profileVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.42, ease: entranceEase },
  },
};

const riseVariants: Variants = {
  hidden: { filter: "blur(8px)", opacity: 0, y: 34 },
  show: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: entranceEase },
  },
};

const titleVariants: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 54 },
  show: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: entranceEase },
  },
};

const staggerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const compactItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: entranceEase },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: entranceEase },
  },
};

export default function HomePage({
  experiences,
  featuredProjects,
  profileHighlights,
  siteProfile,
  skillDefinitions,
}: Props) {
  const skillLabelById = useMemo(
    () =>
      Object.fromEntries(
        skillDefinitions.map((skill) => [skill.id, skill.label]),
      ) as Record<string, string>,
    [skillDefinitions],
  );
  const featured = featuredProjects.slice(0, 3);
  const experienceSummary = experiences.slice(0, 3);

  function getSkillLabel(skillId: string) {
    return skillLabelById[skillId] ?? skillId;
  }

  function getProjectHref(project: ProjectDefinition) {
    return project.slug ? `/projects/${project.slug}` : "/projects";
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="pb-8">
        <motion.section
          animate="show"
          className="relative mx-auto flex min-h-[calc(100svh-7.5rem)] w-full max-w-[82rem] items-center justify-center overflow-hidden px-4 pb-16 pt-6 text-center"
          id="home"
          initial="hidden"
          variants={heroContainerVariants}
        >
          <SystemsBackdrop />
          <div className="relative z-10 max-w-5xl">
            <div className="flex flex-col items-center gap-5">
              <motion.img
                alt={`${siteProfile.name} profile`}
                className="h-24 w-24 rounded-full border-[5px] border-white object-cover shadow-[0_20px_52px_rgba(31,44,75,0.16)] sm:h-32 sm:w-32"
                src={siteProfile.profileImageUrl ?? "/profile-pic.jpeg"}
                variants={profileVariants}
              />
              <motion.div variants={riseVariants}>
                <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#1f3b73]">
                  {siteProfile.title}
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  {siteProfile.location} / updated{" "}
                  {siteProfile.lastUpdatedLabel}
                </p>
              </motion.div>
            </div>

            <motion.h1
              className="mx-auto mt-8 max-w-[14ch] font-display text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-[#0e1528] sm:mt-10 sm:text-6xl lg:text-7xl"
              variants={titleVariants}
            >
              {siteProfile.heroLabel}
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 line-clamp-4 max-w-[21rem] text-center text-lg leading-8 text-slate-600 sm:hidden"
              variants={riseVariants}
            >
              {siteProfile.recruiterPitch}
            </motion.p>
            <motion.p
              className="mx-auto mt-8 hidden max-w-3xl text-xl leading-9 text-slate-600 sm:block"
              variants={riseVariants}
            >
              {siteProfile.recruiterPitch}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10"
              variants={staggerVariants}
            >
              <motion.a
                className="group inline-flex items-center gap-2 rounded-full bg-[#101827] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,24,39,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0b1220] sm:text-base"
                href="/projects"
                variants={compactItemVariants}
              >
                View selected work
                <ArrowRightIcon className="transition group-hover:translate-x-1" />
              </motion.a>
              <motion.a
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-[#0e1528] shadow-[0_14px_30px_rgba(31,44,75,0.09)] transition hover:-translate-y-0.5 hover:bg-white sm:text-base"
                href="/resume"
                variants={compactItemVariants}
              >
                Resume
                <DownloadIcon className="opacity-70 transition group-hover:translate-y-0.5" />
              </motion.a>
              <motion.a
                aria-label="LinkedIn"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-[0_14px_30px_rgba(31,44,75,0.08)] transition hover:-translate-y-0.5 hover:text-[#0e1528]"
                href={siteProfile.linkedinUrl}
                rel="noreferrer"
                target="_blank"
                variants={compactItemVariants}
              >
                <LinkedinIcon className="h-4 w-4" />
              </motion.a>
              <motion.a
                aria-label="GitHub"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-[0_14px_30px_rgba(31,44,75,0.08)] transition hover:-translate-y-0.5 hover:text-[#0e1528]"
                href={siteProfile.githubUrl}
                rel="noreferrer"
                target="_blank"
                variants={compactItemVariants}
              >
                <GitHubIcon className="h-5 w-5" />
              </motion.a>
            </motion.div>

            <motion.div
              className="mx-auto mt-8 hidden max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-[1.4rem] border border-white/80 bg-slate-200/80 shadow-[0_20px_56px_rgba(31,44,75,0.08)] sm:grid"
              variants={staggerVariants}
            >
              {profileHighlights.slice(0, 2).map((item) => (
                <motion.div
                  className="bg-white/76 px-6 py-5"
                  key={item.id}
                  variants={compactItemVariants}
                >
                  <p className="text-2xl font-semibold tracking-tight text-[#0e1528]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <Section
          copy="Internal names stay private. Each writeup focuses on the problem, my ownership, the architecture, the tradeoffs, and what can be shared publicly."
          eyebrow="Selected work"
          id="projects"
          title="Systems I have actually built."
        >
          <motion.div
            className="mt-12 grid gap-px overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-slate-200/80 shadow-[0_24px_70px_rgba(31,44,75,0.08)] lg:grid-cols-3"
            initial="hidden"
            variants={staggerVariants}
            viewport={{ amount: 0.18, once: true }}
            whileInView="show"
          >
            {featured.map((project) => (
              <motion.a
                className="group flex min-h-[24rem] flex-col bg-white/88 p-7 transition hover:bg-white"
                href={getProjectHref(project)}
                key={project.id}
                variants={cardVariants}
              >
                <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#1f3b73]">
                  Selected system
                </p>
                <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#0e1528]">
                  {project.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {project.caseStudy?.headline ?? project.summary}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {project.skillIds.slice(0, 3).map((skillId) => (
                    <span
                      className="min-h-14 rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-xs font-semibold leading-tight text-slate-500"
                      key={skillId}
                    >
                      {getSkillLabel(skillId)}
                    </span>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#1f3b73]">
                  Open case study
                  <ArrowRightIcon className="transition group-hover:translate-x-1" />
                </span>
              </motion.a>
            ))}
          </motion.div>
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.42, ease: entranceEase }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <a
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-semibold text-[#0e1528] transition hover:-translate-y-0.5 hover:bg-white"
              href="/projects"
            >
              Browse all projects
              <ArrowRightIcon />
            </a>
          </motion.div>
        </Section>

        <Section
          copy="I usually work on systems that already matter in production: heavy data movement, unclear ownership, fragile access paths, and platform work that has to become easier to operate."
          eyebrow="Experience"
          id="experience"
          title="Built across telecom, retail, and platform teams."
        >
          <motion.div
            className="mt-12 divide-y divide-slate-200/80 rounded-[1.8rem] border border-slate-200/80 bg-white/82 shadow-[0_24px_70px_rgba(31,44,75,0.08)]"
            initial="hidden"
            variants={staggerVariants}
            viewport={{ amount: 0.22, once: true }}
            whileInView="show"
          >
            {experienceSummary.map((experience) => (
              <motion.article
                className="grid gap-6 p-6 text-left md:grid-cols-[12rem_minmax(0,1fr)] md:p-8"
                key={experience.id}
                variants={cardVariants}
              >
                <div>
                  <p className="text-sm font-semibold text-[#0e1528]">
                    {experience.company}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {experience.date}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-[#0e1528]">
                    {experience.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-slate-600">
                    {experience.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        <motion.section
          className="mx-auto mt-24 max-w-[76rem] rounded-[2rem] bg-[#101827] px-6 py-12 text-center text-white shadow-[0_28px_80px_rgba(16,24,39,0.22)] sm:px-10"
          id="contact"
          initial={{ opacity: 0, y: 34 }}
          transition={{ duration: 0.6, ease: entranceEase }}
          viewport={{ amount: 0.24, once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/55">
            Contact
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            I am most useful where data systems need clearer ownership, safer
            access, and better day-to-day operation.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#101827] transition hover:-translate-y-0.5"
              href={`mailto:${siteProfile.email}`}
            >
              Email {siteProfile.name}
              <ArrowRightIcon />
            </a>
            <a
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              href="/resume"
            >
              Open resume
            </a>
          </div>
        </motion.section>
      </main>
    </MotionConfig>
  );
}

type IconProps = {
  className?: string;
};

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.7 8.9H2.8v12h2.9v-12Zm.2-3.7a1.7 1.7 0 1 0-3.4 0 1.7 1.7 0 0 0 3.4 0Zm8.5 3.5a4 4 0 0 0-3.1 1.3V8.9H8.5v12h2.9v-6.2c0-2 1.1-3.1 2.6-3.1 1.4 0 2.2.9 2.2 2.7v6.6h2.9v-7.2c0-3.2-1.8-5-4.7-5Z" />
    </svg>
  );
}

function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.3-1.1-3.3-1.1-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.2-4.5-1.1-4.5-4.8 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .6 1.4.2 2.4.1 2.6.7.7 1 1.6 1 2.7 0 3.7-2.3 4.6-4.5 4.8.4.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function Section({
  copy,
  eyebrow,
  id,
  title,
  children,
}: {
  copy: string;
  eyebrow: string;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[76rem] px-4 py-20" id={id}>
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#1f3b73]">
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-[15ch] text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#0e1528] sm:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          {copy}
        </p>
      </div>
      {children}
    </section>
  );
}
