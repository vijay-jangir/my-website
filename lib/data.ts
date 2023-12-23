import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import corpcommentImg from "@/public/corpcomment.png";
import rmtdevImg from "@/public/rmtdev.png";
import wordanalyticsImg from "@/public/wordanalytics.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },  
  {
    name: "Blog",
    hash: "https://vijayjangir.com",
  },
] as const;

export const experiencesData = [
  {
    title: "Data Engineer",
    location: "Airtel Digital",
    description:
      "I'm now a full-stack developer working as a freelancer. My stack includes React, Next.js, TypeScript, Tailwind, Prisma and MongoDB. I'm open to full-time opportunities.",
    icon: React.createElement(FaReact),
    date: "2021 - present",
  },
  {
    title: "Front-End Developer",
    location: "Orlando, FL",
    description:
      "I worked as a front-end developer for 2 years in 1 job and 1 year in another job. I also upskilled to the full stack.",
    icon: React.createElement(CgWorkAlt),
    date: "2019 - 2021",
  },
  {
    title: "Graduated bootcamp",
    location: "Miami, FL",
    description:
      "I graduated after 6 months of studying. I immediately found a job as a front-end developer.",
    icon: React.createElement(LuGraduationCap),
    date: "2019",
  },
] as const;

export const projectsData = [
  {
    title: "Portfolio website",
    description:
      "Created my website using nextJS. This is a portfolio website having a blog integration with WIX.",
    tags: ["React", "Next.js", "MongoDB", "Tailwind", "Prisma"],
    imageUrl: corpcommentImg,
  },
  {
    title: "Retail Analytics",
    description:
      "Worked for largest global retail giants to produce insights related to Category, Pricing, Promotion, Cannibalisation.",
    tags: ["Spark", "Python", "Power-BI", "Airflow"],
    imageUrl: rmtdevImg,
  },
  {
    title: "Context Aware Rule Engine",
    description:
      "Developed a context aware platforn, which considers users past activity and to trigger business rules.",
    tags: ["Flink", "Kafka", "Java", "Elastic Stack", "Influx", "Airflow"],
    imageUrl: wordanalyticsImg,
  },
] as const;

export const skillsData = [
  "Spark",
  "Flink",
  "Kubernetes (OCP)",
  "Python", 
  "Java",
  "MongoDB",
  "Cloud (GCP, AWS)",
  "Kafka",
  "MongoDB",
  "Elastic Stack",
] as const;
