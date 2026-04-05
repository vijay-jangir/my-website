import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { APIRoute } from "astro";

import { buildResumeVariant, parseFocusIds } from "@/lib/portfolio";
import { getResumeVariantByToken } from "@/lib/resume-store";
import AtsResumeDocument from "@/src/components/resume/AtsResumeDocument";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const focusIds = parseFocusIds(url.searchParams.get("focus"));
  const variantToken = url.searchParams.get("variant") ?? undefined;
  const storedVariant = variantToken
    ? await getResumeVariantByToken(variantToken)
    : null;
  const variant =
    storedVariant?.variant ??
    buildResumeVariant({
      focusIds,
    });

  const pdfBuffer = await renderToBuffer(
    React.createElement(AtsResumeDocument, { variant }) as React.ReactElement,
  );

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Disposition": 'attachment; filename="Vijay_Jangir_Resume.pdf"',
      "Content-Type": "application/pdf",
    },
  });
};
