import Link from "next/link";

import type { FocusDefinition, FocusId } from "@/lib/portfolio-types";

type FocusPillLinksProps = {
  basePath: string;
  focusOptions: readonly FocusDefinition[];
  activeFocusIds: readonly FocusId[];
  query?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  focusId: FocusId,
  activeFocusIds: readonly FocusId[],
  query?: Record<string, string | undefined>,
) {
  const nextFocusIds = activeFocusIds.includes(focusId)
    ? activeFocusIds.filter((item) => item !== focusId)
    : [...activeFocusIds.filter((item) => item !== "general"), focusId].slice(
        0,
        3,
      );
  const params = new URLSearchParams();
  const mergedFocusIds = nextFocusIds.length > 0 ? nextFocusIds : ["general"];

  params.set("focus", mergedFocusIds.join(","));

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  return `${basePath}?${params.toString()}`;
}

export default function FocusPillLinks({
  basePath,
  focusOptions,
  activeFocusIds,
  query,
}: FocusPillLinksProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {focusOptions.map((focus) => {
        const isActive = activeFocusIds.includes(focus.id);

        return (
          <Link
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-950"
                : "border-black/10 bg-white text-gray-700 hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/10"
            }`}
            href={buildHref(basePath, focus.id, activeFocusIds, query)}
            key={focus.id}
          >
            {focus.shortLabel}
          </Link>
        );
      })}
    </div>
  );
}
