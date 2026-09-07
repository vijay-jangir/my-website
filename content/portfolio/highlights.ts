import type { ProfileHighlight } from "@/lib/portfolio-types";
import { experienceYearsLabel } from "./profile";

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
