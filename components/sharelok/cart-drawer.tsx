"use client";

import { useCart } from "./cart-context";
import { usePathname } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const WA_NUMBER = "628998744199"; // Ganti dengan nomor WA tujuan

export function CartDrawer() {
  const pathname = usePathname();
  const { items, isOpen, setIsOpen, updateQty, removeItem, clearCart, totalItems, totalPrice } =
    useCart();

  if (pathname?.startsWith("/sharelok/admin")) {
    return null;
  }

  function handleCheckoutWA() {
    if (items.length === 0) return;

    const lines = items.map(
      (item) =>
        `• ${item.emoji} ${item.name} x${item.qty} = ${fmt(item.price * item.qty)}`
    );
    const msg = [
      "🛒 *Pesanan Sharelok*",
      "",
      ...lines,
      "",
      `*Total: ${fmt(totalPrice)}*`,
      "",
      "Mohon konfirmasi pesanan saya. Terima kasih! 🙏",
    ].join("\n");

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0 bg-white">
        {/* Header */}
        <SheetHeader className="border-b border-zinc-200 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            Keranjang
            {totalItems > 0 && (
              <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-4 text-5xl">🛒</span>
              <p className="text-sm font-semibold text-zinc-500">Keranjang masih kosong</p>
              <p className="mt-1 text-xs text-zinc-400">
                Yuk, pilih menu favorit kamu!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3"
                >
                  {/* Emoji */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-2xl">
                    {item.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-emerald-700">
                      {fmt(item.price * item.qty)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-zinc-900">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-200 bg-white px-5 py-4">
            {/* Summary */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-zinc-500">Total ({totalItems} item)</span>
              <span className="text-lg font-extrabold text-zinc-900">{fmt(totalPrice)}</span>
            </div>

            {/* Checkout via WA */}
            <button
              onClick={handleCheckoutWA}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <ShoppingBag className="h-4 w-4" />
              Pesan via WhatsApp
            </button>

            {/* Clear */}
            <button
              onClick={clearCart}
              className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
