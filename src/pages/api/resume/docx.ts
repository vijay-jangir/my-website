import type { APIRoute } from "astro";

import {
  buildResumeVariantFromContent,
  parseFocusIdsInContent,
} from "@/lib/portfolio";
import { getPortfolioContent } from "@/lib/portfolio-content";
import { getResumeVariantByToken } from "@/lib/resume-store";
import { renderResumeDocxBuffer } from "@/src/components/resume/AtsResumeDocx";

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

  const docxBuffer = await renderResumeDocxBuffer({
    siteProfile: content.siteProfile,
    variant,
  });

  const headers = new Headers({
    "Content-Disposition": 'attachment; filename="Vijay_Jangir_Resume.docx"',
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Cache-Control": storedVariant
      ? "private, no-store"
      : "public, max-age=3600, s-maxage=86400",
  });

  return new Response(new Uint8Array(docxBuffer), {
    headers,
  });
};
