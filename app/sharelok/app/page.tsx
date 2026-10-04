"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, Loader2, MapPin, MessageCircle, Search, ShoppingBag, Store, Utensils } from "lucide-react";
import { useCart } from "@/components/sharelok/cart-context";

interface Merchant {
  id: string;
  areaId: string | null;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface ServiceArea { id: string; name: string; slug: string; description: string | null; isActive: boolean; sortOrder: number }

interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  merchant: { id: string; areaId: string | null; name: string; slug: string; isActive: boolean; area?: ServiceArea | null } | null;
  category: { id: string; name: string; imageUrl?: string | null } | null;
}

function fmt(value: number) { return "Rp " + value.toLocaleString("id-ID"); }

export default function SharelokDiscoveryPage() {
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDiscovery() {
      try {
        const [merchantResponse, productResponse, areaResponse] = await Promise.all([fetch("/api/sharelok/merchants"), fetch("/api/sharelok/products"), fetch("/api/sharelok/areas")]);
        const [merchantData, productData, areaData] = await Promise.all([merchantResponse.json(), productResponse.json(), areaResponse.json()]);
        if (!merchantResponse.ok || !Array.isArray(merchantData)) throw new Error(merchantData?.error || "Gagal memuat toko");
        if (!productResponse.ok || !Array.isArray(productData)) throw new Error(productData?.error || "Gagal memuat menu");
        if (!areaResponse.ok || !Array.isArray(areaData)) throw new Error(areaData?.error || "Gagal memuat area");
        if (active) {
          setMerchants(merchantData); setProducts(productData);
          const saved = localStorage.getItem("sharelok-selected-area");
          const selected = areaData.find((area: ServiceArea) => area.id === saved && area.isActive) || areaData.find((area: ServiceArea) => area.isActive);
          setSelectedAreaId(selected?.id || "");
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat kuliner");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDiscovery();
    return () => { active = false; };
  }, []);

  const areaProducts = useMemo(() => products.filter((product) => product.merchant?.areaId === selectedAreaId), [products, selectedAreaId]);

  const categories = useMemo(() => {
    const values = new Map<string, { id: string; name: string; imageUrl: string | null }>();
    areaProducts.forEach((product) => {
      if (product.category) values.set(product.category.id, { id: product.category.id, name: product.category.name, imageUrl: product.category.imageUrl || product.imageUrl });
    });
    return [...values.values()];
  }, [areaProducts]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return areaProducts.filter((product) =>
      (!activeCategory || product.category?.id === activeCategory) &&
      (!query || product.name.toLowerCase().includes(query) || product.merchant?.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query))
    );
  }, [activeCategory, areaProducts, search]);

  const visibleMerchants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return merchants.filter((merchant) => merchant.areaId === selectedAreaId)
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.sortOrder - b.sortOrder)
      .filter((merchant) => !query || merchant.name.toLowerCase().includes(query) || merchant.address?.toLowerCase().includes(query) || products.some((product) => product.merchantId === merchant.id && product.name.toLowerCase().includes(query)));
  }, [merchants, products, search, selectedAreaId]);

  const openStores = merchants.filter((merchant) => merchant.areaId === selectedAreaId && merchant.isActive).length;
  const availableMenus = areaProducts.filter((product) => product.isAvailable && product.merchant?.isActive).length;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3"><Link href="/sharelok" className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 shadow-sm"><ArrowLeft className="h-4 w-4" /></Link><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 font-black text-white">S</div><div><div className="font-black tracking-tight text-zinc-900">Share<span className="text-red-500">lok</span></div><div className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">Kuliner Subang</div></div></div></div>
          <button onClick={() => setIsOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShoppingBag className="h-5 w-5" />{totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">{totalItems}</span>}</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl pb-28">
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 px-5 pb-16 pt-8 text-white sm:mx-6 sm:mt-5 sm:rounded-[2rem] sm:px-9 sm:pb-20 sm:pt-10">
          <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-amber-300/25 blur-2xl" />
          <div className="absolute right-6 top-7 hidden h-36 w-36 rotate-6 rounded-full border-[12px] border-white/10 bg-amber-300/20 sm:block" />
          <div className="relative max-w-xl"><span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">Kuliner lokal pilihan</span><h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Lagi lapar?<br /><span className="text-amber-300">Cari menu favoritmu.</span></h1></div>
          <div className="absolute bottom-4 right-5 flex gap-2 text-[10px] font-bold sm:right-9"><span className="rounded-full bg-white/10 px-3 py-1.5">{openStores} toko buka</span><span className="rounded-full bg-white/10 px-3 py-1.5">{availableMenus} menu tersedia</span></div>
        </section>

        <div className="relative z-10 mt-4 px-4 sm:px-10"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Lagi mau makan apa?" className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-zinc-900 shadow-lg shadow-zinc-900/5 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /><Utensils className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" /></div></div>

        {error && <div className="mx-4 mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-6">{error}</div>}
        {loading ? <div className="flex items-center justify-center gap-2 py-24 text-sm font-semibold text-zinc-500"><Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> Menyiapkan kuliner pilihan...</div> : (
          <>
            <section className="mt-8 px-4 sm:px-6">
              <div className="flex items-end justify-between"><div><h2 className="text-lg font-black text-zinc-900">Kuliner sesuai seleramu</h2><p className="mt-1 text-xs text-zinc-500">Pilih kategori untuk menemukan menu.</p></div>{activeCategory && <button onClick={() => setActiveCategory(null)} className="text-xs font-bold text-emerald-700">Lihat semua</button>}</div>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                <button onClick={() => setActiveCategory(null)} className="w-20 shrink-0 text-center"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 ${activeCategory === null ? "border-emerald-600 bg-emerald-50" : "border-zinc-100 bg-zinc-50"}`}><Utensils className="h-6 w-6 text-emerald-700" /></div><div className="mt-2 text-[11px] font-bold text-zinc-700">Semua</div></button>
                {categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} className="w-20 shrink-0 text-center"><div className={`mx-auto h-16 w-16 rounded-full border-2 bg-cover bg-center shadow-sm ${activeCategory === category.id ? "border-emerald-600" : "border-white"}`} style={category.imageUrl ? { backgroundImage: `url(${category.imageUrl})` } : undefined}>{!category.imageUrl && <div className="flex h-full items-center justify-center"><ShoppingBag className="h-5 w-5 text-emerald-600" /></div>}</div><div className="mt-2 line-clamp-2 text-[11px] font-bold leading-tight text-zinc-700">{category.name}</div></button>)}
              </div>
            </section>

            <section className="mt-8 bg-[#f7f8f5] py-7">
              <div className="px-4 sm:px-6"><div><div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Langsung pilih menunya</div><h2 className="mt-1 text-xl font-black text-zinc-900">Menu yang bikin ngiler</h2></div>
                {visibleProducts.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white py-12 text-center text-sm text-zinc-500">Menu tidak ditemukan.</div> : <div className="mt-5 flex gap-4 overflow-x-auto pb-4">{visibleProducts.map((product) => {
                  const storeOpen = Boolean(product.merchant?.isActive);
                  const orderable = storeOpen && product.isAvailable;
                  return <Link key={product.id} href={`/sharelok/app/toko/${product.merchant?.slug || ""}`} className="group w-56 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`relative h-36 bg-emerald-50 bg-cover bg-center ${storeOpen ? "" : "grayscale"}`} style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}>{!product.imageUrl && <div className="flex h-full items-center justify-center"><ShoppingBag className="h-9 w-9 text-emerald-600" /></div>}<span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black ${orderable ? "bg-white text-emerald-700" : "bg-zinc-900 text-white"}`}>{orderable ? "TERSEDIA" : storeOpen ? "TIDAK TERSEDIA" : "TOKO TUTUP"}</span></div><div className="p-4"><h3 className="line-clamp-2 min-h-10 text-sm font-black leading-snug text-zinc-900">{product.name}</h3><div className="mt-2 truncate text-[10px] font-semibold text-zinc-400">{product.merchant?.name}</div><div className="mt-3 flex items-center justify-between"><span className="text-sm font-black text-emerald-700">{fmt(Number(product.price))}</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><ArrowRight className="h-4 w-4" /></span></div></div></Link>;
                })}</div>}
              </div>
            </section>

            <section className="px-4 py-8 sm:px-6"><div><h2 className="text-xl font-black text-zinc-900">Toko kuliner di Sharelok</h2><p className="mt-1 text-xs text-zinc-500">Lihat semua menu berdasarkan tokonya.</p></div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">{visibleMerchants.map((merchant) => {
                const storeProducts = products.filter((product) => product.merchantId === merchant.id);
                const available = storeProducts.filter((product) => product.isAvailable).length;
                return <Link key={merchant.id} href={`/sharelok/app/toko/${merchant.slug}`} className="group flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md"><div className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-emerald-50 bg-cover bg-center ${merchant.isActive ? "" : "grayscale"}`} style={merchant.imageUrl ? { backgroundImage: `url(${merchant.imageUrl})` } : undefined}>{!merchant.imageUrl && <div className="flex h-full items-center justify-center"><Store className="h-8 w-8 text-emerald-600" /></div>}<span className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[8px] font-black ${merchant.isActive ? "bg-emerald-500 text-emerald-950" : "bg-zinc-900 text-white"}`}>{merchant.isActive ? "BUKA" : "TUTUP"}</span></div><div className="min-w-0 flex-1 py-1"><h3 className="truncate text-sm font-black text-zinc-900">{merchant.name}</h3><p className="mt-1 line-clamp-1 text-[10px] text-zinc-500">{merchant.description}</p><div className="mt-2 flex items-start gap-1 text-[9px] text-zinc-400"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-red-500" /><span className="truncate">{merchant.address || "Subang"}</span></div><div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-bold text-zinc-500">{available} menu</span>{merchant.isActive ? <span className="text-[10px] font-black text-emerald-700">Lihat toko →</span> : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400"><Clock3 className="h-3 w-3" /> Tutup</span>}</div></div></Link>;
              })}</div>
            </section>

            <section className="mx-4 mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:mx-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><MessageCircle className="h-5 w-5" /></div><div><div className="text-xs font-black text-emerald-950">Konfirmasi mudah lewat WhatsApp</div><div className="mt-0.5 text-[10px] leading-relaxed text-emerald-800">Admin akan mengonfirmasi ketersediaan, ongkir, dan total sebelum pembayaran.</div></div></div></section>
          </>
        )}
      </main>

      {totalItems > 0 && <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-lg px-4 pb-4"><button onClick={() => setIsOpen(true)} className="flex w-full items-center justify-between rounded-2xl bg-zinc-950 px-5 py-3.5 text-white shadow-2xl"><span className="flex items-center gap-2 text-sm font-bold"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600"><ShoppingBag className="h-4 w-4" /></span>{totalItems} item</span><span className="font-extrabold">{fmt(totalPrice)}</span></button></div>}
    </div>
  );
}
