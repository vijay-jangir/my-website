import type { Metadata } from "next";

import FocusPillLinks from "@/components/focus-pill-links";
import { focusDefinitions } from "@/content/portfolio";
import { getSkillLabel, parseFocusIds, searchProjects } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work across data platforms, streaming systems, backend engineering, and platform foundations.",
};

export default function WorkPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const focusIds = parseFocusIds(searchParams?.focus);
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";
  const projects = searchProjects({
    query,
    focusIds: focusIds.length > 0 ? focusIds : ["general"],
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20">
      <section className="rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
          Manager deep dive
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Selected work
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700 dark:text-white/75">
          This page is optimized for technical reviewers. Filter by focus,
          search for specific systems or skills, and use the resume page when
          you need a concise recruiter-facing version.
        </p>

        <form className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <input
            className="rounded-full border border-black/10 bg-gray-50 px-5 py-3 text-sm outline-none transition focus:border-black/20 focus:bg-white dark:border-white/10 dark:bg-gray-950/60"
            defaultValue={query}
            name="q"
            placeholder="Search for Flink, Kafka, backend, AI, observability..."
            type="search"
          />
          <button
            className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="mt-6">
          <FocusPillLinks
            activeFocusIds={focusIds.length > 0 ? focusIds : ["general"]}
            basePath="/work"
            focusOptions={focusDefinitions}
            query={{ q: query || undefined }}
          />
        </div>
      </section>

      <section className="grid gap-6">
        {projects.map((project) => (
          <article
            className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5"
            key={project.id}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{project.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700 dark:text-white/75">
                  {project.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.skillIds.map((skillId) => (
                  <span
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium dark:bg-white/10"
                    key={skillId}
                  >
                    {getSkillLabel(skillId)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Impact
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-white/70">
                  {project.impact}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Implementation note
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-white/70">
                  {project.detail}
                </p>
              </div>
            </div>

            {project.proofLinks.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.proofLinks.map((link) => (
                  <a
                    className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                    href={link.href}
                    key={link.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
