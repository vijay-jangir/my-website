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
        className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold text-[#0e1528]">
          Tailor a private resume variant
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Paste a job description, optionally pin a few focus areas, and
          generate a shareable resume variant without depending on a hosted LLM.
        </p>

        <label className="mt-6 block text-sm font-medium text-[#0e1528]">
          Job description
        </label>
        <textarea
          className="mt-2 h-64 w-full rounded-[1.5rem] border border-slate-200/80 bg-white p-4 text-sm text-[#0e1528] outline-none transition focus:border-slate-300"
          maxLength={10000}
          minLength={80}
          name="jobDescription"
          placeholder="Paste the role description here. Required, responsibilities, preferred, and title sections all help the parser."
          required
        />

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-[#0e1528]">
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
                        ? "rounded-full bg-[#11192c] px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-[#0e1528]"
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
          className="mt-6 w-full rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
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

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-[#0e1528]">
          Analysis result
        </h2>
        {!result ? (
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The parser will return weighted focus areas, skill matches, a
            preview headline and summary, plus shareable resume and PDF links.
          </p>
        ) : (
          <div className="mt-4 space-y-5 text-sm">
            <div className="rounded-[1.5rem] bg-slate-100/80 p-4">
              <p className="font-semibold text-[#0e1528]">
                {result.variant?.headline}
              </p>
              <p className="mt-2 leading-7 text-slate-600">
                {result.variant?.summary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Focus weights</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.analysis?.focusScores.map((focus) => (
                  <span
                    className="rounded-full border border-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-600"
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
                    className="rounded-full border border-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-600"
                    key={skill.id}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Highlights</h3>
              <ul className="mt-2 space-y-2 text-slate-600">
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
                    className="rounded-[1.5rem] border border-slate-200/80 p-3"
                    key={project.id}
                  >
                    <p className="font-medium text-[#0e1528]">
                      {project.title}
                    </p>
                    <p className="mt-1 text-slate-600">{project.summary}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              {result.resumeUrl ? (
                <a
                  className="rounded-full bg-[#11192c] px-4 py-2 font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222]"
                  href={result.resumeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open resume
                </a>
              ) : null}
              {result.pdfUrl ? (
                <a
                  className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 font-semibold text-[#0e1528] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  href={result.pdfUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download PDF
                </a>
              ) : null}
            </div>

            <p className="text-xs text-slate-500">
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
