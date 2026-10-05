import { ArrowRight, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { getPortalEntries } from "@/lib/portal-db";

const fallbackProducts = [
  { id: "kaos", title: "Kaos Jelajah Subang", summary: "Kaos nyaman dengan identitas Jelajah Subang.", price: 150000, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", externalUrl: "#" },
  { id: "tote", title: "Tote Bag Jelajah Subang", summary: "Teman praktis untuk membawa cerita perjalananmu.", price: 100000, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80", externalUrl: "#" },
];
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const managed = await getPortalEntries({ type: "SHOP", publishedOnly: true });
  const products = managed.length ? managed : fallbackProducts;
  return <div className="min-h-screen bg-[#f7f8f4]"><Navbar /><main>
    <section className="bg-zinc-950 px-4 pb-20 pt-16 text-white"><div className="mx-auto max-w-7xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950"><ShoppingBag className="h-6 w-6" /></div><h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Shop Jelajah Subang</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/60">Produk lokal dan merchandise yang membawa semangat Subang lebih dekat denganmu.</p></div></section>
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <article key={product.id} className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="aspect-square bg-zinc-100 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${product.imageUrl || "/images/hero.jpg"})` }} /><div className="relative bg-white p-5"><h2 className="text-lg font-black">{product.title}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">{product.summary}</p><p className="mt-4 font-black text-emerald-700">{money(product.price)}</p><a href={product.externalUrl || "#"} target={product.externalUrl?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white">Lihat produk<ArrowRight className="h-4 w-4" /></a></div></article>)}</section>
  </main><Footer /></div>;
}
