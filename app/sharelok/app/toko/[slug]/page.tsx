"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Plus, Search, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/components/sharelok/cart-context";

interface Merchant {
  id: string;
  areaId: string | null;
  area?: { id: string; name: string; isActive: boolean } | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  merchant: { id: string; areaId: string | null; name: string; isActive: boolean; area?: { name: string } | null } | null;
  category: { id: string; name: string } | null;
}

function fmt(value: number) {
  return "Rp " + value.toLocaleString("id-ID");
}

export default function MerchantMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem, totalItems, totalPrice, setIsOpen, syncWithProducts } = useCart();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMenu() {
      try {
        const [merchantResponse, productResponse] = await Promise.all([
          fetch("/api/sharelok/merchants"),
          fetch("/api/sharelok/products"),
        ]);
        const [merchantData, productData] = await Promise.all([
          merchantResponse.json(),
          productResponse.json(),
        ]);
        if (!merchantResponse.ok || !Array.isArray(merchantData)) throw new Error(merchantData?.error || "Gagal memuat toko");
        if (!productResponse.ok || !Array.isArray(productData)) throw new Error(productData?.error || "Gagal memuat menu");
        const selectedMerchant = merchantData.find((item: Merchant) => item.slug === slug) || null;
        if (!selectedMerchant) throw new Error("Toko tidak ditemukan.");
        if (!active) return;
        setMerchant(selectedMerchant);
        setProducts(productData.filter((item: Product) => item.merchantId === selectedMerchant.id));
        syncWithProducts(
          productData.flatMap((product: Product) =>
            product.isAvailable && product.merchant?.isActive
              ? [{
                  id: product.id,
                  merchantId: product.merchantId,
                  merchantName: product.merchant.name,
                  areaId: product.merchant.areaId,
                  areaName: product.merchant.area?.name || "Area belum ditentukan",
                  name: product.name,
                  imageUrl: product.imageUrl,
                  price: Number(product.price),
                }]
              : []
          )
        );
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat menu");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMenu();
    return () => { active = false; };
  }, [slug, syncWithProducts]);

  const categories = useMemo(() => {
    const values = new Map<string, string>();
    products.forEach((product) => {
      if (product.category) values.set(product.category.id, product.category.name);
    });
    return [...values.entries()].map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) =>
      (!activeCategory || product.category?.id === activeCategory) &&
      (!query || product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query))
    );
  }, [activeCategory, products, search]);

  function handleAdd(product: Product) {
    if (!merchant?.isActive || !product.isAvailable) return;
    const result = addItem({
      id: product.id,
      merchantId: product.merchantId,
      merchantName: merchant.name,
      areaId: merchant.areaId,
      areaName: merchant.area?.name || "Area belum ditentukan",
      name: product.name,
      imageUrl: product.imageUrl,
      price: Number(product.price),
    });
    setError(result.ok ? "" : result.error || "Menu tidak dapat ditambahkan");
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1]">
      <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/sharelok/app" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50"><ArrowLeft className="h-4 w-4" /></Link>
            <div className="min-w-0"><div className="truncate text-sm font-black text-zinc-900">{merchant?.name || "Menu Toko"}</div><div className={`text-[10px] font-bold ${merchant?.isActive ? "text-emerald-700" : "text-red-600"}`}>{merchant?.isActive ? "Buka · siap menerima pesanan" : "Tutup · tidak menerima pesanan"}</div></div>
          </div>
          <button onClick={() => setIsOpen(true)} className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShoppingBag className="h-5 w-5" />{totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{totalItems}</span>}</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 sm:px-6">
        {merchant && (
          <section className="relative -mx-4 h-56 overflow-hidden bg-emerald-950 bg-cover bg-center sm:mx-0 sm:mt-6 sm:h-64 sm:rounded-[2rem]" style={merchant.imageUrl ? { backgroundImage: `url(${merchant.imageUrl})` } : undefined}>
            {!merchant.imageUrl && <div className="absolute inset-0 flex items-center justify-center"><Store className="h-16 w-16 text-emerald-700" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7"><div className="mb-2 flex items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${merchant.isActive ? "bg-emerald-400 text-emerald-950" : "bg-red-500 text-white"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{merchant.isActive ? "BUKA SEKARANG" : "TOKO TUTUP"}</span><span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">AREA {merchant.area?.name?.toUpperCase() || "BELUM DIATUR"}</span></div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{merchant.name}</h1><p className="mt-1 max-w-xl text-xs leading-relaxed text-white/75">{merchant.description}</p><div className="mt-3 flex items-start gap-1.5 text-[10px] text-white/70"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-amber-300" />{merchant.address || "Subang"}</div></div>
          </section>
        )}

        {!merchant?.isActive && merchant && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">Toko sedang tutup. Menu tetap dapat dilihat, tetapi belum bisa ditambahkan ke keranjang.</div>}
        <div className="sticky top-16 z-30 -mx-4 bg-[#f5f6f1]/95 px-4 pb-3 pt-4 backdrop-blur sm:mx-0 sm:px-0"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mau makan apa hari ini?" className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></div></div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1"><button onClick={() => setActiveCategory(null)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${activeCategory === null ? "bg-emerald-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"}`}>Semua</button>{categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${activeCategory === category.id ? "bg-emerald-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"}`}>{category.name}</button>)}</div>
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-500"><Loader2 className="h-5 w-5 animate-spin" /> Memuat menu...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-sm text-zinc-500">Belum ada menu di toko ini.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const orderable = Boolean(merchant?.isActive && product.isAvailable);
              return (
                <article key={product.id} className={`group relative flex flex-col overflow-hidden rounded-[1.4rem] border bg-white shadow-sm transition ${orderable ? "border-zinc-200 hover:-translate-y-0.5 hover:shadow-lg" : "border-zinc-200 opacity-70"}`}>
                  <div className="relative h-32 overflow-hidden bg-emerald-50 bg-cover bg-center sm:h-36" style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}><div className="absolute inset-0 bg-gradient-to-t from-zinc-950/25 to-transparent" />{!product.imageUrl && <div className="flex h-full items-center justify-center"><ShoppingBag className="h-9 w-9 text-emerald-600" /></div>}{!orderable && <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/55"><span className="rounded-full border border-white/20 bg-zinc-950/80 px-3 py-1 text-[9px] font-black text-white">{merchant?.isActive ? "TIDAK TERSEDIA" : "TOKO TUTUP"}</span></div>}</div>
                  <div className="flex flex-1 flex-col p-3.5"><div className="text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">{product.category?.name || "Menu"}</div><h2 className="mt-1.5 text-sm font-black leading-snug text-zinc-900">{product.name}</h2><p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">{product.description}</p><div className="mt-auto flex items-center justify-between pt-4"><span className="text-sm font-black text-zinc-900">{fmt(Number(product.price))}</span><button onClick={() => handleAdd(product)} disabled={!orderable} aria-label={`Tambah ${product.name}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"><Plus className="h-4 w-4" /></button></div></div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {totalItems > 0 && <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-3xl px-4 pb-4"><button onClick={() => setIsOpen(true)} className="flex w-full items-center justify-between rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-lg"><span className="flex items-center gap-2 text-sm font-bold"><ShoppingBag className="h-5 w-5" /> {totalItems} item</span><span className="font-extrabold">{fmt(totalPrice)}</span></button></div>}
    </div>
  );
}
