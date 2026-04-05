import { NextResponse } from "next/server";
import { z } from "zod";

import { parseFocusIds, searchProjects } from "@/lib/portfolio";

const querySchema = z.object({
  q: z.string().max(120).optional().default(""),
  focus: z.string().optional().default("general"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    focus: url.searchParams.get("focus") ?? "general",
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid search parameters.",
      },
      { status: 400 },
    );
  }

  const projects = searchProjects({
    query: parsed.data.q,
    focusIds: parseFocusIds(parsed.data.focus),
  }).slice(0, 6);

  return NextResponse.json({
    ok: true,
    results: projects.map((project) => ({
      id: project.id,
      title: project.title,
      summary: project.summary,
      impact: project.impact,
      skillIds: project.skillIds,
    })),
  });
}
