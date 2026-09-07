import type {
  ExperienceDefinition,
  FocusDefinition,
  FocusPreset,
  PortfolioLink,
  ProfileHighlight,
  ProjectDefinition,
  SiteProfile,
  SkillDefinition,
  SummaryTemplate,
} from "@/lib/portfolio-types";

const CAREER_START_DATE = new Date("2014-09-01T00:00:00.000Z");
const MILLISECONDS_PER_YEAR = 365.25 * 86_400_000;

export function getExperienceYears(atTime = Date.now()) {
  return Math.floor(
    (atTime - CAREER_START_DATE.getTime()) / MILLISECONDS_PER_YEAR,
  );
}

const experienceYearsLabel = `${getExperienceYears()}+ years`;

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

export const focusDefinitions: readonly FocusDefinition[] = [
  {
    id: "general",
    label: "Overall profile",
    shortLabel: "General",
    category: "role",
    headline: "Architect and Developer for Governed Data Platforms",
    summary:
      "I architect and build governed data platforms, text-to-data systems, metadata services, access-governance integrations, workflow orchestration, in-house CI/CD onboarding, and network-scale analytics pipelines.",
    description: "Best starting point if you want the full picture.",
    aliases: ["general", "overall", "profile", "resume", "full stack profile"],
    relatedSkillIds: ["spark", "flink", "python", "java", "kafka", "sql"],
  },
  {
    id: "ai",
    label: "AI",
    shortLabel: "AI",
    category: "domain",
    headline: "AI-Focused Engineering View",
    summary:
      "This view emphasizes AI product engineering where language models sit inside governed systems: multi-LLM orchestration, graph subflows, metadata grounding, prompt tracing, query execution, answer reasoning, and chart generation.",
    description:
      "For AI engineering, ML infrastructure, and data-heavy product roles.",
    aliases: [
      "ai",
      "ml",
      "machine learning",
      "llm",
      "genai",
      "artificial intelligence",
    ],
    relatedSkillIds: ["python", "fastapi", "langgraph", "langfuse", "trino"],
  },
  {
    id: "agentic-development",
    label: "Agentic development",
    shortLabel: "Agentic",
    category: "domain",
    headline: "Agentic Systems and Workflow View",
    summary:
      "This view highlights agent orchestration, subgraph design, structured node-to-node state, metadata context, governed query execution, answer reasoning, and visualization workflows where the agent helps users work with data without becoming the data boundary.",
    description:
      "For agent tooling, workflow automation, and LLM-backed product engineering.",
    aliases: [
      "agent",
      "agentic",
      "agentic development",
      "workflow automation",
      "llm workflow",
    ],
    relatedSkillIds: ["python", "langgraph", "langfuse", "openwebui", "trino"],
  },
  {
    id: "backend-engineering",
    label: "Backend engineering",
    shortLabel: "Backend",
    category: "role",
    headline: "Backend Engineer for Data-Heavy Systems",
    summary:
      "I have worked on backend services, data product APIs, streaming systems, and operational tooling, usually where data volume and reliability matter.",
    description:
      "For backend-heavy roles that value data systems and platform thinking.",
    aliases: [
      "backend",
      "backend engineer",
      "backend engineering",
      "api",
      "service",
      "microservices",
    ],
    relatedSkillIds: ["python", "java", "fastapi", "postgres", "kafka"],
  },
  {
    id: "platform-engineering",
    label: "Platform engineering",
    shortLabel: "Platform",
    category: "role",
    headline: "Platform and Reliability Engineer",
    summary:
      "I build platform capabilities around orchestration, CI/CD onboarding, access governance, metadata synchronization, observability, and controlled query execution so teams can ship data work without reinventing the operating model.",
    description:
      "For platform, reliability, DevOps, and internal tooling roles.",
    aliases: [
      "platform",
      "platform engineering",
      "reliability",
      "sre",
      "devops",
      "infrastructure",
    ],
    relatedSkillIds: ["kubernetes", "grafana", "airflow", "kafka", "postgres"],
  },
  {
    id: "data-platform",
    label: "Data platform",
    shortLabel: "Data Platform",
    category: "domain",
    headline: "Data Platform Engineer",
    summary:
      "I build data platforms for ingestion, metadata, governance, query execution, orchestration, discovery, and downstream product use. The focus is durable architecture, clear ownership, and dependable operation.",
    description:
      "For platform and data engineering roles centered on pipelines and data products.",
    aliases: [
      "data platform",
      "data engineer",
      "data engineering",
      "etl",
      "pipeline",
      "datalake",
    ],
    relatedSkillIds: ["spark", "airflow", "dbt", "datahub", "sql"],
  },
  {
    id: "flink",
    label: "Flink",
    shortLabel: "Flink",
    category: "technology",
    headline: "Streaming Systems Engineer with Flink",
    summary:
      "I have used Flink for real-time systems where latency, throughput, and operational clarity all matter. The framework is useful only when the surrounding system is reliable.",
    description:
      "For real-time streaming systems, event pipelines, and Flink-heavy roles.",
    aliases: [
      "flink",
      "apache flink",
      "stream processing",
      "real time streaming",
    ],
    relatedSkillIds: ["flink", "kafka", "java", "python"],
  },
  {
    id: "kafka",
    label: "Kafka",
    shortLabel: "Kafka",
    category: "technology",
    headline: "Event-Driven Backend and Data Engineer",
    summary:
      "Kafka has been central to my work in streaming pipelines, event-driven services, and product-level data flows where scale, durability, and clear system boundaries matter.",
    description:
      "For event-driven architecture, messaging, and streaming platform roles.",
    aliases: ["kafka", "apache kafka", "messaging", "event driven"],
    relatedSkillIds: ["kafka", "flink", "java", "python"],
  },
  {
    id: "python",
    label: "Python",
    shortLabel: "Python",
    category: "technology",
    headline: "Python Engineer for Data, APIs, and Automation",
    summary:
      "I use Python to build data products, APIs, automation, and analytics workflows. The value is faster delivery without losing operational clarity.",
    description: "For Python-first backend, data, and automation roles.",
    aliases: ["python", "python3", "pandas", "fastapi"],
    relatedSkillIds: ["python", "fastapi", "airflow", "spark", "sql"],
  },
] as const;

export const skillDefinitions: readonly SkillDefinition[] = [
  {
    id: "spark",
    label: "Spark",
    category: "framework",
    aliases: ["spark", "apache spark", "pyspark"],
    focusWeights: {
      general: 0.9,
      "data-platform": 1,
      python: 0.6,
    },
  },
  {
    id: "flink",
    label: "Flink",
    category: "framework",
    aliases: ["flink", "apache flink"],
    focusWeights: {
      general: 0.9,
      "backend-engineering": 0.35,
      "platform-engineering": 0.25,
      "data-platform": 0.85,
      flink: 1,
      kafka: 0.45,
    },
  },
  {
    id: "kubernetes",
    label: "Kubernetes (OCP)",
    category: "platform",
    aliases: ["kubernetes", "k8s", "openshift", "ocp"],
    focusWeights: {
      general: 0.6,
      "platform-engineering": 1,
      "backend-engineering": 0.3,
    },
  },
  {
    id: "spark-operator",
    label: "Spark Operator",
    category: "platform",
    aliases: [
      "spark operator",
      "kubernetes spark operator",
      "spark on kubernetes",
    ],
    focusWeights: {
      general: 0.45,
      "platform-engineering": 0.85,
      "data-platform": 0.75,
    },
  },
  {
    id: "python",
    label: "Python",
    category: "language",
    aliases: ["python", "python3"],
    focusWeights: {
      general: 0.9,
      ai: 0.9,
      "agentic-development": 0.8,
      "backend-engineering": 0.7,
      "data-platform": 0.8,
      python: 1,
    },
  },
  {
    id: "java",
    label: "Java",
    category: "language",
    aliases: ["java"],
    focusWeights: {
      general: 0.8,
      "backend-engineering": 0.8,
      "data-platform": 0.7,
      flink: 0.7,
      kafka: 0.6,
    },
  },
  {
    id: "scala",
    label: "Scala",
    category: "language",
    aliases: ["scala"],
    focusWeights: {
      general: 0.45,
      "backend-engineering": 0.5,
      "data-platform": 0.7,
      flink: 0.35,
      kafka: 0.35,
    },
  },
  {
    id: "javascript",
    label: "JavaScript",
    category: "language",
    aliases: ["javascript", "js", "typescript", "ts"],
    focusWeights: {
      general: 0.35,
      "backend-engineering": 0.55,
      ai: 0.25,
      "agentic-development": 0.25,
    },
  },
  {
    id: "typescript",
    label: "TypeScript",
    category: "language",
    aliases: ["typescript", "ts"],
    focusWeights: {
      general: 0.35,
      "backend-engineering": 0.55,
      ai: 0.25,
      "agentic-development": 0.25,
    },
  },
  {
    id: "mongodb",
    label: "MongoDB",
    category: "data",
    aliases: ["mongodb", "mongo"],
    focusWeights: {
      general: 0.3,
      "backend-engineering": 0.5,
    },
  },
  {
    id: "cloud",
    label: "Cloud (GCP, AWS, Azure)",
    category: "platform",
    aliases: [
      "gcp",
      "aws",
      "azure",
      "cloud",
      "google cloud",
      "amazon web services",
      "microsoft azure",
    ],
    focusWeights: {
      general: 0.5,
      "platform-engineering": 0.7,
      "data-platform": 0.5,
    },
  },
  {
    id: "kafka",
    label: "Kafka",
    category: "platform",
    aliases: ["kafka", "apache kafka"],
    focusWeights: {
      general: 0.6,
      "backend-engineering": 0.6,
      "platform-engineering": 0.55,
      "data-platform": 0.5,
      flink: 0.45,
      kafka: 1,
    },
  },
  {
    id: "elastic-stack",
    label: "Elastic Stack",
    category: "tooling",
    aliases: ["elastic stack", "elasticsearch", "kibana", "elastic"],
    focusWeights: {
      general: 0.5,
      "platform-engineering": 0.7,
      "data-platform": 0.4,
      kafka: 0.3,
    },
  },
  {
    id: "nifi",
    label: "NiFi",
    category: "tooling",
    aliases: ["nifi", "apache nifi"],
    focusWeights: {
      "data-platform": 0.7,
    },
  },
  {
    id: "datahub",
    label: "DataHub",
    category: "tooling",
    aliases: ["datahub"],
    focusWeights: {
      "platform-engineering": 0.5,
      "data-platform": 0.8,
    },
  },
  {
    id: "dbt",
    label: "dbt",
    category: "tooling",
    aliases: ["dbt"],
    focusWeights: {
      "data-platform": 0.7,
    },
  },
  {
    id: "airflow",
    label: "Airflow",
    category: "platform",
    aliases: ["airflow", "apache airflow"],
    focusWeights: {
      general: 0.5,
      "platform-engineering": 0.6,
      "data-platform": 0.8,
      python: 0.4,
    },
  },
  {
    id: "hive",
    label: "Apache Hive",
    category: "data",
    aliases: ["hive", "apache hive", "hive metastore", "metastore"],
    focusWeights: {
      "platform-engineering": 0.6,
      "data-platform": 0.8,
    },
  },
  {
    id: "iceberg",
    label: "Apache Iceberg",
    category: "data",
    aliases: ["iceberg", "apache iceberg", "table format"],
    focusWeights: {
      general: 0.35,
      "data-platform": 0.75,
      "platform-engineering": 0.35,
    },
  },
  {
    id: "hudi",
    label: "Apache Hudi",
    category: "data",
    aliases: ["hudi", "apache hudi", "data lake table format"],
    focusWeights: {
      general: 0.35,
      "data-platform": 0.75,
      "platform-engineering": 0.35,
    },
  },
  {
    id: "influx",
    label: "Influx",
    category: "data",
    aliases: ["influx", "influxdb"],
    focusWeights: {
      general: 0.3,
      "data-platform": 0.4,
      "platform-engineering": 0.4,
    },
  },
  {
    id: "grafana",
    label: "Grafana",
    category: "tooling",
    aliases: ["grafana"],
    focusWeights: {
      "platform-engineering": 0.7,
      "data-platform": 0.25,
    },
  },
  {
    id: "kyuubi",
    label: "Apache Kyuubi",
    category: "tooling",
    aliases: ["kyuubi", "apache kyuubi"],
    focusWeights: {
      general: 0.4,
      "data-platform": 0.8,
      "platform-engineering": 0.5,
    },
  },
  {
    id: "trino",
    label: "Trino",
    category: "tooling",
    aliases: ["trino"],
    focusWeights: {
      general: 0.5,
      "backend-engineering": 0.3,
      "data-platform": 0.8,
    },
  },
  {
    id: "alluxio",
    label: "Alluxio",
    category: "platform",
    aliases: ["alluxio"],
    focusWeights: {
      "data-platform": 0.7,
    },
  },
  {
    id: "jupyter",
    label: "Jupyter",
    category: "tooling",
    aliases: ["jupyter", "jupyter notebook"],
    focusWeights: {
      general: 0.2,
      "data-platform": 0.6,
    },
  },
  {
    id: "power-bi",
    label: "Power BI",
    category: "tooling",
    aliases: ["power bi", "powerbi"],
    focusWeights: {
      general: 0.5,
      "data-platform": 0.6,
      python: 0.3,
    },
  },
  {
    id: "sql",
    label: "SQL",
    category: "data",
    aliases: ["sql", "postgresql", "postgres"],
    focusWeights: {
      general: 0.8,
      "backend-engineering": 0.6,
      "data-platform": 0.9,
      python: 0.4,
    },
  },
  {
    id: "postgres",
    label: "Postgres",
    category: "data",
    aliases: ["postgres", "postgresql"],
    focusWeights: {
      ai: 0.4,
      "agentic-development": 0.5,
      "backend-engineering": 0.9,
      "platform-engineering": 0.4,
      "data-platform": 0.4,
      python: 0.3,
    },
  },
  {
    id: "react",
    label: "React",
    category: "framework",
    aliases: ["react"],
    focusWeights: {
      general: 0.2,
      "backend-engineering": 0.2,
    },
  },
  {
    id: "nextjs",
    label: "Next.js",
    category: "framework",
    aliases: ["next.js", "nextjs", "next js"],
    focusWeights: {
      "agentic-development": 0.4,
      "backend-engineering": 0.3,
    },
  },
  {
    id: "tailwind",
    label: "Tailwind",
    category: "framework",
    aliases: ["tailwind", "tailwind css"],
    focusWeights: {
      general: 0.1,
    },
  },
  {
    id: "prisma",
    label: "Prisma",
    category: "tooling",
    aliases: ["prisma"],
    focusWeights: {
      "backend-engineering": 0.4,
    },
  },
  {
    id: "fastapi",
    label: "FastAPI",
    category: "framework",
    aliases: ["fastapi"],
    focusWeights: {
      ai: 0.4,
      "agentic-development": 0.7,
      "backend-engineering": 1,
      python: 0.8,
    },
  },
  {
    id: "nodejs",
    label: "Node.js",
    category: "platform",
    aliases: ["node.js", "nodejs", "node"],
    focusWeights: {
      general: 0.3,
      "backend-engineering": 0.5,
    },
  },
  {
    id: "apriori",
    label: "Apriori",
    category: "tooling",
    aliases: ["apriori", "association rules"],
    focusWeights: {
      general: 0.2,
      "data-platform": 0.3,
      python: 0.2,
    },
  },
  {
    id: "astro",
    label: "Astro",
    category: "framework",
    aliases: ["astro"],
    focusWeights: {
      general: 0.1,
      "backend-engineering": 0.1,
    },
  },
  {
    id: "vector-search",
    label: "Vector Search",
    category: "ai",
    aliases: ["vector search", "vector database", "embedding search", "rag"],
    focusWeights: {
      ai: 0.8,
      "agentic-development": 0.8,
      python: 0.3,
    },
  },
  {
    id: "context-engineering",
    label: "Context Engineering",
    category: "ai",
    aliases: [
      "context engineering",
      "context window design",
      "schema grounding",
      "retrieval grounding",
    ],
    focusWeights: {
      ai: 1,
      "agentic-development": 0.9,
      python: 0.3,
    },
  },
  {
    id: "genai",
    label: "Generative AI",
    category: "ai",
    aliases: ["genai", "generative ai", "generative-ai", "llm systems"],
    focusWeights: {
      ai: 1,
      "agentic-development": 0.7,
    },
  },
  {
    id: "llm-workflows",
    label: "LLM Orchestration",
    category: "ai",
    aliases: [
      "llm",
      "agent",
      "agentic",
      "llm orchestration",
      "llm workflows",
      "evaluation",
    ],
    focusWeights: {
      ai: 1,
      "agentic-development": 1,
    },
  },
  {
    id: "agent-orchestration",
    label: "Agent Orchestration",
    category: "ai",
    aliases: [
      "agent orchestration",
      "agent harness",
      "agent runtime",
      "agent workflow",
    ],
    focusWeights: {
      ai: 1,
      "agentic-development": 1,
      python: 0.3,
    },
  },
  {
    id: "langgraph",
    label: "LangGraph",
    category: "framework",
    aliases: ["langgraph", "graph orchestration", "agent graph", "subgraph"],
    focusWeights: {
      ai: 1,
      "agentic-development": 1,
      python: 0.4,
    },
  },
  {
    id: "rag",
    label: "RAG",
    category: "ai",
    aliases: [
      "rag",
      "retrieval augmented generation",
      "retrieval-augmented generation",
      "retrieval grounded",
    ],
    focusWeights: {
      ai: 1,
      "agentic-development": 0.9,
      python: 0.3,
    },
  },
  {
    id: "mcp",
    label: "MCP (Model Context Protocol)",
    category: "ai",
    aliases: [
      "mcp",
      "model context protocol",
      "mcp server",
      "mcp servers",
      "tool servers",
    ],
    focusWeights: {
      ai: 0.8,
      "agentic-development": 1,
    },
  },
  {
    id: "prompt-engineering",
    label: "Prompt Engineering",
    category: "ai",
    aliases: [
      "prompt engineering",
      "prompt design",
      "prompt management",
      "prompt tuning",
    ],
    focusWeights: {
      ai: 0.9,
      "agentic-development": 0.8,
    },
  },
  {
    id: "langfuse",
    label: "Langfuse",
    category: "tooling",
    aliases: ["langfuse", "prompt tracing", "prompt management", "llm tracing"],
    focusWeights: {
      ai: 0.8,
      "agentic-development": 0.8,
    },
  },
  {
    id: "openwebui",
    label: "Open WebUI",
    category: "platform",
    aliases: ["openwebui", "open webui", "chat ui", "rich ui"],
    focusWeights: {
      ai: 0.5,
      "agentic-development": 0.7,
    },
  },
  {
    id: "opa",
    label: "OPA (Open Policy Agent)",
    category: "platform",
    aliases: ["opa", "open policy agent", "rego", "policy engine", "opal", "cedar", "keycloak", "ldap", "data masking", "row-level security", "rls", "access governance"],
    focusWeights: {
      "backend-engineering": 0.6,
      "platform-engineering": 1,
      "data-platform": 0.7,
    },
  },
  {
    id: "ranger",
    label: "Apache Ranger",
    category: "platform",
    aliases: ["ranger", "apache ranger", "rbac", "data access governance"],
    focusWeights: {
      "platform-engineering": 0.8,
      "data-platform": 0.8,
      "backend-engineering": 0.4,
    },
  },
  {
    id: "seatunnel",
    label: "Apache SeaTunnel",
    category: "data",
    aliases: ["seatunnel", "apache seatunnel", "data ingestion"],
    focusWeights: {
      "data-platform": 0.7,
      "platform-engineering": 0.5,
    },
  },
  {
    id: "helm",
    label: "Helm",
    category: "tooling",
    aliases: ["helm", "helm charts", "kubernetes deployment"],
    focusWeights: {
      "platform-engineering": 0.7,
      "data-platform": 0.4,
    },
  },
  {
    id: "internal-cicd",
    label: "In-house CI/CD YAML",
    category: "tooling",
    aliases: [
      "internal cicd",
      "workflow file",
      "ci/cd",
      "cicd",
      "pipeline yaml",
    ],
    focusWeights: {
      "platform-engineering": 0.7,
      "backend-engineering": 0.3,
    },
  },
  {
    id: "jenkins",
    label: "Jenkins",
    category: "tooling",
    aliases: ["jenkins", "jenkins runner", "jenkins pipeline"],
    focusWeights: {
      "platform-engineering": 0.65,
      "backend-engineering": 0.25,
    },
  },
  {
    id: "docker",
    label: "Docker",
    category: "platform",
    aliases: ["docker", "docker agent", "container build"],
    focusWeights: {
      "platform-engineering": 0.55,
      "backend-engineering": 0.35,
    },
  },
  {
    id: "linux",
    label: "Linux",
    category: "platform",
    aliases: ["linux", "shell", "scripting", "unix"],
    focusWeights: {
      general: 0.45,
      "platform-engineering": 0.65,
      "backend-engineering": 0.45,
      "data-platform": 0.45,
    },
  },
  {
    id: "jira",
    label: "Jira",
    category: "tooling",
    aliases: ["jira", "ticket workflow", "issue transition"],
    focusWeights: {
      "platform-engineering": 0.45,
      "backend-engineering": 0.2,
    },
  },
  {
    id: "metabase",
    label: "Metabase",
    category: "tooling",
    aliases: ["metabase", "bi", "business intelligence", "dashboard"],
    focusWeights: {
      "data-platform": 0.5,
      "platform-engineering": 0.25,
    },
  },
  {
    id: "geospatial",
    label: "Geospatial streaming",
    category: "data",
    aliases: [
      "geospatial",
      "gps",
      "triangulation",
      "point of interest",
      "poi",
      "geofence",
    ],
    focusWeights: {
      "data-platform": 0.7,
      "platform-engineering": 0.45,
      flink: 0.8,
      kafka: 0.6,
    },
  },
  {
    id: "multi-agent-systems",
    label: "Multi-Agent Systems",
    category: "ai",
    aliases: [
      "multi-agent",
      "multi agent",
      "agent orchestration",
      "agent systems",
      "supervisor pattern",
    ],
    highlights: [
      "Production multi-agent orchestration with supervisor and worker patterns",
    ],
    focusWeights: {
      general: 0.8,
      ai: 1,
      "agentic-development": 1,
      "platform-engineering": 0.5,
    },
  },
  {
    id: "agent-harness",
    label: "Agent Harness",
    category: "ai",
    aliases: [
      "agent harness",
      "agent runtime",
      "agent framework",
      "agent infrastructure",
    ],
    highlights: [
      "Custom agent runtime with tool routing, state management, and recovery",
    ],
    focusWeights: {
      general: 0.7,
      ai: 1,
      "agentic-development": 1,
      "backend-engineering": 0.6,
    },
  },
  {
    id: "evals",
    label: "AI Evals",
    category: "ai",
    aliases: [
      "evals",
      "evaluation",
      "ai evaluation",
      "model evaluation",
      "eval framework",
      "RAGAS",
    ],
    highlights: [
      "Evaluation framework design for production LLM systems",
    ],
    focusWeights: { general: 0.7, ai: 1, "agentic-development": 0.8 },
  },
  {
    id: "ai-observability",
    label: "AI Observability",
    category: "ai",
    aliases: [
      "ai observability",
      "llm observability",
      "prompt tracing",
      "inference monitoring",
    ],
    highlights: [
      "Production observability with Langfuse for LLM pipelines",
    ],
    focusWeights: {
      general: 0.6,
      ai: 1,
      "platform-engineering": 0.7,
    },
  },
  {
    id: "tool-use",
    label: "Tool Use & Function Calling",
    category: "ai",
    aliases: [
      "tool use",
      "function calling",
      "tool calling",
      "structured outputs",
    ],
    highlights: [
      "MCP-based tool integration and function calling for agent systems",
    ],
    focusWeights: {
      general: 0.6,
      ai: 1,
      "agentic-development": 1,
    },
  },
  {
    id: "production-ai",
    label: "Production AI",
    category: "ai",
    aliases: [
      "production ai",
      "production llm",
      "ai infrastructure",
      "ai systems",
      "applied ai",
    ],
    highlights: [
      "Shipping AI systems with guardrails, observability, and cost controls",
    ],
    focusWeights: {
      general: 0.8,
      ai: 1,
      "platform-engineering": 0.8,
      "backend-engineering": 0.6,
    },
  },
] as const;

