import { useState, type FormEvent } from "react";

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

type Props = {
  focusOptions: readonly FocusDefinition[];
};

export default function ResumeLab({ focusOptions }: Props) {
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
      body: formData,
      method: "POST",
    });
    const payload = (await response.json()) as ResumeLabResponse;

    if (!response.ok || !payload.ok) {
      setError(payload.message ?? "Unable to analyze the job description.");
      setLoading(false);
      return;
    }

    setResult(payload);
    setLoading(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
      <form
        className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold">
          Tailor a private resume variant
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
          Paste a job description, optionally pin a few focus areas, and
          generate a shareable resume variant without depending on a hosted LLM.
        </p>

        <label className="mt-6 block text-sm font-medium text-[var(--ink)]">
          Job description
        </label>
        <textarea
          className="mt-2 h-64 w-full rounded-[1.5rem] border border-[var(--line)] bg-white p-4 text-sm outline-none focus:border-[var(--accent)]"
          maxLength={10000}
          minLength={80}
          name="jobDescription"
          placeholder="Paste the role description here. Required, responsibilities, preferred, and title sections all help the parser."
          required
        />

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-[var(--ink)]">
            Pin focus overrides
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {focusOptions
              .filter((focus) => focus.id !== "general")
              .map((focus) => {
                const isSelected = selectedFocuses.includes(focus.id);

                return (
                  <button
                    className={
                      isSelected
                        ? "rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
                    }
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

        <button
          className="mt-6 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Analyzing..." : "Analyze JD and build resume"}
        </button>

        {error ? (
          <p className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </form>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/75 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Analysis result</h2>
        {!result ? (
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            The parser will return weighted focus areas, skill matches, a
            preview headline and summary, plus shareable resume and PDF links.
          </p>
        ) : (
          <div className="mt-4 space-y-5 text-sm">
            <div className="rounded-[1.5rem] bg-[var(--accent-soft)] p-4">
              <p className="font-semibold">{result.variant?.headline}</p>
              <p className="mt-2 leading-7 text-[var(--muted)]">
                {result.variant?.summary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Focus weights</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.analysis?.focusScores.map((focus) => (
                  <span
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]"
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
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]"
                    key={skill.id}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Highlights</h3>
              <ul className="mt-2 space-y-2 text-[var(--muted)]">
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
                    className="rounded-[1.5rem] border border-[var(--line)] p-3"
                    key={project.id}
                  >
                    <p className="font-medium">{project.title}</p>
                    <p className="mt-1 text-[var(--muted)]">
                      {project.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              {result.resumeUrl ? (
                <a
                  className="rounded-full bg-[var(--ink)] px-4 py-2 font-semibold text-white hover:opacity-90"
                  href={result.resumeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open resume
                </a>
              ) : null}
              {result.pdfUrl ? (
                <a
                  className="rounded-full border border-[var(--line)] px-4 py-2 font-semibold hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  href={result.pdfUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download PDF
                </a>
              ) : null}
            </div>

            <p className="text-xs text-[var(--muted)]">
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
