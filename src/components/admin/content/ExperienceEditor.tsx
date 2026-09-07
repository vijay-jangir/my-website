import { useState, useRef } from "react";
import { actions } from "astro:actions";
import type { ExperienceDefinition } from "@/lib/portfolio-types";
import {
  EMPTY_EXPERIENCE,
  formatJson,
  JsonTextarea,
  NEW_RECORD_ID,
  parseJsonValue,
  RecordButton,
  SectionTitle,
  type EditorContext,
  type PublishResult,
} from "./shared";

type ExperienceActionInput = Parameters<typeof actions.createExperience>[0];

type Props = {
  ctx: EditorContext;
  experiences: readonly ExperienceDefinition[];
};

export function ExperienceEditor({ ctx, experiences }: Props) {
  const [selectedId, setSelectedId] = useState(
    experiences[0]?.id ?? NEW_RECORD_ID,
  );
  const [draft, setDraft] = useState(
    formatJson(experiences[0] ?? EMPTY_EXPERIENCE),
  );
  const selectOverrideRef = useRef<string | undefined>();
  const prevRef = useRef(experiences);

  if (experiences !== prevRef.current) {
    prevRef.current = experiences;
    const override = selectOverrideRef.current;
    selectOverrideRef.current = undefined;
    const nextId =
      override ??
      (experiences.find((e) => e.id === selectedId)?.id
        ? selectedId
        : (experiences[0]?.id ?? NEW_RECORD_ID));
    setSelectedId(nextId);
    setDraft(
      formatJson(
        experiences.find((e) => e.id === nextId) ?? EMPTY_EXPERIENCE,
      ),
    );
  }

  function select(experienceId: string) {
    setSelectedId(experienceId);
    setDraft(
      formatJson(
        experiences.find((e) => e.id === experienceId) ?? EMPTY_EXPERIENCE,
      ),
    );
  }

  async function save() {
    const parsed = parseJsonValue<ExperienceActionInput>(
      draft,
      "experience record",
    );
    const action = experiences.some((e) => e.id === parsed.id)
      ? actions.updateExperience
      : actions.createExperience;
    selectOverrideRef.current = parsed.id;
    const payload = await ctx.runAction<PublishResult>("experience", () => action(parsed));
    ctx.onActionComplete(payload, `Experience ${parsed.company} saved.`);
  }

  async function remove() {
    if (!selectedId || selectedId === NEW_RECORD_ID) return;
    selectOverrideRef.current = experiences.find(
      (e) => e.id !== selectedId,
    )?.id;
    const payload = await ctx.runAction<PublishResult>("experience-delete", () =>
      actions.deleteExperience({ id: selectedId }),
    );
    ctx.onActionComplete(payload, `Experience ${selectedId} deleted.`);
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <SectionTitle
          body="Experience entries include company metadata, bullet-level skills, and focus weights."
          eyebrow="Experience"
          title="Experience records"
        />
        <div className="mt-6 space-y-2">
          <RecordButton
            active={selectedId === NEW_RECORD_ID}
            label="New experience"
            onClick={() => {
              setSelectedId(NEW_RECORD_ID);
              setDraft(formatJson(EMPTY_EXPERIENCE));
            }}
          />
          {experiences.map((experience) => (
            <RecordButton
              active={selectedId === experience.id}
              key={experience.id}
              label={experience.company}
              onClick={() => select(experience.id)}
              secondary={experience.title}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <JsonTextarea
          height="h-[34rem]"
          label="Experience JSON"
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
            {ctx.isBusy("experience")
              ? "Saving experience..."
              : "Save experience"}
          </button>
          <button
            className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={ctx.actionDisabled || selectedId === NEW_RECORD_ID}
            onClick={remove}
            type="button"
          >
            {ctx.isBusy("experience-delete")
              ? "Deleting..."
              : "Delete selected experience"}
          </button>
        </div>
      </div>
    </section>
  );
}
