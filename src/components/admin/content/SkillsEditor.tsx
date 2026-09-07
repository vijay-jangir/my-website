import { useState, useRef } from "react";
import { actions } from "astro:actions";
import type { SkillDefinition } from "@/lib/portfolio-types";
import {
  EMPTY_SKILL,
  formatJson,
  JsonTextarea,
  NEW_RECORD_ID,
  parseJsonValue,
  RecordButton,
  SectionTitle,
  type EditorContext,
  type PublishResult,
} from "./shared";

type SkillActionInput = Parameters<typeof actions.createSkill>[0];

type Props = {
  ctx: EditorContext;
  skills: readonly SkillDefinition[];
};

export function SkillsEditor({ ctx, skills }: Props) {
  const [selectedId, setSelectedId] = useState(
    skills[0]?.id ?? NEW_RECORD_ID,
  );
  const [draft, setDraft] = useState(
    formatJson(skills[0] ?? EMPTY_SKILL),
  );
  const selectOverrideRef = useRef<string | undefined>();
  const prevSkillsRef = useRef(skills);

  if (skills !== prevSkillsRef.current) {
    prevSkillsRef.current = skills;
    const override = selectOverrideRef.current;
    selectOverrideRef.current = undefined;
    const nextId =
      override ??
      (skills.find((s) => s.id === selectedId)?.id
        ? selectedId
        : (skills[0]?.id ?? NEW_RECORD_ID));
    setSelectedId(nextId);
    setDraft(
      formatJson(skills.find((s) => s.id === nextId) ?? EMPTY_SKILL),
    );
  }

  function select(skillId: string) {
    setSelectedId(skillId);
    setDraft(
      formatJson(skills.find((s) => s.id === skillId) ?? EMPTY_SKILL),
    );
  }

  async function save() {
    const parsed = parseJsonValue<SkillActionInput>(draft, "skill record");
    const action = skills.some((s) => s.id === parsed.id)
      ? actions.updateSkill
      : actions.createSkill;
    selectOverrideRef.current = parsed.id;
    const payload = await ctx.runAction<PublishResult>("skill", () => action(parsed));
    ctx.onActionComplete(payload, `Skill ${parsed.label} saved.`);
  }

  async function remove() {
    if (!selectedId || selectedId === NEW_RECORD_ID) return;
    selectOverrideRef.current = skills.find(
      (s) => s.id !== selectedId,
    )?.id;
    const payload = await ctx.runAction<PublishResult>("skill-delete", () =>
      actions.deleteSkill({ id: selectedId }),
    );
    ctx.onActionComplete(payload, `Skill ${selectedId} deleted.`);
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <SectionTitle
          body="Create, update, or remove skills. Focus weights remain JSON to keep the editor flexible."
          eyebrow="Skills"
          title="Skill records"
        />
        <div className="mt-6 space-y-2">
          <RecordButton
            active={selectedId === NEW_RECORD_ID}
            label="New skill"
            onClick={() => {
              setSelectedId(NEW_RECORD_ID);
              setDraft(formatJson(EMPTY_SKILL));
            }}
          />
          {skills.map((skill) => (
            <RecordButton
              active={selectedId === skill.id}
              key={skill.id}
              label={skill.label}
              onClick={() => select(skill.id)}
              secondary={skill.id}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <JsonTextarea
          height="h-[30rem]"
          label="Skill JSON"
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
            {ctx.isBusy("skill") ? "Saving skill..." : "Save skill"}
          </button>
          <button
            className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={ctx.actionDisabled || selectedId === NEW_RECORD_ID}
            onClick={remove}
            type="button"
          >
            {ctx.isBusy("skill-delete")
              ? "Deleting..."
              : "Delete selected skill"}
          </button>
        </div>
      </div>
    </section>
  );
}
