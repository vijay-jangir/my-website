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
  title: "Data Platform and Backend Engineer",
  location: "India",
  timezone: "Asia/Kolkata",
  lastUpdatedLabel: "April 2026",
  contentPromise: "I keep this site current as the work evolves.",
  currentFocusLabels: ["Streaming systems", "Backend platforms", "AI tooling"],
  email: "contact@vijayjangir.com",
  githubUrl: "https://github.com/vijay-jangir",
  linkedinUrl: "https://linkedin.com/in/vijayjangir",
  heroLabel:
    "I build data platforms, streaming systems, and backend tools that stay reliable in production.",
  recruiterPitch:
    "Over the last decade I have worked across telecom, retail, analytics, streaming, and platform engineering, usually on systems that multiple teams depend on. Use the resume for the short version and selected work when you want proof, detail, and technical depth.",
  overview: [
    "Most of my work has been on systems that move a lot of data, serve multiple teams, and cannot afford to be fragile.",
    "I am strongest where platform thinking meets product reality: streaming pipelines, reusable data products, backend services, and engineering foundations that hold up over time.",
    "This site is designed to be quick to scan first and still rewarding to read more closely when you want the detail.",
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
    headline: "Data Platform and Backend Engineer",
    summary:
      "I build data and backend systems with a strong bias toward reliability, scale, and clear ownership. My best work spans streaming, platform foundations, analytics, and product-facing services.",
    description: "Best starting point if you want the full picture.",
    aliases: ["general", "overall", "profile", "resume", "full stack profile"],
    relatedSkillIds: ["python", "java", "kafka", "flink", "spark", "sql"],
  },
  {
    id: "ai",
    label: "AI",
    shortLabel: "AI",
    category: "domain",
    headline: "AI Infrastructure and Backend Engineer",
    summary:
      "I focus on the engineering layer around AI: Python services, retrieval foundations, data pipelines, and the guardrails needed to run AI features in production.",
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
    relatedSkillIds: [
      "python",
      "fastapi",
      "vector-search",
      "postgres",
      "kafka",
    ],
  },
  {
    id: "agentic-development",
    label: "Agentic development",
    shortLabel: "Agentic",
    category: "domain",
    headline: "Agentic Systems and Workflow Engineer",
    summary:
      "I build agent-style workflows around structured inputs, deterministic fallbacks, and clear operational boundaries. The goal is useful automation, not magic.",
    description:
      "For agent tooling, workflow automation, and LLM-backed product engineering.",
    aliases: [
      "agent",
      "agentic",
      "agentic development",
      "workflow automation",
      "llm workflow",
    ],
    relatedSkillIds: [
      "python",
      "fastapi",
      "nextjs",
      "vector-search",
      "postgres",
    ],
  },
  {
    id: "backend-engineering",
    label: "Backend engineering",
    shortLabel: "Backend",
    category: "role",
    headline: "Backend Engineer for Data-Heavy Systems",
    summary:
      "I build backend services and data-facing APIs with an emphasis on clean interfaces, reliable behavior, and systems that hold up under real production load.",
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
      "I build reusable platform foundations: data products, observability, operational tooling, and engineering workflows that make teams faster without making systems fragile.",
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
      "I build data platforms for ingestion, transformation, discovery, and downstream product use. The value is durable architecture, clear ownership, and dependable operation.",
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
      "I use Flink for real-time systems where latency, throughput, and operational clarity all matter. The framework is only useful if the surrounding system is reliable.",
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
      "Kafka has been central to my work in streaming pipelines, event-driven services, and product-level data flows. I use it where scale, durability, and clear system boundaries matter.",
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
      "I use Python to build data products, APIs, automation, and AI-adjacent workflows. The value is faster delivery without losing operational clarity.",
    description: "For Python-first backend, data, and automation roles.",
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
    id: "astro",
    label: "Astro",
    category: "framework",
    aliases: ["astro"],
    focusWeights: {
      general: 0.2,
      "agentic-development": 0.2,
      "backend-engineering": 0.2,
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
    title: "Portfolio and resume platform",
    summary:
      "Built this site as a product surface with focused resume views, project search, ATS-safe PDF export, and a low-cost stack.",
    impact:
      "Turns one site into a sharp introduction, a deeper work sample, and a tailored resume tool.",
    detail:
      "Built with Astro, Wix for blog content, deterministic focus ranking, private admin tooling, and room for future search and assistant features.",
    skillIds: ["astro", "postgres", "fastapi", "python"],
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
      "Built a low-latency decision engine that evaluated user activity and triggered downstream actions in real time.",
    impact:
      "Moved business decisions closer to the event stream instead of waiting for offline reporting loops.",
    detail:
      "The system consumed user events, enriched them, applied context-aware rules, and pushed results to downstream systems while keeping throughput high and the rule model understandable.",
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
      "Designed a petabyte-scale telemetry platform for mobile network data, handling more than two trillion events per day.",
    impact:
      "Created the analytics foundation used for network visibility, downstream data products, and operational reporting.",
    detail:
      "Balanced ingestion scale, storage cost, usability, and operational reliability across multiple downstream consumers.",
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
      "Built analytics that showed how customers shopped across departments, categories, and products, with segmentation layered in.",
    impact:
      "Helped retail teams turn customer behavior into merchandising and strategy decisions.",
    detail:
      "Combined analytical modeling with production data engineering in a form that business teams could understand and use.",
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
      "Built a large-scale association engine to understand which products, categories, and departments were bought together.",
    impact:
      "Turned large-scale basket behavior into usable retail intelligence and repeatable decision support.",
    detail:
      "The hard part was not only the algorithmic work, but turning it into a repeatable analytics product that matched the cadence of retail planning.",
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
      "Built analytics to measure category uplift from new launches, incremental sales contribution, and cannibalization within the same category.",
    impact:
      "Gave stakeholders a clearer view of how launches changed category performance beyond top-line sales.",
    detail:
      "The value came from combining sound analysis with reliable data preparation that business users could trust.",
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
      "Building large-scale data platforms for network telemetry and product data, with a focus on scale, reliability, and reuse.",
    date: "2021 - present",
    icon: "/project_img/org-airtel.png",
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
        text: "Designed petabyte-scale pipelines and platform capabilities for network and product-facing data systems.",
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
        text: "Built reusable data products and access patterns that reduced repeated work for downstream teams.",
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
        text: "Improved reliability and observability so ownership stayed clearer and incidents were easier to manage.",
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
      "Worked between data science and big data platform teams to turn retail analytics into repeatable products and pipelines.",
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
        text: "Built reporting, segmentation, and customer behavior solutions for large retail datasets with an emphasis on trust and repeatability.",
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
      "Worked across enterprise data and migration projects for insurance and telecom clients, including automation that removed substantial manual work.",
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
    detail:
      "Hands-on work across telecom, retail, analytics, streaming, and platform systems.",
    focusWeights: {
      general: 1,
    },
  },
  {
    id: "scale",
    label: "Scale",
    value: "2T+ events/day",
    detail:
      "Worked on network telemetry systems operating at very high event volume.",
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
    label: "Best at",
    value: "Streaming, platforms, and data systems",
    detail:
      "Strongest when scale, reliability, and clarity all matter at the same time.",
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
    headline: "Data Platform and Backend Engineer",
    summary:
      "I build data and backend systems with a strong bias toward reliability, scale, and clear ownership. My best work spans streaming, platform foundations, analytics, and product-facing services.",
  },
  {
    id: "ai",
    focusIds: ["ai"],
    headline: "AI Infrastructure and Backend Engineer",
    summary:
      "I focus on the engineering side of AI work: Python services, retrieval foundations, structured data, and the platform work needed to make AI features reliable in production.",
  },
  {
    id: "backend",
    focusIds: ["backend-engineering"],
    headline: "Backend Engineer for Data-Heavy Systems",
    summary:
      "I build backend services and data-facing APIs with a bias toward clean interfaces, reliable behavior, and systems that hold up under production load.",
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
