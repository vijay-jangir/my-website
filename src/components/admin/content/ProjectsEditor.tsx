import { useState, useRef } from "react";
import { actions } from "astro:actions";
import type { ProjectDefinition } from "@/lib/portfolio-types";
import {
  EMPTY_PROJECT,
  formatJson,
  JsonTextarea,
  NEW_RECORD_ID,
  parseJsonValue,
  RecordButton,
  SectionTitle,
  type EditorContext,
  type PublishResult,
} from "./shared";

type ProjectActionInput = Parameters<typeof actions.createProject>[0];

type Props = {
  ctx: EditorContext;
  projects: readonly ProjectDefinition[];
};

export function ProjectsEditor({ ctx, projects }: Props) {
  const [selectedId, setSelectedId] = useState(
    projects[0]?.id ?? NEW_RECORD_ID,
  );
  const [draft, setDraft] = useState(
    formatJson(projects[0] ?? EMPTY_PROJECT),
  );
  const selectOverrideRef = useRef<string | undefined>();
  const prevRef = useRef(projects);

  if (projects !== prevRef.current) {
    prevRef.current = projects;
    const override = selectOverrideRef.current;
    selectOverrideRef.current = undefined;
    const nextId =
      override ??
      (projects.find((p) => p.id === selectedId)?.id
        ? selectedId
        : (projects[0]?.id ?? NEW_RECORD_ID));
    setSelectedId(nextId);
    setDraft(
      formatJson(projects.find((p) => p.id === nextId) ?? EMPTY_PROJECT),
    );
  }

  function select(projectId: string) {
    setSelectedId(projectId);
    setDraft(
      formatJson(
        projects.find((p) => p.id === projectId) ?? EMPTY_PROJECT,
      ),
    );
  }

  async function save() {
    const parsed = parseJsonValue<ProjectActionInput>(
      draft,
      "project record",
    );
    const action = projects.some((p) => p.id === parsed.id)
      ? actions.updateProject
      : actions.createProject;
    selectOverrideRef.current = parsed.id;
    const payload = await ctx.runAction<PublishResult>("project", () => action(parsed));
    ctx.onActionComplete(payload, `Project ${parsed.title} saved.`);
  }

  async function remove() {
    if (!selectedId || selectedId === NEW_RECORD_ID) return;
    selectOverrideRef.current = projects.find(
      (p) => p.id !== selectedId,
    )?.id;
    const payload = await ctx.runAction<PublishResult>("project-delete", () =>
      actions.deleteProject({ id: selectedId }),
    );
    ctx.onActionComplete(payload, `Project ${selectedId} deleted.`);
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <SectionTitle
          body="Projects remain rich structured records with links, skill mappings, and per-focus weights."
          eyebrow="Projects"
          title="Project records"
        />
        <div className="mt-6 space-y-2">
          <RecordButton
            active={selectedId === NEW_RECORD_ID}
            label="New project"
            onClick={() => {
              setSelectedId(NEW_RECORD_ID);
              setDraft(formatJson(EMPTY_PROJECT));
            }}
          />
          {projects.map((project) => (
            <RecordButton
              active={selectedId === project.id}
              key={project.id}
              label={project.title}
              onClick={() => select(project.id)}
              secondary={project.slug}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <JsonTextarea
          height="h-[34rem]"
          label="Project JSON"
          onChange={setDraft}
          value={draft}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={ctx.actionDisabled}
            onClick={save}
            type="button"
          >
            {ctx.isBusy("project") ? "Saving project..." : "Save project"}
          </button>
          <button
            className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={ctx.actionDisabled || selectedId === NEW_RECORD_ID}
            onClick={remove}
            type="button"
          >
            {ctx.isBusy("project-delete")
              ? "Deleting..."
              : "Delete selected project"}
          </button>
        </div>
      </div>
    </section>
  );
}
