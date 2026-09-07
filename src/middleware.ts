import { defineMiddleware } from "astro:middleware";

import { getSessionUser } from "@/src/lib/auth";
import { setRobotsHeader } from "@/src/layouts/BaseLayout.astro";
import { isApiRoute, isPrivateRoute } from "@/src/lib/route-guard";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!isPrivateRoute(pathname)) {
    return next();
  }

  const user = await getSessionUser(context.cookies);

  if (!user) {
    if (isApiRoute(pathname)) {
      return new Response(
        JSON.stringify({ ok: false, message: "Authentication required." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return context.redirect("/admin");
  }

  const response = await next();

  // Defense-in-depth: ensure private responses carry X-Robots-Tag
  // even if the individual page forgets to set it.
  setRobotsHeader(response.headers);

  return response;
});
