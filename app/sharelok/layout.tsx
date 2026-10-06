import type { Metadata } from "next";
import { CartProvider } from "@/components/sharelok/cart-context";
import { CartDrawer } from "@/components/sharelok/cart-drawer";

export const metadata: Metadata = {
  title: "Sharelok — Pesan Kuliner Lokal Subang",
  description: "Temukan dan pesan makanan dari mitra kuliner lokal sesuai area layanan di Kabupaten Subang.",
  alternates: { canonical: "/sharelok" },
  openGraph: { title: "Sharelok — Kuliner Lokal Subang", description: "Pesan menu dari mitra lokal dan lanjutkan konfirmasi melalui WhatsApp.", url: "/sharelok" },
};

export default function SharelokLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
