"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BadgeCheck, Loader2, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useCart } from "./cart-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const WA_NUMBER = "628998744199";

interface CreatedOrder {
  orderNumber: string;
  trackingToken: string;
  subtotal: number;
  total: number;
  discount: number;
  promoCode: string | null;
  merchant: { name: string } | null;
  items: { productName: string; price: number; quantity: number; subtotal: number }[];
}

function fmt(value: number) {
  return "Rp " + value.toLocaleString("id-ID");
}

export function CartDrawer() {
  const pathname = usePathname();
  const { items, isOpen, setIsOpen, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string | null } | null>(null);
  const [error, setError] = useState("");

  if (pathname?.startsWith("/admin")) return null;

  async function applyPromo() {
    if (!promoInput.trim() || promoLoading) return;
    setPromoLoading(true); setPromoError(""); setAppliedPromo(null);
    try {
      const response = await fetch("/api/sharelok/promos/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: promoInput, subtotal: totalPrice }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kode promo tidak valid");
      setAppliedPromo(data); setPromoInput(data.code);
    } catch (err) { setPromoError(err instanceof Error ? err.message : "Kode promo tidak valid"); }
    finally { setPromoLoading(false); }
  }

  async function handleCheckout(event: React.FormEvent) {
    event.preventDefault();
    if (items.length === 0 || submitting) return;
    setSubmitting(true);
    setError("");

    const whatsappWindow = window.open("", "_blank");
    try {
      const response = await fetch("/api/sharelok/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          customerNote,
          areaId: items[0].areaId,
          promoCode: appliedPromo?.code,
          items: items.map((item) => ({ productId: item.id, quantity: item.qty })),
        }),
      });
      const data = (await response.json()) as CreatedOrder & { error?: string };
      if (!response.ok) throw new Error(data.error || "Gagal membuat calon pesanan");

      const lines = data.items.map(
        (item) => `• ${item.productName} x${item.quantity} = ${fmt(item.subtotal)}`
      );
      const message = [
        "Halo Sharelok 👋",
        `Saya mau konfirmasi pesanan *${data.orderNumber}*`,
        `Pantau status: ${window.location.origin}/sharelok/pesanan/${data.trackingToken}`,
        "",
        `🏪 *${data.merchant?.name || items[0].merchantName}*`,
        `📌 Area ${items[0].areaName}`,
        ...lines,
        "",
        `Subtotal: *${fmt(data.subtotal)}*`,
        data.discount > 0 ? `Promo ${data.promoCode}: -*${fmt(data.discount)}*` : "",
        data.discount > 0 ? `Total sementara: *${fmt(data.total)}*` : "",
        "",
        `👤 ${customerName}`,
        `📍 ${customerAddress}`,
        customerNote ? `📝 ${customerNote}` : "",
        "",
        "Mohon info ongkir dan totalnya ya. Terima kasih 🙏",
      ].filter(Boolean).join("\n");
      const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

      if (whatsappWindow) whatsappWindow.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;

      clearCart();
      setIsOpen(false);
      setCustomerNote("");
      setAppliedPromo(null); setPromoInput("");
    } catch (err) {
      whatsappWindow?.close();
      setError(err instanceof Error ? err.message : "Gagal membuat calon pesanan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col bg-white p-0">
        <SheetHeader className="border-b border-zinc-200 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            Keranjang
            {totalItems > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{totalItems}</span>}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleCheckout} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-zinc-300" />
                <p className="text-sm font-semibold text-zinc-500">Keranjang masih kosong</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">{items[0].merchantName}</p><p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Area {items[0].areaName}</p>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50"><ShoppingBag className="h-5 w-5 text-emerald-600" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                          <p className="text-xs font-bold text-emerald-700">{fmt(item.price * item.qty)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-black text-emerald-950"><Tag className="h-4 w-4" /> Punya kode promo?</label>
                  <div className="flex gap-2"><input value={promoInput} onChange={(event) => { setPromoInput(event.target.value.toUpperCase()); setAppliedPromo(null); setPromoError(""); }} placeholder="Masukkan kode" className="min-w-0 flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-bold uppercase outline-none focus:border-emerald-500" /><button type="button" onClick={applyPromo} disabled={!promoInput.trim() || promoLoading} className="rounded-xl bg-emerald-700 px-4 text-xs font-black text-white disabled:opacity-50">{promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pakai"}</button></div>
                  {appliedPromo && <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700"><BadgeCheck className="h-4 w-4" /> Hemat {fmt(appliedPromo.discount)}{appliedPromo.description ? ` · ${appliedPromo.description}` : ""}</p>}
                  {promoError && <p className="mt-2 text-xs font-semibold text-red-600">{promoError}</p>}
                </div>

                <div className="space-y-3 border-t border-zinc-200 pt-4">
                  <h3 className="text-sm font-bold text-zinc-900">Data konfirmasi</h3>
                  <input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nama pemesan" className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none" />
                  <input required minLength={8} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Nomor WhatsApp" inputMode="tel" className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none" />
                  <textarea required value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} placeholder="Alamat pengantaran lengkap" rows={3} className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none" />
                  <textarea value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} placeholder="Catatan pesanan (opsional)" rows={2} className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none" />
                  <p className="text-xs leading-relaxed text-zinc-500">Ongkir dan total akhir akan dikonfirmasi admin melalui WhatsApp.</p>
                  <ol className="grid grid-cols-3 gap-2 rounded-xl bg-emerald-50 p-3 text-center text-[10px] font-semibold text-emerald-900">
                    <li><span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">1</span>Kirim calon order</li>
                    <li><span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">2</span>Konfirmasi via WA</li>
                    <li><span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">3</span>Pesanan diproses</li>
                  </ol>
                </div>
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-zinc-200 bg-white px-5 py-4">
              <div className="mb-4 space-y-1.5"><div className="flex items-center justify-between"><span className="text-sm text-zinc-500">Subtotal ({totalItems} item)</span><span className="text-sm font-bold text-zinc-900">{fmt(totalPrice)}</span></div>{appliedPromo && <div className="flex items-center justify-between text-emerald-700"><span className="text-xs font-semibold">Promo {appliedPromo.code}</span><span className="text-xs font-bold">- {fmt(appliedPromo.discount)}</span></div>}<div className="flex items-center justify-between border-t border-zinc-100 pt-2"><span className="text-sm font-bold">Total sementara</span><span className="text-lg font-extrabold">{fmt(Math.max(0, totalPrice - (appliedPromo?.discount || 0)))}</span></div></div>
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                {submitting ? "Membuat pesanan..." : "Lanjutkan konfirmasi di WhatsApp"}
              </button>
              <button type="button" onClick={clearCart} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-50">Kosongkan keranjang</button>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
