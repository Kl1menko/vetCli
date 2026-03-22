import type { Metadata } from "next";
import localFont from "next/font/local";

import { ToastViewport } from "@/components/ui/toast";
import { getClinicProfile } from "@/lib/clinic-settings";
import { getSiteUrl, siteMetadata } from "@/lib/metadata";
import "./globals.css";

const gilroySans = localFont({
  variable: "--font-sans",
  src: [
    {
      path: "../../public/fonts/gilroy/Gilroy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/gilroy/Gilroy-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/gilroy/Gilroy-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/gilroy/Gilroy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/gilroy/Gilroy-Extrabold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const clinicProfile = await getClinicProfile();

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: `${clinicProfile.name} | Ветклініка у Львові`,
      template: `%s | ${clinicProfile.name}`,
    },
    description: siteMetadata.description,
    applicationName: clinicProfile.name,
    keywords: [...siteMetadata.keywords],
    authors: [{ name: clinicProfile.name }],
    creator: clinicProfile.name,
    publisher: clinicProfile.name,
    category: "healthcare",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${clinicProfile.name} | Ветклініка у Львові`,
      description: siteMetadata.description,
      url: "/",
      siteName: clinicProfile.name,
      locale: siteMetadata.locale,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${clinicProfile.name} — ветклініка у Львові`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${clinicProfile.name} | Ветклініка у Львові`,
      description: siteMetadata.description,
      images: ["/twitter-image"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/brand/logo.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/favicon.ico"],
    },
    manifest: "/site.webmanifest",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${gilroySans.variable} min-h-screen antialiased`}>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
