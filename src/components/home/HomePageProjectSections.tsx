import { motion, type Variants } from "framer-motion";

import type { ProjectDefinition, SkillDefinition } from "@/lib/portfolio-types";
import { ArrowRightIcon } from "@/src/components/home/HomePageIcons";
import HomeSection from "@/src/components/home/HomeSection";

export type HomeTechStackGroup = {
  readonly title: string;
  readonly skills: readonly SkillDefinition[];
};

type SelectedWorkSectionProps = {
  readonly featuredProjects: readonly ProjectDefinition[];
  readonly skillLabelById: Readonly<Record<string, string>>;
};

type TechStackSectionProps = {
  readonly groups: readonly HomeTechStackGroup[];
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

const processSteps = [
  {
    description:
      "Map the data landscape, constraints, and access patterns before writing code.",
    id: "discovery",
    number: "01",
    title: "Discovery",
  },
  {
    description:
      "Design metadata, authorization, orchestration, and agent workflows as one operating system.",
    id: "architecture",
    number: "02",
    title: "Architecture",
  },
  {
    description:
      "Build with governance, observability, and tests from the first commit — not bolted on later.",
    id: "development",
    number: "03",
    title: "Development",
  },
  {
    description:
      "Ship cloud-native deployments with monitoring, CI/CD, and incremental rollout instead of big-bang handoffs.",
    id: "delivery",
    number: "04",
    title: "Delivery",
  },
  {
    description:
      "Keep tuning models, expanding coverage, and closing governance gaps after production use begins.",
    id: "evolution",
    number: "05",
    title: "Evolution",
  },
] as const;

export const homeTechStackGroupDefinitions = [
  {
    skillIds: ["python", "java", "scala", "typescript", "sql"],
    title: "Languages",
  },
  {
    skillIds: ["langgraph", "mcp", "rag", "fastapi", "langfuse", "openwebui"],
    title: "AI / LLM",
  },
  {
    skillIds: ["kafka", "flink", "spark", "trino", "dbt", "airflow", "datahub"],
    title: "Data",
  },
  {
    skillIds: ["kubernetes", "docker", "helm", "grafana", "elastic-stack"],
    title: "Infrastructure",
  },
  {
    skillIds: ["postgres", "mongodb", "hive", "iceberg", "hudi"],
    title: "Databases",
  },
  {
    skillIds: ["cloud"],
    title: "Cloud",
  },
] as const;

export function SelectedWorkSection({
  featuredProjects,
  skillLabelById,
}: SelectedWorkSectionProps) {
  return (
    <HomeSection
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
        {featuredProjects.slice(0, 3).map((project) => (
          <motion.a
            className="group flex min-h-[24rem] flex-col bg-white/88 p-7 transition hover:bg-white"
            href={`/projects/${project.slug}`}
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
            <div className="mt-6 flex flex-wrap gap-2">
              {project.skillIds.slice(0, 5).map((skillId) => (
                <span
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold leading-tight text-slate-600"
                  key={skillId}
                >
                  {skillLabelById[skillId] ?? skillId}
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
    </HomeSection>
  );
}

export function ProcessSection() {
  return (
    <HomeSection
      copy="The AI journey starts with discovery. I usually need to understand the data landscape, permissions, and operating constraints before architecture or model choices are worth debating."
      eyebrow="How I work"
      id="process"
      title="Discovery-first delivery for AI and data platforms."
    >
      <motion.div
        className="mt-12 grid gap-4 lg:grid-cols-5"
        initial="hidden"
        variants={staggerVariants}
        viewport={{ amount: 0.18, once: true }}
        whileInView="show"
      >
        {processSteps.map((step) => (
          <motion.article
            className="flex h-full flex-col rounded-[1.8rem] border border-slate-200/80 bg-white/82 px-5 py-6 shadow-[0_18px_48px_rgba(31,44,75,0.06)]"
            key={step.id}
            variants={cardVariants}
          >
            <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#1f3b73]">
              {step.number}
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0e1528]">
              {step.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {step.description}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </HomeSection>
  );
}

export function TechStackSection({ groups }: TechStackSectionProps) {
  return (
    <HomeSection
      copy="Grouped the way the work actually gets done: languages, AI stack, data systems, infrastructure, databases, and cloud foundations."
      eyebrow="Tech stack"
      id="skills"
      title="Tools I reach for when the system has to hold up in production."
    >
      <motion.div
        className="mt-12 grid gap-4 lg:grid-cols-2"
        initial="hidden"
        variants={staggerVariants}
        viewport={{ amount: 0.18, once: true }}
        whileInView="show"
      >
        {groups.map((group) => (
          <motion.article
            className="rounded-[1.8rem] border border-slate-200/80 bg-white/82 px-6 py-6 shadow-[0_18px_48px_rgba(31,44,75,0.06)]"
            key={group.title}
            variants={cardVariants}
          >
            <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#1f3b73]">
              {group.title}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {group.skills.map((skill) => (
                <span
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-[#0e1528]"
                  key={skill.id}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </HomeSection>
  );
}
