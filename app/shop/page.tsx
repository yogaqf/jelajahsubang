import type { Metadata } from "next";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { ShopCatalog } from "@/components/shop-catalog";
import { getPortalEntries } from "@/lib/portal-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Produk Lokal Subang",
  description: "Belanja merchandise, oleh-oleh, dan produk lokal pilihan dari Kabupaten Subang.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop Jelajah Subang", description: "Produk lokal dan merchandise pilihan dari Kabupaten Subang.", url: "/shop" },
};

export default async function ShopPage() {
  const managed = await getPortalEntries({ type: "SHOP", publishedOnly: true });
  return <div className="min-h-screen overflow-x-clip bg-[#f7f8f4]"><Navbar /><main>
    <section className="relative overflow-hidden bg-zinc-950 px-4 pb-24 pt-20 text-white sm:px-6 sm:pb-28 sm:pt-24">
      <Image src="/images/IMG_9706.PNG" alt="" fill sizes="100vw" quality={75} preload className="object-cover object-center" />
      <div className="relative mx-auto max-w-7xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950"><ShoppingBag className="h-6 w-6" /></div><h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Jelajah Subang Shop</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white">Produk lokal dan merchandise yang membawa semangat Subang lebih dekat denganmu.</p></div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">{managed.length > 0 ? <ShopCatalog products={managed.map((product) => ({ id: product.id, title: product.title, summary: product.summary || "", imageUrl: product.imageUrl || "/images/hero.jpg", price: product.price }))} /> : <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">Belum ada produk yang dipublikasikan dari CMS.</div>}</section>
  </main><Footer /></div>;
}
