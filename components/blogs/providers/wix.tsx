import type { BlogProp } from '../blog';
import { env } from "@/lib/env";

type WixPostResponse = {
  posts?: BlogProp[];
};

export default async function getWixBlogs() {
  const apiKey = env.wixApiKey;

  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch("https://www.wixapis.com/v3/posts/query", {
      method: "POST",
      headers: {
        "wix-site-id": env.wixSiteId,
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        fieldsets: ["URL"],
      }),
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as WixPostResponse;

    return (data.posts ?? []).map((post) => ({
      ...post,
      blog_id: "wix",
    }));
  } catch {
    return [];
  }
}
