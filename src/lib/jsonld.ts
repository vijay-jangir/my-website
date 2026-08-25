import type { SiteProfile } from "@/lib/portfolio-types";

export type JsonLdRecord = Record<string, unknown>;

type EntityInput = {
  siteProfile: SiteProfile;
  baseUrl: URL;
};

export type PersonJsonLdInput = EntityInput & {
  description: string;
  fallbackImagePath?: string;
};

export function buildPersonJsonLd(input: PersonJsonLdInput): JsonLdRecord {
  const { siteProfile, baseUrl, description, fallbackImagePath } = input;
  const homeUrl = new URL("/", baseUrl).toString();
  const imageUrl = new URL(
    siteProfile.profileImageUrl ?? fallbackImagePath ?? "/og-preview.jpg",
    baseUrl,
  ).toString();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    description,
    email: siteProfile.email,
    image: imageUrl,
    jobTitle: siteProfile.title,
    knowsAbout: [...siteProfile.currentFocusLabels],
    mainEntityOfPage: homeUrl,
    name: siteProfile.name,
    sameAs: [siteProfile.githubUrl, siteProfile.linkedinUrl].filter(Boolean),
    url: homeUrl,
  };
}

export function buildProfilePageJsonLd(input: EntityInput): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: buildPersonJsonLd({
      baseUrl: input.baseUrl,
      description: input.siteProfile.heroLabel,
      fallbackImagePath: input.siteProfile.profileImageUrl ?? undefined,
      siteProfile: input.siteProfile,
    }),
    url: new URL("/", input.baseUrl).toString(),
  };
}

export function buildWebsiteJsonLd(input: EntityInput): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.siteProfile.name,
    url: new URL("/", input.baseUrl).toString(),
  };
}

export type BreadcrumbItem = {
  name: string;
  path?: string;
};

export function buildBreadcrumbJsonLd(input: {
  baseUrl: URL;
  items: readonly BreadcrumbItem[];
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: input.items.map((item, index) => ({
      ...(item.path
        ? { item: new URL(item.path, input.baseUrl).toString() }
        : {}),
      "@type": "ListItem",
      name: item.name,
      position: index + 1,
    })),
  };
}

export function buildItemListJsonLd(input: {
  baseUrl: URL;
  name: string;
  items: readonly { name: string; path: string }[];
}): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      item: new URL(item.path, input.baseUrl).toString(),
      name: item.name,
      position: index + 1,
    })),
    name: input.name,
  };
}
