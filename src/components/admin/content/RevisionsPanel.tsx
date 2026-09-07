import type { PortfolioSnapshot } from "@/lib/portfolio-types";
import { SectionTitle } from "./shared";

type Props = {
  revisions: PortfolioSnapshot["revisions"];
};

export function RevisionsPanel({ revisions }: Props) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_54px_rgba(31,44,75,0.07)] backdrop-blur-xl">
      <SectionTitle
        body="Every publish writes the full canonical snapshot to the backup repo before applying it to Astro DB."
        eyebrow="Revision log"
        title="Published revisions"
      />
      <div className="mt-6 space-y-3">
        {(revisions ?? []).length === 0 ? (
          <p className="text-sm leading-7 text-slate-600">
            No revisions have been published yet.
          </p>
        ) : (
          revisions?.map((revision) => (
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
  );
}
