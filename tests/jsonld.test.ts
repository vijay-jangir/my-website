import { describe, expect, it } from "vitest";

import type { SiteProfile } from "@/lib/portfolio-types";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  buildWebsiteJsonLd,
} from "@/src/lib/jsonld";

const baseUrl = new URL("https://vijayjangir.com");

const siteProfile = {
  name: "Test Person",
  title: "Platform Architect",
  location: "India",
  timezone: "Asia/Kolkata",
  lastUpdatedLabel: "May 2026",
  contentPromise: "Case studies describe ownership.",
  currentFocusLabels: ["Data platforms", "Enterprise AI"],
  email: "contact@example.com",
  githubUrl: "https://github.com/example",
  linkedinUrl: "https://linkedin.com/in/example",
  profileImageUrl: "/profile-pic.jpeg",
  heroLabel: "I build governed data platforms.",
  recruiterPitch: "Architect and hands-on developer.",
} as SiteProfile;

describe("buildPersonJsonLd", () => {
  it("emits entity fields anchored to the home URL without worksFor", () => {
    const person = buildPersonJsonLd({
      baseUrl,
      description: "Page description",
      fallbackImagePath: "/og-preview.jpg",
      siteProfile,
    });

    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Test Person");
    expect(person.description).toBe("Page description");
    expect(person.mainEntityOfPage).toBe("https://vijayjangir.com/");
    expect(person.url).toBe("https://vijayjangir.com/");
    expect(person.image).toBe("https://vijayjangir.com/profile-pic.jpeg");
    expect(person.sameAs).toEqual([
      "https://github.com/example",
      "https://linkedin.com/in/example",
    ]);
    expect("worksFor" in person).toBe(false);
  });

  it("falls back to the provided image path when no profile image exists", () => {
    const person = buildPersonJsonLd({
      baseUrl,
      description: "d",
      fallbackImagePath: "/og-preview.jpg",
      siteProfile: { ...siteProfile, profileImageUrl: null },
    });

    expect(person.image).toBe("https://vijayjangir.com/og-preview.jpg");
  });
});

describe("buildProfilePageJsonLd", () => {
  it("wraps the person as mainEntity on a ProfilePage", () => {
    const page = buildProfilePageJsonLd({ baseUrl, siteProfile });

    expect(page["@type"]).toBe("ProfilePage");
    expect(page.url).toBe("https://vijayjangir.com/");
    const mainEntity = page.mainEntity as Record<string, unknown>;

    expect(mainEntity["@type"]).toBe("Person");
    expect(mainEntity.name).toBe("Test Person");
  });
});

describe("buildWebsiteJsonLd", () => {
  it("names the site with the home URL", () => {
    const website = buildWebsiteJsonLd({ baseUrl, siteProfile });

    expect(website).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Test Person",
      url: "https://vijayjangir.com/",
    });
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("positions items in order with absolute item URLs", () => {
    const breadcrumb = buildBreadcrumbJsonLd({
      baseUrl,
      items: [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "A post", path: "/blog/a-post" },
      ],
    });
    const elements = breadcrumb.itemListElement as Record<string, unknown>[];

    expect(elements).toHaveLength(3);
    expect(elements[0]).toEqual({
      "@type": "ListItem",
      item: "https://vijayjangir.com/",
      name: "Home",
      position: 1,
    });
    expect(elements[2]).toEqual({
      "@type": "ListItem",
      item: "https://vijayjangir.com/blog/a-post",
      name: "A post",
      position: 3,
    });
  });

  it("omits the item field when no path is provided", () => {
    const breadcrumb = buildBreadcrumbJsonLd({
      baseUrl,
      items: [{ name: "Current page" }],
    });
    const [element] = breadcrumb.itemListElement as Record<string, unknown>[];

    expect("item" in element).toBe(false);
    expect(element.name).toBe("Current page");
  });
});

describe("buildItemListJsonLd", () => {
  it("lists items with positions and absolute URLs", () => {
    const itemList = buildItemListJsonLd({
      baseUrl,
      items: [
        { name: "Project A", path: "/projects/project-a" },
        { name: "Project B", path: "/projects/project-b" },
      ],
      name: "Public projects",
    });

    expect(itemList["@type"]).toBe("ItemList");
    expect(itemList.name).toBe("Public projects");
    expect(itemList.itemListElement).toEqual([
      {
        "@type": "ListItem",
        item: "https://vijayjangir.com/projects/project-a",
        name: "Project A",
        position: 1,
      },
      {
        "@type": "ListItem",
        item: "https://vijayjangir.com/projects/project-b",
        name: "Project B",
        position: 2,
      },
    ]);
  });
});
