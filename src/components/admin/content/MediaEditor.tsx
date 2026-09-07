import { useState, type ChangeEvent, type FormEvent } from "react";
import { actions } from "astro:actions";
import type { MediaAsset, PortfolioSnapshot } from "@/lib/portfolio-types";
import { SectionTitle, type EditorContext, type PublishResult } from "./shared";

type Props = {
  ctx: EditorContext;
  mediaAssets: PortfolioSnapshot["mediaAssets"];
};

export function MediaEditor({ ctx, mediaAssets }: Props) {
  const [mediaLabel, setMediaLabel] = useState("");
  const [mediaKind, setMediaKind] = useState<MediaAsset["kind"]>("image");
  const [mediaEntityType, setMediaEntityType] = useState<
    MediaAsset["entityType"] | ""
  >("");
  const [mediaEntityId, setMediaEntityId] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!mediaFile) {
      ctx.setError("Choose a file to upload first.");
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

    const payload = await ctx.runAction<PublishResult>("media", () =>
      actions.uploadMedia(formData),
    );

    if (!payload) return;

    ctx.onActionComplete(
      payload,
      `Uploaded ${mediaLabel || mediaFile.name}.`,
    );
    setMediaLabel("");
    setMediaEntityId("");
    setMediaEntityType("");
    setMediaKind("image");
    setMediaFile(null);
    event.currentTarget.reset();
  }

  const INPUT_CLASS =
    "mt-2 w-full rounded-[1.1rem] border border-slate-200/80 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300";

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
        <SectionTitle
          body="Uploads are stored in the backup repository first, then registered in the DB-backed content snapshot."
          eyebrow="Media"
          title="Upload assets"
        />
        <form className="mt-6 space-y-4" onSubmit={handleUpload}>
          <label className="block text-sm font-medium text-[#0e1528]">
            Label
            <input
              className={INPUT_CLASS}
              onChange={(event) => setMediaLabel(event.target.value)}
              value={mediaLabel}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-[#0e1528]">
              Kind
              <select
                className={INPUT_CLASS}
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
                className={INPUT_CLASS}
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
              className={INPUT_CLASS}
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
            disabled={ctx.actionDisabled}
            type="submit"
          >
            {ctx.isBusy("media") ? "Uploading..." : "Upload media"}
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
          {mediaAssets.length === 0 ? (
            <p className="text-sm leading-7 text-slate-600">
              No media assets have been uploaded yet.
            </p>
          ) : (
            mediaAssets.map((asset) => (
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
  );
}