export const projects: readonly ProjectDefinition[] = [
  {
    id: "governed-conversational-data-platform",
    slug: "governed-conversational-data-platform",
    title: "Governed conversational data platform",
    summary:
      "I architected and built a governed conversational data and visualization agent: it retrieves business knowledge, answers business questions, runs governed queries from that context, reasons over results, and builds charts without making the LLM the data boundary.",
    impact:
      "Moved analytics discovery toward self-service by connecting a multi-LLM graph runtime with knowledge retrieval, governed Trino execution, answer reasoning, chart generation, prompt tracing, and a richer Open WebUI experience. The natural-language analytics path reduced query time by about 40% for supported workflows.",
    detail:
      "My role covered both architecture and hands-on implementation across the full service topology: custom Open WebUI experience, multi-LLM agent runtime, graph subflows, knowledge system, query engine, platform control plane, and supporting services for identity, metadata, query execution, reasoning, and visualization. The text-to-SQL path inside the platform was taken through the full journey - discovery of why naive prompting fails at enterprise scale, retrieval-grounded schema linking, graph orchestration, governed execution, tracing, delivery, and post-launch evaluation.",
    skillIds: [
      "langgraph",
      "mcp",
      "python",
      "fastapi",
      "context-engineering",
      "rag",
      "llm-workflows",
      "agent-orchestration",
      "prompt-engineering",
      "genai",
      "langfuse",
      "trino",
      "datahub",
      "openwebui",
      "dbt",
      "vector-search",
      "multi-agent-systems",
      "agent-harness",
      "evals",
      "ai-observability",
      "tool-use",
      "production-ai",
    ],
    focusWeights: {
      general: 1,
      ai: 1,
      "agentic-development": 1,
      "backend-engineering": 0.9,
      "platform-engineering": 1,
      "data-platform": 1,
      python: 0.9,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: [
        "private-enterprise",
        "sanitized-diagram",
        "metric",
        "open-source-reference",
      ],
      architectureShape: [
        "Business users ask through a customized Open WebUI experience with richer controls for data, charts, and follow-up workflows.",
        "A multi-LLM graph runtime routes work through specialized subgraphs for knowledge retrieval, business question answering, query generation, execution, reasoning, and visualization.",
        "Schema linking is retrieval-based rather than prompt-stuffed: schemas and metadata are decomposed into semantic units, indexed, and retrieved per question with relevance calibration, following the RASL approach (arXiv:2507.23104) - zero fine-tuning, resilient to catalog changes.",
        "Agents use metadata and knowledge services built from DataHub context, business definitions, SQL logs, schema relationships, and query patterns.",
        "MCP servers expose metadata lookup, controlled query execution, and chart generation as discrete, auditable tools to the agent runtime.",
        "A governed query engine executes through Trino with user identity, Ranger authorization, cancellation, guardrails, and persisted result references.",
        "The product handles business questions such as top-performing managers by geography, month-over-month gross-addition trends, and quarter-level growth comparisons.",
        "Visualization and answer-reasoning flows work from governed result references rather than sending raw enterprise data into the language model.",
      ],
      scaleSignals: [
        {
          label: "Ownership",
          value: "Architect + developer",
          detail:
            "Designed the architecture and built the core services and components across the agent runtime, query engine, knowledge system, and platform orchestration pieces.",
        },
        {
          label: "Agent shape",
          value: "Multi-LLM subgraphs",
          detail:
            "The platform uses multiple language models and specialized graph subflows instead of one generic prompt path.",
        },
        {
          label: "Safety model",
          value: "No raw data to LLM",
          detail:
            "Language models reason over metadata, query plans, and bounded outputs. Enterprise data access remains behind governed execution paths.",
        },
        {
          label: "Schema linking",
          value: "Retrieval-grounded",
          detail:
            "Table selection follows the RASL design (arXiv:2507.23104): decomposed semantic units, indexed retrieval, and multi-stage relevance calibration instead of stuffing schemas into prompts.",
        },
        {
          label: "Adaptation cost",
          value: "Zero fine-tuning",
          detail:
            "New or changed tables require re-indexing metadata rather than retraining or rewriting prompts, keeping the system operable by the data platform team.",
        },
        {
          label: "User path",
          value: "Text to data + charts",
          detail:
            "The system supports natural-language data questions and visualization workflows while keeping authorization and execution controls in the platform.",
        },
        {
          label: "Analytics query time",
          value: "~40% reduction",
          detail:
            "The natural-language path reduced time-to-answer for supported business analytics questions by about 40% compared with the older manual query path.",
        },
        {
          label: "Query shape",
          value: "Business questions",
          detail:
            "Example prompts include top-performing managers in Delhi, month-over-month gross-addition trends for Mumbai, and first-quarter manager growth comparisons.",
        },
      ],
      responsibilities: [
        "Ran the discovery phase for the text-to-SQL path: audited why naive prompting and earlier attempts fail at enterprise catalog scale, and defined production non-negotiables.",
        "Designed the platform architecture for governed conversational analytics.",
        "Implemented retrieval-grounded schema linking for table selection, following the RASL design (arXiv:2507.23104).",
        "Built the multi-LLM agent runtime, specialized subgraphs, query execution path, knowledge system, control-plane integration, and service orchestration pieces.",
        "Created MCP servers exposing metadata lookup, controlled query execution, and chart generation as auditable tools.",
        "Connected Trino, Apache Ranger-based authorization, DataHub metadata, Neo4j-backed knowledge context, Langfuse prompt management and tracing, and visualization workflows.",
        "Used structured data flow between graph nodes to keep behavior deterministic and reduce unnecessary token usage.",
        "Customized the Open WebUI experience with richer interaction patterns for business users working with data and charts.",
        "Translated the internal implementation into a case study focused on ownership, topology, design decisions, and constraints.",
      ],
      constraints: [
        "Internal product names, dataset names, business metrics, user groups, prompts, traces, and production screenshots are not published.",
        "This page can describe architecture topology, technology choices, agent patterns, safety model, ownership scope, and implementation responsibilities.",
      ],
      artifacts: [
        {
          label: "Governed conversational analytics topology",
          type: "sanitized-diagram",
          detail:
            "A shareable topology can show the custom conversation UI, multi-LLM graph runtime, specialized subgraphs, metadata and knowledge services, governed query engine, Trino/Ranger execution, persisted results, reasoning, and visualization outputs.",
        },
        {
          label: "Research grounding",
          type: "article",
          detail:
            "The schema-linking design follows RASL: Retrieval Augmented Schema Linking for Massive Database Text-to-SQL (arXiv:2507.23104), which decomposes database schemas into semantic entities, indexes them for retrieval, and narrows candidate tables through multi-stage relevance calibration without fine-tuning.",
        },
        {
          label: "Technology references",
          type: "open-source-reference",
          detail:
            "The shareable technology context includes Trino, Apache Ranger-based authorization, DataHub, Neo4j, LangGraph-style orchestration with tool nodes, Langfuse prompt management and tracing, MCP servers, dbt, and Open WebUI customization.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal product names, repository names, dataset names, user groups, business metrics, prompts, traces, and screenshots.",
      ],
    },
    caseStudy: {
      headline:
        "A multi-LLM conversational data agent that retrieves business knowledge, runs governed queries, reasons over answers, and builds charts.",
      context:
        "Business users needed a safer way to ask data questions, understand business definitions, execute governed queries, inspect answers, and create charts without routing every request through analysts or treating the model as the authorization layer. Text-to-SQL specifically tends to fail in one of two places: the model cannot find the right tables once a warehouse outgrows any prompt, or generated SQL has no safe path to execution. This platform treated both as architectural problems to solve, not prompt-quality problems to retry.",
      role: "Architect and developer across the core services and components.",
      timeframe: "Airtel Digital, 2026-present",
      organization: "Airtel Digital",
      team: "Data platform, analytics, and enterprise AI stakeholders",
      confidentiality:
        "This page excludes internal product names, repository names, datasets, prompts, user groups, screenshots, and business metrics.",
      metrics: [
        {
          label: "Ownership",
          value: "Architect + developer",
          detail:
            "Designed and built the platform across agent runtime, query engine, knowledge system, service integration, and platform orchestration.",
        },
        {
          label: "Agent architecture",
          value: "Multi-LLM subgraphs",
          detail:
            "Specialized graph paths handle knowledge retrieval, business question answering, query generation, execution, answer reasoning, and visualization.",
        },
        {
          label: "Governance principle",
          value: "No raw data to LLM",
          detail:
            "The platform keeps enterprise data access behind governed execution paths instead of making the language model the data boundary.",
        },
        {
          label: "User outcome",
          value: "Text to data + charts",
          detail:
            "The product direction is natural-language analytics with governed query execution, answer reasoning, reusable result references, and visualization workflows.",
        },
        {
          label: "Schema linking",
          value: "Retrieval-grounded",
          detail:
            "Table selection uses RASL-style decomposition and multi-stage retrieval with relevance calibration (arXiv:2507.23104), replacing schema-stuffing approaches that break beyond a handful of tables.",
        },
        {
          label: "Extension surface",
          value: "Purpose-scoped MCP",
          detail:
            "Metadata lookup, controlled execution, and charting ship as MCP servers, giving the agent stable tools and giving the platform one place to audit each capability.",
        },
        {
          label: "Time-to-answer",
          value: "~40% lower",
          detail:
            "For supported analytics workflows, the conversational path reduced query time by about 40% while preserving governed execution.",
        },
      ],
      architecture: [
        "A customized Open WebUI experience captures the user question and supports richer data and chart interactions.",
        "A multi-LLM graph runtime routes work through specialized subgraphs for knowledge retrieval, business question answering, query generation, execution, reasoning, and visualization.",
        "Schema linking follows the RASL design: build-time decomposition of schemas and metadata into semantic units indexed in a vector store, then inference-time keyword-based multi-stage retrieval with relevance calibration to narrow candidate tables within a context budget.",
        "Structured state moves between graph nodes so the system remains deterministic, easier to trace, and less wasteful with tokens.",
        "Drafted SQL is validated before submission: dialect checks, guardrails, and plan inspection happen outside the prompt rather than as model self-critique.",
        "A knowledge system grounds the agent using metadata, business definitions, schema relationships, query logs, joins, filters, and usage patterns.",
        "Business-question subgraphs map user intent such as geography, manager, time period, metric, and comparison type into grounded query plans.",
        "MCP servers expose metadata lookup, controlled query execution, and chart generation to the agent runtime with explicit tool contracts.",
        "A governed query engine submits SQL through Trino with user identity, Ranger authorization, cancellation, guardrails, and Parquet-style result persistence.",
        "Answer-reasoning and visualization agents consume governed result references and produce explanations or charts without turning raw data into prompt context.",
        "Langfuse supports prompt management and tracing so prompts, graph behavior, and production flows can be inspected and improved.",
      ],
      responsibilities: [
        "Defined the architecture and service boundaries for the conversational data platform.",
        "Ran discovery for the text-to-SQL path and implemented retrieval-grounded schema linking following the RASL design (arXiv:2507.23104).",
        "Implemented the core backend services around agents, subgraphs, query execution, knowledge context, reasoning, visualization, and platform integration.",
        "Created MCP servers wrapping metadata access, governed execution, and visualization as auditable tools.",
        "Built structured graph-state flows between nodes to improve determinism and reduce avoidable token usage.",
        "Integrated Langfuse for prompt management and tracing across the conversational workflows.",
        "Customized Open WebUI with richer user-facing interactions for data exploration and chart workflows.",
        "Designed the safety model around metadata grounding, authorization, auditability, result references, and execution guardrails.",
        "Built the developer and platform workflow needed to run multiple services together with reproducible setup.",
      ],
      decisions: [
        {
          label: "Keep business logic in governed data systems",
          detail:
            "The agent can help interpret intent, but KPI definitions, authorization, and query execution stay in governed platform layers such as dbt, Trino, and Apache Ranger-based controls.",
        },
        {
          label: "Use metadata before data",
          detail:
            "The system grounds responses with catalogs, business definitions, schema relationships, query history, and usage patterns before attempting execution.",
        },
        {
          label: "Retrieve schemas instead of stuffing them",
          detail:
            "Table selection follows the RASL pattern (arXiv:2507.23104): decompose schemas into indexed semantic units and retrieve per question with relevance calibration. That makes catalog growth an indexing task rather than a modeling or prompt-length problem.",
        },
        {
          label: "Give tools protocol boundaries",
          detail:
            "Exposing metadata lookup, execution, and charting as MCP servers keeps tool contracts explicit and versioned, separates platform concerns from prompt concerns, and gives security one review surface per capability.",
        },
        {
          label: "Validate SQL outside the prompt",
          detail:
            "Dialect checks, guardrails, and plan inspection run as deterministic pre-execution steps rather than model self-critique, because self-review is not a safety boundary.",
        },
        {
          label: "Model business questions as structured intent",
          detail:
            "Questions such as top manager by city, month-over-month trends, and quarterly growth comparisons need explicit metric, geography, time, and entity slots before SQL generation is useful.",
        },
        {
          label: "Split the agent into subgraphs",
          detail:
            "Knowledge retrieval, business question answering, query generation, execution, answer reasoning, and visualization each need different prompts, tools, state contracts, and failure handling.",
        },
        {
          label: "Carry structured state between nodes",
          detail:
            "Passing structured data between graph nodes made behavior easier to reason about, improved determinism, and avoided spending tokens restating context that the system already knew.",
        },
        {
          label: "Trace prompts and graph behavior",
          detail:
            "Langfuse made prompt versions and graph execution observable, which matters when a business-facing data agent needs repeatable behavior instead of one-off demos.",
        },
        {
          label: "Return references, not unrestricted data",
          detail:
            "Query results move through persisted references and controlled previews, which keeps downstream visualization useful without expanding the prompt surface unnecessarily.",
        },
        {
          label: "Split agent reasoning from query execution",
          detail:
            "Separating the conversational runtime from the governed query engine made cancellation, guardrails, auditing, and authorization easier to reason about.",
        },
        {
          label: "Treat the chat UI as product surface",
          detail:
            "Customizing Open WebUI improved the user path for data workflows because business users need richer controls than a plain chat transcript when moving from question to query to chart.",
        },
      ],
      lessons: [
        "Enterprise AI becomes useful when it respects existing data governance instead of bypassing it.",
        "Conversational analytics needs metadata, authorization, and observability as much as it needs prompt quality.",
        "Text-to-SQL succeeds or fails at schema linking long before generation quality matters.",
        "The execution path is the product: governed engines with real authorization turn a demo into something deployable.",
        "Traces are evaluation data; without them, accuracy work is guesswork dressed up as engineering.",
        "Most text-to-SQL projects fail for architectural reasons, not model-quality reasons - which means they are solvable.",
        "A production data agent is a graph, state, tracing, and UX problem as much as it is an LLM problem.",
        "The hard part is not generating SQL; it is making the full path explainable, cancellable, auditable, and safe for repeated use.",
      ],
    },
  },
  {
    id: "access-governance-platform",
    slug: "access-governance-platform",
    title: "Access governance platform",
    summary:
      "Sole architect and lead developer of an enterprise access governance platform — centralized attribute management, policy authoring for OPA/Ranger/OpenFGA, cryptographically signed bundle distribution, and enforcement that keeps working with the control plane offline.",
    impact:
      "Unified access control across a large telecom enterprise's data infrastructure: attributes from multiple systems of record under one roof, policies authored once and compiled for each enforcement engine, signed bundles shipped to local PDPs for sub-millisecond decisions. Full audit trail and approval workflows for every change.",
    detail:
      "Designed the entire system from first principles: a control plane with attribute, policy, approval, distribution, and audit services backed by PostgreSQL, plus an enforcement plane of OPA PDPs, Ranger PEP plugins, and OPAL-based bundle delivery. The architecture enforces a strict separation — the control plane is never in the authorization hot path, and enforcement points continue operating when the control plane is unavailable. Ports-and-adapters design means every external dependency (identity providers, data catalogs, approval tools, cloud services) sits behind an adapter interface. Multi-repository workspace with a manifest-driven orchestration CLI.",
    skillIds: [
      "opa",
      "ranger",
      "postgres",
      "kubernetes",
      "datahub",
      "java",
      "python",
      "airflow",
      "production-ai",
    ],
    focusWeights: {
      general: 1,
      "backend-engineering": 1,
      "platform-engineering": 1,
      "data-platform": 0.8,
      ai: 0.3,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram"],
      architectureShape: [
        "Control plane with five services: attribute, policy, approval, distribution, and audit — each with its own PostgreSQL schema, communicating via NATS/JetStream.",
        "Attribute service ingests from multiple systems of record via scheduled connectors, with trust states and system-of-record-aware write-back policies.",
        "Policy service lowers authored policies to a canonical IR, then compiles to target-specific artifacts: Rego for OPA, authorization models for OpenFGA, delegating policies for Ranger.",
        "Distribution service assembles signed bundles containing only the attributes each policy set references (referenced-attribute projection), publishes to a registry, and notifies subscribers.",
        "Enforcement plane is customer-owned: OPA PDPs as node-local DaemonSets, OPAL clients for bundle delivery, PEP plugins for Trino/Kafka/API gateways/Ranger.",
        "Human-originated changes go through draft → approval → commit. Machine-ingested attributes skip approval. Concurrent edits use optimistic concurrency control.",
        "Multi-repository workspace orchestrated via manifest files, lockfile-based snapshot pinning, and a custom repoctl CLI for clone/sync/status/checkout across all component repos.",
      ],
      scaleSignals: [],
      responsibilities: [
        "Platform architecture across control plane, policy compilation, bundle distribution, and local enforcement boundaries.",
        "Service implementation for attributes, approvals, distribution, and audit workflows.",
        "Adapter design for external identity, metadata, and approval systems.",
      ],
      constraints: [
        "Control plane could not sit in the live authorization path.",
        "Architecture details had to remain sanitized for public sharing.",
        "Policy artifacts needed to serve multiple enforcement engines without duplicating governance logic.",
      ],
      artifacts: [
        {
          label: "Sanitized system shape",
          type: "sanitized-diagram",
          detail:
            "High-level control-plane and enforcement-plane architecture shared without internal identifiers or policy data.",
        },
      ],
      confidentialityNotes: [
        "Internal service names, policy data, and enterprise-specific identifiers stay private; the public writeup focuses on architecture, interfaces, and operating model.",
      ],
    },
    caseStudy: {
      headline:
        "Sole architect and lead developer of an enterprise access governance platform — centralized attribute management, policy authoring for OPA/Ranger/OpenFGA, cryptographically signed bundle distribution, and enforcement that keeps working with the control plane offline.",
      context:
        "Large enterprises usually accumulate access rules across catalogs, query engines, workflow tools, and custom services. The goal here was to give the organization one governed path for attributes, approvals, policy authoring, distribution, and audit — without making the control plane a runtime dependency for every authorization decision.",
      role: "Sole architect and lead developer",
      timeframe: "2026",
      organization: "Large telecom enterprise",
      team:
        "Built directly while partnering with identity, data-platform, and security stakeholders for source-system and enforcement integration.",
      confidentiality:
        "This was an internal project for a large telecom enterprise. The writeup keeps internal service names, policy data, and system identifiers private while sharing the architecture and operating model in sanitized form.",
      metrics: [],
      architecture: [
        "Control plane with five services: attribute, policy, approval, distribution, and audit — each with its own PostgreSQL schema, communicating via NATS/JetStream.",
        "Attribute service ingests from multiple systems of record via scheduled connectors, with trust states and system-of-record-aware write-back policies.",
        "Policy service lowers authored policies to a canonical IR, then compiles to target-specific artifacts: Rego for OPA, authorization models for OpenFGA, delegating policies for Ranger.",
        "Distribution service assembles signed bundles containing only the attributes each policy set references, publishes to a registry, and notifies subscribers.",
        "Enforcement stays local: OPA PDPs, Ranger plugins, and OPAL clients continue making decisions even if the control plane is unavailable.",
      ],
      responsibilities: [
        "Defined the control-plane and enforcement-plane split so policy authoring, approvals, and bundle generation never sat in the authorization hot path.",
        "Designed the canonical policy IR and the compilation pipeline for OPA, OpenFGA, and Ranger targets.",
        "Built the PostgreSQL-backed services for attributes, approvals, distribution, and audit, plus the adapter boundaries for external systems.",
        "Created the multi-repository workspace workflow and orchestration CLI used to clone, sync, pin, and operate the platform consistently.",
      ],
      decisions: [
        {
          label: "Keep enforcement offline-capable",
          detail:
            "Authorization checks had to keep working during control-plane outages, so bundles were signed and delivered to local enforcement points instead of calling home on every decision.",
        },
        {
          label: "Compile once, enforce many ways",
          detail:
            "A canonical policy representation made it possible to author once and emit target-specific artifacts for OPA, Ranger, and OpenFGA without duplicating governance logic.",
        },
        {
          label: "Hide enterprise dependencies behind adapters",
          detail:
            "Identity sources, data catalogs, approval tooling, and cloud services all sat behind adapter interfaces so the core platform stayed testable and replaceable.",
        },
      ],
      lessons: [
        "Access governance works better when metadata, approvals, and policy compilation are treated as one platform instead of separate admin tools.",
        "A control plane should improve authoring and auditability, not become a latency or availability dependency for authorization itself.",
        "Bundle signing, projection, and offline enforcement are what turn central policy management into something production teams will trust.",
      ],
    },
  },
  {
    id: "telecom-network-datalake",
    slug: "telecom-network-datalake",
    title: "Telecom network data lake",
    summary:
      "Designed and implemented data lake and warehouse foundations for mobile tower network events at petabyte scale and roughly five trillion events per day.",
    impact:
      "Created the analytics foundation for network data products, reporting, and large-scale downstream consumption.",
    detail:
      "Worked across ingestion, storage, multi-level aggregation, processing, and operational concerns for very large mobile tower network-event datasets.",
    skillIds: [
      "flink",
      "kafka",
      "java",
      "elastic-stack",
      "influx",
      "airflow",
      "iceberg",
      "hudi",
    ],
    focusWeights: {
      general: 1,
      "backend-engineering": 0.4,
      "platform-engineering": 0.8,
      "data-platform": 1,
      flink: 0.8,
      kafka: 0.8,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Mobile tower network events enter ingestion paths through streaming and batch movement.",
        "Flink and Java services process high-volume streams and derived datasets.",
        "Multi-level aggregation paths reduce raw tower-event volume into analytical outputs before downstream consumers use the data.",
        "Data lake table-format experience includes Iceberg/Hudi-style foundations for large analytical datasets.",
        "Airflow, Elastic Stack, and Influx support orchestration and operational visibility.",
      ],
      scaleSignals: [
        {
          label: "Event scale",
          value: "~5T events/day",
          detail:
            "The mobile tower network-event platform handled petabyte-scale data and about five trillion events per day.",
        },
        {
          label: "Data scale",
          value: "Petabyte-scale",
          detail:
            "Shareable description stays at scale category level and avoids internal capacity details.",
        },
      ],
      responsibilities: [
        "Designed and implemented ingestion, processing, storage, and reliability pieces.",
        "Worked across pipeline boundaries needed for downstream reporting and data products.",
        "Kept network topology and operational thresholds confidential.",
      ],
      constraints: [
        "Network topology, tower identifiers, vendor details, and operational thresholds are confidential.",
        "Site notes present scale as rounded signals only.",
      ],
      artifacts: [
        {
          label: "High-level telecom data lake shape",
          type: "sanitized-diagram",
          detail:
            "Can be shown as ingestion, streaming, storage, orchestration, observability, and downstream consumption layers.",
        },
        {
          label: "Scale signal",
          type: "metric",
          detail:
            "About five trillion events per day and petabyte-scale are acceptable shareable indicators without internal topology.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: network topology, dataset names, exact retention policies, service-level thresholds, and internal platform names.",
      ],
    },
    caseStudy: {
      headline:
        "Petabyte-scale network data lake and multi-level analytics for mobile tower events.",
      context:
        "Network data from mobile towers needed an analytics foundation that could support reporting, downstream data products, and very high event volume.",
      role: "Designed and implemented large-scale ingestion, storage, processing, and operational pieces.",
      timeframe: "Airtel Digital, 2021-present",
      organization: "Airtel Digital",
      team: "Telecom data platform and analytics stakeholders",
      confidentiality:
        "This case study excludes network topology, internal platform names, and operational thresholds.",
      metrics: [
        {
          label: "Event scale",
          value: "~5T events/day",
          detail:
            "The mobile tower network-event platform handled petabyte-scale data and about five trillion events per day.",
        },
        {
          label: "Data scale",
          value: "Petabyte-scale",
          detail:
            "The system supported very large telecom datasets across ingestion, storage, and downstream consumption.",
        },
      ],
      architecture: [
        "Streaming and batch ingestion paths moved mobile tower network events across the platform.",
        "Flink and Java supported streaming and processing workloads.",
        "Multi-level aggregation paths reduced raw tower-event volume into analytical outputs.",
        "Table-format experience around Iceberg and Hudi supported the broader data lake skill set.",
        "Airflow, Elastic Stack, and Influx supported orchestration and operational visibility.",
      ],
      responsibilities: [
        "Designed data flows for very high-volume mobile tower network events.",
        "Worked on petabyte-scale tower-event data and multi-level aggregation paths.",
        "Implemented platform pieces across ingestion, processing, and operational reliability.",
        "Created a foundation for downstream reporting and data product consumption.",
      ],
      decisions: [
        {
          label: "Treat operations as a first-class requirement",
          detail:
            "At this scale, pipeline correctness and visibility mattered as much as raw throughput.",
        },
        {
          label: "Separate ingestion, processing, and consumption concerns",
          detail:
            "Clear system boundaries helped the platform support downstream analytics and products.",
        },
      ],
      lessons: [
        "Large data systems fail at the boundaries unless ownership and observability are explicit.",
        "Scale claims are only useful when tied to the operational systems that made them sustainable.",
      ],
    },
  },
  {
    id: "hive-metastore-sync-governance",
    slug: "hive-metastore-sync-governance",
    title: "Hive metastore synchronization and metadata governance",
    summary:
      "Designed and built services that keep Hive metadata consistent across independent environments using real-time listener sync, daily reconciliation, expiry cleanup, one-time interval jobs, observability, and deployment hardening.",
    impact:
      "Turned fragile metadata drift into an owned synchronization path with real-time event propagation, reconciliation, recovery behavior, logs, and platform deployment controls.",
    detail:
      "This work sits at the boundary of data platform reliability and governance: metastore sync, Hive listeners, partition handlers, scheduled reconciliation, interval backfill jobs, operational logging, and production deployment workflows for data teams that depend on consistent metadata.",
    skillIds: ["java", "spark", "airflow", "hive", "kubernetes", "helm"],
    focusWeights: {
      general: 0.9,
      "backend-engineering": 0.6,
      "platform-engineering": 0.9,
      "data-platform": 1,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Hive listener paths handle real-time synchronization for table and partition metadata changes.",
        "Daily reconciliation jobs add missed syncs, remove stale metadata, and drop expired partitions that fall outside the sync-duration policy.",
        "One-time interval jobs can synchronize time-based partitions between explicit start and end intervals.",
        "Operational logs, backup event streams, and deployment controls make the system supportable when metadata events fail, arrive late, or need replay.",
      ],
      scaleSignals: [
        {
          label: "Scope",
          value: "Metadata sync",
          detail:
            "Work covered real-time listener sync, scheduled reconciliation, interval backfill, partition handling, logging, and deployment readiness.",
        },
        {
          label: "Ownership",
          value: "Design + build",
          detail:
            "Designed and implemented the service behavior and the operational paths needed to run it safely.",
        },
      ],
      responsibilities: [
        "Implemented Hive metastore synchronization behavior across independent data environments.",
        "Built listener support for alter-table, alter-partition, delete-partition, and event-time handling.",
        "Added daily reconciliation for missed additions/removals and sync-duration based partition expiry.",
        "Built one-time jobs for synchronizing time-based partitions across explicit start and end intervals.",
        "Added drop-partition and partition-location handling so metadata changes could be replayed and recovered.",
        "Improved observability through structured logs, backup event paths, and deployment-ready runtime configuration.",
      ],
      constraints: [
        "Internal metastore names, schemas, topics, tickets, and deployment details are not published.",
        "This case study focuses on the metadata consistency problem, architecture shape, and engineering responsibilities.",
      ],
      artifacts: [
        {
          label: "Metadata synchronization topology",
          type: "sanitized-diagram",
          detail:
            "Can be shown as source Hive events, listener processing, sync service, target Hive updates, daily reconciliation, interval backfill jobs, expiry cleanup, backup events, and operational logs.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal cluster names, table names, topics, tickets, and production topology.",
      ],
    },
    caseStudy: {
      headline:
        "Metadata synchronization between independent Hive environments without treating manual repair as the operating model.",
      context:
        "Independent Hive systems can drift when table and partition events are not propagated reliably. Data teams then lose trust in catalogs, downstream jobs, and query behavior.",
      role: "Architect and developer for sync service behavior, listener events, partition handling, and deployment paths.",
      timeframe: "Airtel Digital, 2024-2025",
      organization: "Airtel Digital",
      team: "Data platform and Spark reporting teams",
      confidentiality:
        "Internal cluster names, table names, topics, tickets, and production deployment details are not included.",
      metrics: [
        {
          label: "Problem class",
          value: "Metadata drift",
          detail:
            "The work addressed table and partition consistency across independent Hive environments.",
        },
        {
          label: "System shape",
          value: "Listeners + reconciliation",
          detail:
            "Real-time listeners, daily reconciliation, and one-time interval jobs worked together rather than depending on manual catalog repair.",
        },
      ],
      architecture: [
        "Hive listener components capture metadata events such as alter table, alter partition, and delete partition for real-time sync.",
        "A synchronization service translates those events into updates for another Hive environment.",
        "Daily reconciliation jobs repair missed additions and removals and drop partitions that have expired beyond the configured sync-duration policy.",
        "One-time interval jobs synchronize time-based partitions between explicit start and end intervals when historical repair or backfill is needed.",
        "Partition location and drop-partition behavior are handled explicitly so drift can be corrected through the service path.",
        "Operational logs and backup event streams preserve visibility into failures and replay paths.",
        "Deployment configuration keeps the same service behavior portable across controlled environments.",
      ],
      responsibilities: [
        "Designed the synchronization and event-handling flow.",
        "Implemented listener and sync-service changes for table and partition events.",
        "Implemented daily reconciliation for missed events and expiry cleanup.",
        "Built interval-based one-time sync jobs for time-partitioned data.",
        "Added drop-partition and partition-location behavior.",
        "Improved logging, observability, and runtime configuration for production use.",
      ],
      decisions: [
        {
          label: "Treat metadata as platform state",
          detail:
            "The system needed durable event handling because metadata consistency is part of platform correctness, not a side task.",
        },
        {
          label: "Combine real-time sync with reconciliation",
          detail:
            "Listeners handle normal propagation quickly, while daily reconciliation repairs missed syncs and expiry cleanup keeps partition state bounded by policy.",
        },
        {
          label: "Make partition changes explicit",
          detail:
            "Drop and location changes are high-risk metadata operations, so they were modeled as first-class sync behavior.",
        },
        {
          label: "Keep replay paths visible",
          detail:
            "Backup event and logging paths made failure handling easier to reason about when sync operations did not complete cleanly.",
        },
      ],
      lessons: [
        "Metadata systems need the same reliability thinking as data pipelines.",
        "The hard part is not reading a metastore event; it is making the event safe to replay, observe, and operate.",
      ],
    },
  },
  {
    id: "ranger-rbac-and-policy-governance",
    slug: "ranger-rbac-and-policy-governance",
    title: "Ranger RBAC and policy-governance extensions",
    summary:
      "Extended enterprise data access governance around Apache Ranger-based RBAC, an external attribute store, DataHub tag-driven policies, row-level security, masking, Trino integration, audit clarity, and local/containerized development paths.",
    impact:
      "Made access policy behavior more expressive and supportable by marrying tag-based governance with row-level security, masking, extensible attributes, query-engine integration, and audit/error visibility.",
    detail:
      "The contribution evidence shows external DB-backed attribute lookup, extensible policy attributes, caching, DataHub tag-driven policy implementation, row-level security, masking, Trino/Ranger integration, tag-sync support, audit fixes, denied-access message clarity, and deployment/runtime hardening.",
    skillIds: ["java", "ranger", "trino", "datahub", "kubernetes", "helm"],
    focusWeights: {
      general: 0.8,
      "backend-engineering": 0.7,
      "platform-engineering": 1,
      "data-platform": 0.9,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: [
        "private-enterprise",
        "sanitized-diagram",
        "open-source-reference",
      ],
      architectureShape: [
        "Query engines call into policy enforcement rather than embedding access decisions in application code.",
        "An external database provides extensible attributes so policy context can evolve without code changes for every new attribute.",
        "DataHub tags can drive policy behavior, combining tag-based governance with row-level security and masking.",
        "Audit and denied-access paths are treated as product behavior because users and operators need clear explanations.",
      ],
      scaleSignals: [
        {
          label: "Policy model",
          value: "Tags + RLS + masking",
          detail:
            "Work married tag-based policies with row-level security, masking, and custom attribute lookup for enterprise query access.",
        },
        {
          label: "Integration",
          value: "Ranger + Trino",
          detail:
            "The access-governance work connected Apache Ranger-based authorization with query-engine execution paths.",
        },
      ],
      responsibilities: [
        "Implemented external database-backed attribute lookup so policies could use as many attributes as required.",
        "Enabled DataHub tag-driven policy implementation, including tag-based controls combined with row-level security and masking.",
        "Worked on Trino and Ranger integration, local/containerized runtime setup, and missing-plugin/runtime fixes.",
        "Improved Ranger audit behavior and denied-access error clarity.",
        "Built tag-synchronization support between metadata governance and access-control layers.",
      ],
      constraints: [
        "Internal policy names, attributes, table names, user groups, and access rules are not published.",
        "This case study can discuss the architecture and implementation responsibilities without exposing policy details.",
      ],
      artifacts: [
        {
          label: "Access-governance integration map",
          type: "sanitized-diagram",
          detail:
            "Can show DataHub tags, external attributes, policy evaluation, row-level filters, masking, Trino/Ranger integration, audit logs, and denied-access feedback.",
        },
        {
          label: "Open-source context",
          type: "open-source-reference",
          detail:
            "Apache Ranger and Trino can be named as technology context; internal policies and deployment details stay private.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal attributes, policy names, user groups, schemas, and access decisions.",
      ],
    },
    caseStudy: {
      headline:
        "Access governance that combines RBAC, metadata tags, row-level security, masking, custom attributes, and query-engine enforcement.",
      context:
        "Enterprise data platforms need policy enforcement that is expressive enough for real business rules while still being understandable to users and operators.",
      role: "Hands-on developer for Ranger/RBAC extensions, Trino integration, tag sync, and audit/error-path improvements.",
      timeframe: "Airtel Digital, 2024-2026",
      organization: "Airtel Digital",
      team: "Data platform and governance stakeholders",
      confidentiality:
        "Internal policy names, business attributes, user groups, schemas, and production topology are not included.",
      metrics: [
        {
          label: "Policy input",
          value: "External attributes",
          detail:
            "Policy behavior was extended with database-backed attributes and caching so new policy context could be added without code changes for each attribute.",
        },
        {
          label: "Governance shape",
          value: "Tags + RLS + masking",
          detail:
            "DataHub tags became a policy entry point while row-level security and masking handled fine-grained enforcement.",
        },
        {
          label: "Execution layer",
          value: "Query enforcement",
          detail:
            "The governance work connects to query-engine execution instead of remaining a standalone admin concern.",
        },
      ],
      architecture: [
        "An external database provides extensible attributes that enrich the context available to policy evaluation.",
        "Apache Ranger-based authorization governs query-engine access through integration points such as Trino plugins.",
        "DataHub tags can drive policy behavior directly instead of remaining only catalog metadata.",
        "Tag-based policies are combined with row-level security and masking so policy decisions can control both access and data shape.",
        "Tag synchronization keeps governance metadata closer to the authorization layer.",
        "Audit logs and denied-access messages are improved so failures can be investigated and explained.",
        "Containerized/local setup paths make the governance stack easier to test and evolve.",
      ],
      responsibilities: [
        "Implemented external DB-backed attribute lookup and caching behavior.",
        "Enabled DataHub tag-driven policies that combine tag governance with row-level security and masking.",
        "Worked on Trino/Ranger integration and containerized runtime setup.",
        "Improved audit and denied-access feedback paths.",
        "Built tag-sync support between metadata and policy systems.",
      ],
      decisions: [
        {
          label: "Make policy context richer than roles",
          detail:
            "RBAC alone was not enough for the policy shapes required, so external attributes, DataHub tags, row filters, and masking became part of enforcement context.",
        },
        {
          label: "Keep policy inputs extensible",
          detail:
            "Using an external attribute store made it possible to add policy attributes as requirements changed without hard-coding every new dimension into the integration.",
        },
        {
          label: "Use catalog tags as governance intent",
          detail:
            "DataHub tags were a natural place to express governance meaning, while Ranger enforcement handled the row-level and masking behavior at query time.",
        },
        {
          label: "Move clarity into the failure path",
          detail:
            "Denied access should tell users and operators what kind of access failed instead of behaving like a generic platform error.",
        },
        {
          label: "Keep governance testable",
          detail:
            "Local/containerized setup made it easier to verify policy behavior without waiting on full production environments.",
        },
      ],
      lessons: [
        "Access governance is part of developer experience, not just security administration.",
        "Policy systems are easier to operate when audit, error messages, and local testability are treated as first-class work.",
      ],
    },
  },
  {
    id: "cicd-developer-experience-framework",
    slug: "cicd-developer-experience-framework",
    title: "CI/CD onboarding and developer-experience framework",
    summary:
      "Created an in-house YAML-driven CI/CD framework that let teams onboard projects with very little friction while keeping validation, security scans, deployment behavior, and Jira status updates standardized.",
    impact:
      "Improved developer experience, reduced CI/CD onboarding time by about 40%, and increased CI/CD adoption several-fold by replacing bespoke Jenkins pipelines with a small project-level YAML file, reusable templates, automated quality gates, and Jira-triggered delivery flows.",
    detail:
      "The framework supported Jenkins runner and Docker-agent build modes, mandatory pre-commit checks, unit-test report publishing, security scans, deployment templates, shared utilities, and Jira integration where ticket transitions could trigger relevant CI/CD flows and receive status updates back from the pipeline.",
    skillIds: [
      "internal-cicd",
      "jenkins",
      "docker",
      "kubernetes",
      "helm",
      "jira",
    ],
    focusWeights: {
      general: 0.9,
      "backend-engineering": 0.4,
      "platform-engineering": 1,
      "data-platform": 0.9,
      python: 0.6,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "metric", "sanitized-diagram"],
      architectureShape: [
        "A small in-house YAML file maps project configuration into standard build, validation, scan, deploy, and release behavior.",
        "Pipelines can use Jenkins runners or Docker agents inside Jenkins depending on the project build requirement.",
        "Jira ticket transitions can trigger relevant CI/CD flows, and pipeline status is pushed back to Jira for delivery visibility.",
        "Shared utilities and templates keep validation and deployment behavior consistent across services and data jobs.",
      ],
      scaleSignals: [
        {
          label: "Adoption",
          value: "Several-fold growth",
          detail:
            "The easy onboarding path made CI/CD practical for many more projects than the old bespoke-pipeline model.",
        },
        {
          label: "Onboarding time",
          value: "~40% faster",
          detail:
            "Standard templates, mandatory gates, and one small project-level YAML file reduced the time needed to onboard projects to CI/CD by about 40%.",
        },
        {
          label: "Onboarding",
          value: "In-house YAML",
          detail:
            "Teams could adopt standard CI/CD behavior by adding a small internal YAML file instead of hand-writing pipelines.",
        },
        {
          label: "Validation",
          value: "Mandatory checks",
          detail:
            "The path included pre-commit runs, unit-test report publishing, security scans, and simple CI/CD enablement.",
        },
        {
          label: "Workflow integration",
          value: "Jira-aware",
          detail:
            "Ticket transitions could trigger build or deploy flows, and CI/CD status moved back into Jira for end-to-end visibility.",
        },
      ],
      responsibilities: [
        "Designed the in-house CI/CD YAML contract for standard onboarding across projects.",
        "Built reusable CI/CD templates, Jenkins runner and Docker-agent build support, deployment scripts, shared utility functions, and validation conventions.",
        "Added mandatory pre-commit runs, unit-test report reporting, and security scans to keep the onboarding path production-ready.",
        "Integrated CI/CD flows with Jira so ticket transitions could trigger relevant build or deployment behavior and receive status updates.",
        "Hardened Maven wrapper and deployment behavior so projects could onboard consistently across controlled environments.",
        "Built custom Airflow operators and plugin behavior as supporting orchestration work, not as the main CI/CD product.",
      ],
      constraints: [
        "Internal repo names, workflow templates, ticket IDs, and deployment targets are not published.",
        "This case study describes the framework pattern and engineering responsibilities.",
      ],
      artifacts: [
        {
          label: "Workflow onboarding model",
          type: "sanitized-diagram",
          detail:
            "Can show project YAML file, shared templates, Jenkins runner or Docker-agent build path, validation gates, security scans, Jira transition triggers, deployment steps, and status feedback without exposing internal scripts.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal pipeline templates, deployment endpoints, repo names, tickets, and environment details.",
      ],
    },
    caseStudy: {
      headline:
        "A config-led CI/CD onboarding path that made the secure delivery workflow easier for teams to adopt.",
      context:
        "Teams were losing time to copied Jenkins files, custom deployment scripts, uneven quality gates, and manual coordination between delivery tickets and pipeline state. The platform needed a cleaner onboarding path that made the standard delivery model easy to adopt.",
      role: "Architect and developer for the CI/CD YAML contract, Jenkins templates, validation gates, deployment utilities, Jira integration, and supporting Airflow operator work.",
      timeframe: "Airtel Digital, 2022-2026",
      organization: "Airtel Digital",
      team: "Data platform, analytics engineering, and consuming data teams",
      confidentiality:
        "Internal pipeline templates, environment names, ticket IDs, repo names, and deployment targets are not included.",
      metrics: [
        {
          label: "Adoption outcome",
          value: "Several-fold growth",
          detail:
            "More teams adopted CI/CD once onboarding moved from bespoke pipeline authoring to a small internal YAML file.",
        },
        {
          label: "Onboarding efficiency",
          value: "~40% faster",
          detail:
            "Reusable templates and a small internal YAML contract reduced project onboarding time by about 40%.",
        },
        {
          label: "Delivery shape",
          value: "Config-led CI/CD",
          detail:
            "The onboarding model moved repeated build, validation, scan, and deployment behavior into reusable templates and one internal YAML file.",
        },
        {
          label: "Delivery visibility",
          value: "Jira integrated",
          detail:
            "Ticket transitions could trigger relevant CI/CD flows, with status pushed back to Jira for end-to-end visibility.",
        },
      ],
      architecture: [
        "Project repos declare delivery behavior through a small in-house YAML file rather than copied Jenkins pipeline code.",
        "CI/CD repos hold reusable deployment templates, shared utility functions, Jenkins runner support, Docker-agent support, and validation conventions.",
        "Project-level configuration drives build, validation, security scan, reporting, and deployment paths without every team owning custom pipeline code.",
        "Jira transitions can invoke the relevant CI/CD workflow, while pipeline status updates are written back into Jira for visibility.",
        "Deployment scripts and wrapper hardening reduce environment-specific failures during onboarding.",
        "Airflow DAGs and custom operators remain part of the broader workflow platform, but they are supporting evidence here rather than the main project.",
      ],
      responsibilities: [
        "Created the in-house YAML onboarding model and shared deployment utilities.",
        "Added mandatory validation steps including pre-commit checks, unit-test report publishing, and security scans.",
        "Supported Jenkins runner and Docker-agent execution modes inside Jenkins.",
        "Integrated Jira ticket transitions with build and deployment workflows and pushed status back into Jira.",
        "Hardened build and deployment scripts for consistent onboarding across projects.",
        "Built custom Airflow operators and plugin behavior where workflow orchestration needed shared platform support.",
      ],
      decisions: [
        {
          label: "Standardize delivery, not every workload",
          detail:
            "Teams still need workload-specific code, but build, validation, scan, deployment, and status reporting should not be reinvented per repo.",
        },
        {
          label: "Make onboarding configuration-driven",
          detail:
            "A small in-house YAML file is easier for teams to adopt and review than a copied, hand-edited pipeline.",
        },
        {
          label: "Keep quality gates mandatory",
          detail:
            "Pre-commit checks, unit-test reporting, and security scans made the simple onboarding path usable without silently lowering the release bar.",
        },
        {
          label: "Support different build execution modes",
          detail:
            "Jenkins runners and Docker agents let projects use the same onboarding contract even when build environments differed.",
        },
        {
          label: "Connect delivery state to ticket state",
          detail:
            "Jira integration made CI/CD visible in the workflow where delivery was already being coordinated.",
        },
      ],
      lessons: [
        "Internal platforms succeed when the happy path is concrete enough for teams to copy safely.",
        "CI/CD standardization works best when the easiest path is also the compliant path.",
      ],
    },
  },
  {
    id: "kubernetes-spark-operator-migration",
    slug: "kubernetes-spark-operator-migration",
    title: "Kubernetes and Spark Operator migration",
    summary:
      "Migrated 50+ Spark and data workloads to Red Hat OCP using Spark Operator, shared CI/CD foundations, containerized runtime patterns, and platform deployment conventions.",
    impact:
      "Reduced infrastructure cost by about 30% while improving workload isolation, resource management, deployment repeatability, and scalability for data workloads.",
    detail:
      "The work moved shared data-processing workloads from older execution patterns into Kubernetes-managed Spark execution with Spark Operator, CI/CD templates, Helm/Docker packaging, and operational controls.",
    skillIds: [
      "kubernetes",
      "spark-operator",
      "spark",
      "internal-cicd",
      "jenkins",
      "docker",
      "helm",
      "linux",
    ],
    focusWeights: {
      general: 0.85,
      "backend-engineering": 0.35,
      "platform-engineering": 1,
      "data-platform": 0.9,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "metric", "sanitized-diagram"],
      architectureShape: [
        "Spark and data workloads are packaged for Kubernetes execution instead of being operated through older, less standardized runtime paths.",
        "Spark Operator controls workload submission, lifecycle, and Kubernetes-native resource management.",
        "Shared CI/CD templates, Helm/Docker packaging, and validation gates make migration repeatable across projects.",
        "Operational controls cover build, deploy, resource behavior, and failure visibility without exposing internal clusters or workload names.",
      ],
      scaleSignals: [
        {
          label: "Migration scope",
          value: "50+ workloads",
          detail:
            "The migration covered more than 50 Spark and data workloads across enterprise data-processing use cases.",
        },
        {
          label: "Cost impact",
          value: "~30% reduction",
          detail:
            "The move to Kubernetes-managed Spark execution reduced infrastructure cost by about 30%.",
        },
      ],
      responsibilities: [
        "Planned and implemented the migration path for Spark and data workloads onto Red Hat OCP.",
        "Used Spark Operator to standardize workload submission and lifecycle behavior on Kubernetes.",
        "Connected the migration with shared CI/CD, container build, Helm, and deployment practices.",
        "Improved resource management, deployment repeatability, and operational visibility for migrated workloads.",
      ],
      constraints: [
        "Cluster names, workload names, project names, capacity numbers, and internal deployment details are not published.",
        "The public story focuses on migration scope, platform shape, responsibilities, and rounded outcome metrics.",
      ],
      artifacts: [
        {
          label: "Kubernetes Spark workload migration topology",
          type: "sanitized-diagram",
          detail:
            "Can show CI/CD, container packaging, Helm deployment, Spark Operator submission, Kubernetes resource management, and workload monitoring without exposing internal clusters.",
        },
        {
          label: "Migration outcome",
          type: "metric",
          detail:
            "50+ migrated workloads and roughly 30% infrastructure cost reduction are shareable rounded signals.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal cluster names, project names, workload names, capacity plans, and deployment manifests.",
      ],
    },
    caseStudy: {
      headline:
        "A migration path for running enterprise Spark workloads on Kubernetes with Spark Operator and shared CI/CD.",
      context:
        "Data workloads needed a more repeatable runtime with better resource management, cleaner deployment mechanics, and lower infrastructure cost without forcing every team to invent its own Kubernetes pattern.",
      role: "Designed and implemented migration foundations across Spark Operator, Kubernetes/OCP deployment, CI/CD, packaging, and runtime hardening.",
      timeframe: "Airtel Digital, 2021-2026",
      organization: "Airtel Digital",
      team: "Data platform, data engineering, and consuming workload teams",
      confidentiality:
        "This case study excludes internal cluster names, workload names, project names, and capacity details.",
      metrics: [
        {
          label: "Migration scope",
          value: "50+ workloads",
          detail:
            "Moved more than 50 Spark and data workloads toward Kubernetes-managed execution.",
        },
        {
          label: "Cost outcome",
          value: "~30% reduction",
          detail:
            "Reduced infrastructure cost by about 30% through better workload placement and resource management.",
        },
      ],
      architecture: [
        "Existing Spark and data workloads were moved toward containerized execution patterns.",
        "Spark Operator handled Kubernetes-native Spark application submission and lifecycle management.",
        "CI/CD templates, Docker packaging, and Helm deployment conventions made the migration repeatable.",
        "Operational visibility and validation stayed part of the migration path instead of being treated as after-work.",
      ],
      responsibilities: [
        "Designed migration conventions for Spark workloads running on Red Hat OCP.",
        "Implemented and hardened Spark Operator-based execution paths.",
        "Integrated workload migration with CI/CD, image packaging, Helm, and deployment validation.",
        "Helped reduce runtime cost and improve repeatability across migrated workloads.",
      ],
      decisions: [
        {
          label: "Use Kubernetes-native Spark lifecycle management",
          detail:
            "Spark Operator gave the platform a clearer control point for submission, lifecycle, and resource behavior than one-off execution scripts.",
        },
        {
          label: "Make migration repeatable",
          detail:
            "Shared packaging and CI/CD conventions mattered because migrating one workload well is different from migrating dozens consistently.",
        },
        {
          label: "Tie cost reduction to resource behavior",
          detail:
            "The cost benefit came from better workload placement, scaling, and resource management rather than a cosmetic platform move.",
        },
      ],
      lessons: [
        "Platform migrations are successful when teams get a repeatable operating model, not just a new runtime target.",
        "Spark on Kubernetes needs CI/CD, packaging, and operations to be designed together.",
      ],
    },
  },
  {
    id: "browsing-log-analytics-safe-browsing",
    slug: "browsing-log-analytics-safe-browsing",
    title: "Browsing-log analytics and safe-browsing pipelines",
    summary:
      "Built browsing-log ingestion and analytics pipelines for safe-browsing classification, audience management, cohort creation, and pattern-based downstream data products.",
    impact:
      "Turned raw browsing activity into governed analytical signals: threat classification, spam URL marking, audience segments, browsing-pattern cohorts, and reusable data products.",
    detail:
      "This work is separate from mobile tower network-event systems. It focuses on browsing logs and domain/URL signals: NiFi-heavy ingestion, AI threat-analysis outputs, safe-browsing classification, audience management, cohort creation, and queryable analytical datasets.",
    skillIds: [
      "nifi",
      "spark",
      "airflow",
      "python",
      "sql",
      "seatunnel",
      "kyuubi",
      "trino",
    ],
    focusWeights: {
      general: 0.85,
      "backend-engineering": 0.45,
      "platform-engineering": 0.65,
      "data-platform": 1,
      python: 0.6,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "metric", "sanitized-diagram"],
      architectureShape: [
        "Browsing-log and domain/URL data moves through NiFi-heavy ingestion before validation, enrichment, and analytics preparation.",
        "AI threat-analysis outputs feed safe-browsing classification so suspicious URLs can be marked as spam or unsafe.",
        "Analytical pipelines transform browsing patterns into audience-management signals and cohort datasets.",
        "Workflow orchestration coordinates backfills, retention windows, cleanup, and downstream data-product refreshes.",
        "Query and validation services provide controlled access patterns for analytics and operational consumers.",
      ],
      scaleSignals: [
        {
          label: "Domain",
          value: "Browsing logs",
          detail:
            "The work focuses on browsing activity, domain/URL signals, safe-browsing classification, and audience analytics.",
        },
        {
          label: "Product paths",
          value: "Safety + audience",
          detail:
            "The same data foundation supported spam/unsafe URL classification and analytics for audience management and cohort creation.",
        },
        {
          label: "Shape",
          value: "Ingestion + analytics",
          detail:
            "Contributions include NiFi ingestion, validation, enrichment, orchestration, query paths, and downstream analytical datasets.",
        },
      ],
      responsibilities: [
        "Built ingestion and cleanup workflows for browsing-log and domain/URL datasets.",
        "Implemented NiFi-heavy ingestion and safe-browsing classification paths.",
        "Built analytical pipelines for audience management and cohort creation based on browsing patterns.",
        "Implemented validation and metadata behavior around file and record-level ingestion paths.",
        "Worked on query-engine and Kyuubi/Trino execution paths for controlled data access.",
      ],
      constraints: [
        "Internal dataset names, user groups, exact data volumes, and operational dashboards are not published.",
        "This case study focuses on the data-product shape, technology context, and implementation responsibilities.",
      ],
      artifacts: [
        {
          label: "Browsing-log data product pipeline",
          type: "sanitized-diagram",
          detail:
            "Can be represented as browsing logs, NiFi ingestion, validation, enrichment, AI threat-analysis outputs, safe-browsing classification, audience/cohort generation, query engines, and downstream data products.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: dataset names, user-level examples, internal dashboards, exact scale, and operational endpoints.",
      ],
    },
    caseStudy: {
      headline:
        "Browsing-log analytics pipelines for safe-browsing classification, audience management, and cohort creation.",
      context:
        "Browsing-log data can support several product paths, but only when ingestion, validation, enrichment, threat classification, and analytics preparation are separated cleanly enough to operate and evolve.",
      role: "Hands-on developer across ingestion, validation, workflow orchestration, query-engine integration, safe-browsing classification, and audience analytics.",
      timeframe: "Airtel Digital, 2021-2026",
      organization: "Airtel Digital",
      team: "Browsing-log analytics, audience, and platform stakeholders",
      confidentiality:
        "Internal datasets, dashboards, users, exact volumes, and production endpoints are not included.",
      metrics: [
        {
          label: "Data shape",
          value: "Browsing patterns",
          detail:
            "The work spans browsing-log ingestion, domain/URL enrichment, safe-browsing classification, audience management, and cohort analytics.",
        },
        {
          label: "Safety path",
          value: "URL classification",
          detail:
            "AI threat-analysis outputs helped mark suspicious or spam URLs for safe-browsing use cases.",
        },
        {
          label: "Analytics path",
          value: "Audience cohorts",
          detail:
            "Browsing patterns were shaped into audience-management signals and cohort datasets for downstream use.",
        },
      ],
      architecture: [
        "Browsing-log data moves through NiFi-heavy ingestion before validation and enrichment.",
        "Domain and URL signals are prepared for AI threat-analysis and safe-browsing classification.",
        "Spam or unsafe URL decisions are produced as downstream classification signals rather than mixed into ingestion logic.",
        "Analytical pipelines transform browsing patterns into audience-management and cohort datasets.",
        "Spark and Airflow jobs handle transformation, cleanup, retention, and refresh workflows.",
        "Kyuubi/Trino/query-engine paths provide controlled execution and access for downstream users.",
      ],
      responsibilities: [
        "Implemented browsing-log ingestion, cleanup, and retention workflow changes.",
        "Built safe-browsing and URL spam-classification support around NiFi ingestion and AI threat-analysis outputs.",
        "Built analytical pipelines for audience management and cohort creation from browsing patterns.",
        "Built validation and metadata behavior for file and record-level ingestion.",
        "Improved query-engine and Kyuubi/Trino behavior for platform-controlled data access.",
      ],
      decisions: [
        {
          label: "Keep browsing logs separate from network-event analytics",
          detail:
            "Browsing logs serve audience, cohort, and safe-browsing products; mobile tower network events serve mobile network analytics. Mixing them makes the portfolio story and the system boundaries unclear.",
        },
        {
          label: "Separate ingestion from interpretation",
          detail:
            "NiFi ingestion handled data movement while AI threat analysis and URL classification stayed as distinct enrichment and interpretation layers.",
        },
        {
          label: "Build reusable audience signals",
          detail:
            "Audience management and cohort creation work better when browsing-pattern features are prepared as reusable datasets instead of one-off analysis outputs.",
        },
        {
          label: "Put validation before product use",
          detail:
            "File and record validation reduce downstream ambiguity and make ingestion failures easier to isolate.",
        },
      ],
      lessons: [
        "Browsing-log analytics needs clear boundaries between ingestion, enrichment, safety classification, and audience products.",
        "The same raw data can serve multiple products only when the intermediate signals are reusable and governed.",
      ],
    },
  },
  {
    id: "observability",
    slug: "observability",
    title: "Internal observability platform",
    summary:
      "Built an in-house alerting and monitoring framework around Elastic Stack, Kafka, and custom services.",
    impact:
      "Improved visibility, alerting, and operational response for internal systems, cutting incident-resolution time by about 25% instead of relying on disconnected monitoring paths.",
    detail:
      "Built an internal observability layer around Elastic Stack, Node.js-based services, Kafka, and downstream integrations to make monitoring more usable for day-to-day operations.",
    skillIds: ["elastic-stack", "nodejs", "kafka"],
    focusWeights: {
      general: 0.8,
      "backend-engineering": 0.5,
      "platform-engineering": 0.9,
      "data-platform": 0.4,
      kafka: 0.4,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Operational events flow into Elastic Stack for search and investigation.",
        "Selected event streams are carried through Kafka toward alerting and integration services.",
        "Custom services normalize signals into team-facing alert and response workflows.",
      ],
      scaleSignals: [
        {
          label: "Coverage pattern",
          value: "Multi-system",
          detail:
            "This case study describes the integrated observability pattern without exposing internal systems.",
        },
        {
          label: "Resolution time",
          value: "~25% faster",
          detail:
            "The alerting and monitoring framework reduced incident-resolution time by about 25% by shortening the path from signal to action.",
        },
      ],
      responsibilities: [
        "Designed the alerting and monitoring framework around operational response paths.",
        "Implemented service and integration pieces around Elastic Stack and Kafka.",
        "Kept the site description limited to vendor-level architecture and role scope.",
      ],
      constraints: [
        "Internal alert rules, hostnames, routing groups, and incident workflows are confidential.",
        "Architecture can be shown as a sanitized shape only.",
      ],
      artifacts: [
        {
          label: "High-level observability architecture",
          type: "sanitized-diagram",
          detail:
            "Can be represented as event sources, Elastic indexing, Kafka transport, alert services, and response consumers.",
        },
        {
          label: "Employer project context",
          type: "private-enterprise",
          detail:
            "Work was delivered inside Airtel Digital; the case study is limited to responsibilities, stack, constraints, and non-sensitive scale signals.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal topology, alert thresholds, rule names, and operational escalation paths.",
      ],
    },
    caseStudy: {
      headline:
        "Internal observability platform for alerting, monitoring, and operational response.",
      context:
        "Internal teams needed a more dependable way to detect issues, route alerts, and inspect operational signals across data and backend systems.",
      role: "Designed and implemented the core alerting and monitoring framework.",
      timeframe: "Airtel Digital, 2021-present",
      organization: "Airtel Digital",
      team: "Data engineering and platform stakeholders",
      confidentiality:
        "This case study excludes internal system names, alert rules, and operational topology.",
      metrics: [
        {
          label: "Operational coverage",
          value: "Multi-system",
          detail:
            "Brought monitoring and alerting paths together for internal systems that were otherwise observed through disconnected flows.",
        },
        {
          label: "Primary outcome",
          value: "~25% faster resolution",
          detail:
            "Improved visibility and escalation quality, reducing incident-resolution time by about 25% for monitored workflows.",
        },
      ],
      architecture: [
        "Elastic Stack collected and indexed operational events for search and investigation.",
        "Kafka carried selected event streams into downstream alerting and integration paths.",
        "Custom services shaped raw operational signals into alerts and team-facing workflows.",
      ],
      responsibilities: [
        "Modeled the alerting flow around practical operations instead of raw log availability alone.",
        "Built custom application pieces around Elastic Stack and Kafka integrations.",
        "Improved day-to-day usability so teams could inspect, route, and respond to issues faster.",
      ],
      decisions: [
        {
          label: "Use existing observability primitives",
          detail:
            "The implementation leaned on Elastic Stack and existing event infrastructure instead of adding a separate heavy monitoring product.",
        },
        {
          label: "Optimize for operations",
          detail:
            "The useful unit was not just a searchable log entry; it was a signal that could become an action.",
        },
      ],
      lessons: [
        "Observability work succeeds when it shortens the path from signal to action.",
        "Internal tooling needs simple ownership and routing rules as much as ingestion capability.",
      ],
    },
  },
  {
    id: "self-service-data-platform-governance",
    slug: "self-service-data-platform-governance",
    title: "Self-service data platform and governance architecture",
    summary:
      "Built data-mesh platform capabilities around Kyuubi, custom engine routing, RBAC, secrets management, Trino query access, dbt transformations, DataHub metadata, and Metabase BI.",
    impact:
      "Created a governed self-service data path where teams could discover data, transform it, query it, and consume BI outputs without bypassing access control or central metadata.",
    detail:
      "The platform used Apache Kyuubi as the governed access layer with custom changes for engine selection, RBAC, and secrets management; Trino as a query engine; dbt for transformation; DataHub as the central metadata base; and Metabase as the BI layer.",
    skillIds: [
      "kyuubi",
      "trino",
      "ranger",
      "datahub",
      "metabase",
      "jupyter",
      "dbt",
      "spark",
      "airflow",
    ],
    focusWeights: {
      general: 0.8,
      "platform-engineering": 0.8,
      "data-platform": 1,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: [
        "private-enterprise",
        "sanitized-diagram",
        "open-source-reference",
      ],
      architectureShape: [
        "Kyuubi acts as a governed access gateway, with custom behavior for engine selection, RBAC, and secrets management.",
        "Trino provides query execution, while Spark supports heavier processing workloads behind the platform.",
        "dbt owns transformation patterns, DataHub acts as the central metadata base, and Metabase provides the BI consumption layer.",
        "Airflow remains the scheduling/orchestration layer used across platform workflows rather than the main product story.",
      ],
      scaleSignals: [
        {
          label: "Platform shape",
          value: "Governed self-serve",
          detail:
            "The shareable story is the operating model: query access, authorization, secrets, metadata, transformation, and BI connected into one platform path.",
        },
        {
          label: "Access layer",
          value: "Kyuubi + Trino",
          detail:
            "Kyuubi handled governed entry points and engine behavior while Trino provided interactive query execution.",
        },
      ],
      responsibilities: [
        "Built and extended Kyuubi platform behavior for engine selection, RBAC, and secrets management.",
        "Connected Trino query access, dbt transformations, DataHub metadata, and Metabase BI into a clearer self-service data path.",
        "Improved data discovery, governed access, and reusable analytics patterns across platform consumers.",
      ],
      constraints: [
        "Internal datasets, access policies, tenancy boundaries, and deployment topology are confidential.",
        "Site notes avoid screenshots or examples that reveal enterprise data assets.",
      ],
      artifacts: [
        {
          label: "Governed self-service data platform topology",
          type: "sanitized-diagram",
          detail:
            "Can be shown as Kyuubi access gateway, custom engine routing, RBAC, secrets management, Trino query execution, dbt transformations, DataHub metadata, Metabase BI, notebooks, and scheduled platform workflows.",
        },
        {
          label: "Open-source technology references",
          type: "open-source-reference",
          detail:
            "The case study can cite the named open-source projects as technology context without implying ownership of enterprise deployment details.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: dataset names, access rules, cluster sizing, tenant names, and internal platform URLs.",
      ],
    },
    caseStudy: {
      headline:
        "Governed self-service data platform for discovery, query access, transformation, and BI.",
      context:
        "Teams needed self-service access to shared data assets, but the platform still had to preserve authorization, secrets, metadata, transformation ownership, and a usable BI layer.",
      role: "Built and extended platform pieces across Kyuubi, engine routing, RBAC, secrets management, Trino query access, DataHub metadata, dbt transformation, and BI consumption.",
      timeframe: "Airtel Digital, 2021-present",
      organization: "Airtel Digital",
      team: "Data platform and analytics users",
      confidentiality:
        "This case study keeps architecture vendor-level and omits internal datasets, access policies, and deployment details.",
      metrics: [
        {
          label: "Platform model",
          value: "Governed self-serve",
          detail:
            "The platform connected access control, query engines, metadata, transformations, notebooks, and BI instead of treating them as disconnected tools.",
        },
        {
          label: "Access gateway",
          value: "Kyuubi customizations",
          detail:
            "Custom changes covered engine behavior, RBAC, and secrets management around shared query access.",
        },
      ],
      architecture: [
        "Kyuubi served as the governed access gateway, with custom platform changes for engine selection, RBAC, and secrets management.",
        "Trino handled interactive query execution, while Spark supported heavier processing paths.",
        "dbt provided transformation structure, DataHub served as the central metadata base, and notebooks supported exploration.",
        "Metabase provided the BI layer for consuming curated outputs.",
        "Airflow supported recurring platform workflows without being the headline capability.",
      ],
      responsibilities: [
        "Extended Kyuubi behavior for engine routing and platform access needs.",
        "Worked on RBAC and secrets-management pieces around governed query access.",
        "Connected Trino, dbt, DataHub, notebooks, and Metabase into a more coherent user path.",
        "Improved discoverability and reusable access patterns for shared data assets.",
      ],
      decisions: [
        {
          label: "Use Kyuubi as the governed access layer",
          detail:
            "Kyuubi was the right place to centralize access behavior because it sits close to users, engines, identity, and workload routing.",
        },
        {
          label: "Keep metadata central",
          detail:
            "DataHub became the shared metadata base so discovery and governance did not depend on scattered project knowledge.",
        },
        {
          label: "Separate transformation from consumption",
          detail:
            "dbt and Metabase served different parts of the workflow: transformation ownership and BI consumption.",
        },
      ],
      lessons: [
        "Self-service data platforms need access control, metadata, transformation, and BI to be designed together.",
        "The most useful platform work often happens in the boundaries between open-source systems, not inside one tool alone.",
      ],
    },
  },
  {
    id: "automatic-engine-selection-for-kyuubi",
    slug: "automatic-engine-selection-for-kyuubi",
    title: "Automatic engine selection for Kyuubi",
    summary:
      "Changed Kyuubi engine selection so shared compute could route interactive or batch sessions using user group context.",
    impact:
      "Made shared compute usage more practical by routing users toward the engine mode that best matched their access pattern.",
    detail:
      "Worked directly in the Kyuubi codebase to improve engine selection behavior across Spark and Trino-backed use cases.",
    skillIds: ["kyuubi", "java", "spark", "trino"],
    focusWeights: {
      general: 0.7,
      "backend-engineering": 0.5,
      "platform-engineering": 0.8,
      "data-platform": 0.8,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: [
        "private-enterprise",
        "sanitized-diagram",
        "open-source-reference",
      ],
      architectureShape: [
        "Identity or group context informs engine routing decisions.",
        "Interactive and batch execution modes remain separated behind the routing layer.",
        "Spark and Trino-backed workloads remain part of the shared compute environment.",
      ],
      scaleSignals: [
        {
          label: "Routing basis",
          value: "Group-aware",
          detail:
            "The shareable signal is the routing pattern, not the specific enterprise group names or policies.",
        },
      ],
      responsibilities: [
        "Modified Kyuubi engine-selection behavior close to the platform layer.",
        "Mapped access patterns into deterministic routing behavior.",
        "Kept enterprise identity details out of the site description.",
      ],
      constraints: [
        "AD group names, private repository references, internal patches, and deployment rules are confidential.",
        "Site notes describe only the generalized routing pattern.",
      ],
      artifacts: [
        {
          label: "High-level routing diagram",
          type: "sanitized-diagram",
          detail:
            "Can be shown as user context feeding an engine selector that routes toward interactive or batch engines.",
        },
        {
          label: "Kyuubi platform context",
          type: "open-source-reference",
          detail:
            "Kyuubi is a public open-source system; this employer-specific change stays described at the pattern level unless the patch becomes public.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: internal group mappings, patch diffs, repository names, and cluster routing policies.",
      ],
    },
    caseStudy: {
      headline:
        "Kyuubi engine routing improvement based on user access patterns.",
      context:
        "Shared compute users needed better routing between interactive and batch engine modes without manual selection becoming a recurring source of friction.",
      role: "Patched engine selection behavior in the Kyuubi codebase.",
      timeframe: "Airtel Digital, 2021-present",
      organization: "Airtel Digital",
      team: "Data platform users and platform engineering",
      confidentiality:
        "This case study avoids internal AD group names, deployment topology, and repository details.",
      metrics: [
        {
          label: "Routing model",
          value: "AD-group aware",
          detail:
            "Engine selection used user group context to route workloads toward the right execution mode.",
        },
        {
          label: "Primary outcome",
          value: "Less manual routing",
          detail:
            "Reduced friction for shared compute users by aligning engine behavior with access pattern.",
        },
      ],
      architecture: [
        "User group context informed the engine selection path.",
        "Interactive and batch modes remained separate execution patterns behind a cleaner routing layer.",
        "Spark and Trino-backed use cases remained part of the platform context.",
      ],
      responsibilities: [
        "Read and modified Kyuubi internals instead of solving the problem only at the wrapper layer.",
        "Mapped access pattern requirements into deterministic engine selection behavior.",
        "Validated the change against shared platform usage expectations.",
      ],
      decisions: [
        {
          label: "Patch the platform layer",
          detail:
            "The change belonged close to engine selection, where routing could stay consistent across users.",
        },
        {
          label: "Use existing identity context",
          detail:
            "AD group membership was already meaningful operational data, so it became part of routing logic.",
        },
      ],
      lessons: [
        "Platform ergonomics often improve most when defaults match real user behavior.",
        "Small routing decisions can have large operational impact in shared compute environments.",
      ],
    },
  },
  {
    id: "point-of-interest-proximity-streaming",
    slug: "point-of-interest-proximity-streaming",
    title: "Point-of-interest proximity streaming pipeline",
    summary:
      "Built a real-time proximity pipeline that joined customer location events with points of interest so users could receive relevant offers when they came within roughly a one-kilometer radius.",
    impact:
      "Moved location-aware decisioning into the event stream by combining GPS and network-triangulated location signals with point-of-interest context such as retail outlets, offers, and airports.",
    detail:
      "The pipeline handled real-time customer location signals, including triangulation-driven location beyond GPS alone, and evaluated proximity against known points of interest for downstream offer and action workflows.",
    skillIds: [
      "flink",
      "kafka",
      "java",
      "geospatial",
      "elastic-stack",
      "influx",
      "airflow",
    ],
    focusWeights: {
      general: 0.8,
      "backend-engineering": 0.6,
      "platform-engineering": 0.5,
      "data-platform": 0.8,
      flink: 1,
      kafka: 0.9,
    },
    featured: true,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Kafka carries customer location events and point-of-interest reference updates into stream-processing paths.",
        "Flink evaluates proximity between user location and POI boundaries close to event time.",
        "Location signals can come from GPS as well as network triangulation, so the pipeline handles imperfect and changing location quality.",
        "Downstream action paths can trigger relevant offers or notifications when a user enters the target radius.",
      ],
      scaleSignals: [
        {
          label: "Processing mode",
          value: "Real-time",
          detail:
            "The product required event-time proximity evaluation rather than only offline audience computation.",
        },
        {
          label: "Trigger radius",
          value: "~1 km",
          detail:
            "The shareable product rule is proximity to a point of interest such as a retail outlet or airport.",
        },
        {
          label: "Location sources",
          value: "GPS + triangulation",
          detail:
            "The pipeline accounted for location signals that were not purely GPS-driven.",
        },
      ],
      responsibilities: [
        "Implemented stream-processing and proximity-decisioning components.",
        "Integrated customer location streams, point-of-interest context, radius matching, and downstream action paths.",
        "Handled GPS and triangulation-based location signals in the streaming design.",
        "Kept customer attributes, exact event schemas, offer rules, and partner details out of the site description.",
      ],
      constraints: [
        "Customer attributes, event schemas, offer rules, partner names, and campaign details are confidential.",
        "Proof should show streaming, geospatial, and decisioning shape without exposing user or campaign data.",
      ],
      artifacts: [
        {
          label: "High-level POI streaming topology",
          type: "sanitized-diagram",
          detail:
            "Can be represented as location events, POI reference data, stream processing, proximity evaluation, action triggers, and operational visibility.",
        },
        {
          label: "Proximity trigger signal",
          type: "metric",
          detail:
            "The case study can state the approximate one-kilometer trigger radius without publishing customer or campaign details.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: customer data, partner names, exact event schemas, campaign logic, or offer details.",
      ],
    },
    caseStudy: {
      headline:
        "Real-time location intelligence that detects when users enter a point-of-interest radius.",
      context:
        "The product needed to react when a user came near a relevant location such as a retail outlet with an offer or an airport. The location data was not only GPS-driven; it also included network-triangulated signals, which made proximity evaluation a streaming systems problem rather than a simple static lookup.",
      role: "Built streaming and decisioning components around customer location events, point-of-interest context, proximity matching, and downstream actions.",
      timeframe: "Airtel Digital, 2021-present",
      organization: "Airtel Digital",
      team: "Data engineering and product stakeholders",
      confidentiality:
        "This case study omits customer data, event schemas, partner names, campaign rules, and offer details.",
      metrics: [
        {
          label: "Processing mode",
          value: "Real-time",
          detail:
            "Proximity decisions needed to happen as location events arrived, not only in offline batches.",
        },
        {
          label: "Trigger radius",
          value: "~1 km",
          detail:
            "The representative business rule was to trigger an action when a user came near a configured point of interest.",
        },
        {
          label: "Location model",
          value: "GPS + triangulation",
          detail:
            "The stream had to account for location signals from both device GPS and network triangulation.",
        },
      ],
      architecture: [
        "Kafka carried customer location events and point-of-interest reference updates into the streaming layer.",
        "Flink evaluated proximity against configured points of interest and handled event-time decisioning.",
        "Reference data included places such as retail outlets with offers and airports.",
        "The location model accounted for GPS and triangulation-based signals, including imperfect precision.",
        "Operational stores, monitoring, and scheduled workflows supported downstream actions and maintainability.",
      ],
      responsibilities: [
        "Implemented stream processing pieces for point-of-interest proximity decisions.",
        "Integrated location events, POI reference data, radius checks, and downstream action paths.",
        "Handled location-quality constraints caused by mixing GPS and network-triangulated signals.",
        "Balanced real-time behavior with operational visibility and maintainability.",
      ],
      decisions: [
        {
          label: "Evaluate proximity in the stream",
          detail:
            "The value depended on reacting while the user was near the location, so batch-only processing would miss the product moment.",
        },
        {
          label: "Treat location quality as part of the design",
          detail:
            "Triangulation-driven signals are useful but less precise than clean GPS, so the pipeline needed to tolerate changing confidence and signal quality.",
        },
        {
          label: "Keep operations visible",
          detail:
            "Location-trigger systems are difficult to trust when opaque, so monitoring and replay/debug paths matter.",
        },
      ],
      lessons: [
        "Real-time location products are as much about signal quality and timing as they are about geospatial math.",
        "A useful proximity system needs clear event boundaries, reference data ownership, and operational visibility from the start.",
      ],
    },
  },
  {
    id: "retail-cross-shopping",
    slug: "retail-cross-shopping",
    title: "Retail adjacency and store-flow analytics",
    summary:
      "Built reusable analytics workflows for cross-shopping, category adjacency, aisle-flow, and store-flow analysis across departments, categories, and products.",
    impact:
      "Helped retail teams move from isolated category views to placement and assortment decisions associated with up to 20% sales-growth impact.",
    detail:
      "The work covered customer priority assortment, cross-shopping behavior, category adjacency, and store-flow style outputs so planning teams could reason about placement, assortment, and category optimization across retail contexts.",
    skillIds: ["spark", "python", "power-bi", "airflow"],
    focusWeights: {
      general: 0.7,
      "data-platform": 0.8,
      python: 0.7,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Retail transaction data is prepared in Spark and Python processing flows.",
        "Reusable preparation layers support multiple segmentation and comparison variants.",
        "Power BI presents cross-shopping output for business review.",
      ],
      scaleSignals: [
        {
          label: "Analysis scope",
          value: "Cross-category",
          detail:
            "This case study shares the department, category, and product relationship pattern, not client data.",
        },
        {
          label: "Business impact",
          value: "Up to 20% sales growth",
          detail:
            "Retail optimization work was associated with up to 20% sales growth through placement and category decisions.",
        },
      ],
      responsibilities: [
        "Built reusable data preparation for cross-shopping, adjacency, aisle-flow, and store-flow analysis.",
        "Connected data science needs with platform-ready repeatable workflows.",
        "Protected client, shopper, and commercial details in site descriptions.",
      ],
      constraints: [
        "Client names, shopper-level data, commercial rules, and segmentation definitions are confidential.",
        "Site notes use generalized retail taxonomy language.",
      ],
      artifacts: [
        {
          label: "High-level retail analytics shape",
          type: "sanitized-diagram",
          detail:
            "Can be shown as transaction preparation, segmentation variants, relationship outputs, and BI consumption.",
        },
        {
          label: "Reusable analysis signal",
          type: "metric",
          detail:
            "The case study can state cross-category and segmented reuse patterns without publishing client metrics.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: client names, basket examples, product taxonomies, and commercial segmentation rules.",
      ],
    },
    caseStudy: {
      headline:
        "Reusable retail analytics product for cross-shopping, category adjacency, and store-flow decisions.",
      context:
        "Retail stakeholders needed a repeatable way to understand how customers moved across departments and categories, then convert that signal into placement, adjacency, and assortment decisions.",
      role: "Data science engineer working between analytics users and big data platform teams.",
      timeframe: "dunnhumby, 2018-2021",
      organization: "dunnhumby",
      team: "Retail analytics and data science engineering teams",
      confidentiality:
        "This case study excludes client names, shopper-level data, commercial rules, and proprietary segmentation details.",
      metrics: [
        {
          label: "Analysis scope",
          value: "Cross-category",
          detail:
            "Modeled relationships across departments, categories, and products rather than a single isolated product view.",
        },
        {
          label: "Commercial signal",
          value: "Up to 20% sales growth",
          detail:
            "Retail optimization work was associated with up to 20% sales growth through better placement and category decisions.",
        },
        {
          label: "Reuse pattern",
          value: "Segmented",
          detail:
            "Designed the analysis so multiple customer segmentation approaches could reuse the same prepared data foundations.",
        },
      ],
      architecture: [
        "Spark and Python prepared large retail transaction datasets for repeatable cross-shopping analysis.",
        "Reusable data preparation separated raw transaction work from analytical segmentation.",
        "Aisle-flow and store-flow style outputs supported placement, adjacency, and category optimization conversations.",
        "Power BI surfaced the output in a format business teams could inspect and compare.",
      ],
      responsibilities: [
        "Translated retail analysis needs into repeatable data processing and reporting workflows for cross-shopping, adjacency, and store-flow questions.",
        "Built reusable preparation logic so segmentation variants could share common foundations.",
        "Worked across data science and platform concerns so the output could be run repeatedly at scale.",
      ],
      decisions: [
        {
          label: "Separate reusable preparation from analysis variants",
          detail:
            "The work was structured so segmentation methods could evolve without rebuilding the base transaction preparation each time.",
        },
        {
          label: "Make the output business-readable",
          detail:
            "The final shape prioritized comparison and exploration so retail users could reason about cross-shopping behavior directly.",
        },
      ],
      lessons: [
        "Retail analytics products need strong data preparation before the statistical layer can be trusted.",
        "Reusable analytical foundations matter when similar questions appear across many clients and categories.",
      ],
    },
  },
  {
    id: "retail-association-rule-engine",
    slug: "retail-association-rule-engine",
    title: "Retail association-rule engine",
    summary:
      "Built a repeatable Apriori-based workflow for analyzing how products, categories, and departments are shopped together at scale.",
    impact:
      "Turned basket-level relationships into usable retail intelligence for planning and decision support.",
    detail:
      "The core challenge was not just running Apriori at scale, but turning it into something repeatable and useful for business teams.",
    skillIds: ["spark", "python", "power-bi", "airflow", "apriori"],
    focusWeights: {
      general: 0.6,
      "data-platform": 0.7,
      python: 0.7,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Basket and taxonomy data is prepared with Spark and Python.",
        "Association-rule processing identifies product, category, and department relationships.",
        "Orchestration and BI layers make the workflow repeatable and consumable.",
      ],
      scaleSignals: [
        {
          label: "Method",
          value: "Apriori",
          detail:
            "This case study can name the standard algorithm while omitting thresholds and client datasets.",
        },
      ],
      responsibilities: [
        "Built scalable preparation and association-rule processing flows.",
        "Turned analytical output into reusable structures for planning and decision support.",
        "Kept client data, product taxonomy, and commercial thresholds private.",
      ],
      constraints: [
        "Client datasets, product identifiers, basket-level examples, and thresholds are confidential.",
        "Site notes describe the analytical pattern without publishing outputs.",
      ],
      artifacts: [
        {
          label: "High-level association-rule workflow",
          type: "sanitized-diagram",
          detail:
            "Can be represented as basket preparation, Apriori processing, relationship output, orchestration, and BI review.",
        },
        {
          label: "Standard method context",
          type: "metric",
          detail:
            "Apriori is a public standard method; enterprise inputs and outputs remain private.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: product names, support/confidence thresholds, basket examples, and client-specific outputs.",
      ],
    },
    caseStudy: {
      headline:
        "Large-scale association-rule analytics for discovering product, category, and department relationships.",
      context:
        "Retail teams needed a way to turn basket-level behavior into repeatable intelligence about which products and categories were commonly shopped together.",
      role: "Data science engineer building scalable analytical workflows and reusable reporting output.",
      timeframe: "dunnhumby, 2018-2021",
      organization: "dunnhumby",
      team: "Retail analytics, data science, and platform engineering collaborators",
      confidentiality:
        "This case study excludes client names, product taxonomy details, basket-level data, and commercial thresholds.",
      metrics: [
        {
          label: "Method",
          value: "Apriori",
          detail:
            "Used association-rule mining to identify product and category relationships from large retail datasets.",
        },
        {
          label: "Delivery shape",
          value: "Repeatable",
          detail:
            "Focused on a workflow that could be rerun and consumed by analysts rather than a one-off notebook result.",
        },
      ],
      architecture: [
        "Spark and Python handled large-scale basket preparation and association-rule processing.",
        "Airflow-style orchestration made recurring data preparation and reporting more reliable.",
        "Power BI translated the discovered relationships into reviewable business output.",
      ],
      responsibilities: [
        "Built data preparation flows for product, category, and department-level association analysis.",
        "Turned Apriori output into reusable structures that could support planning and decision workflows.",
        "Handled the engineering around scale, repeatability, and downstream consumption.",
      ],
      decisions: [
        {
          label: "Productize the analysis path",
          detail:
            "The key decision was to treat association-rule mining as an operational analytics product, not just a model run.",
        },
        {
          label: "Expose relationships at multiple taxonomy levels",
          detail:
            "Supporting products, categories, and departments made the output useful to different retail planning conversations.",
        },
      ],
      lessons: [
        "Useful data science work often depends on making the run path repeatable before tuning the analytical method.",
        "Retail insights become more actionable when users can move between product-level and category-level views.",
      ],
    },
  },
  {
    id: "retail-category-uplift",
    slug: "retail-category-uplift",
    title: "Retail category uplift and cannibalization",
    summary:
      "Built analysis workflows for measuring launch uplift, incremental sales contribution, and cannibalization within a retail category.",
    impact:
      "Helped stakeholders understand how launches changed category performance beyond top-line sales alone.",
    detail:
      "Combined statistical analysis with reliable data preparation so the output could be trusted and reused in business planning.",
    skillIds: ["spark", "python", "power-bi", "airflow", "apriori"],
    focusWeights: {
      general: 0.6,
      "data-platform": 0.7,
      python: 0.7,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
    publicProof: {
      proofTypes: ["private-enterprise", "sanitized-diagram", "metric"],
      architectureShape: [
        "Historical sales and product data is prepared through Spark and Python processing.",
        "Measurement logic compares launch behavior against category and adjacent-product baselines.",
        "Power BI provides planning-ready review of uplift and cannibalization patterns.",
      ],
      scaleSignals: [
        {
          label: "Business question",
          value: "Uplift vs. shift",
          detail:
            "This case study can describe the measurement distinction without exposing launch or client data.",
        },
      ],
      responsibilities: [
        "Built data preparation for launch and category-performance analysis.",
        "Supported measurement logic for incremental contribution and cannibalization.",
        "Packaged outputs for business planning while keeping proprietary data private.",
      ],
      constraints: [
        "Client names, launch calendars, product identifiers, baselines, and measurement rules are confidential.",
        "Site notes use generalized category-performance language.",
      ],
      artifacts: [
        {
          label: "High-level category measurement workflow",
          type: "sanitized-diagram",
          detail:
            "Can be shown as historical preparation, baseline comparison, uplift/cannibalization measurement, and BI review.",
        },
        {
          label: "Measurement pattern signal",
          type: "metric",
          detail:
            "The case study can state uplift versus demand-shift analysis without publishing proprietary values.",
        },
      ],
      confidentialityNotes: [
        "Not shown here: launch details, category baselines, product identifiers, client names, and commercial measurement rules.",
      ],
    },
    caseStudy: {
      headline:
        "Category performance analytics for measuring launch uplift, incremental sales, and cannibalization effects.",
      context:
        "Retail stakeholders needed a clearer way to understand whether a new product launch grew the category, shifted demand from nearby products, or did both.",
      role: "Data science engineer responsible for analysis preparation, statistical workflow support, and reusable reporting foundations.",
      timeframe: "dunnhumby, 2018-2021",
      organization: "dunnhumby",
      team: "Retail analytics and data science engineering teams",
      confidentiality:
        "This case study excludes client names, launch data, product identifiers, and proprietary measurement rules.",
      metrics: [
        {
          label: "Business question",
          value: "Uplift vs. shift",
          detail:
            "Separated incremental category contribution from demand that moved between related products.",
        },
        {
          label: "Output style",
          value: "Planning-ready",
          detail:
            "Prepared results for business planning conversations rather than only technical validation.",
        },
      ],
      architecture: [
        "Spark and Python prepared historical sales, product, and category-level datasets for measurement.",
        "Statistical analysis compared launch behavior against relevant category and product baselines.",
        "Power BI provided a consumable view for reviewing uplift and cannibalization patterns.",
      ],
      responsibilities: [
        "Built reliable data preparation for product launch and category performance analysis.",
        "Supported measurement logic that distinguished incremental contribution from cannibalization.",
        "Packaged outputs so retail stakeholders could evaluate launch outcomes and tradeoffs.",
      ],
      decisions: [
        {
          label: "Measure the category, not only the launched product",
          detail:
            "Looking only at the launched product could overstate success, so the analysis considered adjacent products and total category behavior.",
        },
        {
          label: "Keep the workflow reusable",
          detail:
            "The design favored repeatable preparation and reporting so similar launch evaluations could be run again with less manual work.",
        },
      ],
      lessons: [
        "Launch analytics need a clear baseline story or the output becomes easy to misread.",
        "Cannibalization is a data-preparation problem as much as a statistical one because product relationships define the question.",
      ],
    },
  },
] as const;

export const experiences: readonly ExperienceDefinition[] = [
  {
    id: "airtel-digital",
    title: "Data Platform Engineer / Architect",
    company: "Airtel Digital",
    companyUrl: "https://careers.airtel.com",
    type: "employment",
    description:
      "I architect and build governed data platforms, metadata services, workflow orchestration, access-governance integrations, in-house CI/CD onboarding, and network-scale analytics systems.",
    date: "2021 - present",
    icon: "/project_img/org-airtel.png",
    focusWeights: {
      general: 1,
      ai: 0.8,
      "agentic-development": 0.8,
      "backend-engineering": 0.5,
      "platform-engineering": 0.9,
      "data-platform": 1,
      flink: 0.7,
      kafka: 0.7,
    },
    bullets: [
      {
        id: "airtel-conversational-data",
        text: "Architected and built a governed conversational data platform for text-to-data workflows: multi-LLM subgraphs, knowledge retrieval, controlled query execution, answer reasoning, chart generation, prompt tracing, and platform orchestration.",
        skillIds: [
          "python",
          "fastapi",
          "langgraph",
          "langfuse",
          "trino",
          "datahub",
          "llm-workflows",
        ],
        focusWeights: {
          general: 1,
          ai: 1,
          "agentic-development": 1,
          "backend-engineering": 0.8,
          "platform-engineering": 0.9,
          "data-platform": 0.9,
          python: 0.9,
        },
        visibility: "public",
      },
      {
        id: "airtel-metadata-governance",
        text: "Designed and implemented Hive metadata synchronization for independent Hive environments, combining real-time listener sync, daily reconciliation, missed-addition/removal repair, sync-duration expiry cleanup, one-time interval jobs, observability, and deployment hardening.",
        skillIds: ["java", "hive", "spark", "airflow"],
        focusWeights: {
          general: 1,
          "platform-engineering": 0.9,
          "data-platform": 1,
        },
        visibility: "public",
      },
      {
        id: "airtel-ranger-governance",
        text: "Extended Apache Ranger-based access governance with an external attribute store, DataHub tag-driven policies, row-level security, masking, Trino integration, clearer audit/error paths, and local/containerized runtime support.",
        skillIds: ["ranger", "trino", "datahub", "java", "kubernetes"],
        focusWeights: {
          general: 0.8,
          "backend-engineering": 0.7,
          "platform-engineering": 1,
          "data-platform": 0.9,
        },
        visibility: "public",
      },
      {
        id: "airtel-self-service-data-platform",
        text: "Built governed self-service data platform capabilities around Kyuubi customizations, Trino query access, DataHub metadata, dbt transformations, Metabase BI, RBAC, and secrets management.",
        skillIds: ["kyuubi", "trino", "datahub", "dbt", "metabase", "ranger"],
        focusWeights: {
          general: 0.9,
          "platform-engineering": 1,
          "data-platform": 1,
        },
        visibility: "public",
      },
      {
        id: "airtel-cicd-dx",
        text: "Created an in-house YAML-driven CI/CD onboarding framework that reduced onboarding time by about 40%, with Jenkins runner and Docker-agent build modes, mandatory pre-commit checks, unit-test reporting, security scans, deployment templates, and Jira-triggered workflow/status integration.",
        skillIds: [
          "internal-cicd",
          "jenkins",
          "docker",
          "helm",
          "kubernetes",
          "jira",
        ],
        focusWeights: {
          general: 0.8,
          "platform-engineering": 1,
          "data-platform": 0.8,
          python: 0.6,
        },
        visibility: "public",
      },
      {
        id: "airtel-ocp-spark-migration",
        text: "Migrated 50+ Spark and data workloads to Red Hat OCP using Spark Operator, shared CI/CD, Docker/Helm packaging, and Kubernetes runtime conventions, reducing infrastructure cost by about 30%.",
        skillIds: [
          "kubernetes",
          "spark-operator",
          "spark",
          "internal-cicd",
          "docker",
          "helm",
        ],
        focusWeights: {
          general: 0.85,
          "platform-engineering": 1,
          "data-platform": 0.9,
        },
        visibility: "public",
      },
      {
        id: "airtel-ingestion-analytics",
        text: "Built mobile tower network-event analytics, browsing-log data products, and real-time point-of-interest proximity pipelines, including petabyte-scale aggregation, safe-browsing classification, audience cohorts, and location-triggered downstream actions.",
        skillIds: [
          "flink",
          "kafka",
          "spark",
          "airflow",
          "seatunnel",
          "kyuubi",
          "trino",
          "sql",
          "nifi",
          "geospatial",
        ],
        focusWeights: {
          general: 0.9,
          "backend-engineering": 0.6,
          "platform-engineering": 0.7,
          "data-platform": 1,
          python: 0.6,
        },
        visibility: "public",
      },
    ],
  },
  {
    id: "dunnhumby",
    title: "Data Science Engineer",
    company: "dunnhumby",
    companyUrl: "https://www.dunnhumby.com/careers/",
    type: "employment",
    description:
      "I worked between data science and big-data platform teams, turning statistical and ML analysis into reusable pipelines, data marts, reporting products, and client-ready analytics workflows.",
    date: "2018 - 2021",
    icon: "/project_img/org-dh.jpg",
    focusWeights: {
      general: 0.8,
      ai: 0.4,
      "data-platform": 0.8,
      python: 0.7,
    },
    bullets: [
      {
        id: "dh-bridge",
        text: "Worked as a bridge between data science and big data platform teams by turning analytical work into reusable products and repeatable pipelines.",
        skillIds: ["python", "spark", "sql"],
        focusWeights: {
          general: 0.7,
          ai: 0.5,
          "data-platform": 0.8,
          python: 0.8,
        },
        visibility: "public",
      },
      {
        id: "dh-retail",
        text: "Built customer segmentation, data marts, reporting platforms, and retail optimization analytics for large datasets, including category/adjacency work associated with up to 20% sales-growth impact.",
        skillIds: ["spark", "python", "sql", "airflow", "power-bi"],
        focusWeights: {
          general: 0.7,
          ai: 0.4,
          "data-platform": 0.8,
          python: 0.7,
        },
        visibility: "public",
      },
      {
        id: "dh-products",
        text: "Created reusable retail analytics workflows across customer priority assortment, cross-shopping behavior, direct-mail promotion planning, category uplift, and seasonality analysis.",
        skillIds: ["spark", "python", "airflow"],
        focusWeights: {
          general: 0.7,
          "data-platform": 0.8,
          python: 0.6,
        },
        visibility: "public",
      },
    ],
  },
  {
    id: "mphasis",
    title: "Software Engineer",
    company: "Mphasis",
    companyUrl: "https://careers.mphasis.com/home.html",
    type: "employment",
    description:
      "I worked on mainframe and big-data systems for insurance and telecom clients, including Spark migration work and automation that saved 500+ manual hours per year.",
    date: "2014 - 2018",
    icon: "/project_img/org-mphasis.png",
    focusWeights: {
      general: 0.7,
      "backend-engineering": 0.7,
      "platform-engineering": 0.5,
      "data-platform": 0.6,
    },
    bullets: [
      {
        id: "mphasis-migration",
        text: "Worked in both mainframe and big data ecosystems and contributed to migration from mainframe workloads to Spark-based processing.",
        skillIds: ["spark", "java", "sql"],
        focusWeights: {
          general: 0.6,
          "backend-engineering": 0.5,
          "data-platform": 0.7,
        },
        visibility: "public",
      },
      {
        id: "mphasis-automation",
        text: "Built automations that saved 500+ manual hours per year by removing repetitive workflow steps.",
        skillIds: ["python", "java"],
        focusWeights: {
          general: 0.6,
          "backend-engineering": 0.7,
          "platform-engineering": 0.4,
          python: 0.5,
        },
        visibility: "public",
      },
      {
        id: "mphasis-clients",
        text: "Worked as a developer for insurance and telecom clients across enterprise systems and data workflows.",
        skillIds: ["java", "sql", "spark"],
        focusWeights: {
          general: 0.5,
          "backend-engineering": 0.6,
          "data-platform": 0.5,
        },
        visibility: "public",
      },
    ],
  },
] as const;

export const profileHighlights: readonly ProfileHighlight[] = [
  {
    id: "experience-years",
    label: "Experience",
    value: experienceYearsLabel,
    detail:
      "Hands-on work across AI systems, telecom, retail, analytics, distributed systems, and platform engineering.",
    focusWeights: {
      general: 1,
    },
  },
  {
    id: "scale",
    label: "Scale",
    value: "~5T events/day",
    detail:
      "Worked on mobile tower network-event systems operating at petabyte scale and about five trillion events per day.",
    focusWeights: {
      general: 1,
      "platform-engineering": 0.8,
      "data-platform": 1,
      flink: 0.7,
      kafka: 0.7,
    },
  },
  {
    id: "measured-impact",
    label: "Measured impact",
    value: "40% faster onboarding, 30% lower cost",
    detail:
      "Measured outcomes include 40% faster CI/CD onboarding, 50+ workloads migrated to OCP, 30% infrastructure cost reduction, 25% faster incident resolution, 20% sales-growth impact, and 500+ manual hours saved.",
    focusWeights: {
      general: 1,
      "platform-engineering": 1,
      "data-platform": 0.85,
      ai: 0.45,
    },
  },
  {
    id: "ai-stack",
    label: "AI stack",
    value: "LangGraph, MCP, RAG, Prompt Engineering, FastAPI, OPA",
    detail:
      "Daily work spans context engineering, LLM orchestration, agent orchestration, governed retrieval, MCP tool contracts, FastAPI services, and access-governance enforcement.",
    focusWeights: {
      general: 1,
      ai: 1,
      "backend-engineering": 0.5,
      "platform-engineering": 1,
      "data-platform": 1,
      flink: 0.8,
      kafka: 0.8,
    },
  },
];

export const summaryTemplates: readonly SummaryTemplate[] = [
  {
    id: "general",
    focusIds: ["general"],
    headline: "Architect and Developer for Governed Data Platforms",
    summary:
      "I architect and build governed data platforms, text-to-data systems, metadata services, access-governance integrations, workflow orchestration, in-house CI/CD onboarding, Kubernetes/Spark migrations, and network-scale analytics pipelines.",
  },
  {
    id: "ai",
    focusIds: ["ai"],
    headline: "AI Engineer for Governed Text-to-Data Systems",
    summary:
      "This view highlights my current governed conversational data platform work: context engineering, LLM orchestration, agent subgraphs, MCP-based tools, retrieval-grounded schema linking, prompt tracing, query execution, answer reasoning, and visualization workflows.",
  },
  {
    id: "backend",
    focusIds: ["backend-engineering"],
    headline: "Backend Engineer for Data-Heavy Systems",
    summary:
      "I have worked on backend services, data product APIs, streaming systems, and operational tooling, usually where data volume and reliability matter.",
  },
  {
    id: "platform",
    focusIds: ["platform-engineering"],
    headline: "Platform and Reliability Engineer",
    summary:
      "I build reusable platform capabilities around orchestration, CI/CD onboarding, Kubernetes/Spark Operator migrations, access governance, metadata synchronization, observability, and controlled query execution.",
  },
  {
    id: "streaming",
    focusIds: ["flink"],
    headline: "Streaming Systems Engineer with Flink",
    summary:
      "I have used Flink in the context of real systems: event pipelines, decisioning, platform reliability, and throughput-sensitive workloads where operational clarity matters as much as latency.",
  },
  {
    id: "ai-backend",
    focusIds: ["ai", "backend-engineering"],
    headline: "Backend Engineer for AI Data Products",
    summary:
      "This view combines backend engineering with AI product infrastructure: Python services, context engineering, graph state contracts, MCP tool APIs, metadata context, prompt tracing, governed query execution, answer reasoning, and operational guardrails.",
  },
] as const;

export const focusPresets: readonly FocusPreset[] = [
  {
    id: "backend-platform",
    label: "Backend platform",
    description: "Service ownership, data APIs, and production reliability.",
    focusIds: ["backend-engineering", "platform-engineering"],
    sortOrder: 0,
  },
  {
    id: "data-platform",
    label: "Data platform",
    description: "Pipelines, mesh foundations, streaming, and governance.",
    focusIds: ["data-platform", "kafka", "flink"],
    sortOrder: 1,
  },
  {
    id: "ai-data-products",
    label: "AI data products",
    description: "Governed agents, text-to-data, visualization, and Python.",
    focusIds: ["ai", "agentic-development", "python"],
    sortOrder: 2,
  },
] as const;

export const fallbackPortfolioSnapshot = {
  siteProfile,
  portfolioLinks,
  focusDefinitions,
  focusPresets,
  skillDefinitions,
  projects,
  experiences,
  profileHighlights,
  summaryTemplates,
  mediaAssets: [],
  revisions: [],
} as const;
