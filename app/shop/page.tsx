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
    <section className="relative overflow-hidden bg-amber-50 px-4 pb-24 pt-20 text-zinc-950 sm:px-6 sm:pb-28 sm:pt-24">
      <Image src="/images/IMG_9706.PNG" alt="" fill sizes="100vw" quality={75} preload className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-amber-50/85 to-amber-50/5" />
      <div className="relative mx-auto max-w-7xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/20"><ShoppingBag className="h-6 w-6" /></div><p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-800">Produk lokal pilihan</p><h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl">Jelajah Subang Shop</h1><p className="mt-4 max-w-xl text-base font-medium leading-7 text-zinc-700">Produk lokal dan merchandise yang membawa semangat Subang lebih dekat denganmu.</p></div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">{managed.length > 0 ? <ShopCatalog products={managed.map((product) => ({ id: product.id, title: product.title, summary: product.summary || "", imageUrl: product.imageUrl || "/images/hero.jpg", price: product.price }))} /> : <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">Belum ada produk yang dipublikasikan dari CMS.</div>}</section>
  </main><Footer /></div>;
}
