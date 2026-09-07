import { motion, type Variants } from "framer-motion";

import type { ProfileHighlight, SiteProfile } from "@/lib/portfolio-types";
import {
  ArrowRightIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedinIcon,
} from "@/src/components/home/HomePageIcons";
import SystemsBackdrop from "@/src/components/home/SystemsBackdrop";

type Props = {
  readonly profileHighlights: readonly ProfileHighlight[];
  readonly siteProfile: SiteProfile;
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

export default function HomePageHero({ profileHighlights, siteProfile }: Props) {
  const heroTitleLines =
    siteProfile.heroTitleLines && siteProfile.heroTitleLines.length > 0
      ? siteProfile.heroTitleLines
      : [siteProfile.heroLabel];
  const heroSubtitle = siteProfile.heroSubtitle ?? siteProfile.recruiterPitch;

  return (
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
            className="h-24 w-24 rounded-full border-[5px] border-white object-cover shadow-[0_28px_80px_rgba(16,24,39,0.18)] sm:h-32 sm:w-32"
            src={siteProfile.profileImageUrl ?? "/profile-pic.jpeg"}
            variants={profileVariants}
          />
          <motion.div variants={riseVariants}>
            <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#1f3b73]">
              {siteProfile.title}
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {siteProfile.location} / updated {siteProfile.lastUpdatedLabel}
            </p>
          </motion.div>
        </div>

        <motion.h1
          className="mx-auto mt-8 max-w-3xl text-balance font-display text-4xl font-semibold leading-[0.96] tracking-[-0.06em] text-[#0e1528] sm:mt-10 sm:text-5xl lg:text-6xl"
          variants={titleVariants}
        >
          {heroTitleLines.map((line, index) => (
            <span className="block" key={`${line}-${index}`}>
              {line}
            </span>
          ))}
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-center text-base leading-8 text-slate-600 sm:mt-8 sm:text-xl sm:leading-9"
          variants={riseVariants}
        >
          {heroSubtitle}
        </motion.p>

        <motion.div
          className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2.5"
          variants={staggerVariants}
        >
          {siteProfile.currentFocusLabels.map((label) => (
            <motion.span
              className="rounded-full border border-[#d9e3f5] bg-white/92 px-3.5 py-2 text-xs font-semibold tracking-[0.01em] text-[#0e1528] shadow-[0_8px_24px_rgba(31,44,75,0.06)] sm:text-sm"
              key={label}
              variants={compactItemVariants}
            >
              {label}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10"
          variants={staggerVariants}
        >
          <motion.a
            className="group inline-flex items-center gap-2 rounded-full bg-[#101827] px-6 py-3 text-sm font-semibold text-white shadow-[0_28px_80px_rgba(16,24,39,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0b1220] sm:text-base"
            href="/projects"
            variants={compactItemVariants}
          >
            View selected work
            <ArrowRightIcon className="transition group-hover:translate-x-1" />
          </motion.a>
          <motion.a
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-[#0e1528] shadow-[0_8px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:bg-white sm:text-base"
            href="/resume"
            variants={compactItemVariants}
          >
            Resume
            <DownloadIcon className="opacity-70 transition group-hover:translate-y-0.5" />
          </motion.a>
          <motion.a
            aria-label="LinkedIn"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-[0_8px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:text-[#0e1528]"
            href={siteProfile.linkedinUrl}
            rel="noreferrer"
            target="_blank"
            variants={compactItemVariants}
          >
            <LinkedinIcon className="h-4 w-4" />
          </motion.a>
          <motion.a
            aria-label="GitHub"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-[0_8px_24px_rgba(31,44,75,0.06)] transition hover:-translate-y-0.5 hover:text-[#0e1528]"
            href={siteProfile.githubUrl}
            rel="noreferrer"
            target="_blank"
            variants={compactItemVariants}
          >
            <GitHubIcon className="h-5 w-5" />
          </motion.a>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/80 bg-slate-200/80 shadow-[0_18px_48px_rgba(31,44,75,0.08)]"
          variants={staggerVariants}
        >
          {profileHighlights.slice(0, 4).map((item) => (
            <motion.div
              className="bg-white/76 px-4 py-4 sm:px-6 sm:py-5"
              key={item.id}
              variants={compactItemVariants}
            >
              <p className="text-xl font-semibold leading-snug tracking-tight text-[#0e1528] sm:text-2xl">
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
  );
}
