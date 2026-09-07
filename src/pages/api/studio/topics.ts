import type { APIRoute } from "astro";

import { getPortfolioContent } from "@/lib/portfolio-content";
import {
  recommendTopics,
  type PublishedPost,
  type TopicEngineInput,
} from "@/lib/studio/topics";
import { ApiAuthError, requireAuthenticatedOwner } from "@/src/lib/api-helpers";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    await requireAuthenticatedOwner(cookies);
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return new Response(
        JSON.stringify({ ok: false, message: err.message }),
        { status: err.status, headers: { "Content-Type": "application/json" } },
      );
    }
    throw err;
  }

  const content = await getPortfolioContent();

  // Build published posts list from content for dedup.
  // In a full implementation this would also fetch from Astro content collection,
  // but at the API level we pass what we have from portfolio content.
  const publishedPosts: PublishedPost[] = content.projects
    .filter((p) => p.visibility === "public")
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.skillIds,
    }));

  const input: TopicEngineInput = {
    focuses: content.focusDefinitions,
    skills: content.skillDefinitions,
    publishedPosts,
  };

  const suggestions = recommendTopics(input);

  return new Response(
    JSON.stringify({ ok: true, suggestions }),
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "application/json",
      },
    },
  );
};
