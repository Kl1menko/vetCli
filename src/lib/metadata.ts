import type { Metadata } from "next";

import { getClinicProfile } from "@/lib/clinic-settings";

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
  name: "UltraVet",
  title: "UltraVet | Ветклініка у Львові",
  shortTitle: "UltraVet",
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

export async function generatePageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Promise<Metadata> {
  const clinicProfile = await getClinicProfile();
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
      siteName: clinicProfile.name,
      locale: siteMetadata.locale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${clinicProfile.name} — ${description}`,
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

export function createPageMetadata(args: {
  title: string;
  description: string;
  path?: string;
}) {
  return generatePageMetadata(args);
}
