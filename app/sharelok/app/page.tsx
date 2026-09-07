"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ArrowLeft, Plus } from "lucide-react";
import { useCart } from "@/components/sharelok/cart-context";
import { sharelokMenu, sharelokCategories } from "@/lib/menu";

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function SharelokAppPage() {
  const { addItem, totalItems, totalPrice, setIsOpen } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredMenu = useMemo(() => {
    let result = sharelokMenu;
    if (activeCategory) {
      result = result.filter((item) => item.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/sharelok"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm font-extrabold text-white">
                S
              </div>
              <span className="text-base font-bold text-zinc-900">
                Share<span className="text-red-500">lok</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28">
        {/* ── SEARCH ── */}
        <div className="sticky top-14 z-30 -mx-4 bg-zinc-50 px-4 pb-3 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* ── KATEGORI ── */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              activeCategory === null
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Semua
          </button>
          {sharelokCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                setActiveCategory(activeCategory === cat.value ? null : cat.value)
              }
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                activeCategory === cat.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* ── MENU GRID ── */}
        {filteredMenu.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="mb-3 text-4xl">🔍</span>
            <p className="text-sm font-semibold text-zinc-500">Menu tidak ditemukan</p>
            <p className="mt-1 text-xs text-zinc-400">
              Coba kata kunci lain atau ubah filter kategori
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Badge */}
                {item.badge && (
                  <span
                    className={`absolute left-2 top-2 z-10 rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white ${
                      item.badge === "Baru"
                        ? "bg-emerald-600"
                        : item.badge === "Terlaris"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Emoji area */}
                <div className="flex h-28 items-center justify-center bg-emerald-50 text-5xl transition-transform group-hover:scale-110 sm:h-32">
                  {item.emoji}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="text-xs font-bold leading-snug text-zinc-900 sm:text-sm">
                    {item.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
                    {item.desc}
                  </p>

                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                      {item.oldPrice && (
                        <span className="block text-[10px] text-zinc-400 line-through">
                          {fmt(item.oldPrice)}
                        </span>
                      )}
                      <span className="text-sm font-extrabold text-emerald-700">
                        {fmt(item.price)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          id: item.id,
                          name: item.name,
                          emoji: item.emoji,
                          price: item.price,
                        })
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FLOATING CART BUTTON ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-3xl px-4 pb-4">
          <button
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-lg transition hover:bg-emerald-700"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-bold">{totalItems} item</span>
            </div>
            <span className="text-sm font-extrabold">{fmt(totalPrice)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
