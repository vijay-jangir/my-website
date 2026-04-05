import airtel from "@/public/project_img/org-airtel.png";
import dh from "@/public/project_img/org-dh.jpg";
import mphasis from "@/public/project_img/org-mphasis.png";

import type {
  ExperienceDefinition,
  FocusDefinition,
  PortfolioLink,
  ProfileHighlight,
  ProjectDefinition,
  SiteProfile,
  SkillDefinition,
  SummaryTemplate,
} from "@/lib/portfolio-types";

export const siteProfile: SiteProfile = {
  name: "Vijay Jangir",
  title: "Data and Platform Engineer",
  location: "India",
  timezone: "Asia/Kolkata",
  email: "contact@vijayjangir.com",
  githubUrl: "https://github.com/vijay-jangir",
  linkedinUrl: "https://linkedin.com/in/vijayjangir",
  heroLabel:
    "Data engineer building reliable platforms, streaming systems, and recruiter-friendly proof of work.",
  recruiterPitch:
    "I build data and platform systems that stay reliable at scale, and I can reframe the story for AI, streaming, backend, or platform-focused roles without inventing new facts.",
  overview: [
    "I have spent the last decade working across data engineering, streaming systems, platform reliability, analytics, and internal developer tooling.",
    "My strongest work is where systems design, product thinking, and operational discipline meet: large-scale data pipelines, event-driven platforms, and reusable engineering foundations.",
    "This site is designed to support two journeys at once: a fast recruiter scan and a deeper manager-level review of the work, tradeoffs, and outcomes behind each project.",
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
    name: "Work",
    hash: "/work",
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
    headline: "Data and Platform Engineer",
    summary:
      "I build reliable data and platform systems across streaming, analytics, backend services, and operational tooling. My strongest work combines system design, delivery discipline, and business context.",
    description:
      "Balanced profile for recruiters or managers who want the full picture.",
    aliases: ["general", "overall", "profile", "resume", "full stack profile"],
    relatedSkillIds: ["python", "java", "kafka", "flink", "spark", "sql"],
  },
  {
    id: "ai",
    label: "AI",
    shortLabel: "AI",
    category: "domain",
    headline: "AI and Data Platform Engineer",
    summary:
      "I approach AI work from an engineering perspective: production Python, data pipelines, evaluation-friendly systems, backend services, and the platform foundations needed to make AI features reliable.",
    description:
      "For AI engineering, applied ML infrastructure, and data-heavy product roles.",
    aliases: [
      "ai",
      "ml",
      "machine learning",
      "llm",
      "genai",
      "artificial intelligence",
    ],
    relatedSkillIds: ["python", "fastapi", "vector-search", "postgres", "kafka"],
  },
  {
    id: "agentic-development",
    label: "Agentic development",
    shortLabel: "Agentic",
    category: "domain",
    headline: "Agentic Development and AI Workflow Engineer",
    summary:
      "I design practical AI workflows around structured data, deterministic fallbacks, model-assisted reasoning, and operational safeguards. The focus is useful systems, not novelty for its own sake.",
    description:
      "For agent tooling, workflow automation, and LLM-backed product engineering.",
    aliases: [
      "agent",
      "agentic",
      "agentic development",
      "workflow automation",
      "llm workflow",
    ],
    relatedSkillIds: ["python", "fastapi", "nextjs", "vector-search", "postgres"],
  },
  {
    id: "backend-engineering",
    label: "Backend engineering",
    shortLabel: "Backend",
    category: "role",
    headline: "Backend and Data Infrastructure Engineer",
    summary:
      "I build backend services and data-facing APIs with an emphasis on reliability, clear interfaces, and systems that survive production realities such as scale, latency, and operational load.",
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
      "My platform work focuses on reusable foundations: data products, operational visibility, pipeline reliability, and developer workflows that make teams faster without creating fragile systems.",
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
    headline: "Data Platform and Streaming Engineer",
    summary:
      "I build data platforms that support ingestion, transformation, discovery, and downstream product use. The emphasis is durable architecture, developer ergonomics, and operating at meaningful scale.",
    description:
      "For platform/data engineering roles centred on pipelines and data products.",
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
      "I use Flink where low-latency processing, event-driven decisioning, and operational control matter. The value is not the framework itself, but the systems and products it enables.",
    description:
      "For real-time streaming systems, event pipelines, and Flink-heavy roles.",
    aliases: ["flink", "apache flink", "stream processing", "real time streaming"],
    relatedSkillIds: ["flink", "kafka", "java", "python"],
  },
  {
    id: "kafka",
    label: "Kafka",
    shortLabel: "Kafka",
    category: "technology",
    headline: "Event-Driven Backend and Data Engineer",
    summary:
      "Kafka has been central to my work in streaming pipelines, event-driven services, and product-level data flows. I use it where durability, throughput, and decoupled system boundaries matter.",
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
      "I use Python to build data products, automation, API layers, and AI-adjacent workflows. The strength is applying Python where it accelerates delivery without compromising operational clarity.",
    description:
      "For Python-first backend, data, and automation roles.",
    aliases: ["python", "python3", "pandas", "fastapi"],
    relatedSkillIds: ["python", "fastapi", "postgres", "airflow", "spark"],
  },
] as const;

