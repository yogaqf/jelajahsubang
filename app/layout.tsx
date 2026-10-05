import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "@/lib/site-url";

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
  applicationName: "Jelajah Subang",
  authors: [{ name: "Jelajah Subang", url: siteUrl }],
  creator: "Jelajah Subang",
  publisher: "Jelajah Subang",
  formatDetection: { email: false, address: false, telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
