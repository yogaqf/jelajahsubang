import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Kuliner Lokal Subang",
  description: "Pilih menu makanan dari mitra lokal yang tersedia di area layanan Sharelok.",
  alternates: { canonical: "/sharelok/app" },
};

export default function SharelokCatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
