"use client";

import { useState, type FormEvent } from "react";

import TurnstileWidget from "@/components/turnstile-widget";
import type { FocusDefinition } from "@/lib/portfolio-types";

type ResumeLabResponse = {
  ok: boolean;
  analysis?: {
    focusScores: Array<{ focusId: string; label: string; score: number }>;
    skillScores: Array<{ skillId: string; label: string; score: number }>;
    extractedHighlights: string[];
  };
  variant?: {
    headline: string;
    summary: string;
    focusIds: string[];
    primarySkills: Array<{ id: string; label: string }>;
    projects: Array<{ id: string; title: string; summary: string }>;
  };
  resumeUrl?: string;
  pdfUrl?: string;
  saved?: boolean;
  message?: string;
};

type ResumeLabProps = {
  focusOptions: readonly FocusDefinition[];
  turnstileSiteKey?: string;
};

export default function ResumeLab({
  focusOptions,
  turnstileSiteKey,
}: ResumeLabProps) {
  const [selectedFocuses, setSelectedFocuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeLabResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.set("focusOverride", selectedFocuses.join(","));

    const response = await fetch("/api/jd/analyze", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as ResumeLabResponse;

    if (!response.ok || !payload.ok) {
      setLoading(false);
      setError(payload.message ?? "Unable to analyze the job description.");
      return;
    }

    setLoading(false);
    setResult(payload);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
      <form
        className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold">Tailor a private resume variant</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/70">
          Paste a job description, optionally pin a few focus areas, and generate
          a shareable resume variant without sending anything to an external LLM.
        </p>

        <label className="mt-6 block text-sm font-medium text-gray-700 dark:text-white/80">
          Job description
        </label>
        <textarea
          className="mt-2 h-64 w-full rounded-2xl border border-black/10 bg-gray-50 p-4 text-sm outline-none transition focus:border-black/20 focus:bg-white dark:border-white/10 dark:bg-gray-950/60 dark:text-white"
          maxLength={10000}
          minLength={80}
          name="jobDescription"
          placeholder="Paste the role description here. Required, responsibilities, preferred, and title sections all help the parser."
          required
        />

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-gray-700 dark:text-white/80">
            Pin focus overrides
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {focusOptions
              .filter((focus) => focus.id !== "general")
              .map((focus) => {
                const isSelected = selectedFocuses.includes(focus.id);

                return (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-950"
                        : "border-black/10 bg-white text-gray-700 hover:border-black/20 dark:border-white/10 dark:bg-transparent dark:text-white/80"
                    }`}
                    key={focus.id}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedFocuses((current) => {
                        if (current.includes(focus.id)) {
                          return current.filter((item) => item !== focus.id);
                        }

                        return [...current, focus.id].slice(0, 3);
                      });
                    }}
                    type="button"
                  >
                    {focus.shortLabel}
                  </button>
                );
              })}
          </div>
        </fieldset>

        <TurnstileWidget siteKey={turnstileSiteKey} />

        <button
          className="mt-6 w-full rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Analyzing..." : "Analyze JD and build resume"}
        </button>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold">Analysis result</h2>
        {!result ? (
          <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white/70">
            The parser will return weighted focus areas, skill matches, a preview
            headline and summary, plus shareable resume and PDF links. If a
            database is configured, the variant will also be saved with a token.
          </p>
        ) : (
          <div className="mt-4 space-y-5 text-sm">
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/50">
              <p className="font-semibold">{result.variant?.headline}</p>
              <p className="mt-2 leading-6 text-gray-700 dark:text-white/70">
                {result.variant?.summary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Focus weights</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.analysis?.focusScores.map((focus) => (
                  <span
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium dark:border-white/10"
                    key={focus.focusId}
                  >
                    {focus.label} {(focus.score * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Top skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.variant?.primarySkills.map((skill) => (
                  <span
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium dark:border-white/10"
                    key={skill.id}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Highlights</h3>
              <ul className="mt-2 space-y-2 text-gray-700 dark:text-white/70">
                {result.analysis?.extractedHighlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Top projects</h3>
              <ul className="mt-2 space-y-3">
                {result.variant?.projects.map((project) => (
                  <li
                    className="rounded-2xl border border-black/10 p-3 dark:border-white/10"
                    key={project.id}
                  >
                    <p className="font-medium">{project.title}</p>
                    <p className="mt-1 text-gray-700 dark:text-white/70">
                      {project.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              {result.resumeUrl ? (
                <a
                  className="rounded-full bg-gray-900 px-4 py-2 font-semibold text-white transition hover:bg-gray-800"
                  href={result.resumeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open resume
                </a>
              ) : null}
              {result.pdfUrl ? (
                <a
                  className="rounded-full border border-black/10 px-4 py-2 font-semibold transition hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                  href={result.pdfUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download PDF
                </a>
              ) : null}
            </div>

            <p className="text-xs text-gray-500 dark:text-white/50">
              {result.saved
                ? "This variant was saved in the database."
                : "Database storage is not configured yet, so the public links use focus-based fallback only."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
