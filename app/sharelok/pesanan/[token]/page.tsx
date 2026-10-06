"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Bike,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  MapPin,
  MessageCircle,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Store,
} from "lucide-react";

const ADMIN_WHATSAPP = "628998744199";

interface TrackingOrder {
  orderNumber: string;
  customerName: string;
  status: string;
  statusLabel: string;
  statusDescription: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string;
  area: { name: string } | null;
  merchant: { name: string } | null;
  driver: { name: string; vehicleType: string | null; vehiclePlate: string | null } | null;
  items: { id: string; productName: string; price: number; quantity: number; subtotal: number }[];
  statusHistory: { id: string; status: string; label: string; description: string; createdAt: string }[];
}

const statusSteps = [
  { key: "WAITING_CONFIRMATION", label: "Masuk", icon: ShoppingBag },
  { key: "CONFIRMED", label: "Dikonfirmasi", icon: CheckCircle2 },
  { key: "PREPARING", label: "Disiapkan", icon: ChefHat },
  { key: "DELIVERING", label: "Diantar", icon: Bike },
  { key: "COMPLETED", label: "Selesai", icon: Check },
] as const;

const progressByStatus: Record<string, number> = {
  WAITING_CONFIRMATION: 1,
  CONTACTED: 1,
  PENDING: 1,
  CONFIRMED: 2,
  PREPARING: 3,
  READY: 3,
  DELIVERING: 4,
  COMPLETED: 5,
};

