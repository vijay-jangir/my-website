import type {
  ExperienceDefinition,
  FocusPreset,
  PortfolioSnapshot,
  ProjectDefinition,
  SkillDefinition,
} from "@/lib/portfolio-types";

export const NEW_RECORD_ID = "__new__";

export const EMPTY_SKILL: SkillDefinition = {
  aliases: [],
  category: "tooling",
  focusWeights: {},
  highlights: [],
  id: "",
  label: "",
};

export const EMPTY_PROJECT: ProjectDefinition = {
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

export const EMPTY_EXPERIENCE: ExperienceDefinition = {
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

export const EMPTY_FOCUS_PRESET: FocusPreset = {
  description: "",
  focusIds: [],
  id: "",
  label: "",
  sortOrder: 0,
};

export type PublishResult = {
  revisions: PortfolioSnapshot["revisions"];
  snapshot: PortfolioSnapshot;
};

export type EditorContext = {
  actionDisabled: boolean;
  isBusy: (name: string) => boolean;
  onActionComplete: (
    payload: PublishResult | null,
    message: string,
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Astro SafeResult union
  runAction: <T = unknown>(
    name: string,
    runner: () => Promise<any>,
  ) => Promise<T | null>;
  setError: (message: string | null) => void;
  setLocalStatus: (message: string) => void;
};

export function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function toErrorMessage(error: unknown, fallback: string) {
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

export function parseJsonValue<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(
      `Unable to parse ${label}: ${toErrorMessage(error, "Invalid JSON.")}`,
    );
  }
}

export function SectionTitle(props: {
  body: string;
  eyebrow: string;
  title: string;
}) {
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

export function RecordButton(props: {
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

export function JsonTextarea(props: {
  height?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm font-medium text-[#0e1528]">
      {props.label}
      <textarea
        className={`mt-2 ${props.height ?? "h-[28rem]"} w-full rounded-[1.35rem] border border-slate-200/80 bg-slate-950 px-4 py-4 font-mono text-xs leading-6 text-slate-100 outline-none transition focus:border-slate-300`}
        onChange={(event) => props.onChange(event.target.value)}
        spellCheck={false}
        value={props.value}
      />
    </label>
  );
}
