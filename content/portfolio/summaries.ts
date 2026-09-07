import type { SummaryTemplate } from "@/lib/portfolio-types";

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