function money(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function dateTime(value: string) {
  return `${new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value))} WIB`;
}

export default function TrackingOrderPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async (silent = false) => {
    if (!token) return;
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch(`/api/sharelok/track/${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Pesanan tidak ditemukan");
      setOrder(data);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Gagal memuat status pesanan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => loadOrder(), 0);
    const interval = window.setInterval(() => loadOrder(true), 15000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadOrder]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-5">
        <div className="text-center"><RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-700" /><p className="mt-3 text-sm font-bold text-zinc-600">Memuat pesananmu...</p></div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-5">
        <div className="w-full max-w-sm rounded-3xl border border-red-100 bg-white p-7 text-center shadow-xl shadow-zinc-200/50">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-black text-zinc-900">Link pesanan tidak ditemukan</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{error || "Periksa kembali link dari WhatsApp atau hubungi admin Sharelok."}</p>
          <Link href="/sharelok" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Kembali ke Sharelok</Link>
        </div>
      </main>
    );
  }

  const currentProgress = progressByStatus[order.status] || 1;
  const isClosed = order.status === "CANCELLED";
  const whatsappText = encodeURIComponent(`Halo Admin Sharelok, saya ingin bertanya tentang pesanan ${order.orderNumber}.`);

  return (
    <main className="min-h-screen bg-[#f5f7f4] pb-24 text-zinc-900">
      <header className="relative overflow-hidden bg-emerald-950 px-5 pb-20 pt-6 text-white">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <Link href="/sharelok" className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white font-black text-emerald-800">S</span><span className="font-black tracking-tight">Share<span className="text-red-400">lok</span></span></Link>
            <button type="button" onClick={() => loadOrder(true)} disabled={refreshing} className="flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-bold text-white disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Perbarui</button>
          </div>
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Lacak pesanan</p>
            <h1 className="mt-2 text-2xl font-black">Halo, {order.customerName} 👋</h1>
            <p className="mt-2 text-sm text-white/65">Status akan diperbarui otomatis setiap 15 detik.</p>
          </div>
        </div>
      </header>

      <div className="relative mx-auto -mt-12 max-w-2xl space-y-4 px-4 sm:px-5">
        <section className={`overflow-hidden rounded-3xl border bg-white shadow-xl shadow-zinc-200/60 ${isClosed ? "border-red-200" : "border-emerald-100"}`}>
          <div className={`p-5 ${isClosed ? "bg-red-50" : "bg-gradient-to-br from-emerald-50 to-white"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{order.orderNumber}</p><h2 className={`mt-1 text-xl font-black ${isClosed ? "text-red-700" : "text-emerald-900"}`}>{order.statusLabel}</h2><p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-500">{order.statusDescription}</p></div>
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${order.paymentStatus === "PAID" ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-800"}`}>{order.paymentStatus === "PAID" ? "SUDAH DIBAYAR" : "BELUM DIBAYAR"}</span>
            </div>
          </div>
          {!isClosed && (
            <div className="border-t border-zinc-100 px-3 py-5 sm:px-5">
              <div className="grid grid-cols-5">
                {statusSteps.map((step, index) => {
                  const done = currentProgress >= index + 1;
                  const active = currentProgress === index + 1;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="relative flex flex-col items-center text-center">
                      {index > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full ${done ? "bg-emerald-500" : "bg-zinc-200"}`} />}
                      <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-zinc-200 bg-white text-zinc-300"} ${active ? "ring-4 ring-emerald-100" : ""}`}><Icon className="h-3.5 w-3.5" /></span>
                      <span className={`mt-2 text-[8px] font-bold sm:text-[10px] ${done ? "text-emerald-800" : "text-zinc-400"}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-900"><Store className="h-4 w-4 text-emerald-700" /> Mitra</div>
            <p className="mt-2 text-sm font-bold">{order.merchant?.name || "Mitra Sharelok"}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500"><MapPin className="h-3 w-3" /> Area {order.area?.name || "Subang"}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-900"><Bike className="h-4 w-4 text-purple-700" /> Driver</div>
            {order.driver ? <><p className="mt-2 text-sm font-bold">{order.driver.name}</p><p className="mt-1 text-[10px] text-zinc-500">{[order.driver.vehicleType, order.driver.vehiclePlate].filter(Boolean).join(" · ") || "Kendaraan belum dicatat"}</p></> : <p className="mt-2 text-xs leading-relaxed text-zinc-500">Driver akan tampil setelah ditentukan admin.</p>}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3"><ReceiptText className="h-4 w-4 text-emerald-700" /><h2 className="text-sm font-black">Rincian pesanan</h2></div>
          <div className="divide-y divide-zinc-100 px-4">
            {order.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 py-3 text-xs"><div><p className="font-bold text-zinc-800">{item.productName}</p><p className="mt-0.5 text-[10px] text-zinc-400">{item.quantity} × {money(item.price)}</p></div><span className="font-bold text-zinc-800">{money(item.subtotal)}</span></div>)}
          </div>
          <div className="space-y-2 border-t border-zinc-100 bg-zinc-50/70 p-4 text-xs">
            <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            <div className="flex justify-between text-zinc-500"><span>Ongkir</span><span>{order.deliveryFee > 0 ? money(order.deliveryFee) : "Menunggu admin"}</span></div>
            {order.discount > 0 && <div className="flex justify-between font-semibold text-emerald-700"><span>Promo {order.promoCode}</span><span>-{money(order.discount)}</span></div>}
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-black"><span>Total</span><span className="text-emerald-700">{money(order.total)}</span></div>
            <div className="flex justify-between text-[10px] text-zinc-400"><span>Metode pembayaran</span><span className="font-bold text-zinc-600">{order.paymentMethod || "Belum ditentukan"}</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-black">Riwayat status</h2><p className="mt-0.5 text-[10px] text-zinc-400">Terakhir diperbarui {dateTime(order.updatedAt)}</p></div><Clock3 className="h-5 w-5 text-emerald-700" /></div>
          <div className="mt-5">
            {order.statusHistory.map((history, index) => {
              const latest = index === order.statusHistory.length - 1;
              return (
                <div key={history.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < order.statusHistory.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-emerald-200" />}
                  <span className={`relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-4 ${latest ? "border-emerald-200 bg-emerald-600" : "border-zinc-200 bg-white"}`} />
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-xs font-black text-zinc-900">{history.label}</p>{latest && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-black text-emerald-700">TERBARU</span>}<time className="ml-auto text-[9px] text-zinc-400">{dateTime(history.createdAt)}</time></div><p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{history.description}</p></div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-2xl"><a href={`https://wa.me/${ADMIN_WHATSAPP}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20"><MessageCircle className="h-5 w-5" /> Hubungi Admin Sharelok</a></div>
      </div>
    </main>
  );
}
