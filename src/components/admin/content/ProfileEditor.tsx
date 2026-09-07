import { useState, useRef } from "react";
import { actions } from "astro:actions";
import type { SiteProfile } from "@/lib/portfolio-types";
import { SectionTitle, type EditorContext, type PublishResult } from "./shared";

type UpsertProfileInput = Parameters<typeof actions.upsertProfile>[0];

type Props = {
  ctx: EditorContext;
  profile: SiteProfile;
};

const INPUT_CLASS =
  "mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300";
const TEXTAREA_CLASS =
  "mt-2 w-full rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-slate-300";

export function ProfileEditor({ ctx, profile }: Props) {
  const [draft, setDraft] = useState<SiteProfile>(profile);
  const prevRef = useRef(profile);

  if (profile !== prevRef.current) {
    prevRef.current = profile;
    setDraft(profile);
  }

  function handleChange<K extends keyof SiteProfile>(
    key: K,
    value: SiteProfile[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    const payload = await ctx.runAction<PublishResult>("profile", () =>
      actions.upsertProfile(draft as UpsertProfileInput),
    );
    ctx.onActionComplete(payload, "Profile updated.");
  }

  return (
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
            className={INPUT_CLASS}
            onChange={(event) => handleChange("name", event.target.value)}
            value={draft.name}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Title
          <input
            className={INPUT_CLASS}
            onChange={(event) => handleChange("title", event.target.value)}
            value={draft.title}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Location
          <input
            className={INPUT_CLASS}
            onChange={(event) => handleChange("location", event.target.value)}
            value={draft.location}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Timezone
          <input
            className={INPUT_CLASS}
            onChange={(event) => handleChange("timezone", event.target.value)}
            value={draft.timezone}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Email
          <input
            className={INPUT_CLASS}
            onChange={(event) => handleChange("email", event.target.value)}
            value={draft.email}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Profile image URL
          <input
            className={INPUT_CLASS}
            onChange={(event) =>
              handleChange("profileImageUrl", event.target.value)
            }
            value={draft.profileImageUrl ?? ""}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          GitHub URL
          <input
            className={INPUT_CLASS}
            onChange={(event) => handleChange("githubUrl", event.target.value)}
            value={draft.githubUrl}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          LinkedIn URL
          <input
            className={INPUT_CLASS}
            onChange={(event) =>
              handleChange("linkedinUrl", event.target.value)
            }
            value={draft.linkedinUrl}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="text-sm font-medium text-[#0e1528]">
          Hero label
          <textarea
            className={`${TEXTAREA_CLASS} h-28`}
            onChange={(event) => handleChange("heroLabel", event.target.value)}
            value={draft.heroLabel}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Recruiter pitch
          <textarea
            className={`${TEXTAREA_CLASS} h-32`}
            onChange={(event) =>
              handleChange("recruiterPitch", event.target.value)
            }
            value={draft.recruiterPitch}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Overview paragraphs
          <textarea
            className={`${TEXTAREA_CLASS} h-36`}
            onChange={(event) =>
              handleChange(
                "overview",
                event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              )
            }
            value={draft.overview.join("\n")}
          />
        </label>
        <label className="text-sm font-medium text-[#0e1528]">
          Current focus labels
          <input
            className={INPUT_CLASS}
            onChange={(event) =>
              handleChange(
                "currentFocusLabels",
                event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
            value={draft.currentFocusLabels.join(", ")}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-[#0e1528]">
            Last updated label
            <input
              className={INPUT_CLASS}
              onChange={(event) =>
                handleChange("lastUpdatedLabel", event.target.value)
              }
              value={draft.lastUpdatedLabel}
            />
          </label>
          <label className="text-sm font-medium text-[#0e1528]">
            Content promise
            <input
              className={INPUT_CLASS}
              onChange={(event) =>
                handleChange("contentPromise", event.target.value)
              }
              value={draft.contentPromise}
            />
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          className="rounded-full bg-[#11192c] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(17,25,44,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0b1222] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={ctx.actionDisabled}
          onClick={save}
          type="button"
        >
          {ctx.isBusy("profile") ? "Saving profile..." : "Save profile"}
        </button>
      </div>
    </section>
  );
}
