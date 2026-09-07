import { useState } from "react";

import type { PortfolioSnapshot } from "@/lib/portfolio-types";
import {
  toErrorMessage,
  type EditorContext,
  type PublishResult,
} from "./content/shared";
import { ProfileEditor } from "./content/ProfileEditor";
import { SkillsEditor } from "./content/SkillsEditor";
import { ProjectsEditor } from "./content/ProjectsEditor";
import { ExperienceEditor } from "./content/ExperienceEditor";
import { FocusPresetEditor } from "./content/FocusPresetEditor";
import { MediaEditor } from "./content/MediaEditor";
import { RevisionsPanel } from "./content/RevisionsPanel";

type Props = {
  backupConfigured: boolean;
  initialContent: PortfolioSnapshot;
};

export default function ContentManager({
  backupConfigured,
  initialContent,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function isBusy(actionName: string) {
    return busy === actionName;
  }

  async function runAction<T>(
    actionName: string,
    runner: () => Promise<{
      data: T | undefined;
      error: { message: string } | undefined;
    }>,
  ) {
    setBusy(actionName);
    setError(null);
    setStatus(null);

    try {
      const result = await runner();

      if (result.error) {
        setError(result.error.message);
        return null;
      }

      return result.data ?? null;
    } catch (actionError) {
      setError(toErrorMessage(actionError, "The action failed."));
      return null;
    } finally {
      setBusy(null);
    }
  }

  function handleActionComplete(
    payload: PublishResult | null,
    message: string,
  ) {
    if (!payload) return;
    setContent(payload.snapshot);
    setStatus(message);
  }

  const actionDisabled = !backupConfigured || busy !== null;

  const ctx: EditorContext = {
    actionDisabled,
    isBusy,
    onActionComplete: handleActionComplete,
    runAction,
    setError,
    setLocalStatus: (message: string) => {
      setError(null);
      setStatus(message);
    },
  };

  return (
    <div className="space-y-8">
      {!backupConfigured ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
          Content publishing is disabled until <code>CONTENT_BACKUP_REPO</code>{" "}
          and <code>CONTENT_BACKUP_PAT</code> are configured. Reads still fall
          back to the bundled snapshot.
        </section>
      ) : null}

      {status ? (
        <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-7 text-emerald-900">
          {status}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[1.75rem] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-800">
          {error}
        </section>
      ) : null}

      <ProfileEditor ctx={ctx} profile={content.siteProfile} />

      <SkillsEditor ctx={ctx} skills={content.skillDefinitions} />

      <ProjectsEditor ctx={ctx} projects={content.projects} />

      <ExperienceEditor ctx={ctx} experiences={content.experiences} />

      <FocusPresetEditor
        ctx={ctx}
        focusDefinitions={content.focusDefinitions}
        focusPresets={content.focusPresets}
        profileHighlights={content.profileHighlights}
        summaryTemplates={content.summaryTemplates}
      />

      <MediaEditor ctx={ctx} mediaAssets={content.mediaAssets} />

      <RevisionsPanel revisions={content.revisions} />
    </div>
  );
}
