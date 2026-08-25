import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { APIRoute } from "astro";

import {
  buildResumeVariantFromContent,
  parseFocusIdsInContent,
} from "@/lib/portfolio";
import { getPortfolioContent } from "@/lib/portfolio-content";
import { getResumeVariantByToken } from "@/lib/resume-store";
import AtsResumeDocument from "@/src/components/resume/AtsResumeDocument";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const content = await getPortfolioContent();
  const focusIds = parseFocusIdsInContent(
    content,
    url.searchParams.get("focus"),
  );
  const variantToken = url.searchParams.get("variant") ?? undefined;
  const storedVariant = variantToken
    ? await getResumeVariantByToken(variantToken)
    : null;
  const variant =
    storedVariant?.variant ??
    buildResumeVariantFromContent(content, {
      focusIds,
    });

  const pdfBuffer = await renderToBuffer(
    React.createElement(AtsResumeDocument, {
      siteProfile: content.siteProfile,
      variant,
    }) as React.ReactElement,
  );

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Disposition": 'attachment; filename="Vijay_Jangir_Resume.pdf"',
      "Content-Type": "application/pdf",
    },
  });
};
