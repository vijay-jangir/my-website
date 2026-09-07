import type { PortfolioLink, SiteProfile } from "@/lib/portfolio-types";

const CAREER_START_DATE = new Date("2014-09-01T00:00:00.000Z");
const MILLISECONDS_PER_YEAR = 365.25 * 86_400_000;

export function getExperienceYears(atTime = Date.now()) {
  return Math.floor(
    (atTime - CAREER_START_DATE.getTime()) / MILLISECONDS_PER_YEAR,
  );
}

export const experienceYearsLabel = `${getExperienceYears()}+ years`;

export const siteProfile: SiteProfile = {
  name: "Vijay Jangir",
  title:
    "Platform engineer building governed data platforms, AI agents, and access governance systems",
  location: "India",
  timezone: "Asia/Kolkata",
  lastUpdatedLabel: "September 2026",
  contentPromise:
    "Case studies describe the problem, my ownership, architecture, constraints, and decisions without exposing internal systems.",
  currentFocusLabels: [
    "Context Engineering",
    "Multi-Agent Systems",
    "LLM Orchestration",
    "MCP",
    "RAG",
    "Agent Harness",
    "AI Observability",
    "Evals",
    "Tool Use",
    "Production AI",
  ],
  email: "contact@vijayjangir.com",
  githubUrl: "https://github.com/vijay-jangir",
  linkedinUrl: "https://linkedin.com/in/vijayjangir",
  profileImageUrl: "/profile-pic.jpeg",
  heroLabel: `${experienceYearsLabel} in platform engineering, AI agents and governance, and production AI systems.`,
  heroTitleLines: [
    "Platform Engineering.",
    "AI Agents & Governance.",
    "Production AI Systems.",
  ],
  heroSubtitle:
    `${experienceYearsLabel} building multi-agent systems, context engineering, LLM orchestration, MCP integrations, RAG pipelines, AI observability, and governed data platforms for enterprise.`,
  recruiterPitch:
    "Platform engineer, data engineer, and AI engineer. I build multi-agent systems, agent harnesses, context engineering workflows, MCP-based tool integrations, RAG pipelines with evals, AI observability, access-governance platforms, and the orchestration and developer tooling that keep enterprise data infrastructure production-ready.",
  overview: [
    "I build governed data platforms \u2014 the metadata, authorization, orchestration, and developer tooling that make enterprise data usable. Recently that\u2019s meant multi-LLM agent runtimes, MCP-based tool use, retrieval-grounded schema linking, and context engineering for text-to-SQL at enterprise scale.",
    "The latest project is an access governance platform \u2014 centralized attribute store, policy authoring for multiple PDPs (OPA, Ranger, OpenFGA), signed bundle distribution, and enforcement that runs locally without calling home.",
    "Before that: Hive metastore sync, Ranger RBAC extensions, DataHub metadata integrations, Airflow operators, Kafka/Flink pipelines for telecom network analytics, and a YAML-driven CI/CD onboarding framework.",
  ],
};

export const portfolioLinks: readonly PortfolioLink[] = [
  {
    name: "Home",
    hash: "/#home",
  },
  {
    name: "About",
    hash: "/#about",
  },
  {
    name: "Projects",
    hash: "/#projects",
  },
  {
    name: "Skills",
    hash: "/#skills",
  },
  {
    name: "Experience",
    hash: "/#experience",
  },
  {
    name: "Resume",
    hash: "/resume",
  },
  {
    name: "Projects",
    hash: "/projects",
  },
  {
    name: "Blog",
    hash: "/blog",
  },
  {
    name: "Contact",
    hash: "/#contact",
  },
] as const;
