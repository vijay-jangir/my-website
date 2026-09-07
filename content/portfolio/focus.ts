import type { FocusDefinition, FocusPreset } from "@/lib/portfolio-types";

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