export const skillDefinitions: readonly SkillDefinition[] = [
  {
    id: "python",
    label: "Python",
    category: "language",
    aliases: ["python", "python3"],
    focusWeights: {
      general: 0.9,
      ai: 1,
      "agentic-development": 0.9,
      "backend-engineering": 0.8,
      "platform-engineering": 0.5,
      "data-platform": 0.8,
      flink: 0.2,
      kafka: 0.3,
      python: 1,
    },
  },
  {
    id: "java",
    label: "Java",
    category: "language",
    aliases: ["java"],
    focusWeights: {
      general: 0.7,
      "backend-engineering": 0.7,
      "platform-engineering": 0.5,
      "data-platform": 0.6,
      flink: 0.6,
      kafka: 0.6,
    },
  },
  {
    id: "sql",
    label: "SQL",
    category: "data",
    aliases: ["sql", "postgresql", "postgres"],
    focusWeights: {
      general: 0.8,
      ai: 0.5,
      "backend-engineering": 0.6,
      "data-platform": 0.8,
      python: 0.4,
    },
  },
  {
    id: "postgres",
    label: "Postgres",
    category: "data",
    aliases: ["postgres", "postgresql"],
    focusWeights: {
      ai: 0.5,
      "agentic-development": 0.7,
      "backend-engineering": 0.9,
      "platform-engineering": 0.5,
      "data-platform": 0.5,
      python: 0.4,
    },
  },
  {
    id: "fastapi",
    label: "FastAPI",
    category: "framework",
    aliases: ["fastapi"],
    focusWeights: {
      ai: 0.4,
      "agentic-development": 0.8,
      "backend-engineering": 1,
      python: 0.9,
    },
  },
  {
    id: "nextjs",
    label: "Next.js",
    category: "framework",
    aliases: ["next.js", "nextjs", "next js"],
    focusWeights: {
      "agentic-development": 0.5,
      "backend-engineering": 0.4,
    },
  },
  {
    id: "flink",
    label: "Flink",
    category: "framework",
    aliases: ["flink", "apache flink"],
    focusWeights: {
      general: 0.5,
      "backend-engineering": 0.35,
      "platform-engineering": 0.25,
      "data-platform": 0.7,
      flink: 1,
      kafka: 0.45,
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
    id: "spark",
    label: "Spark",
    category: "framework",
    aliases: ["spark", "apache spark", "pyspark"],
    focusWeights: {
      general: 0.6,
      "data-platform": 0.9,
      python: 0.5,
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
    id: "dbt",
    label: "dbt",
    category: "tooling",
    aliases: ["dbt"],
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
      "platform-engineering": 0.45,
      "data-platform": 0.75,
    },
  },
  {
    id: "nifi",
    label: "NiFi",
    category: "tooling",
    aliases: ["nifi", "apache nifi"],
    focusWeights: {
      "data-platform": 0.6,
    },
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    category: "platform",
    aliases: ["kubernetes", "k8s", "openshift", "ocp"],
    focusWeights: {
      general: 0.5,
      "backend-engineering": 0.3,
      "platform-engineering": 0.9,
      "data-platform": 0.3,
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
    id: "llm-workflows",
    label: "LLM Workflows",
    category: "ai",
    aliases: ["llm", "agent", "agentic", "prompt engineering", "evaluation"],
    focusWeights: {
      ai: 1,
      "agentic-development": 1,
    },
  },
] as const;

export const projects: readonly ProjectDefinition[] = [
  {
    id: "portfolio-website",
    slug: "portfolio-website",
    title: "Portfolio platform",
    summary:
      "Built this site in Next.js with a Wix-backed blog, structured resume data, deterministic focus-based ranking, and a zero-cost hosting path.",
    impact:
      "Turns the portfolio into a recruiter path, manager deep-dive, and resume tailoring surface without depending on paid AI.",
    detail:
      "The portfolio is intentionally engineered like a product surface: free-first hosting, structured content, deterministic resume tailoring, ATS-safe PDF export, and clear separation between public content and admin-only tooling.",
    skillIds: ["nextjs", "postgres", "fastapi", "python"],
    focusWeights: {
      general: 0.8,
      ai: 0.4,
      "agentic-development": 0.7,
      "backend-engineering": 0.6,
      "platform-engineering": 0.4,
      python: 0.2,
    },
    featured: true,
    visibility: "public",
    proofLinks: [
      {
        label: "GitHub repository",
        href: "https://github.com/vijay-jangir/my-website",
        kind: "repo",
      },
    ],
  },
  {
    id: "context-aware-rule-engine",
    slug: "context-aware-rule-engine",
    title: "Context-aware rule engine",
    summary:
      "Built a real-time decisioning platform that evaluated user activity and triggered downstream business rules with low latency.",
    impact:
      "Supported event-driven business decisions using streaming data instead of static reporting loops.",
    detail:
      "The system consumed user behavior events, enriched them, evaluated context-aware conditions, and pushed decisions into downstream consumers. The key engineering problem was maintaining throughput while keeping the rule surface understandable for non-platform stakeholders.",
    skillIds: ["flink", "kafka", "java", "airflow"],
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
  },
  {
    id: "telecom-network-datalake",
    slug: "telecom-network-datalake",
    title: "Telecom network datalake",
    summary:
      "Designed and implemented a data lake and warehouse for mobile network telemetry operating at petabyte scale and more than two trillion events per day.",
    impact:
      "Created a durable analytics foundation for network visibility, downstream data products, and operational reporting.",
    detail:
      "The work covered ingestion, modeling, platform reliability, and downstream access patterns for highly voluminous network telemetry. The hard part was balancing scale, cost, and operability while keeping the platform useful for multiple consumers.",
    skillIds: ["flink", "kafka", "java", "nifi", "airflow", "sql"],
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
  },
  {
    id: "retail-cross-shopping",
    slug: "retail-cross-shopping",
    title: "Retail cross-shopping analysis",
    summary:
      "Developed a solution for global retailers to analyze cross-shopping behavior across departments, categories, and products, enriched with customer segmentation.",
    impact:
      "Helped retail teams identify patterns that informed merchandising and customer strategy decisions.",
    detail:
      "This project combined analytical modeling with production data engineering. The work needed to be understandable to business teams while still being robust enough to run repeatedly at retail data scale.",
    skillIds: ["spark", "python", "sql", "airflow"],
    focusWeights: {
      general: 0.7,
      ai: 0.2,
      "data-platform": 0.8,
      python: 0.7,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
  },
  {
    id: "retail-association-rule-engine",
    slug: "retail-association-rule-engine",
    title: "Retail association engine",
    summary:
      "Built a large-scale association engine to understand which products, categories, and departments were bought together using Apriori-based analysis.",
    impact:
      "Translated large-scale basket behavior into useful retail intelligence and repeatable decision support.",
    detail:
      "The challenge was not only the algorithmic work; it was building a repeatable and consumable analytics product that fit the cadence of retail planning and reporting.",
    skillIds: ["spark", "python", "sql", "airflow"],
    focusWeights: {
      general: 0.6,
      ai: 0.3,
      "data-platform": 0.7,
      python: 0.7,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
  },
  {
    id: "retail-category-uplift",
    slug: "retail-category-uplift",
    title: "Retail uplift and cannibalization analysis",
    summary:
      "Developed a solution to measure category uplift from new product launches, incremental contribution to sales, and cannibalization within the same category.",
    impact:
      "Gave stakeholders a clearer view of how launches affected category performance beyond top-line sales.",
    detail:
      "The value came from connecting analytical reasoning with reliable data preparation. It had to be trusted by business users, not just technically correct in isolation.",
    skillIds: ["spark", "python", "sql", "airflow"],
    focusWeights: {
      general: 0.6,
      ai: 0.2,
      "data-platform": 0.7,
      python: 0.7,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
  },
] as const;

export const experiences: readonly ExperienceDefinition[] = [
  {
    id: "airtel-digital",
    title: "Data Engineer",
    company: "Airtel Digital",
    companyUrl: "https://careers.airtel.com",
    type: "employment",
    description:
      "I work on large-scale data engineering systems with an emphasis on distributed platforms, dependable delivery, and reusable data products.",
    date: "2021 - present",
    icon: airtel,
    focusWeights: {
      general: 1,
      "backend-engineering": 0.5,
      "platform-engineering": 0.9,
      "data-platform": 1,
      flink: 0.7,
      kafka: 0.7,
    },
    bullets: [
      {
        id: "airtel-scale",
        text: "Design petabyte-scale data pipelines and platform capabilities for network and product-facing data systems.",
        skillIds: ["flink", "kafka", "sql", "airflow"],
        focusWeights: {
          general: 1,
          "platform-engineering": 0.8,
          "data-platform": 1,
          flink: 0.8,
          kafka: 0.7,
        },
        visibility: "public",
      },
      {
        id: "airtel-products",
        text: "Build reusable data product interfaces that reduce repeated work for downstream consumers and internal teams.",
        skillIds: ["python", "sql", "postgres"],
        focusWeights: {
          general: 0.8,
          "backend-engineering": 0.6,
          "platform-engineering": 0.8,
          "data-platform": 0.9,
        },
        visibility: "public",
      },
      {
        id: "airtel-reliability",
        text: "Improve operational reliability through design choices that reduce breakage, simplify ownership, and increase observability.",
        skillIds: ["grafana", "kubernetes", "airflow"],
        focusWeights: {
          general: 0.8,
          "platform-engineering": 1,
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
      "Worked between data scientists and big data platforms to productize analytics, reporting, customer segmentation, and data marts for global retailers.",
    date: "2018 - 2021",
    icon: dh,
    focusWeights: {
      general: 0.8,
      ai: 0.4,
      "data-platform": 0.8,
      python: 0.7,
    },
    bullets: [
      {
        id: "dh-bridge",
        text: "Bridged data science and platform teams by turning analytical work into reusable products and repeatable pipelines.",
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
        text: "Built reporting, segmentation, and customer behavior solutions for large retailer datasets with an emphasis on trust and repeatability.",
        skillIds: ["spark", "python", "sql", "airflow"],
        focusWeights: {
          general: 0.7,
          ai: 0.4,
          "data-platform": 0.8,
          python: 0.7,
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
      "Worked across mainframe and big data systems for insurance and telecom clients, including migration work and time-saving automation.",
    date: "2014 - 2018",
    icon: mphasis,
    focusWeights: {
      general: 0.7,
      "backend-engineering": 0.7,
      "platform-engineering": 0.5,
      "data-platform": 0.6,
    },
    bullets: [
      {
        id: "mphasis-migration",
        text: "Contributed to migration from mainframe workloads to Spark-based processing for enterprise clients.",
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
        text: "Built automations that saved more than 1,000 hours per year by removing repetitive manual workflow steps.",
        skillIds: ["python", "java"],
        focusWeights: {
          general: 0.6,
          "backend-engineering": 0.7,
          "platform-engineering": 0.4,
          python: 0.5,
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
    value: "10+ years",
    detail: "Hands-on work across data engineering, analytics, streaming, and platform systems.",
    focusWeights: {
      general: 1,
    },
  },
  {
    id: "scale",
    label: "Scale",
    value: "2T+ events/day",
    detail: "Shipped systems that had to stay useful under very large network telemetry volumes.",
    focusWeights: {
      general: 1,
      "platform-engineering": 0.8,
      "data-platform": 1,
      flink: 0.7,
      kafka: 0.7,
    },
  },
  {
    id: "systems",
    label: "Strength",
    value: "Streaming and platforms",
    detail: "Strongest at reliable data products, event systems, and engineering foundations.",
    focusWeights: {
      general: 1,
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
    headline: "Data and Platform Engineer",
    summary:
      "I build reliable data and platform systems across streaming, analytics, backend services, and operational tooling. My strongest work combines system design, delivery discipline, and business context.",
  },
  {
    id: "ai",
    focusIds: ["ai"],
    headline: "AI and Data Platform Engineer",
    summary:
      "I focus on the engineering side of AI work: Python, backend services, structured data, retrieval foundations, and the platform work needed to make AI features stable in production.",
  },
  {
    id: "backend",
    focusIds: ["backend-engineering"],
    headline: "Backend and Data Infrastructure Engineer",
    summary:
      "I build backend services and data-facing APIs with a bias toward clear interfaces, operational reliability, and systems that hold up under production load.",
  },
  {
    id: "platform",
    focusIds: ["platform-engineering"],
    headline: "Platform and Reliability Engineer",
    summary:
      "I care about reusable foundations, observability, and platform decisions that make teams faster without making systems fragile.",
  },
  {
    id: "streaming",
    focusIds: ["flink"],
    headline: "Streaming Systems Engineer with Flink",
    summary:
      "I use Flink in the context of real systems: event pipelines, decisioning, platform reliability, and throughput-sensitive workloads where operational clarity matters as much as latency.",
  },
  {
    id: "ai-backend",
    focusIds: ["ai", "backend-engineering"],
    headline: "AI and Backend Engineer",
    summary:
      "I build AI-adjacent backend systems with structured data, deterministic fallbacks, and pragmatic engineering constraints in mind. The focus is dependable product behavior, not demos that only work in ideal conditions.",
  },
] as const;
