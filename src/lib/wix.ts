import { env } from "@/lib/env";

export type WixBlogPost = {
  id: string;
  title: string;
  excerpt: string;
  url: {
    base: string;
    path: string;
  };
};

type WixPostsResponse = {
  posts?: WixBlogPost[];
};

export async function getWixBlogs() {
  if (!env.wixApiKey) {
    return [];
  }

  try {
    const response = await fetch("https://www.wixapis.com/v3/posts/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.wixApiKey,
        "wix-site-id": env.wixSiteId,
      },
      body: JSON.stringify({
        fieldsets: ["URL"],
      }),
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as WixPostsResponse;
    return payload.posts ?? [];
  } catch {
    return [];
  }
}
