import type { Metadata } from "next";

import { clinicProfile } from "@/constants/site";

const defaultBaseUrl = "http://localhost:3000";

export function getSiteUrl() {
  const value = process.env.AUTH_URL ?? defaultBaseUrl;

  try {
    return new URL(value);
  } catch {
    return new URL(defaultBaseUrl);
  }
}

export const siteMetadata = {
  name: clinicProfile.name,
  title: `${clinicProfile.name} | Ветклініка у Львові`,
  shortTitle: clinicProfile.name,
  description:
    "Сучасна ветклініка у Львові з онлайн-записом, профілями лікарів, кабінетом власника тварини та прозорою медичною історією.",
  locale: "uk_UA",
  keywords: [
    "ветклініка Львів",
    "ветеринар Львів",
    "онлайн запис до ветеринара",
    "ветклініка UltraVet",
    "вакцинація тварин",
    "ветеринарна клініка",
  ],
} as const;

export function createPageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = new URL(path, siteUrl).toString();
  const image = new URL("/opengraph-image", siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteMetadata.shortTitle,
      locale: siteMetadata.locale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteMetadata.shortTitle} — ${description}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
