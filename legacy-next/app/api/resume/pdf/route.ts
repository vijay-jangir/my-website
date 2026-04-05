import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import AtsResumeDocument from "@/components/resume/ats-resume-document";
import { buildResumeVariant, parseFocusIds } from "@/lib/portfolio";
import { getResumeVariantByToken } from "@/lib/resume-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const variantToken = url.searchParams.get("variant");
  const storedVariant = variantToken
    ? await getResumeVariantByToken(variantToken)
    : null;
  const focusIds = parseFocusIds(url.searchParams.get("focus") ?? "");
  const variant =
    storedVariant?.variant ??
    buildResumeVariant({
      focusIds,
    });
  const fileName = `Vijay_Jangir_${variant.focusIds.join("_") || "resume"}.pdf`;
  const document = React.createElement(AtsResumeDocument, {
    variant,
  }) as React.ReactElement<any>;
  const buffer = await renderToBuffer(document);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
