import { ArrowRight, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { getPortalEntries } from "@/lib/portal-db";

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const managed = await getPortalEntries({ type: "SHOP", publishedOnly: true });
  return <div className="min-h-screen overflow-x-clip bg-[#f7f8f4]"><Navbar /><main>
    <section className="relative overflow-hidden bg-zinc-950 px-4 pb-24 pt-20 text-white sm:px-6 sm:pb-28 sm:pt-24"><div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" /><div className="relative mx-auto max-w-7xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950"><ShoppingBag className="h-6 w-6" /></div><h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Shop Jelajah Subang</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/60">Produk lokal dan merchandise yang membawa semangat Subang lebih dekat denganmu.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">{managed.length > 0 ? <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">{managed.map((product) => <article key={product.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="aspect-square shrink-0 overflow-hidden bg-zinc-100"><div className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${product.imageUrl || "/images/hero.jpg"})` }} /></div><div className="relative flex flex-1 flex-col bg-white p-5"><h2 className="line-clamp-2 min-h-14 text-lg font-black leading-7 text-zinc-950">{product.title}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500">{product.summary}</p><p className="mt-4 text-lg font-black text-emerald-700">{money(product.price)}</p><a href={product.externalUrl || "#"} target={product.externalUrl?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">Lihat produk<ArrowRight className="h-4 w-4" /></a></div></article>)}</div> : <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">Belum ada produk yang dipublikasikan dari CMS.</div>}</section>
  </main><Footer /></div>;
}
