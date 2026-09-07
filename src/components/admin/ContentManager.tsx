import { useState, type ChangeEvent, type FormEvent } from "react";
import { actions } from "astro:actions";

import type {
  ExperienceDefinition,
  FocusPreset,
  MediaAsset,
  PortfolioSnapshot,
  ProjectDefinition,
  SiteProfile,
  SkillDefinition,
} from "@/lib/portfolio-types";

const NEW_RECORD_ID = "__new__";

const EMPTY_SKILL: SkillDefinition = {
  aliases: [],
  category: "tooling",
  focusWeights: {},
  highlights: [],
  id: "",
  label: "",
};

const EMPTY_PROJECT: ProjectDefinition = {
  detail: "",
  featured: false,
  focusWeights: {},
  id: "",
  impact: "",
  proofLinks: [],
  skillIds: [],
  slug: "",
  summary: "",
  title: "",
  visibility: "public",
};

const EMPTY_EXPERIENCE: ExperienceDefinition = {
  bullets: [],
  company: "",
  companyUrl: "",
  date: "",
  description: "",
  focusWeights: {},
  icon: "",
  id: "",
  title: "",
  type: "employment",
};

const EMPTY_FOCUS_PRESET: FocusPreset = {
  description: "",
  focusIds: [],
  id: "",
  label: "",
  sortOrder: 0,
};

type Props = {
  backupConfigured: boolean;
  initialContent: PortfolioSnapshot;
};

type UpsertProfileInput = Parameters<typeof actions.upsertProfile>[0];
type SkillActionInput = Parameters<typeof actions.createSkill>[0];
type ProjectActionInput = Parameters<typeof actions.createProject>[0];
type ExperienceActionInput = Parameters<typeof actions.createExperience>[0];
type FocusPresetActionInput = NonNullable<
  Parameters<typeof actions.publishContentSnapshot>[0]["focusPresets"]
>[number];
type PublishSnapshotInput = Parameters<
  typeof actions.publishContentSnapshot
>[0];

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function toErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

function parseJsonValue<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(
      `Unable to parse ${label}: ${toErrorMessage(error, "Invalid JSON.")}`,
    );
  }
}

