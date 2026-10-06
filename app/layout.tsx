import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Jelajah Subang — Wisata, Kuliner & Cerita Lokal", template: "%s | Jelajah Subang" },
  description: "Temukan destinasi, kuliner, cerita lokal, dan produk pilihan dari Kabupaten Subang.",
  keywords: [
    "Jelajah Subang",
    "wisata Subang",
    "kuliner Subang",
    "destinasi Subang",
    "Kabupaten Subang",
    "wisata Jawa Barat",
    "kuliner lokal Subang",
  ],
  applicationName: "Jelajah Subang",
  authors: [{ name: "Jelajah Subang", url: siteUrl }],
  creator: "Jelajah Subang",
  publisher: "Jelajah Subang",
  formatDetection: { email: false, address: false, telephone: false },
  category: "travel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Jelajah Subang",
    url: "/",
    title: "Jelajah Subang — Wisata, Kuliner & Cerita Lokal",
    description: "Temukan destinasi, kuliner, cerita lokal, dan produk pilihan dari Kabupaten Subang.",
    images: [{ url: "/images/hero.jpg", alt: "Jelajah Kabupaten Subang" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jelajah Subang — Wisata, Kuliner & Cerita Lokal",
    description: "Temukan destinasi, kuliner, cerita lokal, dan produk pilihan dari Kabupaten Subang.",
    images: ["/images/hero.jpg"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: "Jelajah Subang",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/images/logo.PNG"),
        },
        description: "Portal wisata, kuliner, artikel lokal, dan produk pilihan Kabupaten Subang.",
        areaServed: { "@type": "AdministrativeArea", name: "Kabupaten Subang, Jawa Barat" },
        sameAs: [
          "https://www.instagram.com/jelajahsubang/",
          "https://www.youtube.com/@jelajahsubang",
        ],
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: siteUrl,
        name: "Jelajah Subang",
        description: "Panduan wisata, kuliner, artikel lokal, dan produk pilihan Kabupaten Subang.",
        inLanguage: "id-ID",
        publisher: { "@id": absoluteUrl("/#organization") },
      },
    ],
  };
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
