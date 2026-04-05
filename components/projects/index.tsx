"use client";

import Link from "next/link";
import React from "react";

import SectionHeading from "@/components/section-heading";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

import Project from "./project";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.45);

  return (
    <section className="mb-28 scroll-mt-18" id="projects" ref={ref}>
      <div className="flex flex-col gap-4 text-center">
        <SectionHeading>Selected work</SectionHeading>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-700 dark:text-white/70">
          A few representative projects. Use the work page for deeper filters,
          detailed context, and recruiter or manager-specific paths.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {projectsData.slice(0, 4).map((project) => (
          <Project
            description={project.description}
            key={project.title}
            tags={project.tags}
            title={project.title}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          href="/work"
        >
          Browse all selected work
        </Link>
      </div>
    </section>
  );
}
