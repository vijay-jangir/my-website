import { useState, useRef } from "react";
import { actions } from "astro:actions";
import type { FocusId, FocusPreset, PortfolioSnapshot } from "@/lib/portfolio-types";
import {
  EMPTY_FOCUS_PRESET,
  formatJson,
  JsonTextarea,
  NEW_RECORD_ID,
  parseJsonValue,
  RecordButton,
  SectionTitle,
  type EditorContext,
  type PublishResult,
} from "./shared";

type FocusPresetActionInput = NonNullable<
  Parameters<typeof actions.publishContentSnapshot>[0]["focusPresets"]
>[number];
type PublishSnapshotInput = Parameters<
  typeof actions.publishContentSnapshot
>[0];

type Props = {
  ctx: EditorContext;
  focusDefinitions: PortfolioSnapshot["focusDefinitions"];
  focusPresets: readonly FocusPreset[];
  profileHighlights: PortfolioSnapshot["profileHighlights"];
  summaryTemplates: PortfolioSnapshot["summaryTemplates"];
};

function normalizeFocusPresets(presets: readonly FocusPreset[]) {
  return presets.map((preset, index) => ({ ...preset, sortOrder: index }));
}

export function FocusPresetEditor({
  ctx,
  focusDefinitions,
  focusPresets,
  profileHighlights,
  summaryTemplates,
}: Props) {
  const [focusDefsDraft, setFocusDefsDraft] = useState(formatJson(focusDefinitions));
  const [presetsState, setPresetsState] = useState<FocusPreset[]>([...focusPresets]);
  const [selectedPresetId, setSelectedPresetId] = useState(
    focusPresets[0]?.id ?? NEW_RECORD_ID,
  );
  const [presetDraft, setPresetDraft] = useState(
    formatJson(focusPresets[0] ?? EMPTY_FOCUS_PRESET),
  );
  const [highlightsDraft, setHighlightsDraft] = useState(formatJson(profileHighlights));
  const [templatesDraft, setTemplatesDraft] = useState(formatJson(summaryTemplates));
  const prevRef = useRef(focusPresets);

  if (focusPresets !== prevRef.current) {
    prevRef.current = focusPresets;
    setFocusDefsDraft(formatJson(focusDefinitions));
    setPresetsState([...focusPresets]);
    setHighlightsDraft(formatJson(profileHighlights));
    setTemplatesDraft(formatJson(summaryTemplates));
    const nextId =
      focusPresets.find((p) => p.id === selectedPresetId)?.id ??
      focusPresets[0]?.id ??
      NEW_RECORD_ID;
    setSelectedPresetId(nextId);
    setPresetDraft(
      formatJson(focusPresets.find((p) => p.id === nextId) ?? EMPTY_FOCUS_PRESET),
    );
  }

  function selectPreset(id: string) {
    setSelectedPresetId(id);
    setPresetDraft(
      formatJson(presetsState.find((p) => p.id === id) ?? EMPTY_FOCUS_PRESET),
    );
  }

  function stagePreset() {
    const parsed = parseJsonValue<FocusPresetActionInput>(presetDraft, "focus preset");
    const idx = presetsState.findIndex((p) => p.id === parsed.id);
    const next = [...presetsState];
    if (idx === -1) {
      next.push({ ...parsed, focusIds: (parsed.focusIds ?? []) as FocusId[], sortOrder: next.length });
    } else {
      next[idx] = { ...parsed, focusIds: (parsed.focusIds ?? []) as FocusId[], sortOrder: next[idx]?.sortOrder ?? idx };
    }
    const normalized = normalizeFocusPresets(next);
    setPresetsState(normalized);
    setSelectedPresetId(parsed.id);
    setPresetDraft(formatJson(normalized.find((p) => p.id === parsed.id) ?? parsed));
    ctx.setLocalStatus(`Focus preset ${parsed.label} staged for publish.`);
  }

  function removePreset() {
    if (!selectedPresetId || selectedPresetId === NEW_RECORD_ID) return;
    const normalized = normalizeFocusPresets(
      presetsState.filter((p) => p.id !== selectedPresetId),
    );
    const nextId = normalized[0]?.id ?? NEW_RECORD_ID;
    setPresetsState(normalized);
    setSelectedPresetId(nextId);
    setPresetDraft(formatJson(normalized.find((p) => p.id === nextId) ?? EMPTY_FOCUS_PRESET));
    ctx.setLocalStatus(`Focus preset ${selectedPresetId} removed from draft.`);
  }

  function movePreset(direction: -1 | 1) {
    if (!selectedPresetId || selectedPresetId === NEW_RECORD_ID) return;
    const curIdx = presetsState.findIndex((p) => p.id === selectedPresetId);
    const nextIdx = curIdx + direction;
    if (curIdx === -1 || nextIdx < 0 || nextIdx >= presetsState.length) return;
    const reordered = [...presetsState];
    const cur = reordered[curIdx];
    const nxt = reordered[nextIdx];
    if (!cur || !nxt) return;
    reordered[curIdx] = nxt;
    reordered[nextIdx] = cur;
    const normalized = normalizeFocusPresets(reordered);
    setPresetsState(normalized);
    setPresetDraft(
      formatJson(normalized.find((p) => p.id === selectedPresetId) ?? EMPTY_FOCUS_PRESET),
    );
    ctx.setLocalStatus(`Focus presets reordered.`);
  }

  async function publish() {
    const fd = parseJsonValue<PublishSnapshotInput["focusDefinitions"]>(focusDefsDraft, "focus definitions") ?? [];
    const fp = normalizeFocusPresets(presetsState);
    const ph = parseJsonValue<PublishSnapshotInput["profileHighlights"]>(highlightsDraft, "profile highlights") ?? [];
    const st = parseJsonValue<PublishSnapshotInput["summaryTemplates"]>(templatesDraft, "summary templates") ?? [];
    const payload = await ctx.runAction<PublishResult>("collections", () =>
      actions.publishContentSnapshot({
        focusDefinitions: fd,
        focusPresets: fp,
        profileHighlights: ph,
        summary: "Updated focus definitions, presets, highlights, and summaries",
        summaryTemplates: st,
      }),
    );
    ctx.onActionComplete(payload, "Focus definitions, presets, highlights, and summaries published.");
  }

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl sm:p-8">
      <SectionTitle
        body="These collections drive focus chips, resume preset cards, summary selection, and homepage metrics. They publish together."
        eyebrow="Advanced collections"
        title="Focuses, presets, highlights, and summaries"
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <JsonTextarea label="Focus definitions JSON" onChange={setFocusDefsDraft} value={focusDefsDraft} />
        <div className="text-sm font-medium text-[#0e1528]">
          Resume focus presets
          <div className="mt-2 grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="space-y-2">
              {presetsState.map((preset) => (
                <RecordButton
                  active={selectedPresetId === preset.id}
                  key={preset.id}
                  label={preset.label}
                  onClick={() => selectPreset(preset.id)}
                  secondary={preset.description}
                />
              ))}
              <button
                className="w-full rounded-[1.35rem] border border-dashed border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                onClick={() => {
                  setSelectedPresetId(NEW_RECORD_ID);
                  setPresetDraft(formatJson({ ...EMPTY_FOCUS_PRESET, sortOrder: presetsState.length }));
                }}
                type="button"
              >
                New preset draft
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0e1528] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    selectedPresetId === NEW_RECORD_ID ||
                    presetsState.findIndex((p) => p.id === selectedPresetId) <= 0
                  }
                  onClick={() => movePreset(-1)}
                  type="button"
                >
                  Move up
                </button>
                <button
                  className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0e1528] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    selectedPresetId === NEW_RECORD_ID ||
                    presetsState.findIndex((p) => p.id === selectedPresetId) ===
                      presetsState.length - 1
                  }
                  onClick={() => movePreset(1)}
                  type="button"
                >
                  Move down
                </button>
              </div>
            </div>
            <div>
              <JsonTextarea label="" onChange={setPresetDraft} value={presetDraft} />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-[#11192c] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222]"
                  onClick={stagePreset}
                  type="button"
                >
                  Stage preset
                </button>
                <button
                  className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0e1528] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={selectedPresetId === NEW_RECORD_ID}
                  onClick={removePreset}
                  type="button"
                >
                  Remove preset
                </button>
              </div>
            </div>
          </div>
        </div>
        <JsonTextarea label="Profile highlights JSON" onChange={setHighlightsDraft} value={highlightsDraft} />
        <JsonTextarea label="Summary templates JSON" onChange={setTemplatesDraft} value={templatesDraft} />
      </div>
      <div className="mt-4">
        <button
          className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={ctx.actionDisabled}
          onClick={publish}
          type="button"
        >
          {ctx.isBusy("collections")
            ? "Publishing collections..."
            : "Publish advanced collections"}
        </button>
      </div>
    </section>
  );
}
