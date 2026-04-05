import Link from "next/link";
import type { Metadata } from "next";

import FocusPillLinks from "@/components/focus-pill-links";
import { focusDefinitions, siteProfile } from "@/content/portfolio";
import { buildResumeVariant, getSkillLabel, parseFocusIds } from "@/lib/portfolio";
import { getResumeVariantByToken } from "@/lib/resume-store";
import type { FocusId } from "@/lib/portfolio-types";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Focused resume views for data, platform, streaming, AI, and backend engineering roles.",
};

export default async function ResumePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const focusIds = parseFocusIds(searchParams?.focus);
  const variantToken =
    typeof searchParams?.variant === "string" ? searchParams.variant : undefined;
  const storedVariant = variantToken
    ? await getResumeVariantByToken(variantToken)
    : null;
  const variant =
    storedVariant?.variant ??
    buildResumeVariant({
      focusIds,
    });
  const selectedFocusIds: readonly FocusId[] =
    variant.focusIds.length > 0 ? variant.focusIds : ["general"];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20">
      <section className="grid gap-8 rounded-[2rem] border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Recruiter-ready resume
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {variant.headline}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-700 dark:text-white/75">
            {variant.summary}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600 dark:text-white/60">
            {siteProfile.recruiterPitch}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              href={`/api/resume/pdf?${new URLSearchParams(
                storedVariant?.token
                  ? { variant: storedVariant.token }
                  : { focus: selectedFocusIds.join(",") },
              ).toString()}`}
            >
              Download ATS PDF
            </Link>
            <Link
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
              href="/work"
            >
              Browse selected work
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-gray-50 p-6 dark:bg-gray-950/50">
          {variant.highlights.map((highlight) => (
            <div key={highlight.id}>
              <p className="text-sm font-medium text-gray-500">{highlight.label}</p>
              <p className="mt-1 text-2xl font-semibold">{highlight.value}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/65">
                {highlight.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
              Focus the resume
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Choose what to emphasize</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-white/60">
            The resume changes deterministically. Focuses update the summary,
            project order, and skill emphasis without inventing new claims.
          </p>
        </div>
        <div className="mt-6">
          <FocusPillLinks
            activeFocusIds={selectedFocusIds}
            basePath="/resume"
            focusOptions={focusDefinitions}
          />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Selected work</h2>
            <div className="mt-6 space-y-5">
              {variant.projects.map((project) => (
                <article
                  className="rounded-[1.5rem] border border-black/10 p-5 dark:border-white/10"
                  key={project.id}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-white/70">
                        {project.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.skillIds.slice(0, 4).map((skillId) => (
                        <span
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium dark:bg-white/10"
                          key={skillId}
                        >
                          {getSkillLabel(skillId)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white/60">
                    {project.impact}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Experience</h2>
            <div className="mt-6 space-y-6">
              {variant.experiences.map((experience) => (
                <article key={experience.id}>
                  <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                    <h3 className="text-xl font-semibold">
                      {experience.title} · {experience.company}
                    </h3>
                    <p className="text-sm text-gray-500">{experience.date}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-white/70">
                    {experience.description}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-600 dark:text-white/60">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet.id}>• {bullet.text}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Primary skills</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {variant.primarySkills.map((skill) => (
                <span
                  className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-gray-950"
                  key={skill.id}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Secondary skills</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {variant.secondarySkills.map((skill) => (
                <span
                  className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/10"
                  key={skill.id}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-2xl font-semibold">Supporting context</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {variant.supportingSkills.map((skill) => (
                <span
                  className="rounded-full border border-dashed border-black/15 px-4 py-2 text-sm font-medium dark:border-white/15"
                  key={skill.id}
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </div>

          {variant.analysis ? (
            <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="text-2xl font-semibold">JD analysis</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-600 dark:text-white/60">
                {variant.analysis.extractedHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
