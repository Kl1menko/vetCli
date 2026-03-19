import type { Metadata } from "next";
import localFont from "next/font/local";

import { ToastViewport } from "@/components/ui/toast";
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

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.shortTitle}`,
  },
  description: siteMetadata.description,
  applicationName: siteMetadata.shortTitle,
  keywords: [...siteMetadata.keywords],
  authors: [{ name: siteMetadata.shortTitle }],
  creator: siteMetadata.shortTitle,
  publisher: siteMetadata.shortTitle,
  category: "healthcare",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: "/",
    siteName: siteMetadata.shortTitle,
    locale: siteMetadata.locale,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteMetadata.shortTitle} — ветклініка у Львові`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: ["/twitter-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

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
