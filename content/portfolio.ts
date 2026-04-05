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
  title: "Data Engineering · Analytics · Platforms · DevOps",
  location: "India",
  timezone: "Asia/Kolkata",
  lastUpdatedLabel: "April 2026",
  contentPromise: "I keep this profile current as the work evolves.",
  currentFocusLabels: [
    "Data engineering",
    "Distributed systems",
    "Analytics platforms",
  ],
  email: "contact@vijayjangir.com",
  githubUrl: "https://github.com/vijay-jangir",
  linkedinUrl: "https://linkedin.com/in/vijayjangir",
  profileImageUrl: "/profile-pic.jpeg",
  heroLabel: "Data Engineer | Data Analyst | Platform Engineer | DevOps.",
  recruiterPitch:
    "I am a data analytics evangelist and dedicated data engineer with a passion for transforming raw data into valuable insights.",
  overview: [
    "Hello! I am a data analytics evangelist and dedicated data engineer with a passion for transforming raw data into valuable insights. With expertise in data modeling, ETL processes, and data visualization, I enjoy streamlining complex workflows and uncovering hidden patterns.",
    "As a constant learner, I stay updated with the latest trends and technologies in data and analytics. I believe collaboration is key to solving challenges, and I enjoy working with people who care about building useful systems.",
    "If you are looking for someone who can work across data engineering, analytics, distributed systems, and platform thinking, I would be glad to connect.",
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
    headline: "Data Engineer | Data Analyst | Platform Engineer | DevOps",
    summary:
      "I work across data engineering, analytics, platform engineering, and backend services. Most of my work has been on distributed systems, ETL pipelines, data products, and large-scale platforms used by multiple teams.",
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
      "This view highlights the Python, backend, data-platform, and workflow experience that is most relevant to AI engineering roles. It is about engineering foundations, APIs, and data systems, not claiming a long history of model research.",
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
    relatedSkillIds: ["python", "fastapi", "postgres", "kafka", "spark"],
  },
  {
    id: "agentic-development",
    label: "Agentic development",
    shortLabel: "Agentic",
    category: "domain",
    headline: "Agentic Systems and Workflow View",
    summary:
      "This view highlights workflow orchestration, APIs, structured automation, and product engineering patterns that are useful for agent-based systems.",
    description:
      "For agent tooling, workflow automation, and LLM-backed product engineering.",
    aliases: [
      "agent",
      "agentic",
      "agentic development",
      "workflow automation",
      "llm workflow",
    ],
    relatedSkillIds: ["python", "fastapi", "postgres", "nextjs"],
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
      "I have built reusable platform capabilities around observability, data access, streaming, and internal tooling so teams can move faster with fewer operational surprises.",
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
      "I build data platforms for ingestion, transformation, discovery, and downstream product use. The focus is durable architecture, clear ownership, and dependable operation.",
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
    label: "Cloud (GCP, AWS)",
    category: "platform",
    aliases: ["gcp", "aws", "cloud", "google cloud", "amazon web services"],
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
    id: "observability",
    slug: "observability",
    title: "Observability",
    summary:
      "Designed and implemented an in-house alerting and monitoring framework using the Elastic Stack and custom applications.",
    impact:
      "Improved visibility, alerting, and operational response for internal systems instead of relying on disconnected monitoring paths.",
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
    featured: true,
    visibility: "public",
    proofLinks: [],
  },
  {
    id: "setup-of-datamesh",
    slug: "setup-of-datamesh",
    title: "Setup of Datamesh",
    summary:
      "Enabled a DataMesh-style architecture using Kyuubi, Trino, Alluxio, DataHub, Jupyter, dbt, Spark, and Airflow.",
    impact:
      "Improved data access, discoverability, and self-serve analytics capabilities across teams instead of keeping everything tied to one central flow.",
    detail:
      "Worked on the platform pieces needed to make shared data assets easier to discover and use, with a strong focus on query access, metadata, notebooks, and downstream engineering workflows.",
    skillIds: [
      "kyuubi",
      "trino",
      "alluxio",
      "datahub",
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
  },
  {
    id: "automatic-engine-selection-for-kyuubi",
    slug: "automatic-engine-selection-for-kyuubi",
    title: "Automatic engine selection for Kyuubi",
    summary:
      "Patched the codebase to dynamically allocate interactive or batch engines based on user AD groups.",
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
  },
  {
    id: "portfolio-website",
    slug: "portfolio-website",
    title: "Portfolio website",
    summary:
      "Created my website using Next.js with blog integration through Wix.",
    impact:
      "Brought projects, experience, resume, and blog content together in one place.",
    detail:
      "The original site was built with React, Next.js, MongoDB, Tailwind, and Prisma, and it continues to evolve as my portfolio grows.",
    skillIds: ["react", "nextjs", "mongodb", "tailwind", "prisma"],
    focusWeights: {
      general: 0.5,
      "backend-engineering": 0.3,
      "agentic-development": 0.3,
    },
    featured: false,
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
    title: "Context Aware Rule Engine",
    summary:
      "Developed a context-aware platform that takes decisions based on past user activity in real time and triggers business rules.",
    impact:
      "Moved decisioning closer to the event stream instead of waiting for slower offline feedback loops.",
    detail:
      "Built around Flink, Kafka, Java, Elastic Stack, Influx, and Airflow to combine streaming context, rules, and downstream actions.",
    skillIds: ["flink", "kafka", "java", "elastic-stack", "influx", "airflow"],
    focusWeights: {
      general: 0.8,
      "backend-engineering": 0.6,
      "platform-engineering": 0.5,
      "data-platform": 0.8,
      flink: 1,
      kafka: 0.9,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
  },
  {
    id: "telecom-network-datalake",
    slug: "telecom-network-datalake",
    title: "Telecom - Network Datalake",
    summary:
      "Designed and implemented a data lake and warehouse for network data coming from mobile towers, handling petabyte-scale data and more than two trillion events per day.",
    impact:
      "Created the analytics foundation for network data products, reporting, and large-scale downstream consumption.",
    detail:
      "Worked across ingestion, storage, processing, and operational concerns for very large telecom datasets using streaming and platform tooling.",
    skillIds: [
      "flink",
      "kafka",
      "java",
      "elastic-stack",
      "influx",
      "airflow",
      "nifi",
    ],
    focusWeights: {
      general: 1,
      "backend-engineering": 0.4,
      "platform-engineering": 0.8,
      "data-platform": 1,
      flink: 0.8,
      kafka: 0.8,
    },
    featured: false,
    visibility: "public",
    proofLinks: [],
  },
  {
    id: "retail-cross-shopping",
    slug: "retail-cross-shopping",
    title: "Retail - Cross Shopping Behaviour",
    summary:
      "Developed a solution for major retailers to analyze how customers cross-shop between departments, categories, and products.",
    impact:
      "Helped retail teams understand customer behavior across the store instead of looking only at isolated categories.",
    detail:
      "This was enhanced with multiple customer segmentation approaches so the analysis could be reused across different retail contexts.",
    skillIds: ["spark", "python", "power-bi", "airflow"],
    focusWeights: {
      general: 0.7,
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
    title: "Retail - Association Rule Engine",
    summary:
      "Developed a solution to analyze how products, categories, and departments are shopped together at large scale using Apriori.",
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
  },
  {
    id: "retail-category-uplift",
    slug: "retail-category-uplift",
    title: "Retail - Category Uplift and Cannibalization",
    summary:
      "Developed a solution to measure the impact of new product launches, incremental sales contribution, and cannibalization within the same category.",
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
      "I work as a full-stack data engineer designing petabyte-scale data pipelines. My expertise is in distributed systems and in designing efficient data pipelines and data product APIs.",
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
        text: "Designed and implemented large-scale data pipelines and platform capabilities for network and product-facing data systems.",
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
        text: "Worked on reusable data products, query access patterns, and APIs so downstream teams could build on shared foundations.",
        skillIds: ["python", "sql", "postgres", "kyuubi", "trino", "datahub"],
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
        text: "Built observability, platform tooling, and operational improvements around systems that teams depend on every day.",
        skillIds: ["elastic-stack", "grafana", "kubernetes", "airflow"],
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
      "I worked as a bridge between data scientists and big data platforms. I worked on a multitude of ML and statistical analysis problems, and created products and solutions reused by a diverse client base across the world, including some of the biggest retailers.",
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
        text: "Built customer segmentation, data marts, reporting platforms, and on-demand analytics products for large retail datasets.",
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
        text: "Created products and solutions to be reused by a diverse client base across the world, including some of the biggest retailers.",
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
      "I worked in mainframe and big data ecosystems as a developer for insurance and telecom clients. My role was instrumental in migration from mainframe to Spark, along with key automations that saved more than 1,000 man-hours per year.",
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
        text: "Built automations that saved more than 1,000 man-hours per year by removing repetitive manual workflow steps.",
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
    value: "10+ years",
    detail:
      "Hands-on work across telecom, retail, analytics, distributed systems, and platform engineering.",
    focusWeights: {
      general: 1,
    },
  },
  {
    id: "scale",
    label: "Scale",
    value: "2T+ events/day",
    detail:
      "Worked on network telemetry systems operating at petabyte scale and very high event volume.",
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
    label: "Core areas",
    value: "Data engineering, analytics, and platform systems",
    detail:
      "Strongest where distributed systems, ETL, observability, and reusable data products all matter at the same time.",
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
    headline: "Data Engineer | Data Analyst | Platform Engineer | DevOps",
    summary:
      "I work across data engineering, analytics, platform engineering, and backend services. Most of my work has involved distributed systems, ETL pipelines, reusable data products, and platforms that multiple teams rely on.",
  },
  {
    id: "ai",
    focusIds: ["ai"],
    headline: "AI-Focused Engineering View",
    summary:
      "This view highlights the Python, backend, and data-platform work that is most relevant to AI engineering roles. It emphasizes engineering foundations and reliable systems.",
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
      "I have built reusable platform capabilities around observability, data access, streaming, and internal tooling so teams can move faster with fewer operational surprises.",
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
    headline: "AI and Backend Engineering View",
    summary:
      "This view combines backend engineering with the Python, data, and workflow experience that is relevant to AI-heavy product and platform roles.",
  },
] as const;

export const fallbackPortfolioSnapshot = {
  siteProfile,
  portfolioLinks,
  focusDefinitions,
  skillDefinitions,
  projects,
  experiences,
  profileHighlights,
  summaryTemplates,
  mediaAssets: [],
  revisions: [],
} as const;