function SectionTitle(props: { body: string; eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#1f3b73]">
        {props.eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] text-[#0e1528]">
        {props.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        {props.body}
      </p>
    </div>
  );
}

function RecordButton(props: {
  active: boolean;
  label: string;
  onClick: () => void;
  secondary?: string;
}) {
  return (
    <button
      className={
        props.active
          ? "w-full rounded-[1.35rem] border border-[#1f3b73]/20 bg-[#1f3b73] px-4 py-3 text-left text-sm text-white shadow-[0_10px_24px_rgba(31,59,115,0.18)]"
          : "w-full rounded-[1.35rem] border border-slate-200/80 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      }
      onClick={props.onClick}
      type="button"
    >
      <p className="font-semibold">{props.label}</p>
      {props.secondary ? (
        <p
          className={
            props.active ? "mt-1 text-white/75" : "mt-1 text-slate-500"
          }
        >
          {props.secondary}
        </p>
      ) : null}
    </button>
  );
}

export default function ContentManager({
  backupConfigured,
  initialContent,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [profileDraft, setProfileDraft] = useState<SiteProfile>(
    initialContent.siteProfile,
  );

  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    initialContent.skillDefinitions[0]?.id ?? NEW_RECORD_ID,
  );
  const [skillDraft, setSkillDraft] = useState(
    formatJson(initialContent.skillDefinitions[0] ?? EMPTY_SKILL),
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialContent.projects[0]?.id ?? NEW_RECORD_ID,
  );
  const [projectDraft, setProjectDraft] = useState(
    formatJson(initialContent.projects[0] ?? EMPTY_PROJECT),
  );

  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    initialContent.experiences[0]?.id ?? NEW_RECORD_ID,
  );
  const [experienceDraft, setExperienceDraft] = useState(
    formatJson(initialContent.experiences[0] ?? EMPTY_EXPERIENCE),
  );

  const [focusDefinitionsDraft, setFocusDefinitionsDraft] = useState(
    formatJson(initialContent.focusDefinitions),
  );
  const [focusPresetsState, setFocusPresetsState] = useState<FocusPreset[]>([
    ...initialContent.focusPresets,
  ]);
  const [selectedFocusPresetId, setSelectedFocusPresetId] = useState<string>(
    initialContent.focusPresets[0]?.id ?? NEW_RECORD_ID,
  );
  const [focusPresetDraft, setFocusPresetDraft] = useState(
    formatJson(initialContent.focusPresets[0] ?? EMPTY_FOCUS_PRESET),
  );
  const [profileHighlightsDraft, setProfileHighlightsDraft] = useState(
    formatJson(initialContent.profileHighlights),
  );
  const [summaryTemplatesDraft, setSummaryTemplatesDraft] = useState(
    formatJson(initialContent.summaryTemplates),
  );

  const [mediaLabel, setMediaLabel] = useState("");
  const [mediaKind, setMediaKind] = useState<MediaAsset["kind"]>("image");
  const [mediaEntityType, setMediaEntityType] = useState<
    MediaAsset["entityType"] | ""
  >("");
  const [mediaEntityId, setMediaEntityId] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  function isBusy(actionName: string) {
    return busy === actionName;
  }

  function syncDrafts(
    nextContent: PortfolioSnapshot,
    overrides?: {
      experienceId?: string;
      projectId?: string;
      skillId?: string;
    },
  ) {
    setContent(nextContent);
    setProfileDraft(nextContent.siteProfile);
    setFocusDefinitionsDraft(formatJson(nextContent.focusDefinitions));
    setFocusPresetsState([...nextContent.focusPresets]);
    setProfileHighlightsDraft(formatJson(nextContent.profileHighlights));
    setSummaryTemplatesDraft(formatJson(nextContent.summaryTemplates));

    const nextFocusPresetId =
      nextContent.focusPresets.find(
        (preset) => preset.id === selectedFocusPresetId,
      )?.id ??
      nextContent.focusPresets[0]?.id ??
      NEW_RECORD_ID;
    setSelectedFocusPresetId(nextFocusPresetId);
    setFocusPresetDraft(
      formatJson(
        nextContent.focusPresets.find(
          (preset) => preset.id === nextFocusPresetId,
        ) ?? EMPTY_FOCUS_PRESET,
      ),
    );

    const nextSkillId =
      overrides?.skillId ??
      (nextContent.skillDefinitions.find(
        (skill) => skill.id === selectedSkillId,
      )?.id
        ? selectedSkillId
        : (nextContent.skillDefinitions[0]?.id ?? NEW_RECORD_ID));
    setSelectedSkillId(nextSkillId);
    setSkillDraft(
      formatJson(
        nextContent.skillDefinitions.find(
          (skill) => skill.id === nextSkillId,
        ) ?? EMPTY_SKILL,
      ),
    );

    const nextProjectId =
      overrides?.projectId ??
      (nextContent.projects.find((project) => project.id === selectedProjectId)
        ?.id
        ? selectedProjectId
        : (nextContent.projects[0]?.id ?? NEW_RECORD_ID));
    setSelectedProjectId(nextProjectId);
    setProjectDraft(
      formatJson(
        nextContent.projects.find((project) => project.id === nextProjectId) ??
          EMPTY_PROJECT,
      ),
    );

    const nextExperienceId =
      overrides?.experienceId ??
      (nextContent.experiences.find(
        (experience) => experience.id === selectedExperienceId,
      )?.id
        ? selectedExperienceId
        : (nextContent.experiences[0]?.id ?? NEW_RECORD_ID));
    setSelectedExperienceId(nextExperienceId);
    setExperienceDraft(
      formatJson(
        nextContent.experiences.find(
          (experience) => experience.id === nextExperienceId,
        ) ?? EMPTY_EXPERIENCE,
      ),
    );
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

  function applyPublishResult(
    payload: {
      revisions: PortfolioSnapshot["revisions"];
      snapshot: PortfolioSnapshot;
    } | null,
    successMessage: string,
    overrides?: { experienceId?: string; projectId?: string; skillId?: string },
  ) {
    if (!payload) {
      return;
    }

    syncDrafts(payload.snapshot, overrides);
    setStatus(successMessage);
  }

  function handleProfileChange<K extends keyof SiteProfile>(
    key: K,
    value: SiteProfile[K],
  ) {
    setProfileDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function selectSkill(skillId: string) {
    setSelectedSkillId(skillId);
    setSkillDraft(
      formatJson(
        content.skillDefinitions.find((skill) => skill.id === skillId) ??
          EMPTY_SKILL,
      ),
    );
  }

  function selectProject(projectId: string) {
    setSelectedProjectId(projectId);
    setProjectDraft(
      formatJson(
        content.projects.find((project) => project.id === projectId) ??
          EMPTY_PROJECT,
      ),
    );
  }

  function selectExperience(experienceId: string) {
    setSelectedExperienceId(experienceId);
    setExperienceDraft(
      formatJson(
        content.experiences.find(
          (experience) => experience.id === experienceId,
        ) ?? EMPTY_EXPERIENCE,
      ),
    );
  }

  function normalizeFocusPresets(nextFocusPresets: readonly FocusPreset[]) {
    return nextFocusPresets.map((preset, index) => ({
      ...preset,
      sortOrder: index,
    }));
  }

  function selectFocusPreset(focusPresetId: string) {
    setSelectedFocusPresetId(focusPresetId);
    setFocusPresetDraft(
      formatJson(
        focusPresetsState.find((preset) => preset.id === focusPresetId) ??
          EMPTY_FOCUS_PRESET,
      ),
    );
  }

  function stageFocusPreset() {
    const parsed = parseJsonValue<FocusPresetActionInput>(
      focusPresetDraft,
      "focus preset",
    );
    const existingIndex = focusPresetsState.findIndex(
      (preset) => preset.id === parsed.id,
    );
    const nextFocusPresets = [...focusPresetsState];

    if (existingIndex === -1) {
      nextFocusPresets.push({ ...parsed, sortOrder: nextFocusPresets.length });
    } else {
      nextFocusPresets[existingIndex] = {
        ...parsed,
        sortOrder: nextFocusPresets[existingIndex]?.sortOrder ?? existingIndex,
      };
    }

    const normalized = normalizeFocusPresets(nextFocusPresets);
    setFocusPresetsState(normalized);
    setSelectedFocusPresetId(parsed.id);
    setFocusPresetDraft(
      formatJson(
        normalized.find((preset) => preset.id === parsed.id) ?? parsed,
      ),
    );
    setStatus(`Focus preset ${parsed.label} staged for publish.`);
    setError(null);
  }

  function removeFocusPreset() {
    if (!selectedFocusPresetId || selectedFocusPresetId === NEW_RECORD_ID) {
      return;
    }

    const normalized = normalizeFocusPresets(
      focusPresetsState.filter((preset) => preset.id !== selectedFocusPresetId),
    );
    const nextFocusPresetId = normalized[0]?.id ?? NEW_RECORD_ID;
    setFocusPresetsState(normalized);
    setSelectedFocusPresetId(nextFocusPresetId);
    setFocusPresetDraft(
      formatJson(
        normalized.find((preset) => preset.id === nextFocusPresetId) ??
          EMPTY_FOCUS_PRESET,
      ),
    );
    setStatus(`Focus preset ${selectedFocusPresetId} removed from draft.`);
    setError(null);
  }

  function moveFocusPreset(direction: -1 | 1) {
    if (!selectedFocusPresetId || selectedFocusPresetId === NEW_RECORD_ID) {
      return;
    }

    const currentIndex = focusPresetsState.findIndex(
      (preset) => preset.id === selectedFocusPresetId,
    );
    const nextIndex = currentIndex + direction;

    if (
      currentIndex === -1 ||
      nextIndex < 0 ||
      nextIndex >= focusPresetsState.length
    ) {
      return;
    }

    const reordered = [...focusPresetsState];
    const current = reordered[currentIndex];
    const next = reordered[nextIndex];

    if (!current || !next) {
      return;
    }

    reordered[currentIndex] = next;
    reordered[nextIndex] = current;

    const normalized = normalizeFocusPresets(reordered);
    setFocusPresetsState(normalized);
    setFocusPresetDraft(
      formatJson(
        normalized.find((preset) => preset.id === selectedFocusPresetId) ??
          EMPTY_FOCUS_PRESET,
      ),
    );
    setStatus(`Focus presets reordered.`);
    setError(null);
  }

  async function saveProfile() {
    const payload = await runAction("profile", () =>
      actions.upsertProfile(profileDraft as UpsertProfileInput),
    );

    applyPublishResult(payload, "Profile updated.");
  }

  async function saveSkill() {
    const parsed = parseJsonValue<SkillActionInput>(skillDraft, "skill record");
    const action = content.skillDefinitions.some(
      (skill) => skill.id === parsed.id,
    )
      ? actions.updateSkill
      : actions.createSkill;
    const payload = await runAction("skill", () => action(parsed));

    applyPublishResult(payload, `Skill ${parsed.label} saved.`, {
      skillId: parsed.id,
    });
  }

  async function removeSkill() {
    if (!selectedSkillId || selectedSkillId === NEW_RECORD_ID) {
      return;
    }

    const payload = await runAction("skill-delete", () =>
      actions.deleteSkill({ id: selectedSkillId }),
    );

    applyPublishResult(payload, `Skill ${selectedSkillId} deleted.`, {
      skillId: content.skillDefinitions.find(
        (skill) => skill.id !== selectedSkillId,
      )?.id,
    });
  }

  async function saveProject() {
    const parsed = parseJsonValue<ProjectActionInput>(
      projectDraft,
      "project record",
    );
    const action = content.projects.some((project) => project.id === parsed.id)
      ? actions.updateProject
      : actions.createProject;
    const payload = await runAction("project", () => action(parsed));

    applyPublishResult(payload, `Project ${parsed.title} saved.`, {
      projectId: parsed.id,
    });
  }

  async function removeProject() {
    if (!selectedProjectId || selectedProjectId === NEW_RECORD_ID) {
      return;
    }

    const payload = await runAction("project-delete", () =>
      actions.deleteProject({ id: selectedProjectId }),
    );

    applyPublishResult(payload, `Project ${selectedProjectId} deleted.`, {
      projectId: content.projects.find(
        (project) => project.id !== selectedProjectId,
      )?.id,
    });
  }

  async function saveExperience() {
    const parsed = parseJsonValue<ExperienceActionInput>(
      experienceDraft,
      "experience record",
    );
    const action = content.experiences.some(
      (experience) => experience.id === parsed.id,
    )
      ? actions.updateExperience
      : actions.createExperience;
    const payload = await runAction("experience", () => action(parsed));

    applyPublishResult(payload, `Experience ${parsed.company} saved.`, {
      experienceId: parsed.id,
    });
  }

  async function removeExperience() {
    if (!selectedExperienceId || selectedExperienceId === NEW_RECORD_ID) {
      return;
    }

    const payload = await runAction("experience-delete", () =>
      actions.deleteExperience({ id: selectedExperienceId }),
    );

    applyPublishResult(payload, `Experience ${selectedExperienceId} deleted.`, {
      experienceId: content.experiences.find(
        (experience) => experience.id !== selectedExperienceId,
      )?.id,
    });
  }

  async function publishCollections() {
    const focusDefinitions =
      parseJsonValue<PublishSnapshotInput["focusDefinitions"]>(
        focusDefinitionsDraft,
        "focus definitions",
      ) ?? [];
    const focusPresets = normalizeFocusPresets(focusPresetsState);
    const profileHighlights =
      parseJsonValue<PublishSnapshotInput["profileHighlights"]>(
        profileHighlightsDraft,
        "profile highlights",
      ) ?? [];
    const summaryTemplates =
      parseJsonValue<PublishSnapshotInput["summaryTemplates"]>(
        summaryTemplatesDraft,
        "summary templates",
      ) ?? [];

    const payload = await runAction("collections", () =>
      actions.publishContentSnapshot({
        focusDefinitions,
        focusPresets,
        profileHighlights,
        summary:
          "Updated focus definitions, presets, highlights, and summaries",
        summaryTemplates,
      }),
    );

    applyPublishResult(
      payload,
      "Focus definitions, presets, highlights, and summaries published.",
    );
  }

  async function handleMediaUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mediaFile) {
      setError("Choose a file to upload first.");
      return;
    }

    const formData = new FormData();
    formData.set("file", mediaFile);
    formData.set("kind", mediaKind);
    formData.set("label", mediaLabel || mediaFile.name);

    if (mediaEntityType) {
      formData.set("entityType", mediaEntityType);
    }

    if (mediaEntityId) {
      formData.set("entityId", mediaEntityId);
    }

    const payload = await runAction("media", () =>
      actions.uploadMedia(formData),
    );

    if (!payload) {
      return;
    }

    syncDrafts(payload.snapshot);
    setStatus(`Uploaded ${mediaLabel || mediaFile.name}.`);
    setMediaLabel("");
    setMediaEntityId("");
    setMediaEntityType("");
    setMediaKind("image");
    setMediaFile(null);
    event.currentTarget.reset();
  }

  const actionDisabled = !backupConfigured || busy !== null;

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

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl sm:p-8">
        <SectionTitle
          body="These values drive the homepage hero, footer, and shared metadata."
          eyebrow="Profile"
          title="Site profile"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-[#0e1528]">
            Name
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("name", event.target.value)
              }
              value={profileDraft.name}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Title
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("title", event.target.value)
              }
              value={profileDraft.title}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Location
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("location", event.target.value)
              }
              value={profileDraft.location}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Timezone
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("timezone", event.target.value)
              }
              value={profileDraft.timezone}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Email
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("email", event.target.value)
              }
              value={profileDraft.email}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Profile image URL
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("profileImageUrl", event.target.value)
              }
              value={profileDraft.profileImageUrl ?? ""}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            GitHub URL
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("githubUrl", event.target.value)
              }
              value={profileDraft.githubUrl}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            LinkedIn URL
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("linkedinUrl", event.target.value)
              }
              value={profileDraft.linkedinUrl}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium text-[#0e1528]">
            Hero label
            <textarea
              className="mt-2 h-28 w-full rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("heroLabel", event.target.value)
              }
              value={profileDraft.heroLabel}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Recruiter pitch
            <textarea
              className="mt-2 h-32 w-full rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange("recruiterPitch", event.target.value)
              }
              value={profileDraft.recruiterPitch}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Overview paragraphs
            <textarea
              className="mt-2 h-36 w-full rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange(
                  "overview",
                  event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                )
              }
              value={profileDraft.overview.join("\n")}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Current focus labels
            <input
              className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
              onChange={(event) =>
                handleProfileChange(
                  "currentFocusLabels",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              value={profileDraft.currentFocusLabels.join(", ")}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-[#0e1528]">
              Last updated label
              <input
                className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                onChange={(event) =>
                  handleProfileChange("lastUpdatedLabel", event.target.value)
                }
                value={profileDraft.lastUpdatedLabel}
              />
            </label>
            <label className="text-sm font-medium text-[#0e1528]">
              Content promise
              <input
                className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                onChange={(event) =>
                  handleProfileChange("contentPromise", event.target.value)
                }
                value={profileDraft.contentPromise}
              />
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button
            className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={actionDisabled}
            onClick={saveProfile}
            type="button"
          >
            {isBusy("profile") ? "Saving profile..." : "Save profile"}
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <SectionTitle
            body="Create, update, or remove skills. Focus weights remain JSON to keep the editor flexible."
            eyebrow="Skills"
            title="Skill records"
          />
          <div className="mt-6 space-y-2">
            <RecordButton
              active={selectedSkillId === NEW_RECORD_ID}
              label="New skill"
              onClick={() => {
                setSelectedSkillId(NEW_RECORD_ID);
                setSkillDraft(formatJson(EMPTY_SKILL));
              }}
            />
            {content.skillDefinitions.map((skill) => (
              <RecordButton
                active={selectedSkillId === skill.id}
                key={skill.id}
                label={skill.label}
                onClick={() => selectSkill(skill.id)}
                secondary={skill.id}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <label className="text-sm font-medium text-[#0e1528]">
            Skill JSON
            <textarea
              className="mt-2 h-[30rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
              onChange={(event) => setSkillDraft(event.target.value)}
              spellCheck={false}
              value={skillDraft}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionDisabled}
              onClick={saveSkill}
              type="button"
            >
              {isBusy("skill") ? "Saving skill..." : "Save skill"}
            </button>
            <button
              className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionDisabled || selectedSkillId === NEW_RECORD_ID}
              onClick={removeSkill}
              type="button"
            >
              {isBusy("skill-delete") ? "Deleting..." : "Delete selected skill"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <SectionTitle
            body="Projects remain rich structured records with links, skill mappings, and per-focus weights."
            eyebrow="Projects"
            title="Project records"
          />
          <div className="mt-6 space-y-2">
            <RecordButton
              active={selectedProjectId === NEW_RECORD_ID}
              label="New project"
              onClick={() => {
                setSelectedProjectId(NEW_RECORD_ID);
                setProjectDraft(formatJson(EMPTY_PROJECT));
              }}
            />
            {content.projects.map((project) => (
              <RecordButton
                active={selectedProjectId === project.id}
                key={project.id}
                label={project.title}
                onClick={() => selectProject(project.id)}
                secondary={project.slug}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <label className="text-sm font-medium text-[#0e1528]">
            Project JSON
            <textarea
              className="mt-2 h-[34rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
              onChange={(event) => setProjectDraft(event.target.value)}
              spellCheck={false}
              value={projectDraft}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionDisabled}
              onClick={saveProject}
              type="button"
            >
              {isBusy("project") ? "Saving project..." : "Save project"}
            </button>
            <button
              className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionDisabled || selectedProjectId === NEW_RECORD_ID}
              onClick={removeProject}
              type="button"
            >
              {isBusy("project-delete")
                ? "Deleting..."
                : "Delete selected project"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <SectionTitle
            body="Experience entries include company metadata, bullet-level skills, and focus weights."
            eyebrow="Experience"
            title="Experience records"
          />
          <div className="mt-6 space-y-2">
            <RecordButton
              active={selectedExperienceId === NEW_RECORD_ID}
              label="New experience"
              onClick={() => {
                setSelectedExperienceId(NEW_RECORD_ID);
                setExperienceDraft(formatJson(EMPTY_EXPERIENCE));
              }}
            />
            {content.experiences.map((experience) => (
              <RecordButton
                active={selectedExperienceId === experience.id}
                key={experience.id}
                label={experience.company}
                onClick={() => selectExperience(experience.id)}
                secondary={experience.title}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <label className="text-sm font-medium text-[#0e1528]">
            Experience JSON
            <textarea
              className="mt-2 h-[34rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
              onChange={(event) => setExperienceDraft(event.target.value)}
              spellCheck={false}
              value={experienceDraft}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionDisabled}
              onClick={saveExperience}
              type="button"
            >
              {isBusy("experience")
                ? "Saving experience..."
                : "Save experience"}
            </button>
            <button
              className="rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                actionDisabled || selectedExperienceId === NEW_RECORD_ID
              }
              onClick={removeExperience}
              type="button"
            >
              {isBusy("experience-delete")
                ? "Deleting..."
                : "Delete selected experience"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl sm:p-8">
        <SectionTitle
          body="These collections drive focus chips, resume preset cards, summary selection, and homepage metrics. They publish together."
          eyebrow="Advanced collections"
          title="Focuses, presets, highlights, and summaries"
        />
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <label className="text-sm font-medium text-[#0e1528]">
            Focus definitions JSON
            <textarea
              className="mt-2 h-[28rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
              onChange={(event) => setFocusDefinitionsDraft(event.target.value)}
              spellCheck={false}
              value={focusDefinitionsDraft}
            />
          </label>
          <div className="text-sm font-medium text-[#0e1528]">
            Resume focus presets
            <div className="mt-2 grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="space-y-2">
                {focusPresetsState.map((preset) => (
                  <RecordButton
                    active={selectedFocusPresetId === preset.id}
                    key={preset.id}
                    label={preset.label}
                    onClick={() => selectFocusPreset(preset.id)}
                    secondary={preset.description}
                  />
                ))}
                <button
                  className="w-full rounded-[1.35rem] border border-dashed border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  onClick={() => {
                    setSelectedFocusPresetId(NEW_RECORD_ID);
                    setFocusPresetDraft(
                      formatJson({
                        ...EMPTY_FOCUS_PRESET,
                        sortOrder: focusPresetsState.length,
                      }),
                    );
                  }}
                  type="button"
                >
                  New preset draft
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0e1528] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      selectedFocusPresetId === NEW_RECORD_ID ||
                      focusPresetsState.findIndex(
                        (preset) => preset.id === selectedFocusPresetId,
                      ) <= 0
                    }
                    onClick={() => moveFocusPreset(-1)}
                    type="button"
                  >
                    Move up
                  </button>
                  <button
                    className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0e1528] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      selectedFocusPresetId === NEW_RECORD_ID ||
                      focusPresetsState.findIndex(
                        (preset) => preset.id === selectedFocusPresetId,
                      ) ===
                        focusPresetsState.length - 1
                    }
                    onClick={() => moveFocusPreset(1)}
                    type="button"
                  >
                    Move down
                  </button>
                </div>
              </div>
              <div>
                <textarea
                  className="h-[28rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
                  onChange={(event) => setFocusPresetDraft(event.target.value)}
                  spellCheck={false}
                  value={focusPresetDraft}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full bg-[#11192c] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222]"
                    onClick={stageFocusPreset}
                    type="button"
                  >
                    Stage preset
                  </button>
                  <button
                    className="rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0e1528] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={selectedFocusPresetId === NEW_RECORD_ID}
                    onClick={removeFocusPreset}
                    type="button"
                  >
                    Remove preset
                  </button>
                </div>
              </div>
            </div>
          </div>
          <label className="text-sm font-medium text-[#0e1528]">
            Profile highlights JSON
            <textarea
              className="mt-2 h-[28rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
              onChange={(event) =>
                setProfileHighlightsDraft(event.target.value)
              }
              spellCheck={false}
              value={profileHighlightsDraft}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Summary templates JSON
            <textarea
              className="mt-2 h-[28rem] w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300"
              onChange={(event) => setSummaryTemplatesDraft(event.target.value)}
              spellCheck={false}
              value={summaryTemplatesDraft}
            />
          </label>
        </div>
        <div className="mt-4">
          <button
            className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={actionDisabled}
            onClick={publishCollections}
            type="button"
          >
            {isBusy("collections")
              ? "Publishing collections..."
              : "Publish advanced collections"}
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <SectionTitle
            body="Uploads are stored in the backup repository first, then registered in the DB-backed content snapshot."
            eyebrow="Media"
            title="Upload assets"
          />
          <form className="mt-6 space-y-4" onSubmit={handleMediaUpload}>
            <label className="block text-sm font-medium text-[#0e1528]">
              Label
              <input
                className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                onChange={(event) => setMediaLabel(event.target.value)}
                value={mediaLabel}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[#0e1528]">
                Kind
                <select
                  className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                  onChange={(event) =>
                    setMediaKind(event.target.value as MediaAsset["kind"])
                  }
                  value={mediaKind}
                >
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#0e1528]">
                Entity type
                <select
                  className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                  onChange={(event) =>
                    setMediaEntityType(
                      (event.target.value || "") as
                        | MediaAsset["entityType"]
                        | "",
                    )
                  }
                  value={mediaEntityType}
                >
                  <option value="">General</option>
                  <option value="site-profile">Site profile</option>
                  <option value="project">Project</option>
                  <option value="experience">Experience</option>
                  <option value="general">General</option>
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-[#0e1528]">
              Entity ID
              <input
                className="mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                onChange={(event) => setMediaEntityId(event.target.value)}
                placeholder="Optional: project id, experience id, etc."
                value={mediaEntityId}
              />
            </label>
            <label className="block text-sm font-medium text-[#0e1528]">
              File
              <input
                className="mt-2 block w-full text-sm text-slate-600"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setMediaFile(event.target.files?.[0] ?? null)
                }
                type="file"
              />
            </label>
            <button
              className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionDisabled}
              type="submit"
            >
              {isBusy("media") ? "Uploading..." : "Upload media"}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
          <SectionTitle
            body="Latest assets registered in the public snapshot."
            eyebrow="Media registry"
            title="Stored assets"
          />
          <div className="mt-6 space-y-3">
            {content.mediaAssets.length === 0 ? (
              <p className="text-sm leading-7 text-slate-600">
                No media assets have been uploaded yet.
              </p>
            ) : (
              content.mediaAssets.map((asset) => (
                <a
                  className="block rounded-[1.35rem] border border-slate-200/80 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                  href={asset.url}
                  key={asset.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <p className="font-semibold text-[#0e1528]">{asset.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {asset.kind} · {asset.fileName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Updated {new Date(asset.updatedAt).toLocaleString()}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <SectionTitle
          body="Every publish writes the full canonical snapshot to the backup repo before applying it to Astro DB."
          eyebrow="Revision log"
          title="Published revisions"
        />
        <div className="mt-6 space-y-3">
          {(content.revisions ?? []).length === 0 ? (
            <p className="text-sm leading-7 text-slate-600">
              No revisions have been published yet.
            </p>
          ) : (
            content.revisions?.map((revision) => (
              <article
                className="rounded-[1.35rem] border border-slate-200/80 bg-white px-4 py-4"
                key={revision.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#0e1528]">
                      {revision.summary ?? "Published content snapshot"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {revision.status} by {revision.publishedBy}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(revision.publishedAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <a
                    className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
                    href={`https://github.com/${revision.backupRepo}/blob/${revision.branch}/${revision.currentPath}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Current snapshot
                  </a>
                  <a
                    className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
                    href={`https://github.com/${revision.backupRepo}/blob/${revision.branch}/${revision.snapshotPath}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Timestamped snapshot
                  </a>
                  {revision.commitSha ? (
                    <a
                      className="font-semibold text-[#1f3b73] hover:text-[#15284c]"
                      href={`https://github.com/${revision.backupRepo}/commit/${revision.commitSha}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Commit {revision.commitSha.slice(0, 7)}
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
