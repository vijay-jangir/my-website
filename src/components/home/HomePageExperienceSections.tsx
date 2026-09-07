import { motion, type Variants } from "framer-motion";

import type { ExperienceDefinition, SiteProfile } from "@/lib/portfolio-types";
import { ArrowRightIcon } from "@/src/components/home/HomePageIcons";
import HomeSection from "@/src/components/home/HomeSection";

type ExperienceSectionProps = {
  readonly experiences: readonly ExperienceDefinition[];
};

type ContactSectionProps = {
  readonly siteProfile: SiteProfile;
};

const entranceEase = [0.22, 1, 0.36, 1] as const;

const staggerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
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

const differentiators = [
  {
    description:
      "The work spans production data platforms, internal developer systems, and AI workflows that have to survive real operational pressure.",
    title:
      "12+ years across telecom, retail, and enterprise data — not just demos",
  },
  {
    description:
      "I do the system design, the service boundaries, the policy model, and the implementation details needed to make the platform actually operate.",
    title: "Architecture to code — I design the system and build it",
  },
  {
    description:
      "The platform shape starts with access, lineage, and observability so AI and data workflows stay usable after the prototype phase.",
    title: "Governance-first — authorization, metadata, and audit from day one",
  },
] as const;

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <HomeSection
      copy="I usually work on systems that already matter in production: heavy data movement, unclear ownership, fragile access paths, and platform work that has to become easier to operate."
      eyebrow="Experience"
      id="experience"
      title="Built across AI, data platforms, telecom, and retail."
    >
      <motion.div
        className="mt-12 divide-y divide-slate-200/80 rounded-3xl border border-slate-200/80 bg-white/82 shadow-[0_18px_48px_rgba(31,44,75,0.08)]"
        initial="hidden"
        variants={staggerVariants}
        viewport={{ amount: 0.22, once: true }}
        whileInView="show"
      >
        {experiences.map((experience) => (
          <motion.article
            className="grid gap-6 p-6 text-left md:grid-cols-[12rem_minmax(0,1fr)] md:p-8"
            key={experience.id}
            variants={cardVariants}
          >
            <div>
              <p className="text-sm font-semibold text-[#0e1528]">
                {experience.company}
              </p>
              <p className="mt-1 text-sm text-slate-500">{experience.date}</p>
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
    </HomeSection>
  );
}

export function WhyVijaySection() {
  return (
    <HomeSection
      copy="The work stays close to production reality: platform design, implementation, and governance decisions in the same lane instead of split across separate roles."
      eyebrow="Why Vijay"
      id="why-vijay"
      title="Built for systems that need to work after the demo."
    >
      <motion.div
        className="mt-12 grid gap-4 lg:grid-cols-3"
        initial="hidden"
        variants={staggerVariants}
        viewport={{ amount: 0.18, once: true }}
        whileInView="show"
      >
        {differentiators.map((item) => (
          <motion.article
            className="rounded-3xl border border-slate-200/80 bg-white/82 px-6 py-6 shadow-[0_8px_24px_rgba(31,44,75,0.06)]"
            key={item.title}
            variants={cardVariants}
          >
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#0e1528]">
              {item.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {item.description}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </HomeSection>
  );
}

export function ContactSection({ siteProfile }: ContactSectionProps) {
  return (
    <motion.section
      className="mt-24 bg-[#101827] px-6 py-16 text-center text-white sm:px-10"
      id="contact"
      initial={{ opacity: 0, y: 34 }}
      transition={{ duration: 0.6, ease: entranceEase }}
      viewport={{ amount: 0.24, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-[76rem]">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/55">
          Contact
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Have a platform, AI, or governance challenge?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
          Let&apos;s talk.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#101827] shadow-[0_28px_80px_rgba(16,24,39,0.18)] transition hover:-translate-y-0.5"
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
      </div>
    </motion.section>
  );
}
