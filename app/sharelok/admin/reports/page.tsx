"use client";

import { useEffect, useState } from "react";
import { Bike, CalendarDays, MapPinned, RefreshCw, Store, WalletCards } from "lucide-react";

interface DailyReport {
  date: string;
  totals: {
    orders: number;
    customerPayments: number;
    merchantPayouts: number;
    driverCommissions: number;
    platformRevenue: number;
  };
  merchants: { merchantId: string; merchantName: string; orders: number; sales: number; payout: number }[];
  drivers: { driverId: string; driverName: string; orders: number; deliveryFees: number; commission: number }[];
  areas: { areaId: string | null; areaName: string; orders: number; customerPayments: number; platformRevenue: number }[];
  closings: {
    id: string;
    orderNumber: string;
    closedAt: string;
    customerName: string;
    areaName: string;
    merchantName: string;
    driverName: string;
    subtotal: number;
    deliveryFee: number;
    customerPayment: number;
    merchantPayout: number;
    driverCommissionPercent: number;
    driverCommission: number;
    platformRevenue: number;
  }[];
}

function jakartaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function money(value: number) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

export default function DailyClosingReportPage() {
  const [date, setDate] = useState(jakartaToday);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadReport() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/sharelok/reports/daily?date=${date}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gagal memuat laporan");
        if (active) setReport(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat laporan");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReport();
    return () => { active = false; };
  }, [date]);

  const cards = report ? [
    { label: "Order closing", value: `${report.totals.orders} order`, tone: "text-zinc-900" },
    { label: "Pembayaran customer", value: money(report.totals.customerPayments), tone: "text-blue-700" },
    { label: "Bayar ke mitra", value: money(report.totals.merchantPayouts), tone: "text-amber-700" },
    { label: "Komisi driver", value: money(report.totals.driverCommissions), tone: "text-purple-700" },
    { label: "Pendapatan Sharelok", value: money(report.totals.platformRevenue), tone: "text-emerald-700" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Laporan Closing Harian</h2>
          <p className="text-sm text-zinc-500">Rekap order selesai, pembayaran mitra, komisi driver, dan pendapatan Sharelok.</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600">
          <CalendarDays className="h-4 w-4 text-emerald-600" />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-transparent text-zinc-900 outline-none" />
          {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
        </label>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
        <strong>Rumus:</strong> bayar mitra = total HPP item. Komisi driver = persentase driver × ongkir. Pendapatan Sharelok = margin menu + sisa ongkir − diskon. Nilai dikunci saat order diselesaikan.
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{card.label}</div>
            <div className={`mt-2 text-xl font-black ${card.tone}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="flex items-center gap-2 font-bold text-zinc-900"><Store className="h-4 w-4 text-amber-600" /> Pembayaran Mitra</h3>
          <div className="mt-4 divide-y divide-zinc-100">
            {report?.merchants.length ? report.merchants.map((item) => (
              <div key={item.merchantId} className="flex items-center justify-between gap-4 py-3 text-xs">
                <div><div className="font-bold text-zinc-900">{item.merchantName}</div><div className="text-zinc-400">{item.orders} order · penjualan {money(item.sales)}</div></div>
                <div className="text-right"><div className="text-[10px] text-zinc-400">Harus dibayar</div><div className="font-extrabold text-amber-700">{money(item.payout)}</div></div>
              </div>
            )) : <div className="py-8 text-center text-xs text-zinc-400">Belum ada closing pada tanggal ini.</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="flex items-center gap-2 font-bold text-zinc-900"><Bike className="h-4 w-4 text-purple-600" /> Komisi Driver</h3>
          <div className="mt-4 divide-y divide-zinc-100">
            {report?.drivers.length ? report.drivers.map((item) => (
              <div key={item.driverId} className="flex items-center justify-between gap-4 py-3 text-xs">
                <div><div className="font-bold text-zinc-900">{item.driverName}</div><div className="text-zinc-400">{item.orders} order · ongkir {money(item.deliveryFees)}</div></div>
                <div className="text-right"><div className="text-[10px] text-zinc-400">Komisi diterima</div><div className="font-extrabold text-purple-700">{money(item.commission)}</div></div>
              </div>
            )) : <div className="py-8 text-center text-xs text-zinc-400">Belum ada komisi driver.</div>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5"><h3 className="flex items-center gap-2 font-bold"><MapPinned className="h-4 w-4 text-emerald-600" /> Closing per Area</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{report?.areas.length ? report.areas.map((area) => <div key={area.areaId || "unassigned"} className="rounded-xl bg-zinc-50 p-3"><div className="font-bold text-zinc-900">{area.areaName}</div><div className="mt-1 text-xs text-zinc-500">{area.orders} order · pembayaran {money(area.customerPayments)}</div><div className="mt-2 text-xs font-bold text-emerald-700">Pendapatan {money(area.platformRevenue)}</div></div>) : <div className="text-xs text-zinc-400">Belum ada data area.</div>}</div></section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4 font-bold text-zinc-900"><WalletCards className="h-4 w-4 text-emerald-600" /> Rincian Closing</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Mitra / Driver</th><th className="px-4 py-3 text-right">Customer bayar</th><th className="px-4 py-3 text-right">Bayar mitra</th><th className="px-4 py-3 text-right">Komisi driver</th><th className="px-4 py-3 text-right">Sharelok</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {report?.closings.map((item) => (
                <tr key={item.id}><td className="px-4 py-3"><div className="font-bold text-zinc-900">{item.orderNumber}</div><div className="text-[10px] text-zinc-400">{new Date(item.closedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · {item.customerName}</div></td><td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{item.areaName}</span></td><td className="px-4 py-3"><div className="font-semibold text-zinc-800">{item.merchantName}</div><div className="text-[10px] text-zinc-400">{item.driverName}</div></td><td className="px-4 py-3 text-right font-bold">{money(item.customerPayment)}</td><td className="px-4 py-3 text-right font-bold text-amber-700">{money(item.merchantPayout)}</td><td className="px-4 py-3 text-right font-bold text-purple-700">{money(item.driverCommission)} <span className="text-[10px] font-normal text-zinc-400">({item.driverCommissionPercent}%)</span></td><td className="px-4 py-3 text-right font-extrabold text-emerald-700">{money(item.platformRevenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
