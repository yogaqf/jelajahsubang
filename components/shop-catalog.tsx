"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";

export interface ShopProductView {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  price: number;
}

const ADMIN_WHATSAPP = "628998744199";
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export function ShopCatalog({ products }: { products: ShopProductView[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const items = useMemo(() => products.filter((product) => cart[product.id] > 0).map((product) => ({ ...product, quantity: cart[product.id] })), [cart, products]);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((amount, item) => amount + item.price * item.quantity, 0);

  function changeQuantity(id: string, change: number) {
    setCart((current) => {
      const quantity = Math.max(0, (current[id] || 0) + change);
      if (quantity === 0) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: quantity };
    });
  }

  function checkout() {
    if (!items.length) return;
    const detail = items.map((item, index) => `${index + 1}. ${item.title} × ${item.quantity} — ${money(item.price * item.quantity)}`).join("\n");
    const message = `Halo Admin Jelajah Subang 👋\nSaya ingin memesan produk berikut:\n\n${detail}\n\nTotal sementara: *${money(total)}*\n\nMohon info ketersediaan dan proses selanjutnya ya.`;
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return <>
    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => {
        const quantity = cart[product.id] || 0;
        return <article key={product.id} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">
          <div className="aspect-square shrink-0 overflow-hidden bg-zinc-100"><div className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${product.imageUrl})` }} /></div>
          <div className="flex flex-1 flex-col p-3 sm:p-5">
            <h2 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-zinc-950 sm:min-h-14 sm:text-lg sm:leading-7">{product.title}</h2>
            <p className="mt-2 hidden min-h-10 text-sm leading-5 text-zinc-500 sm:line-clamp-2">{product.summary}</p>
            <p className="my-2 text-sm font-black text-emerald-700 sm:text-lg">{money(product.price)}</p>
            <div className="mt-auto space-y-2">
              {quantity > 0 ? <div className="flex h-10 items-center justify-between rounded-xl bg-emerald-50 px-2 text-emerald-800"><button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label={`Kurangi ${product.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm"><Minus className="h-3.5 w-3.5" /></button><strong className="text-xs">{quantity}</strong><button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Tambah ${product.title}`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white"><Plus className="h-3.5 w-3.5" /></button></div> : <button type="button" onClick={() => changeQuantity(product.id, 1)} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-2 text-[11px] font-black text-white transition hover:bg-emerald-700 sm:text-sm"><ShoppingCart className="h-3.5 w-3.5" />Tambah</button>}
            </div>
          </div>
        </article>;
      })}
    </div>

    <button type="button" onClick={() => setOpen(true)} aria-label="Buka keranjang" className="fixed bottom-5 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-black text-white shadow-2xl shadow-emerald-950/30 transition hover:bg-emerald-700 sm:bottom-8 sm:right-8">
      <span className="relative"><ShoppingBag className="h-5 w-5" />{totalItems > 0 && <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] text-white ring-2 ring-white">{totalItems}</span>}</span>
      <span className="hidden sm:inline">Keranjang</span>
    </button>

    {open && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="max-h-[82vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4"><div><h3 className="font-black text-zinc-950">Keranjang</h3><p className="text-[11px] text-zinc-400">{totalItems ? `${totalItems} produk dipilih` : "Belum ada produk"}</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Tutup keranjang" className="rounded-full bg-zinc-100 p-2 text-zinc-600"><X className="h-4 w-4" /></button></div>
        <div className="max-h-[50vh] space-y-3 overflow-y-auto p-4">{items.length ? items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-zinc-100 p-2.5"><div className="h-14 w-14 shrink-0 rounded-xl bg-zinc-100 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} /><div className="min-w-0 flex-1"><h4 className="truncate text-xs font-black text-zinc-900">{item.title}</h4><p className="mt-1 text-xs font-bold text-emerald-700">{money(item.price * item.quantity)}</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => changeQuantity(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200" aria-label={`Kurangi ${item.title}`}>{item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5 text-red-500" /> : <Minus className="h-3.5 w-3.5" />}</button><span className="w-6 text-center text-xs font-black">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white" aria-label={`Tambah ${item.title}`}><Plus className="h-3.5 w-3.5" /></button></div></div>) : <div className="py-12 text-center"><ShoppingCart className="mx-auto h-9 w-9 text-zinc-300" /><p className="mt-3 text-sm font-bold text-zinc-500">Keranjang masih kosong</p><button type="button" onClick={() => setOpen(false)} className="mt-3 text-xs font-black text-emerald-700">Mulai pilih produk</button></div>}</div>
        {items.length > 0 && <div className="border-t border-zinc-100 bg-zinc-50 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-zinc-500">Total sementara</span><strong className="text-lg text-zinc-950">{money(total)}</strong></div><button type="button" onClick={checkout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-black text-white transition hover:bg-[#20bd5a]"><MessageCircle className="h-5 w-5" />Pesan via WhatsApp</button></div>}
      </div>
    </div>}
  </>;
}
